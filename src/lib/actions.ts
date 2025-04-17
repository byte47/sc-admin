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
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: HistoryItem[]; total: number }> {
  const result = await getAccessHistory(page, limit, search);
  return {
    items: result.items.map((item) => ({
      ...item,
      access_time: item.access_time.toISOString(),
    })),
    total: result.total,
  };
}

// Blocked names operations
export async function isNameBlockedAction(name: string): Promise<boolean> {
  const blockedNames = await getBlockedNames();
  return blockedNames.items.some(
    (value: string) => value.toLowerCase() === name.toLowerCase()
  );
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
  limit: number = 10
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getBlockedNames(page, limit);
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
  const blockedSlugs = await getBlockedSlugs();
  return blockedSlugs.items.some(
    (value: string) => value.toLowerCase() === slug.toLowerCase()
  );
}

export async function addToBlockedSlugsAction(value: string) {
  const result = await addToBlockedSlugs(value);
  revalidatePath("/admin/lists");
  revalidatePath("/admin/verification");
  return result;
}

export async function removeFromBlockedSlugsAction(value: string) {
  await removeFromBlockedSlugs(value);
  revalidatePath("/admin/lists");
}

export async function getBlockedSlugsAction(
  page: number = 1,
  limit: number = 10
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getBlockedSlugs(page, limit);
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
  const allowedNames = await getAllowedNames();
  return allowedNames.items.some(
    (value: string) => value.toLowerCase() === name.toLowerCase()
  );
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
  limit: number = 10
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getAllowedNames(page, limit);
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
  const allowedSlugs = await getAllowedSlugs();
  return allowedSlugs.items.some(
    (value: string) => value.toLowerCase() === slug.toLowerCase()
  );
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
  limit: number = 10
): Promise<{ items: ListItem[]; total: number }> {
  const result = await getAllowedSlugs(page, limit);
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
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ items: Message[]; total: number }> {
  const result = await getMessages(page, limit, search);
  return {
    items: result.items.map((msg) => ({
      ...msg,
      created_at: msg.created_at.toISOString(),
    })),
    total: result.total,
  };
}

export async function getMessagesByNameAction(
  name: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const messages = await getMessagesByName(name, limit, offset);
  return messages.map((msg) => ({
    ...msg,
    created_at: msg.created_at.toISOString(),
  }));
}

export async function getMessagesBySlugAction(
  slug: string,
  limit = 100,
  offset = 0
): Promise<Message[]> {
  const messages = await getMessagesBySlug(slug, limit, offset);
  return messages.map((msg) => ({
    ...msg,
    created_at: msg.created_at.toISOString(),
  }));
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
