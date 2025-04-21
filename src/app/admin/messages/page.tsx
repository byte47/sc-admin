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
import { BLACKLISTED_NAME_WORDS } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

interface MessagesTableProps {
  searchParams?: Promise<any>;
  params?: Promise<any>;
}

async function MessagesTable({ searchParams }: MessagesTableProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const searchTerm = resolvedSearchParams.search || "";

  const { items: messages, total } = await getMessagesAction(
    currentPage,
    ITEMS_PER_PAGE,
    searchTerm
  );

  // Calculate pagination values
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show current page and surrounding pages
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Function to check if a message contains potentially problematic content
  const checkMessageContent = (content: string) => {
    // Convert to format used in processing
    const processedContent = content.toLowerCase().replace(/\s+/g, "--");

    // Check for B patterns (similar to addBulkMessagesAction)
    const hasBPattern =
      processedContent.split("-b-").length - 1 >= 2 ||
      (processedContent.includes("-b-") && processedContent.includes("-boy-"));

    // Check for blacklisted words
    let hasBlacklistedWord = false;
    for (const word of BLACKLISTED_NAME_WORDS) {
      if (processedContent.includes(word.toLowerCase())) {
        hasBlacklistedWord = true;
        break;
      }
    }

    return {
      flagged: hasBPattern,
      blocked: hasBlacklistedWord,
    };
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
            <Input
              type='search'
              placeholder='Search messages...'
              defaultValue={searchTerm}
              className='w-full'
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className='text-center py-6 text-muted-foreground'>
            {searchTerm
              ? "No messages found matching your search."
              : "No messages found."}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className='w-[40%]'>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => {
                  const { flagged, blocked } = checkMessageContent(
                    message.text
                  );
                  return (
                    <TableRow
                      key={message.id}
                      className={
                        blocked ? "bg-red-50" : flagged ? "bg-yellow-50" : ""
                      }
                    >
                      <TableCell>{message.id}</TableCell>
                      <TableCell>{message.from}</TableCell>
                      <TableCell>{message.to}</TableCell>
                      <TableCell className='max-w-xs truncate'>
                        {message.text}
                      </TableCell>
                      <TableCell>
                        {blocked && (
                          <span className='text-red-600 font-semibold'>
                            Blocked
                          </span>
                        )}
                        {flagged && !blocked && (
                          <span className='text-amber-600 font-semibold'>
                            Flagged
                          </span>
                        )}
                        {!flagged && !blocked && (
                          <span className='text-green-600'>OK</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(message.created_at).toLocaleString("en-US", {
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
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={`?page=${currentPage - 1}${
                            searchTerm ? `&search=${searchTerm}` : ""
                          }`}
                        />
                      </PaginationItem>
                    )}

                    {getPageNumbers().map((pageNum, idx) => (
                      <PaginationItem key={`${pageNum}-${idx}`}>
                        {pageNum === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href={`?page=${pageNum}${
                              searchTerm ? `&search=${searchTerm}` : ""
                            }`}
                            isActive={pageNum === currentPage}
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={`?page=${currentPage + 1}${
                            searchTerm ? `&search=${searchTerm}` : ""
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

export default function MessagesPage({
  searchParams,
}: {
  searchParams?: Promise<any>;
  params?: Promise<any>;
}) {
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
        <MessagesTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
