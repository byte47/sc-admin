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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import HistoryFilters from "./HistoryFilters";

export const metadata: Metadata = {
  title: "Access History - Access Monitor",
  description: "View access history logs",
};

const ITEMS_PER_PAGE = 50;

interface PageProps {
  searchParams?: Promise<any>;
  params?: Promise<any>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const searchTerm = resolvedSearchParams.search || "";
  const resultFilter = resolvedSearchParams.result || "";

  const { items: historyItems, total } = await getAccessHistoryAction(
    currentPage,
    ITEMS_PER_PAGE,
    searchTerm,
    resultFilter || undefined
  );

  // Calculate pagination values
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
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
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Helper to build query string
  const buildQuery = (params: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.search) query.set("search", params.search);
    if (params.result) query.set("result", params.result);
    return `?${query.toString()}`;
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
            <HistoryFilters />
          </div>
        </CardHeader>
        <CardContent>
          {historyItems.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>
              {searchTerm || resultFilter
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
                            href={buildQuery({
                              page: currentPage - 1,
                              search: searchTerm,
                              result: resultFilter,
                            })}
                          />
                        </PaginationItem>
                      )}

                      {getPageNumbers().map((pageNum, idx) => (
                        <PaginationItem key={`${pageNum}-${idx}`}>
                          {pageNum === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href={buildQuery({
                                page: pageNum,
                                search: searchTerm,
                                result: resultFilter,
                              })}
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
                            href={buildQuery({
                              page: currentPage + 1,
                              search: searchTerm,
                              result: resultFilter,
                            })}
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
