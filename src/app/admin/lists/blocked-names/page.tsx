import React from "react";
import { getBlockedNamesAction } from "@/lib/actions";
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

export default async function BlockedNamesPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const page = Number(searchParams?.blockedNamesPage) || 1;
  const search = searchParams?.blockedNamesSearch || "";
  const data = await getBlockedNamesAction(page, ITEMS_PER_PAGE, search);

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Blocked Names</CardTitle>
          <CardDescription>View, add, or remove blocked names.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <ListForm listType={"blocked-names" as ListType} />
          </div>
          <ListTable
            items={data.items}
            totalItems={data.total}
            currentPage={page}
            emptyMessage='No blocked names'
            removeRoute='/api/lists/blocked-names/remove'
            listType='blocked-names'
            baseQueryParam='blockedNames'
          />
        </CardContent>
      </Card>
    </div>
  );
}
