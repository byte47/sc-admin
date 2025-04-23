import { Metadata } from "next";
import Link from "next/link";
import {
  getVerificationQueueAction,
  getAccessHistoryAction,
  getBlockedNamesAction,
  getBlockedSlugsAction,
  getAllowedNamesAction,
  getAllowedSlugsAction,
  getAccessHistoryCountByTimeRangeAction,
  getAccessLeaderboardByNameAction,
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
  const blockedNames = await getBlockedNamesAction(1, 1000000);
  const blockedSlugs = await getBlockedSlugsAction(1, 1000000);
  const allowedNames = await getAllowedNamesAction(1, 1000000);
  const allowedSlugs = await getAllowedSlugsAction(1, 1000000);

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

  // Time ranges
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch summary counts for each range
  const [
    lastHourTotal,
    lastHourAllowed,
    lastHourBlocked,
    lastDayTotal,
    lastDayAllowed,
    lastDayBlocked,
    lastWeekTotal,
    lastWeekAllowed,
    lastWeekBlocked,
    lastMonthTotal,
    lastMonthAllowed,
    lastMonthBlocked,
    allTimeTotal,
    allTimeAllowed,
    allTimeBlocked,
  ] = await Promise.all([
    getAccessHistoryCountByTimeRangeAction(oneHourAgo, now),
    getAccessHistoryCountByTimeRangeAction(oneHourAgo, now, "allow"),
    getAccessHistoryCountByTimeRangeAction(oneHourAgo, now, "block"),
    getAccessHistoryCountByTimeRangeAction(oneDayAgo, now),
    getAccessHistoryCountByTimeRangeAction(oneDayAgo, now, "allow"),
    getAccessHistoryCountByTimeRangeAction(oneDayAgo, now, "block"),
    getAccessHistoryCountByTimeRangeAction(oneWeekAgo, now),
    getAccessHistoryCountByTimeRangeAction(oneWeekAgo, now, "allow"),
    getAccessHistoryCountByTimeRangeAction(oneWeekAgo, now, "block"),
    getAccessHistoryCountByTimeRangeAction(oneMonthAgo, now),
    getAccessHistoryCountByTimeRangeAction(oneMonthAgo, now, "allow"),
    getAccessHistoryCountByTimeRangeAction(oneMonthAgo, now, "block"),
    getAccessHistoryCountByTimeRangeAction(new Date(0), now),
    getAccessHistoryCountByTimeRangeAction(new Date(0), now, "allow"),
    getAccessHistoryCountByTimeRangeAction(new Date(0), now, "block"),
  ]);

  // Fetch leaderboard
  const leaderboard = await getAccessLeaderboardByNameAction(50, 0);

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

      {/* Time Range Summary */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
        {/* Last 1 hour */}
        <Card>
          <CardHeader>
            <CardTitle>Last 1 Hour</CardTitle>
            <CardDescription>Access attempts in the last hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='text-muted-foreground text-sm'>Total</div>
              <div className='text-2xl font-bold'>{lastHourTotal}</div>
              <div className='flex justify-between items-center'>
                <span className='text-green-600'>Allowed</span>
                <span className='font-bold text-green-600'>
                  {lastHourAllowed}
                </span>
                <span className='text-xs text-green-700'>
                  {lastHourTotal > 0
                    ? ((lastHourAllowed / lastHourTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-red-600'>Blocked</span>
                <span className='font-bold text-red-600'>
                  {lastHourBlocked}
                </span>
                <span className='text-xs text-red-700'>
                  {lastHourTotal > 0
                    ? ((lastHourBlocked / lastHourTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Last 24 hours */}
        <Card>
          <CardHeader>
            <CardTitle>Last 24 Hours</CardTitle>
            <CardDescription>
              Access attempts in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='text-muted-foreground text-sm'>Total</div>
              <div className='text-2xl font-bold'>{lastDayTotal}</div>
              <div className='flex justify-between items-center'>
                <span className='text-green-600'>Allowed</span>
                <span className='font-bold text-green-600'>
                  {lastDayAllowed}
                </span>
                <span className='text-xs text-green-700'>
                  {lastDayTotal > 0
                    ? ((lastDayAllowed / lastDayTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-red-600'>Blocked</span>
                <span className='font-bold text-red-600'>{lastDayBlocked}</span>
                <span className='text-xs text-red-700'>
                  {lastDayTotal > 0
                    ? ((lastDayBlocked / lastDayTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Last 1 week */}
        <Card>
          <CardHeader>
            <CardTitle>Last 1 Week</CardTitle>
            <CardDescription>Access attempts in the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='text-muted-foreground text-sm'>Total</div>
              <div className='text-2xl font-bold'>{lastWeekTotal}</div>
              <div className='flex justify-between items-center'>
                <span className='text-green-600'>Allowed</span>
                <span className='font-bold text-green-600'>
                  {lastWeekAllowed}
                </span>
                <span className='text-xs text-green-700'>
                  {lastWeekTotal > 0
                    ? ((lastWeekAllowed / lastWeekTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-red-600'>Blocked</span>
                <span className='font-bold text-red-600'>
                  {lastWeekBlocked}
                </span>
                <span className='text-xs text-red-700'>
                  {lastWeekTotal > 0
                    ? ((lastWeekBlocked / lastWeekTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Last 1 month */}
        <Card>
          <CardHeader>
            <CardTitle>Last 1 Month</CardTitle>
            <CardDescription>Access attempts in the last month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='text-muted-foreground text-sm'>Total</div>
              <div className='text-2xl font-bold'>{lastMonthTotal}</div>
              <div className='flex justify-between items-center'>
                <span className='text-green-600'>Allowed</span>
                <span className='font-bold text-green-600'>
                  {lastMonthAllowed}
                </span>
                <span className='text-xs text-green-700'>
                  {lastMonthTotal > 0
                    ? ((lastMonthAllowed / lastMonthTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-red-600'>Blocked</span>
                <span className='font-bold text-red-600'>
                  {lastMonthBlocked}
                </span>
                <span className='text-xs text-red-700'>
                  {lastMonthTotal > 0
                    ? ((lastMonthBlocked / lastMonthTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* All Time */}
        <Card>
          <CardHeader>
            <CardTitle>All Time</CardTitle>
            <CardDescription>
              Total access attempts since the beginning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='text-muted-foreground text-sm'>Total</div>
              <div className='text-2xl font-bold'>{allTimeTotal}</div>
              <div className='flex justify-between items-center'>
                <span className='text-green-600'>Allowed</span>
                <span className='font-bold text-green-600'>
                  {allTimeAllowed}
                </span>
                <span className='text-xs text-green-700'>
                  {allTimeTotal > 0
                    ? ((allTimeAllowed / allTimeTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-red-600'>Blocked</span>
                <span className='font-bold text-red-600'>{allTimeBlocked}</span>
                <span className='text-xs text-red-700'>
                  {allTimeTotal > 0
                    ? ((allTimeBlocked / allTimeTotal) * 100).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Leaderboard Section */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard: Top Names by Access Attempts</CardTitle>
          <CardDescription>Most frequently attempted names</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-2 px-4'>#</th>
                  <th className='text-left py-2 px-4'>Name</th>
                  <th className='text-left py-2 px-4'>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className='py-4 text-center text-muted-foreground'
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <tr key={entry.name} className='border-b'>
                      <td className='py-2 px-4'>{idx + 1}</td>
                      <td className='py-2 px-4'>{entry.name}</td>
                      <td className='py-2 px-4'>{entry.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
