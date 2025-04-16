"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { ListItem } from "@/app/admin/lists/ListTable";

interface BatchExportButtonProps {
  blockedNames: ListItem[];
  blockedSlugs: ListItem[];
  allowedNames: ListItem[];
  allowedSlugs: ListItem[];
}

export default function BatchExportButton({
  blockedNames,
  blockedSlugs,
  allowedNames,
  allowedSlugs,
}: BatchExportButtonProps) {
  const [loading, setLoading] = useState(false);

  // Format items as CSV content
  const formatAsCsv = (
    items: Array<{ id: number; value: string }>,
    listName: string
  ) => {
    // Convert items to CSV rows
    const rows = items
      .map((item) => `${listName},${item.id},${item.value.replace(/,/g, ";")}`)
      .join("\n");

    return rows;
  };

  const handleExport = () => {
    setLoading(true);

    try {
      // Generate CSV content with all lists
      let csvContent = "list,id,value\n"; // Header

      // Add all lists data
      csvContent += formatAsCsv(blockedNames, "blocked-names") + "\n";
      csvContent += formatAsCsv(blockedSlugs, "blocked-slugs") + "\n";
      csvContent += formatAsCsv(allowedNames, "allowed-names") + "\n";
      csvContent += formatAsCsv(allowedSlugs, "allowed-slugs");

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = url;

      // Set the file name
      const fileName = `sc-admin-all-lists-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.download = fileName;

      // Append the link to the document
      document.body.appendChild(link);

      // Click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting lists:", error);
      alert("Failed to export lists. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant='outline'
      onClick={handleExport}
      disabled={
        loading ||
        blockedNames.length +
          blockedSlugs.length +
          allowedNames.length +
          allowedSlugs.length ===
          0
      }
    >
      {loading ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Exporting...
        </>
      ) : (
        <>
          <Download className='mr-2 h-4 w-4' />
          Export All Lists
        </>
      )}
    </Button>
  );
}
