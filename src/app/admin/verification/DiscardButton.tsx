"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateQueueItemStatusAction } from "@/lib/actions";

interface DiscardButtonProps {
  itemId: number;
}

export default function DiscardButton({ itemId }: DiscardButtonProps) {
  async function handleDiscard() {
    try {
      await updateQueueItemStatusAction(itemId, "reviewed");
    } catch (error) {
      console.error("Error discarding item:", error);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleDiscard}
          className='h-5 text-muted-foreground hover:text-gray-700 px-1 py-0 text-xs'
        >
          <Trash2 className='h-3 w-3 mr-1' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='top'>
        Remove from queue without allowing or blocking
      </TooltipContent>
    </Tooltip>
  );
}
