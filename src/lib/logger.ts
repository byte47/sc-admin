import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";

// Ensure log directory exists
const LOG_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log file paths
const ACCESS_LOG_FILE = path.join(LOG_DIR, "access.log");
const MESSAGES_LOG_FILE = path.join(LOG_DIR, "messages.log");

// Initialize log files if they don't exist
if (!fs.existsSync(ACCESS_LOG_FILE)) {
  fs.writeFileSync(ACCESS_LOG_FILE, "");
}

if (!fs.existsSync(MESSAGES_LOG_FILE)) {
  fs.writeFileSync(MESSAGES_LOG_FILE, "");
}

export type LogEntry = {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  body: any;
  userAgent?: string;
};

/**
 * Log an API request to the specified log file
 */
export async function logRequest(
  request: NextRequest,
  logFile: string,
  body: any = null
): Promise<void> {
  try {
    // Get request details
    const url = request.url;
    const method = request.method;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // If body is not provided, try to parse it from the request
    if (body === null) {
      try {
        // Clone the request to read the body without consuming it
        const clonedRequest = request.clone();
        body = await clonedRequest.json();
      } catch (error) {
        console.error("Error parsing request body:", error);
        body = { error: "Could not parse request body" };
      }
    }

    // Create log entry
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      url,
      ip,
      userAgent,
      body,
    };

    // Append to log file
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n", {
      encoding: "utf8",
    });
  } catch (error) {
    console.error("Error logging request:", error);
  }
}

/**
 * Log an access request
 */
export async function logAccessRequest(
  request: NextRequest,
  body: any = null
): Promise<void> {
  return logRequest(request, ACCESS_LOG_FILE, body);
}

/**
 * Log a messages request
 */
export async function logMessagesRequest(
  request: NextRequest,
  body: any = null
): Promise<void> {
  return logRequest(request, MESSAGES_LOG_FILE, body);
}

/**
 * Get the last n log entries from a log file
 */
export function getLastLogs(logFile: string, count: number = 100): LogEntry[] {
  try {
    if (!fs.existsSync(logFile)) {
      return [];
    }

    const fileContent = fs.readFileSync(logFile, "utf8");
    const lines = fileContent
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Get the last n lines
    const lastLines = lines.slice(-count);

    // Parse each line as JSON
    return lastLines.map((line) => JSON.parse(line) as LogEntry).reverse();
  } catch (error) {
    console.error(`Error reading log file ${logFile}:`, error);
    return [];
  }
}

/**
 * Get the last n access log entries
 */
export function getLastAccessLogs(count: number = 100): LogEntry[] {
  return getLastLogs(ACCESS_LOG_FILE, count);
}

/**
 * Get the last n messages log entries
 */
export function getLastMessagesLogs(count: number = 100): LogEntry[] {
  return getLastLogs(MESSAGES_LOG_FILE, count);
}
