"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportListButtonProps {
  listType:
    | "blocked-names"
    | "blocked-slugs"
    | "allowed-names"
    | "allowed-slugs";
  items: Array<{ id: number; value: string }>;
  fileName?: string;
}

export default function ExportListButton({
  listType,
  items,
  fileName,
}: ExportListButtonProps) {
  const [loading, setLoading] = useState(false);

  // Format items as CSV content
  const formatAsCsv = (items: Array<{ id: number; value: string }>) => {
    // CSV header
    const header = "id,value\n";

    // Convert items to CSV rows
    const rows = items
      .map((item) => `${item.id},${item.value.replace(/,/g, ";")}`)
      .join("\n");

    // Combine header and rows
    return header + rows;
  };

  const handleExport = () => {
    setLoading(true);

    try {
      // Generate CSV content
      const csvContent = formatAsCsv(items);

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = url;

      // Set the file name
      const defaultFileName = `${listType}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.download = fileName || defaultFileName;

      // Append the link to the document
      document.body.appendChild(link);

      // Click the link to trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting list:", error);
      alert("Failed to export list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleExport}
      disabled={loading || items.length === 0}
    >
      {loading ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Exporting...
        </>
      ) : (
        <>
          <Download className='mr-2 h-4 w-4' />
          Export CSV
        </>
      )}
    </Button>
  );
}
