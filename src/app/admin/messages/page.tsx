import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getMessagesAction } from "@/lib/actions";

const ITEMS_PER_PAGE = 100;

interface MessagesTableProps {
  searchParams?: { [key: string]: any };
}

async function MessagesTable({ searchParams }: MessagesTableProps) {
  const params = searchParams || {};
  const page = Number(params.page) || 1;
  const term = params.search || "";

  const { items: msgs, total } = await getMessagesAction(
    page,
    ITEMS_PER_PAGE,
    term
  );

  // Calculate pagination values
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Generate page numbers to display
  const getPages = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxPages = 5;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              Latest messages received from users ({total} total)
            </CardDescription>
          </div>
          <div className='w-64'>
            <form method='GET' action='' className='w-full'>
              <Input
                type='search'
                name='search'
                placeholder='Search messages...'
                defaultValue={term}
                className='w-full'
              />
            </form>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {msgs.length === 0 ? (
          <p className='text-center py-6 text-muted-foreground'>
            {term
              ? "No messages found matching your search."
              : "No messages found."}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className='w-[40%]'>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {msgs.map((msg) => {
                  let status = "OK";
                  let statusClass = "text-green-600";
                  let rowClass = "";
                  if (msg.is_blocked) {
                    status = "Blocked";
                    statusClass = "text-red-600 font-semibold";
                    rowClass = "bg-red-50";
                  } else if (msg.is_flagged) {
                    status = "Flagged";
                    statusClass = "text-amber-600 font-semibold";
                    rowClass = "bg-yellow-50";
                  }
                  return (
                    <TableRow key={msg.id} className={rowClass}>
                      <TableCell>{msg.id}</TableCell>
                      <TableCell>{msg.from}</TableCell>
                      <TableCell>{msg.to}</TableCell>
                      <TableCell className='max-w-xs truncate'>
                        {msg.text}
                      </TableCell>
                      <TableCell>
                        <span className={statusClass}>{status}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(msg.created_at).toLocaleString("en-US", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className='mt-4'>
                <Pagination>
                  <PaginationContent>
                    {page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={`?page=${page - 1}${
                            term ? `&search=${term}` : ""
                          }`}
                        />
                      </PaginationItem>
                    )}

                    {getPages().map((p, idx) => (
                      <PaginationItem key={`${p}-${idx}`}>
                        {p === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href={`?page=${p}${term ? `&search=${term}` : ""}`}
                            className={p === page ? "font-bold underline" : ""}
                          >
                            {p}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    {page < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={`?page=${page + 1}${
                            term ? `&search=${term}` : ""
                          }`}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<any>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>User Messages</h1>
      </div>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Message Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-2'>
            Messages are now automatically processed for potentially problematic
            content:
          </p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>
              <strong>Flagged Messages:</strong> Messages with B-word patterns
              or multiple B references are flagged.
            </li>
            <li>
              <strong>Blocked Messages:</strong> Messages containing blacklisted
              terms are marked for review.
            </li>
            <li>
              All messages are logged in the console with [FLAGGED] or [BLOCKED]
              tags for administrative review.
            </li>
          </ul>
        </CardContent>
      </Card>
      <Suspense fallback={<p>Loading messages...</p>}>
        <MessagesTable searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
