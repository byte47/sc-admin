"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAccessLogsAction, getMessagesLogsAction } from "@/lib/actions";
import { LogEntry } from "@/lib/logger";

export default function LogsPage() {
  const [accessLogs, setAccessLogs] = useState<LogEntry[]>([]);
  const [messagesLogs, setMessagesLogs] = useState<LogEntry[]>([]);
  const [logCount, setLogCount] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestLogs, setRequestLogs] = useState<LogEntry[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);

  const fetchLogs = async (type: "access" | "messages") => {
    setLoading(true);
    try {
      if (type === "access") {
        const logs = await getAccessLogsAction(logCount);
        setAccessLogs(logs);
      } else {
        const logs = await getMessagesLogsAction(logCount);
        setMessagesLogs(logs);
      }
    } catch (error) {
      console.error(`Error fetching ${type} logs:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLogCount(isNaN(value) ? 50 : Math.max(1, value));
  };

  useEffect(() => {
    setLoadingRequests(true);
    fetch("/api/admin/requests-logs")
      .then((res) => res.json())
      .then((data) => setRequestLogs(data))
      .finally(() => setLoadingRequests(false));
  }, []);

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>API Logs</h1>
      </div>

      <div className='flex items-center gap-4 mb-4'>
        <div className='flex items-center gap-2'>
          <label htmlFor='logCount' className='text-sm'>
            Show last
          </label>
          <Input
            id='logCount'
            type='number'
            min={1}
            value={logCount}
            onChange={handleCountChange}
            className='w-24'
          />
          <span className='text-sm'>entries</span>
        </div>
      </div>

      <Tabs defaultValue='access'>
        <TabsList>
          <TabsTrigger value='access' onClick={() => fetchLogs("access")}>
            Access Logs
          </TabsTrigger>
          <TabsTrigger value='messages' onClick={() => fetchLogs("messages")}>
            Messages Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value='access'>
          <Card>
            <CardHeader>
              <CardTitle>Access API Logs</CardTitle>
              <CardDescription>
                View logs of requests to the /api/access endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <Button
                  variant='outline'
                  onClick={() => fetchLogs("access")}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh Logs"}
                </Button>
              </div>

              {accessLogs.length === 0 ? (
                <p className='text-center py-6 text-muted-foreground'>
                  {loading
                    ? "Loading logs..."
                    : 'No logs found. Click "Refresh Logs" to load data.'}
                </p>
              ) : (
                <div className='border rounded-md overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Request</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              timeZone: "Asia/Kolkata",
                            })}
                          </TableCell>
                          <TableCell>{log.method}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                          <TableCell>
                            <pre className='text-xs max-w-md overflow-x-auto whitespace-pre-wrap'>
                              {JSON.stringify(log.body, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='messages'>
          <Card>
            <CardHeader>
              <CardTitle>Messages API Logs</CardTitle>
              <CardDescription>
                View logs of requests to the /api/messages endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <Button
                  variant='outline'
                  onClick={() => fetchLogs("messages")}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh Logs"}
                </Button>
              </div>

              {messagesLogs.length === 0 ? (
                <p className='text-center py-6 text-muted-foreground'>
                  {loading
                    ? "Loading logs..."
                    : 'No logs found. Click "Refresh Logs" to load data.'}
                </p>
              ) : (
                <div className='border rounded-md overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Request</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messagesLogs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              timeZone: "Asia/Kolkata",
                            })}
                          </TableCell>
                          <TableCell>{log.method}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                          <TableCell>
                            <pre className='text-xs max-w-md overflow-x-auto whitespace-pre-wrap'>
                              {JSON.stringify(log.body, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section>
        <h2>Last 5 API Requests</h2>
        {loadingRequests ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Method</th>
                <th>URL</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              {requestLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>{log.timestamp}</td>
                  <td>{log.method}</td>
                  <td>{log.url}</td>
                  <td>
                    <pre style={{ maxWidth: 300, overflowX: "auto" }}>
                      {JSON.stringify(log.body, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
