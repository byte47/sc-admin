"use server";

import { revalidatePath } from "next/cache";
import { QueueItem, ListItem, HistoryItem } from "./data";
import { Message } from "./data-pg";
import {
  addAccessHistory,
  getAccessHistory,
  addToBlockedNames,
  getBlockedNames,
  removeFromBlockedNames,
  addToBlockedSlugs,
  getBlockedSlugs,
  removeFromBlockedSlugs,
  addToAllowedNames,
  getAllowedNames,
  removeFromAllowedNames,
  addToAllowedSlugs,
  getAllowedSlugs,
  removeFromAllowedSlugs,
  addToVerificationQueue,
  getVerificationQueue,
  updateVerificationStatus,
  addMessage,
  getMessages,
  getMessagesByName,
  getMessagesBySlug,
  isBlockedSlug,
  isAllowedSlug,
  isBlockedName,
  isAllowedName,
} from "./data-pg";

// Access history operations
export async function logAccessAction(
  name: string,
  slug: string,
  result: "allow" | "block",
  reason?: string
) {
  const accessResult = await addAccessHistory(name, slug, result, reason);
  return accessResult;
}

export async function getAccessHistoryAction(
  page: number = 1,
  limit: number = 10,
  search?: string,
  result?: "allow" | "block"
): Promise<{ items: HistoryItem[]; total: number }> {
  const resultData = await getAccessHistory(page, limit, search, result);
  return {
    items: resultData.items.map((item) => ({
      ...item,
      access_time: item.access_time.toISOString(),
    })),
    total: resultData.total,
  };
}

// Blocked names operations
export async function isNameBlockedAction(name: string): Promise<boolean> {
  return isBlockedName(name);
}

export async function addToBlockedNamesAction(value: string) {
  const result = await addToBlockedNames(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromBlockedNamesAction(value: string) {
  await removeFromBlockedNames(value);
  revalidatePath("/admin/lists");
}

export async function getBlockedNamesAction(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getBlockedNames(page, limit, search);
  return {
    items: result.items.map((value, index) => ({
      id: (page - 1) * limit + index + 1,
      value,
    })),
    total: result.total,
  };
}

// Blocked slugs operations
export async function isSlugBlockedAction(slug: string): Promise<boolean> {
  return isBlockedSlug(slug);
}

export async function addToBlockedSlugsAction(value: string) {
  try {
    const result = await addToBlockedSlugs(value);
    revalidatePath("/admin/lists");
    revalidatePath("/admin/verification");
    return result;
  } catch (error: any) {
    // Check if the error is a unique constraint violation (code 23505 for PostgreSQL)
    if (error.code === "23505") {
      // Slug is already blocked, which is the intended state. Log or ignore.
      console.log(
        `Slug "${value}" is already blocked. Ignoring duplicate entry.`
      );
      // Revalidate paths even if it was already blocked, to ensure UI consistency
      revalidatePath("/admin/lists");
      revalidatePath("/admin/verification");
      // Optionally return a specific value or null to indicate it was already present
      return null;
    } else {
      // Re-throw any other errors
      console.error("Error adding blocked slug:", error);
      throw error;
    }
  }
}

export async function removeFromBlockedSlugsAction(value: string) {
  await removeFromBlockedSlugs(value);
  revalidatePath("/admin/lists");
}

export async function getBlockedSlugsAction(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getBlockedSlugs(page, limit, search);
  return {
    items: result.items.map((value, index) => ({
      id: (page - 1) * limit + index + 1,
      value,
    })),
    total: result.total,
  };
}

// Allowed names operations
export async function isNameAllowedAction(name: string): Promise<boolean> {
  return isAllowedName(name);
}

export async function addToAllowedNamesAction(value: string) {
  const result = await addToAllowedNames(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromAllowedNamesAction(value: string) {
  await removeFromAllowedNames(value);
  revalidatePath("/admin/lists");
}

export async function getAllowedNamesAction(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getAllowedNames(page, limit, search);
  return {
    items: result.items.map((value, index) => ({
      id: (page - 1) * limit + index + 1,
      value,
    })),
    total: result.total,
  };
}

// Allowed slugs operations
export async function isSlugAllowedAction(slug: string): Promise<boolean> {
  return isAllowedSlug(slug);
}

export async function addToAllowedSlugsAction(value: string) {
  const result = await addToAllowedSlugs(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromAllowedSlugsAction(value: string) {
  await removeFromAllowedSlugs(value);
  revalidatePath("/admin/lists");
}

export async function getAllowedSlugsAction(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getAllowedSlugs(page, limit, search);
  return {
    items: result.items.map((value, index) => ({
      id: (page - 1) * limit + index + 1,
      value,
    })),
    total: result.total,
  };
}

// Verification queue operations
export async function addToQueueAction(name: string, slug: string) {
  const result = await addToVerificationQueue(name, slug);
  revalidatePath("/admin/verification");
  return result;
}

export async function getVerificationQueueAction(
  status = "pending"
): Promise<QueueItem[]> {
  const items = await getVerificationQueue();
  return items.filter((item) => item.status === status);
}

export async function updateQueueItemStatusAction(
  id: number,
  status: "pending" | "reviewed"
) {
  const result = await updateVerificationStatus(id, status);
  revalidatePath("/admin/verification");
  return result;
}

// Access check operations
export async function checkAccessAction(name: string, slug: string) {
  // Check if name is in allowed list (explicit allowlist overrides everything)
  if (await isNameAllowedAction(name)) {
    return { allowed: true, reason: "Name is explicitly allowed" };
  }

  // Check if slug is in allowed list
  if (await isSlugAllowedAction(slug)) {
    return { allowed: true, reason: "Slug is explicitly allowed" };
  }

  // Check if name is in blocked list
  if (await isNameBlockedAction(name)) {
    return { allowed: false, reason: "Name is explicitly blocked" };
  }

  // Check if slug is in blocked list
  if (await isSlugBlockedAction(slug)) {
    return { allowed: false, reason: "Slug is explicitly blocked" };
  }

  // Add to verification queue for manual review
  await addToQueueAction(name, slug);

  // Default to allowing access
  return { allowed: true, reason: "Added to verification queue" };
}

// Message operations
export async function addMessageAction(
  from: string,
  to: string,
  text: string,
  is_flagged: boolean,
  time: Date | null
) {
  const result = await addMessage(from, to, text, is_flagged, time);
  return result;
}

export async function addBulkMessagesAction(
  messages: {
    from: string;
    to: string;
    text: string;
    is_flagged: boolean;
    time: Date | null;
  }[]
) {
  const results = [];
  for (const msg of messages) {
    const result = await addMessage(
      msg.from,
      msg.to,
      msg.text,
      msg.is_flagged,
      msg.time
    );
    results.push(result);
  }
  return results;
}

export async function getMessagesAction(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: Message[]; total: number }> {
  const result = await getMessages(page, limit, search, true);
  return {
    items: result.items.map((item) => ({
      id: item.id,
      from: item.from,
      to: item.to,
      text: item.text,
      is_flagged: item.is_flagged,
      time: item.time,
      created_at: item.created_at,
    })),
    total: result.total,
  };
}

export async function getMessagesByNameAction(
  from: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const items = await getMessagesByName(from, limit, offset);
  return items.map((item) => ({
    ...item,
    time: item.time,
    created_at: item.created_at,
  }));
}

export async function getMessagesBySlugAction(
  to: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const items = await getMessagesBySlug(to, limit, offset);
  return items.map((item) => ({
    ...item,
    time: item.time,
    created_at: item.created_at,
  }));
}
