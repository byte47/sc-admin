"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueueItem } from "@/lib/data";
import {
  addToAllowedNamesAction,
  addToAllowedSlugsAction,
  addToBlockedNamesAction,
  addToBlockedSlugsAction,
  updateQueueItemStatusAction,
} from "@/lib/actions";
import { Check, X, Pencil, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationActionsProps {
  item: QueueItem;
}

export default function VerificationActions({
  item,
}: VerificationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState(item.slug);
  const [isEditing, setIsEditing] = useState(false);

  async function handleAction(
    action: "allow" | "block",
    target: "name" | "slug"
  ) {
    const actionIdentifier = `${action}-${target}`;
    setLoading(actionIdentifier);

    try {
      const value = target === "name" ? item.name : customSlug;

      // Add to appropriate list or just mark as reviewed for discard
      if (action === "allow" && target === "name") {
        await addToAllowedNamesAction(value);
      } else if (action === "allow" && target === "slug") {
        await addToAllowedSlugsAction(value);
      } else if (action === "block" && target === "name") {
        await addToBlockedNamesAction(value);
      } else if (action === "block" && target === "slug") {
        await addToBlockedSlugsAction(value);
      }

      // Mark as reviewed
      await updateQueueItemStatusAction(item.id, "reviewed");

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error("Error processing action:", error);
    } finally {
      setLoading(null);
    }
  }

  function toggleEdit() {
    if (isEditing) {
      // Save changes by doing nothing, just exit edit mode
      setIsEditing(false);
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  }

  return (
    <TooltipProvider>
      <div className='w-full flex space-y-1'>
        {/* Slug row - more compact */}
        {item.slug && (
          <div className='flex items-center'>
            <div className='flex'>
              {isEditing ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={toggleEdit}
                  className='h-6 px-2 text-xs py-0'
                >
                  <Save className='h-2.5 w-2.5 mr-1' />
                  Save
                </Button>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleAction("block", "slug")}
                        disabled={!!loading}
                        className='h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 p-0'
                      >
                        {loading === "block-slug" ? (
                          <div className='h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' />
                        ) : (
                          <X className='h-3 w-3' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>Block slug</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleAction("allow", "slug")}
                        disabled={!!loading}
                        className='h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50 p-0'
                      >
                        {loading === "allow-slug" ? (
                          <div className='h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' />
                        ) : (
                          <Check className='h-3 w-3' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>Allow slug</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
            {isEditing ? (
              <div className='flex-1 mr-1'>
                <Input
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className='h-6 text-xs py-0 px-1'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      toggleEdit();
                    }
                  }}
                />
              </div>
            ) : (
              <div className='flex-1 text-xs text-muted-foreground truncate flex items-center mr-1'>
                <span className='truncate'>{customSlug}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={toggleEdit}
                      className='h-5 w-5 ml-1 p-0'
                    >
                      <Pencil className='h-2.5 w-2.5' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top'>Edit slug</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* Name row - more compact */}
        <div className='flex items-center'>
          <div className='font-medium truncate flex-1 mr-1'>{item.name}</div>
          <div className='flex'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleAction("block", "name")}
                  disabled={!!loading}
                  className='h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 p-0'
                >
                  {loading === "block-name" ? (
                    <div className='h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' />
                  ) : (
                    <X className='h-3 w-3' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top'>Block name</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleAction("allow", "name")}
                  disabled={!!loading}
                  className='h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50 p-0'
                >
                  {loading === "allow-name" ? (
                    <div className='h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' />
                  ) : (
                    <Check className='h-3 w-3' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top'>Allow name</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
