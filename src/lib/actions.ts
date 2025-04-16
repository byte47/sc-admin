"use server";

import { revalidatePath } from "next/cache";
import { QueueItem, ListItem, HistoryItem, Message } from "./data";
import { slugify, BLACKLISTED_MESSAGE_WORDS } from "./utils";
import { getLastAccessLogs, getLastMessagesLogs, LogEntry } from "./logger";
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
  limit = 100,
  offset = 0
): Promise<HistoryItem[]> {
  return getAccessHistory(limit, offset);
}

// Blocked names operations
export async function isNameBlockedAction(name: string): Promise<boolean> {
  const blockedNames = await getBlockedNames();
  return blockedNames.some(
    (value) => value.toLowerCase() === name.toLowerCase()
  );
}

export async function addToBlockedNamesAction(value: string) {
  const result = await addToBlockedNames(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromBlockedNamesAction(id: number) {
  const result = await removeFromBlockedNames(id);
  revalidatePath("/admin/lists");
  return result;
}

export async function getBlockedNamesAction(): Promise<ListItem[]> {
  const names = await getBlockedNames();
  return names.map((value, index) => ({ id: index + 1, value }));
}

// Blocked slugs operations
export async function isSlugBlockedAction(slug: string): Promise<boolean> {
  const blockedSlugs = await getBlockedSlugs();
  return blockedSlugs.some(
    (value) => value.toLowerCase() === slug.toLowerCase()
  );
}

export async function addToBlockedSlugsAction(value: string) {
  const result = await addToBlockedSlugs(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromBlockedSlugsAction(id: number) {
  const result = await removeFromBlockedSlugs(id);
  revalidatePath("/admin/lists");
  return result;
}

export async function getBlockedSlugsAction(): Promise<ListItem[]> {
  const slugs = await getBlockedSlugs();
  return slugs.map((value, index) => ({ id: index + 1, value }));
}

// Allowed names operations
export async function isNameAllowedAction(name: string): Promise<boolean> {
  const allowedNames = await getAllowedNames();
  return allowedNames.some(
    (value) => value.toLowerCase() === name.toLowerCase()
  );
}

export async function addToAllowedNamesAction(value: string) {
  const result = await addToAllowedNames(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromAllowedNamesAction(id: number) {
  const result = await removeFromAllowedNames(id);
  revalidatePath("/admin/lists");
  return result;
}

export async function getAllowedNamesAction(): Promise<ListItem[]> {
  const names = await getAllowedNames();
  return names.map((value, index) => ({ id: index + 1, value }));
}

// Allowed slugs operations
export async function isSlugAllowedAction(slug: string): Promise<boolean> {
  const allowedSlugs = await getAllowedSlugs();
  return allowedSlugs.some(
    (value) => value.toLowerCase() === slug.toLowerCase()
  );
}

export async function addToAllowedSlugsAction(value: string) {
  const result = await addToAllowedSlugs(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromAllowedSlugsAction(id: number) {
  const result = await removeFromAllowedSlugs(id);
  revalidatePath("/admin/lists");
  return result;
}

export async function getAllowedSlugsAction(): Promise<ListItem[]> {
  const slugs = await getAllowedSlugs();
  return slugs.map((value, index) => ({ id: index + 1, value }));
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
export async function addMessageAction(name: string, content: string) {
  // Check for blacklisted words
  const hasBlacklistedWords = BLACKLISTED_MESSAGE_WORDS.some((word) =>
    content.toLowerCase().includes(word.toLowerCase())
  );

  if (hasBlacklistedWords) {
    return { error: "Message contains inappropriate content" };
  }

  const slug = slugify(name);
  const result = await addMessage(name, slug, content);
  revalidatePath("/admin/messages");
  return result;
}

export async function addBulkMessagesAction(name: string, messages: string[]) {
  const slug = slugify(name);
  const results = [];

  for (const content of messages) {
    // Check for blacklisted words
    const hasBlacklistedWords = BLACKLISTED_MESSAGE_WORDS.some((word) =>
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (!hasBlacklistedWords) {
      const result = await addMessage(name, slug, content);
      results.push(result);
    }
  }

  revalidatePath("/admin/messages");
  return results;
}

export async function getMessagesAction(
  limit = 100,
  offset = 0
): Promise<Message[]> {
  return getMessages(limit, offset);
}

export async function getMessagesByNameAction(
  name: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  return getMessagesByName(name, limit, offset);
}

export async function getMessagesBySlugAction(
  slug: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  return getMessagesBySlug(slug, limit, offset);
}

export async function getAccessLogsAction(
  count: number = 100
): Promise<LogEntry[]> {
  return getLastAccessLogs(count);
}

export async function getMessagesLogsAction(
  count: number = 100
): Promise<LogEntry[]> {
  return getLastMessagesLogs(count);
}
