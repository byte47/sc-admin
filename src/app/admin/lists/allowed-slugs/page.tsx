import React from "react";
import { getAllowedSlugsAction } from "@/lib/actions";
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

export default async function AllowedSlugsPage({
  searchParams,
}: {
  searchParams?: any;
}) {
  const page = Number(searchParams?.allowedSlugsPage) || 1;
  const search = searchParams?.allowedSlugsSearch || "";
  const data = await getAllowedSlugsAction(page, ITEMS_PER_PAGE, search);

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Allowed Slugs</CardTitle>
          <CardDescription>View, add, or remove allowed slugs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <ListForm listType={"allowed-slugs" as ListType} />
          </div>
          <ListTable
            items={data.items}
            totalItems={data.total}
            currentPage={page}
            emptyMessage='No allowed slugs'
            removeRoute='/api/lists/allowed-slugs/remove'
            listType='allowed-slugs'
            baseQueryParam='allowedSlugs'
          />
        </CardContent>
      </Card>
    </div>
  );
}
