import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ExportListButton from "@/components/ExportListButton";

export interface ListItem {
  id: number;
  value: string;
}

interface ListTableProps {
  items: ListItem[];
  emptyMessage: string;
  removeRoute: string;
  listType:
    | "blocked-names"
    | "blocked-slugs"
    | "allowed-names"
    | "allowed-slugs";
}

export default function ListTable({
  items,
  emptyMessage,
  removeRoute,
  listType,
}: ListTableProps) {
  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <div className='text-sm text-muted-foreground'>
          {items.length} {items.length === 1 ? "item" : "items"}
        </div>
        <ExportListButton listType={listType} items={items} />
      </div>

      {items.length === 0 ? (
        <p className='text-muted-foreground text-center py-4'>{emptyMessage}</p>
      ) : (
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
      )}
    </>
  );
}
