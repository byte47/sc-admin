import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import config from "@/config";
import {
  getBlockedNamesAction,
  getBlockedSlugsAction,
  getAllowedNamesAction,
  getAllowedSlugsAction,
  getAccessHistoryAction,
} from "@/lib/actions";
import { debugLog } from "@/lib/logger";

// Function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Function to get database info
export async function GET() {
  try {
    debugLog("GET /api/admin/db/info - request received");
    const dataDir = config.data.path;
    const dbPath = path.join(dataDir, "sc-admin.db");
    const backupDir = path.join(dataDir, "backups");

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { error: "Database file not found" },
        { status: 404 }
      );
    }

    // Get database file stats
    const stats = fs.statSync(dbPath);
    const fileSize = formatFileSize(stats.size);
    const lastModified = stats.mtime.toISOString();

    // Get backups info (latest 10)
    let backups: Array<{ name: string; size: string; date: string }> = [];
    let totalBackups = 0;

    if (fs.existsSync(backupDir)) {
      const backupFiles = fs
        .readdirSync(backupDir)
        .filter((file) => file.endsWith(".db"))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(backupDir, a));
          const statB = fs.statSync(path.join(backupDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime(); // Sort by modification time, newest first
        });

      totalBackups = backupFiles.length;

      // Get info for the latest 10 backups
      backups = backupFiles.slice(0, 10).map((file) => {
        const backupStats = fs.statSync(path.join(backupDir, file));
        return {
          name: file,
          size: formatFileSize(backupStats.size),
          date: backupStats.mtime.toISOString(),
        };
      });
    }

    // Get database entry counts
    const allowedNames = await getAllowedNamesAction();
    const allowedSlugs = await getAllowedSlugsAction();
    const blockedNames = await getBlockedNamesAction();
    const blockedSlugs = await getBlockedSlugsAction();
    const historyEntries = await getAccessHistoryAction(1, 0); // Just to get the count

    debugLog("GET /api/admin/db/info - response", {
      dbPath,
      fileSize,
      lastModified,
      backups,
      totalBackups,
      totalEntries: historyEntries.items.length,
      allowedNamesCount: allowedNames.items.length,
      allowedSlugsCount: allowedSlugs.items.length,
      blockedNamesCount: blockedNames.items.length,
      blockedSlugsCount: blockedSlugs.items.length,
    });
    return NextResponse.json({
      dbPath,
      fileSize,
      lastModified,
      backups,
      totalBackups,
      totalEntries: historyEntries.items.length,
      allowedNamesCount: allowedNames.items.length,
      allowedSlugsCount: allowedSlugs.items.length,
      blockedNamesCount: blockedNames.items.length,
      blockedSlugsCount: blockedSlugs.items.length,
    });
  } catch (error) {
    debugLog("GET /api/admin/db/info - error", error);
    console.error("Error getting database info:", error);
    return NextResponse.json(
      { error: "Failed to get database info" },
      { status: 500 }
    );
  }
}
