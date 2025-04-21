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

  // Format items as plain text content (only value per line)
  const formatAsText = (items: Array<{ id: number; value: string }>) => {
    return items.map((item) => item.value).join("\n");
  };

  const handleExport = () => {
    setLoading(true);

    try {
      // Generate plain text content with all lists, only value per line
      const allValues = [
        ...blockedNames,
        ...blockedSlugs,
        ...allowedNames,
        ...allowedSlugs,
      ];
      const textContent = allValues.map((item) => item.value).join("\n");

      // Create a Blob with the text content
      const blob = new Blob([textContent], {
        type: "text/plain;charset=utf-8;",
      });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement("a");
      link.href = url;

      // Set the file name
      const fileName = `sc-admin-all-lists-${
        new Date().toISOString().split("T")[0]
      }.txt`;
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
