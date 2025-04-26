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

      {/* Lists Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage List Pages</CardTitle>
          <CardDescription>
            Select a list to view and manage its items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <a
              href='/admin/lists/blocked-names'
              className='block p-4 border rounded hover:bg-muted transition'
            >
              <div className='font-semibold'>Blocked Names</div>
              <div className='text-sm text-muted-foreground'>
                View and manage blocked names
              </div>
            </a>
            <a
              href='/admin/lists/blocked-slugs'
              className='block p-4 border rounded hover:bg-muted transition'
            >
              <div className='font-semibold'>Blocked Slugs</div>
              <div className='text-sm text-muted-foreground'>
                View and manage blocked slugs
              </div>
            </a>
            <a
              href='/admin/lists/allowed-names'
              className='block p-4 border rounded hover:bg-muted transition'
            >
              <div className='font-semibold'>Allowed Names</div>
              <div className='text-sm text-muted-foreground'>
                View and manage allowed names
              </div>
            </a>
            <a
              href='/admin/lists/allowed-slugs'
              className='block p-4 border rounded hover:bg-muted transition'
            >
              <div className='font-semibold'>Allowed Slugs</div>
              <div className='text-sm text-muted-foreground'>
                View and manage allowed slugs
              </div>
            </a>
          </div>
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
