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

export const metadata: Metadata = {
  title: "Access History - Access Monitor",
  description: "View access history logs",
};

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const searchTerm = searchParams.search || "";

  const { items: historyItems, total } = await getAccessHistoryAction(
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

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Access History</h1>
      </div>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Recent Access Attempts ({total})</CardTitle>
            <div className='w-64'>
              <Input
                type='search'
                placeholder='Search by name, slug, or reason...'
                defaultValue={searchTerm}
                className='w-full'
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyItems.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>
              {searchTerm
                ? "No results found."
                : "No access history to display."}
            </p>
          ) : (
            <>
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
    </div>
  );
}
