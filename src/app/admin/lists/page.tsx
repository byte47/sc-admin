import React from "react";
import { Metadata } from "next";
import {
  getBlockedNamesAction,
  getBlockedSlugsAction,
  getAllowedNamesAction,
  getAllowedSlugsAction,
} from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListTable from "./ListTable";
import ListForm from "./ListForm";
import BulkImportForm from "@/components/BulkImportForm";
import BatchExportButton from "@/components/BatchExportButton";

export const metadata: Metadata = {
  title: "Manage Lists | Access Monitor",
  description: "Manage blocked and allowed lists",
};

interface PageProps {
  searchParams?: Promise<any>;
  params?: Promise<any>;
}

const ITEMS_PER_PAGE = 10;

export default async function ListsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  // Get current page numbers and search terms from URL params
  const blockedNamesPage = Number(resolvedSearchParams.blockedNamesPage) || 1;
  const blockedSlugsPage = Number(resolvedSearchParams.blockedSlugsPage) || 1;
  const allowedNamesPage = Number(resolvedSearchParams.allowedNamesPage) || 1;
  const allowedSlugsPage = Number(resolvedSearchParams.allowedSlugsPage) || 1;

  const blockedNamesSearch = resolvedSearchParams.blockedNamesSearch || "";
  const blockedSlugsSearch = resolvedSearchParams.blockedSlugsSearch || "";
  const allowedNamesSearch = resolvedSearchParams.allowedNamesSearch || "";
  const allowedSlugsSearch = resolvedSearchParams.allowedSlugsSearch || "";

  // Get paginated and filtered lists
  const [blockedNames, blockedSlugs, allowedNames, allowedSlugs] =
    await Promise.all([
      getBlockedNamesAction(
        blockedNamesPage,
        ITEMS_PER_PAGE,
        blockedNamesSearch
      ),
      getBlockedSlugsAction(
        blockedSlugsPage,
        ITEMS_PER_PAGE,
        blockedSlugsSearch
      ),
      getAllowedNamesAction(
        allowedNamesPage,
        ITEMS_PER_PAGE,
        allowedNamesSearch
      ),
      getAllowedSlugsAction(
        allowedSlugsPage,
        ITEMS_PER_PAGE,
        allowedSlugsSearch
      ),
    ]);

  const totalItems =
    blockedNames.total +
    blockedSlugs.total +
    allowedNames.total +
    allowedSlugs.total;

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Manage Lists</h1>
        <p className='text-muted-foreground'>
          Add or remove items from the blocked and allowed lists
        </p>
      </div>

      {/* Forms Section */}
      <div className='grid grid-cols-1 gap-6'>
        <Tabs defaultValue='single'>
          <TabsList className='mb-4'>
            <TabsTrigger value='single'>Add Single Item</TabsTrigger>
            <TabsTrigger value='bulk'>Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value='single'>
            <Card>
              <CardHeader>
                <CardTitle>Add to List</CardTitle>
                <CardDescription>
                  Add a new item to one of the lists
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ListForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='bulk'>
            <BulkImportForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* Lists Section */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div>
            <CardTitle>Current Lists</CardTitle>
            <CardDescription>
              View and manage current list items
            </CardDescription>
          </div>
          <BatchExportButton
            blockedNames={blockedNames.items}
            blockedSlugs={blockedSlugs.items}
            allowedNames={allowedNames.items}
            allowedSlugs={allowedSlugs.items}
          />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='blocked-names'>
            <TabsList className='grid grid-cols-4 mb-4'>
              <TabsTrigger value='blocked-names'>Blocked Names</TabsTrigger>
              <TabsTrigger value='blocked-slugs'>Blocked Slugs</TabsTrigger>
              <TabsTrigger value='allowed-names'>Allowed Names</TabsTrigger>
              <TabsTrigger value='allowed-slugs'>Allowed Slugs</TabsTrigger>
            </TabsList>

            <TabsContent value='blocked-names'>
              <ListTable
                items={blockedNames.items}
                totalItems={blockedNames.total}
                currentPage={blockedNamesPage}
                emptyMessage='No blocked names'
                removeRoute='/api/lists/blocked-names/remove'
                listType='blocked-names'
                baseQueryParam='blockedNamesPage'
              />
            </TabsContent>

            <TabsContent value='blocked-slugs'>
              <ListTable
                items={blockedSlugs.items}
                totalItems={blockedSlugs.total}
                currentPage={blockedSlugsPage}
                emptyMessage='No blocked slugs'
                removeRoute='/api/lists/blocked-slugs/remove'
                listType='blocked-slugs'
                baseQueryParam='blockedSlugsPage'
              />
            </TabsContent>

            <TabsContent value='allowed-names'>
              <ListTable
                items={allowedNames.items}
                totalItems={allowedNames.total}
                currentPage={allowedNamesPage}
                emptyMessage='No allowed names'
                removeRoute='/api/lists/allowed-names/remove'
                listType='allowed-names'
                baseQueryParam='allowedNamesPage'
              />
            </TabsContent>

            <TabsContent value='allowed-slugs'>
              <ListTable
                items={allowedSlugs.items}
                totalItems={allowedSlugs.total}
                currentPage={allowedSlugsPage}
                emptyMessage='No allowed slugs'
                removeRoute='/api/lists/allowed-slugs/remove'
                listType='allowed-slugs'
                baseQueryParam='allowedSlugsPage'
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className='text-sm text-muted-foreground'>
        <p>Total items: {totalItems}</p>
        <p>
          Blocked names: {blockedNames.total}, Blocked slugs:{" "}
          {blockedSlugs.total}
        </p>
        <p>
          Allowed names: {allowedNames.total}, Allowed slugs:{" "}
          {allowedSlugs.total}
        </p>
      </div>
    </div>
  );
}
