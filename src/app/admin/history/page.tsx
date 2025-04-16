import { Metadata } from "next";
import { getAccessHistoryAction } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Access History - Access Monitor",
  description: "View access history logs",
};

export default async function HistoryPage() {
  const historyItems = await getAccessHistoryAction(100, 0);

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Access History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Access Attempts ({historyItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {historyItems.length === 0 ? (
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
                {historyItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{item.name}</TableCell>
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
      </Card>
    </div>
  );
}
