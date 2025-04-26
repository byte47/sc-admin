import React from "react";
import { getBlockedSlugsAction } from "@/lib/actions";
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

export default async function BlockedSlugsPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const page = Number(searchParams?.blockedSlugsPage) || 1;
  const search = searchParams?.blockedSlugsSearch || "";
  const data = await getBlockedSlugsAction(page, ITEMS_PER_PAGE, search);

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Blocked Slugs</CardTitle>
          <CardDescription>View, add, or remove blocked slugs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <ListForm listType={"blocked-slugs" as ListType} />
          </div>
          <ListTable
            items={data.items}
            totalItems={data.total}
            currentPage={page}
            emptyMessage='No blocked slugs'
            removeRoute='/api/lists/blocked-slugs/remove'
            listType='blocked-slugs'
            baseQueryParam='blockedSlugs'
          />
        </CardContent>
      </Card>
    </div>
  );
}
