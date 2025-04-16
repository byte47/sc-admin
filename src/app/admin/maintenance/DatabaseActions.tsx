"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DbInfo {
  dbPath: string;
  fileSize: string;
  lastModified: string;
  backups: Array<{ name: string; size: string; date: string }>;
  totalBackups: number;
  totalEntries: number;
  allowedNamesCount: number;
  allowedSlugsCount: number;
  blockedNamesCount: number;
  blockedSlugsCount: number;
}

export default function DatabaseActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<"backup" | "reset" | null>(
    null
  );
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);

  // Fetch database info on component mount
  useEffect(() => {
    fetchDbInfo();
  }, []);

  // Update database info on the page
  useEffect(() => {
    if (dbInfo) {
      const dbSizeEl = document.getElementById("db-size");
      if (dbSizeEl) {
        dbSizeEl.textContent = dbInfo.fileSize;
      }

      const lastBackupEl = document.getElementById("last-backup");
      if (lastBackupEl && dbInfo.backups.length > 0) {
        const date = new Date(dbInfo.backups[0].date);
        lastBackupEl.textContent = date.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });
      }
    }
  }, [dbInfo]);

  const fetchDbInfo = async () => {
    setLoading("backup");
    setResult(null);

    try {
      const response = await fetch("/api/admin/db/info");
      if (response.ok) {
        const data = await response.json();
        setDbInfo(data);
      } else {
        console.error("Failed to fetch database info");
        setDbInfo(null);
      }
    } catch (error: unknown) {
      console.error("Error fetching database info:", error);
      setDbInfo(null);
    } finally {
      setLoading(null);
    }
  };

  const handleBackup = async () => {
    setLoading("backup");
    setResult(null);

    try {
      const response = await fetch("/api/admin/db/backup", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Database backed up successfully: ${data.filename}`,
        });

        // Refresh database info
        fetchDbInfo();
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to backup database",
        });
      }
    } catch (error: unknown) {
      setResult({
        success: false,
        message: "An unexpected error occurred during backup",
      });
      console.error("Backup error:", error);
    } finally {
      setLoading(null);
      setConfirmOpen(false);
      setCurrentAction(null);
    }
  };

  const handleReset = async () => {
    setLoading("reset");
    setResult(null);

    try {
      const response = await fetch("/api/admin/db/reset", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        // For a successful reset, show a more positive message with reload instructions
        setResult({
          success: true,
          message:
            "Database reset successfully. The page will reload to show the fresh state.",
        });

        // Refresh database info
        fetchDbInfo();

        // Short delay before refreshing the entire page
        setTimeout(() => {
          router.refresh();

          // Force a hard reload after a short delay if needed
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }, 1500);
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to reset database",
        });
      }
    } catch (error: unknown) {
      setResult({
        success: false,
        message: "An unexpected error occurred during reset",
      });
      console.error("Reset error:", error);
    } finally {
      setLoading(null);
      setConfirmOpen(false);
      setCurrentAction(null);
    }
  };

  const openConfirmDialog = (action: "backup" | "reset") => {
    setCurrentAction(action);
    setConfirmOpen(true);
  };

  return (
    <div className='space-y-6'>
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Button
          variant='outline'
          disabled={!!loading}
          onClick={() => openConfirmDialog("backup")}
        >
          {loading === "backup" ? "Backing up..." : "Backup Database"}
        </Button>

        <Button
          variant='destructive'
          disabled={!!loading}
          onClick={() => openConfirmDialog("reset")}
        >
          {loading === "reset" ? "Resetting..." : "Reset Database"}
        </Button>
      </div>

      {/* Recent Backups Section */}
      {dbInfo && dbInfo.backups.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-sm font-medium mb-2'>Recent Backups</h3>
          <div className='text-sm border rounded-md overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Filename
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Size
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {dbInfo.backups.map((backup, index) => (
                  <tr key={index}>
                    <td className='px-3 py-2 whitespace-nowrap text-xs'>
                      {backup.name}
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-xs'>
                      {backup.size}
                    </td>
                    <td className='px-3 py-2 whitespace-nowrap text-xs'>
                      {new Date(backup.date).toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dbInfo.totalBackups > 10 && (
            <p className='text-xs text-gray-500 mt-1'>
              Showing 10 of {dbInfo.totalBackups} backups
            </p>
          )}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction === "backup" ? "Confirm Backup" : "Confirm Reset"}
            </DialogTitle>
            <DialogDescription>
              {currentAction === "backup"
                ? "Are you sure you want to create a backup of the current database? This will create a copy of the database file."
                : "Are you sure you want to reset the database? This will completely clear all data and create a fresh database. A backup will be created automatically before reset."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-4'>
            <Button
              variant='outline'
              onClick={() => setConfirmOpen(false)}
              disabled={!!loading}
            >
              Cancel
            </Button>
            <Button
              variant={currentAction === "backup" ? "default" : "destructive"}
              onClick={currentAction === "backup" ? handleBackup : handleReset}
              disabled={!!loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
