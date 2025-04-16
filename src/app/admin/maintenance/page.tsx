import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import DatabaseActions from "./DatabaseActions";

export const metadata: Metadata = {
  title: "Maintenance - Access Monitor",
  description: "Database maintenance and operations",
};

export default function MaintenancePage() {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Database Maintenance</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
          <CardDescription>
            Manage database backups, reset and other maintenance operations.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <DatabaseActions />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
          <CardDescription>
            Current database status and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='flex justify-between border-b pb-2'>
              <span className='font-medium'>Database Location:</span>
              <span className='text-muted-foreground'>data/sc-admin.db</span>
            </div>
            <div className='flex justify-between border-b pb-2'>
              <span className='font-medium'>Size:</span>
              <span className='text-muted-foreground' id='db-size'>
                Calculating...
              </span>
            </div>
            <div className='flex justify-between border-b pb-2'>
              <span className='font-medium'>Last Backup:</span>
              <span className='text-muted-foreground' id='last-backup'>
                Never
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
