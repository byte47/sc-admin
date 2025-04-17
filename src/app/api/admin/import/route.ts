/**
 * Bulk Import API Endpoint
 *
 * This endpoint handles bulk importing of items to blocked and allowed lists.
 * It supports importing to any of the four lists:
 * - blocked-names
 * - blocked-slugs
 * - allowed-names
 * - allowed-slugs
 *
 * Features:
 * - Deduplication to avoid adding items already in the list
 * - Validation of items to ensure they meet requirements (length, characters)
 * - Detailed results including counts of processed, skipped, invalid items
 * - Comprehensive error reporting for failed items
 *
 * Request format:
 * {
 *   "items": ["item1", "item2", ...],
 *   "type": "blocked-names" | "blocked-slugs" | "allowed-names" | "allowed-slugs",
 *   "deduplicateEnabled": true,  // optional, defaults to true
 *   "validateEnabled": true      // optional, defaults to true
 * }
 *
 * Response format:
 * {
 *   "success": true,
 *   "message": "Successfully processed X out of Y items",
 *   "results": {
 *     "total": 10,
 *     "processed": 8,
 *     "skipped": 1,
 *     "invalid": 1,
 *     "duplicates": 1,
 *     "failures": 0,
 *     "failedItems": [
 *       {"value": "item3", "reason": "Value too short"}
 *     ]
 *   }
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addToBlockedNamesAction,
  addToBlockedSlugsAction,
  addToAllowedNamesAction,
  addToAllowedSlugsAction,
  getBlockedNamesAction,
  getBlockedSlugsAction,
  getAllowedNamesAction,
  getAllowedSlugsAction,
} from "@/lib/actions";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

// Input validation schema
const importSchema = z.object({
  items: z.array(z.string()).min(1),
  type: z.enum([
    "blocked-names",
    "blocked-slugs",
    "allowed-names",
    "allowed-slugs",
  ]),
  deduplicateEnabled: z.boolean().optional().default(true),
  validateEnabled: z.boolean().optional().default(true),
});

// Helper function to validate and clean an item
function validateAndCleanItem(
  item: string,
  type: string
): { valid: boolean; value: string; reason?: string } {
  // Trim whitespace
  const trimmed = item.trim();

  // Check if empty
  if (!trimmed) {
    return { valid: false, value: trimmed, reason: "Empty value" };
  }

  // Basic validation
  if (trimmed.length < 2) {
    return {
      valid: false,
      value: trimmed,
      reason: "Value too short (min 2 characters)",
    };
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      value: trimmed,
      reason: "Value too long (max 100 characters)",
    };
  }

  // Generate and validate slug if it's a name
  if (type === "blocked-names" || type === "allowed-names") {
    const slug = slugify(trimmed);
    if (!slug) {
      return {
        valid: false,
        value: trimmed,
        reason: "Invalid characters - would result in empty slug",
      };
    }
  }

  return { valid: true, value: trimmed };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate the request body
    const result = importSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    // Get data from the validated result
    const { items, type, deduplicateEnabled, validateEnabled } = result.data;

    // Get existing items for deduplication check
    let existingItems: string[] = [];
    if (deduplicateEnabled) {
      try {
        if (type === "blocked-names") {
          const list = await getBlockedNamesAction();
          existingItems = list.items.map((item) => item.value.toLowerCase());
        } else if (type === "blocked-slugs") {
          const list = await getBlockedSlugsAction();
          existingItems = list.items.map((item) => item.value.toLowerCase());
        } else if (type === "allowed-names") {
          const list = await getAllowedNamesAction();
          existingItems = list.items.map((item) => item.value.toLowerCase());
        } else if (type === "allowed-slugs") {
          const list = await getAllowedSlugsAction();
          existingItems = list.items.map((item) => item.value.toLowerCase());
        }
      } catch (error) {
        console.error(
          "Error fetching existing items for deduplication:",
          error
        );
        // Continue without deduplication if fetching fails
      }
    }

    // Process each item according to the list type
    const results = {
      total: items.length,
      processed: 0,
      skipped: 0,
      invalid: 0,
      duplicates: 0,
      failures: 0,
      failedItems: [] as Array<{ value: string; reason?: string }>,
    };

    try {
      for (const item of items) {
        try {
          // Validate and clean the item
          const { valid, value, reason } = validateEnabled
            ? validateAndCleanItem(item, type)
            : { valid: true, value: item.trim() };

          if (!valid) {
            results.invalid++;
            results.failedItems.push({ value, reason });
            continue;
          }

          // Check for duplicates
          if (
            deduplicateEnabled &&
            existingItems.includes(value.toLowerCase())
          ) {
            results.duplicates++;
            results.skipped++;
            continue;
          }

          // Add to the appropriate list
          if (type === "blocked-names") {
            await addToBlockedNamesAction(value);
            existingItems.push(value.toLowerCase());
          } else if (type === "blocked-slugs") {
            await addToBlockedSlugsAction(value);
            existingItems.push(value.toLowerCase());
          } else if (type === "allowed-names") {
            await addToAllowedNamesAction(value);
            existingItems.push(value.toLowerCase());
          } else if (type === "allowed-slugs") {
            await addToAllowedSlugsAction(value);
            existingItems.push(value.toLowerCase());
          }

          results.processed++;
        } catch (err) {
          results.failures++;
          results.failedItems.push({ value: item, reason: "Database error" });
          console.error(`Failed to import item: ${item}`, err);
        }
      }

      // Revalidate the lists page to reflect the new data
      revalidatePath("/admin/lists");

      // Return the results
      return NextResponse.json({
        success: true,
        message: `Successfully processed ${results.processed} out of ${results.total} items (${results.skipped} skipped, ${results.invalid} invalid)`,
        results,
      });
    } catch (error) {
      console.error("Error processing bulk import:", error);
      return NextResponse.json(
        { error: "Failed to process the bulk import" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing import request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
