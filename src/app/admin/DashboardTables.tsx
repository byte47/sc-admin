"use client";

import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import VerificationActions from "./verification/VerificationActions";
import DiscardButton from "./verification/DiscardButton";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardTables() {
  // Poll every 5 seconds
  const { data: verifications } = useSWR("/api/verification-queue", fetcher, {
    refreshInterval: 5000,
  });
  const { data: history } = useSWR("/api/access-history?limit=30", fetcher, {
    refreshInterval: 5000,
  });

  return (
    <div className='space-y-8'>
      {/* Verification Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
          <CardDescription>Most recent pending items</CardDescription>
        </CardHeader>
        <CardContent>
          {!verifications || verifications.length === 0 ? (
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
                {verifications.map((item: any) => (
                  <TableRow key={item.id} className='border-b hover:bg-gray-50'>
                    <TableCell className='py-2'>
                      <VerificationActions item={item} />
                    </TableCell>
                    <TableCell className='py-2 text-sm text-muted-foreground'>
                      <div className='flex items-center justify-between'>
                        <span>
                          {new Date(item.queued_at).toLocaleString("en-US", {
                            timeZone: "Asia/Kolkata",
                          })}
                        </span>
                        <DiscardButton itemId={item.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Link href='/admin/verification' passHref>
            <Button variant='outline' className='w-full'>
              View Full Queue
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Access History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Access History</CardTitle>
          <CardDescription>Last 30 access attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {!history || history.items.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>
              No access history to display.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.slug}</TableCell>
                    <TableCell>
                      {new Date(item.access_time).toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          item.result === "allow"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {item.result}
                      </span>
                    </TableCell>
                    <TableCell>{item.reason || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Link href='/admin/history' passHref>
            <Button variant='outline' className='w-full'>
              View Full History
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
