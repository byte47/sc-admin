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
import { useState, useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ChatBox({ session }: { session: any }) {
  // session: { participants: [string, string], messages: [{from, to, text, time}] }
  return (
    <Card
      className='whatsapp-chat-box bg-slate-50 border-slate-200 shadow-md max-w-xs mx-auto'
      style={{ width: 400 }}
    >
      {" "}
      <CardHeader className='py-2 px-3 bg-slate-100 rounded-t-md'>
        <CardTitle className='text-base font-semibold text-slate-900'>
          {session.participants.filter((p: string) => p !== "Me").join(", ")}
        </CardTitle>
        <CardDescription className='text-xs text-slate-700'>
          Last message:{" "}
          {session.messages[session.messages.length - 1].time
            ? new Date(
                session.messages[session.messages.length - 1].time
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className='p-3 space-y-2 h-[32rem] overflow-y-auto bg-slate-50'>
        {session.messages
          .slice(0)
          .reverse()
          .map((msg: any, idx: number) => (
            <div
              key={idx}
              className={`flex ${
                msg.from === "Me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 max-w-[70%] text-sm shadow-sm ${
                  msg.from === "Me"
                    ? "bg-slate-200 text-right text-slate-900"
                    : "bg-white text-left text-gray-900 border border-slate-100"
                }`}
              >
                <div>{msg.text}</div>
                <div className='text-[10px] text-gray-500 mt-1 text-right'>
                  {msg.time
                    ? new Date(msg.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardTables() {
  // Poll every 5 seconds
  const { data: swrVerifications } = useSWR(
    "/api/verification-queue",
    fetcher,
    {
      refreshInterval: 5000,
    }
  );
  const { data: history } = useSWR("/api/access-history?limit=30", fetcher, {
    refreshInterval: 5000,
  });
  const { data: chatSessions } = useSWR("/api/chat-sessions?limit=3", fetcher, {
    refreshInterval: 5000,
  });
  // New: fetch last active times
  const { data: lastActive } = useSWR(
    "/api/admin/db/info/last-active",
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const [verifications, setVerifications] = useState<any[]>([]);

  useEffect(() => {
    if (swrVerifications) setVerifications(swrVerifications);
  }, [swrVerifications]);

  function handleRemove(id: number) {
    setVerifications((items) => items.filter((item) => item.id !== id));
  }

  // --- Banner logic ---
  let mostRecent: Date | null = null;
  let timeSince: string = "";
  if (lastActive) {
    const lastMessage = lastActive.lastMessage
      ? new Date(lastActive.lastMessage)
      : null;
    const lastAccess = lastActive.lastAccess
      ? new Date(lastActive.lastAccess)
      : null;
    if (lastMessage && lastAccess) {
      mostRecent = lastMessage > lastAccess ? lastMessage : lastAccess;
    } else if (lastMessage) {
      mostRecent = lastMessage;
    } else if (lastAccess) {
      mostRecent = lastAccess;
    }
  }
  const now = new Date();
  let isActive = false;
  if (mostRecent) {
    const diffMs = now.getTime() - mostRecent.getTime();
    isActive = diffMs < 2 * 60 * 1000; // 2 minutes
    // Human readable time since
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) {
      timeSince = `${diffSec} second${diffSec === 1 ? "" : "s"} ago`;
    } else if (diffSec < 3600) {
      const min = Math.floor(diffSec / 60);
      timeSince = `${min} minute${min === 1 ? "" : "s"} ago`;
    } else {
      const hr = Math.floor(diffSec / 3600);
      timeSince = `${hr} hour${hr === 1 ? "" : "s"} ago`;
    }
  } else {
    timeSince = "No activity yet.";
  }
  // --- End banner logic ---

  return (
    <div className='space-y-8'>
      {/* System Status Banner */}
      <div
        className={`w-full py-2 px-4 rounded text-center font-semibold mb-4 ${
          isActive
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }`}
      >
        {isActive ? "System is active " : "System is not running or inactive "}(
        {timeSince})
      </div>
      {/* Latest Chats Section */}
      <div>
        <h2 className='text-xl font-bold mb-2'>Latest Sessions</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {chatSessions && chatSessions.length > 0 ? (
            chatSessions.map((session: any, idx: number) => (
              <ChatBox key={idx} session={session} />
            ))
          ) : (
            <p className='col-span-3 text-center text-muted-foreground'>
              No recent chat sessions.
            </p>
          )}
        </div>
      </div>
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
