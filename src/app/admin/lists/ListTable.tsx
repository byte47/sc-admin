"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks";
import ExportListButton from "@/components/ExportListButton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface ListItem {
  id: number;
  value: string;
}

interface ListTableProps {
  items: ListItem[];
  totalItems: number;
  currentPage: number;
  emptyMessage: string;
  removeRoute: string;
  listType:
    | "blocked-names"
    | "blocked-slugs"
    | "allowed-names"
    | "allowed-slugs";
  baseQueryParam: string;
}

const ITEMS_PER_PAGE = 10;

function buildQuery(baseQueryParam: string, page: number, searchTerm: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set(baseQueryParam, page.toString());
  if (searchTerm) params.set(`${baseQueryParam}Search`, searchTerm);
  return `?${params.toString()}`;
}

export default function ListTable({
  items,
  totalItems,
  currentPage,
  emptyMessage,
  removeRoute,
  listType,
  baseQueryParam,
}: ListTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(
    searchParams.get(`${baseQueryParam}Search`) || ""
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update URL when debounced search term changes
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchTerm) {
      params.set(`${baseQueryParam}Search`, debouncedSearchTerm);
      params.set(baseQueryParam, "1"); // Reset to first page on search
    } else {
      params.delete(`${baseQueryParam}Search`);
    }
    router.push(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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

  return (
    <div>
      <div className='flex flex-col space-y-4'>
        <div className='flex justify-between items-center'>
          <div className='text-sm text-muted-foreground'>
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </div>
          <ExportListButton listType={listType} items={items} />
        </div>

        <Input
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
      </div>

      {totalItems === 0 ? (
        <p className='text-muted-foreground text-center py-4'>
          {searchTerm ? "No results found" : emptyMessage}
        </p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Value</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>{item.value}</TableCell>
                  <TableCell className='text-right'>
                    <form action={`${removeRoute}?id=${item.id}`} method='POST'>
                      <button
                        type='submit'
                        className='text-sm text-red-500 hover:text-red-700'
                      >
                        Remove
                      </button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className='mt-4'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={
                        currentPage > 1
                          ? buildQuery(
                              baseQueryParam,
                              currentPage - 1,
                              searchTerm
                            )
                          : undefined
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {getPageNumbers().map((pageNum, index) => (
                    <PaginationItem key={index}>
                      {pageNum === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href={buildQuery(
                            baseQueryParam,
                            pageNum as number,
                            searchTerm
                          )}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href={
                        currentPage < totalPages
                          ? buildQuery(
                              baseQueryParam,
                              currentPage + 1,
                              searchTerm
                            )
                          : undefined
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
