"use client";

import { useState, useEffect } from "react";
import { LogEntry } from "@/lib/logger";

export default function LogsPage() {
  const [requestLogs, setRequestLogs] = useState<LogEntry[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);

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
        <h1 className='text-3xl font-bold tracking-tight'>Request Body</h1>
      </div>

      <section>
        <h2>Last 5 Requests</h2>
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
