import { BLACKLISTED_NAME_WORDS, slugify } from "./utils";
import {
  isNameBlockedAction,
  isSlugBlockedAction,
  isNameAllowedAction,
  isSlugAllowedAction,
  addToQueueAction,
  logAccessAction,
} from "./actions";
import { AccessResult } from "./data";

export async function checkAccess(name: string): Promise<AccessResult> {
  if (!name || typeof name !== "string") {
    return {
      result: "block",
      reason: "Invalid name provided",
    };
  }

  // Convert name to slug for comparison
  const slug = slugify(name);

  // 1. Check against hardcoded blacklist (case insensitive)
  for (const word of BLACKLISTED_NAME_WORDS) {
    if (name.toLowerCase().includes(word.toLowerCase())) {
      const reason = `Contains blacklisted word: ${word}`;
      // Log the access attempt
      await logAccessAction(name, slug, "block", reason);
      return { result: "block", reason };
    }
  }

  // 2. Check if name is in blocked names list (case insensitive)
  if (await isNameBlockedAction(name)) {
    const reason = "Name is in blocked names list";
    await logAccessAction(name, slug, "block", reason);
    return { result: "block", reason };
  }

  // 3. Check if slug is in blocked slugs list (case insensitive)
  if (await isSlugBlockedAction(slug)) {
    const reason = "Slug variation is in blocked slugs list";
    await logAccessAction(name, slug, "block", reason);
    return { result: "block", reason };
  }

  // 4. Check if name is in allowed names list (case insensitive)
  if (await isNameAllowedAction(name)) {
    await logAccessAction(name, slug, "allow", "Name is in allowed names list");
    return { result: "allow" };
  }

  // 5. Check if slug is in allowed slugs list (case insensitive)
  if (await isSlugAllowedAction(slug)) {
    await logAccessAction(name, slug, "allow", "Slug is in allowed slugs list");
    return { result: "allow" };
  }

  // 6. Add to verification queue for manual review
  await addToQueueAction(name, slug);

  // Default to allow with logging
  await logAccessAction(
    name,
    slug,
    "allow",
    "Default allow, added to verification queue"
  );
  return { result: "allow" };
}
