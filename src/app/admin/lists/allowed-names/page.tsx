import React from "react";
import { getAllowedNamesAction } from "@/lib/actions";
import ListForm, { ListType } from "../ListForm";
import ListTable from "../ListTable";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const ITEMS_PER_PAGE = 10;

export default async function AllowedNamesPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const page = Number(searchParams?.allowedNamesPage) || 1;
  const search = searchParams?.allowedNamesSearch || "";
  const data = await getAllowedNamesAction(page, ITEMS_PER_PAGE, search);

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Allowed Names</CardTitle>
          <CardDescription>View, add, or remove allowed names.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <ListForm listType={"allowed-names" as ListType} />
          </div>
          <ListTable
            items={data.items}
            totalItems={data.total}
            currentPage={page}
            emptyMessage='No allowed names'
            removeRoute='/api/lists/allowed-names/remove'
            listType='allowed-names'
            baseQueryParam='allowedNames'
          />
        </CardContent>
      </Card>
    </div>
  );
}
