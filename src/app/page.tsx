import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AccessTestForm from "@/components/AccessTestForm";
import MessageForm from "@/components/MessageForm";

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <header className='bg-white border-b'>
        <div className='container mx-auto py-4 px-6 flex justify-between items-center'>
          <h1 className='font-bold text-xl'>Access Monitor App</h1>
          <Link href='/admin'>
            <Button variant='outline'>Admin Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className='flex-1 container mx-auto py-12 px-6'>
        <div className='grid md:grid-cols-2 gap-8'>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Access Checker</CardTitle>
              <CardDescription>
                Test if a user would be allowed or blocked based on current
                rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccessTestForm />
            </CardContent>
            <CardFooter className='text-sm text-muted-foreground'>
              This form checks the name against hardcoded blacklists, dynamic
              blocked list, and allowed list to determine if access should be
              granted.
            </CardFooter>
          </Card>

          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Message Sender</CardTitle>
              <CardDescription>
                Test sending messages to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageForm />
            </CardContent>
            <CardFooter className='text-sm text-muted-foreground'>
              This form allows you to send a test message to the system. No
              access check is performed.
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className='border-t bg-white py-6'>
        <div className='container mx-auto px-6 text-center text-sm text-muted-foreground'>
          &copy; {new Date().getFullYear()} Access Monitor App. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
