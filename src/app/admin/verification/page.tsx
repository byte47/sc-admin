"use client";

import { useEffect, useState } from "react";
import { getVerificationQueueAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VerificationActions from "./VerificationActions";
import DiscardButton from "./DiscardButton";

export default function VerificationQueuePage() {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVerificationQueueAction("pending").then((items) => {
      setPendingItems(items);
      setLoading(false);
    });
  }, []);

  function handleRemove(id: number) {
    setPendingItems((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Verification Queue</h1>
      </div>

      <Card>
        <CardHeader className='py-3'>
          <CardTitle>Pending Verification ({pendingItems.length})</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <p className='text-muted-foreground text-center py-4'>Loading...</p>
          ) : pendingItems.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>
              No pending items to verify.
            </p>
          ) : (
            <Table className='border-collapse'>
              <TableHeader>
                <TableRow className='border-b hover:bg-transparent'>
                  <TableHead className='py-2 w-[70%]'>Item Details</TableHead>
                  <TableHead className='py-2 w-[30%]'>Queued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.map((item) => (
                  <TableRow key={item.id} className='border-b hover:bg-gray-50'>
                    <TableCell className='py-2'>
                      <VerificationActions
                        item={item}
                        onRemove={() => handleRemove(item.id)}
                      />
                    </TableCell>
                    <TableCell className='py-2 text-sm text-muted-foreground'>
                      <div className='flex items-center justify-between'>
                        <span>
                          {new Date(item.queued_at).toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                          })}
                        </span>
                        <DiscardButton
                          itemId={item.id}
                          onRemove={() => handleRemove(item.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
