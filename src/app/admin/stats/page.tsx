import { Metadata } from "next";
import Link from "next/link";
import {
  getVerificationQueueAction,
  getAccessHistoryAction,
  getBlockedNamesAction,
  getBlockedSlugsAction,
  getAllowedNamesAction,
  getAllowedSlugsAction,
} from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Stats - Access Monitor",
  description: "Statistics for the Access Monitor application",
};

export default async function StatsPage() {
  // Get stats
  const pendingVerifications = await getVerificationQueueAction("pending");
  const recentHistory = await getAccessHistoryAction(5, 0);
  const blockedNames = await getBlockedNamesAction();
  const blockedSlugs = await getBlockedSlugsAction();
  const allowedNames = await getAllowedNamesAction();
  const allowedSlugs = await getAllowedSlugsAction();

  // Calculate total counts for blocked and allowed items
  const totalBlockedItems = blockedNames.total + blockedSlugs.total;
  const totalAllowedItems = allowedNames.total + allowedSlugs.total;

  // Calculate summary stats
  const accessCount = recentHistory.items.length;
  const allowedCount = recentHistory.items.filter(
    (item: any) => item.result === "allow"
  ).length;
  const blockedCount = recentHistory.items.filter(
    (item: any) => item.result === "block"
  ).length;

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Stats</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Verification Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>Items pending review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>
              {pendingVerifications.length}
            </div>
          </CardContent>
          <CardFooter>
            <Link href='/admin/verification' passHref>
              <Button variant='outline' className='w-full'>
                View Queue
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Blocked Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Items</CardTitle>
            <CardDescription>Names/Slugs in blocked lists</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-3xl font-bold'>{totalBlockedItems}</div>
            <div className='text-sm text-muted-foreground flex justify-between'>
              <span>Names: {blockedNames.total}</span>
              <span>Slugs: {blockedSlugs.total}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href='/admin/lists?tab=blocked' passHref>
              <Button variant='outline' className='w-full'>
                Manage Blocked
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Allowed Lists */}
        <Card>
          <CardHeader>
            <CardTitle>Allowed Items</CardTitle>
            <CardDescription>Names/Slugs in allowed lists</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-3xl font-bold'>{totalAllowedItems}</div>
            <div className='text-sm text-muted-foreground flex justify-between'>
              <span>Names: {allowedNames.total}</span>
              <span>Slugs: {allowedSlugs.total}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link href='/admin/lists?tab=allowed' passHref>
              <Button variant='outline' className='w-full'>
                Manage Allowed
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Summary of recent access attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4 mb-4'>
            <div className='text-center'>
              <div className='text-muted-foreground text-sm'>Total</div>
              <div className='text-2xl font-bold'>{accessCount}</div>
            </div>
            <div className='text-center'>
              <div className='text-muted-foreground text-sm'>Allowed</div>
              <div className='text-2xl font-bold text-green-600'>
                {allowedCount}
              </div>
            </div>
            <div className='text-center'>
              <div className='text-muted-foreground text-sm'>Blocked</div>
              <div className='text-2xl font-bold text-red-600'>
                {blockedCount}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href='/admin/history' passHref>
            <Button variant='outline' className='w-full'>
              View History
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
