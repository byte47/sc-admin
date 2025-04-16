import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

// Function to handle database backup
export async function POST() {
  try {
    // Get current date and time for the backup filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:T]/g, "-").split(".")[0];
    const backupFilename = `sc-admin-backup-${timestamp}.db`;

    // Define paths
    const dataDir = path.join(process.cwd(), "data");
    const dbPath = path.join(dataDir, "sc-admin.db");
    const backupDir = path.join(dataDir, "backups");
    const backupPath = path.join(backupDir, backupFilename);

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Check if the database file exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { error: "Database file not found" },
        { status: 404 }
      );
    }

    // Copy the database file to create a backup
    fs.copyFileSync(dbPath, backupPath);

    // Revalidate the maintenance page to update the backups list
    revalidatePath("/admin/maintenance");

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Database backup created successfully",
      filename: backupFilename,
      path: backupPath,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error creating database backup:", error);
    return NextResponse.json(
      { error: "Failed to create database backup" },
      { status: 500 }
    );
  }
}
