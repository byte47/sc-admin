import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getMessagesAction } from "@/lib/actions";
import { BLACKLISTED_NAME_WORDS } from "@/lib/utils";

async function MessagesTable() {
  const messages = await getMessagesAction(100, 0);

  // Function to check if a message contains potentially problematic content
  const checkMessageContent = (content: string) => {
    // Convert to format used in processing
    const processedContent = content.toLowerCase().replace(/\s+/g, "--");

    // Check for B patterns (similar to addBulkMessagesAction)
    const hasBPattern =
      processedContent.split("-b-").length - 1 >= 2 ||
      (processedContent.includes("-b-") && processedContent.includes("-boy-"));

    // Check for blacklisted words
    let hasBlacklistedWord = false;
    for (const word of BLACKLISTED_NAME_WORDS) {
      if (processedContent.includes(word.toLowerCase())) {
        hasBlacklistedWord = true;
        break;
      }
    }

    return {
      flagged: hasBPattern,
      blocked: hasBlacklistedWord,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Latest messages received from users, ordered by most recent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className='text-center py-6 text-muted-foreground'>
            No messages found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className='w-[40%]'>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => {
                const { flagged, blocked } = checkMessageContent(
                  message.content
                );
                return (
                  <TableRow
                    key={message.id}
                    className={
                      blocked ? "bg-red-50" : flagged ? "bg-yellow-50" : ""
                    }
                  >
                    <TableCell>{message.id}</TableCell>
                    <TableCell>{message.name}</TableCell>
                    <TableCell>{message.slug}</TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {message.content}
                    </TableCell>
                    <TableCell>
                      {blocked && (
                        <span className='text-red-600 font-semibold'>
                          Blocked
                        </span>
                      )}
                      {flagged && !blocked && (
                        <span className='text-amber-600 font-semibold'>
                          Flagged
                        </span>
                      )}
                      {!flagged && !blocked && (
                        <span className='text-green-600'>OK</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(message.created_at).toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function MessagesPage() {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>User Messages</h1>
      </div>
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Message Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-2'>
            Messages are now automatically processed for potentially problematic
            content:
          </p>
          <ul className='list-disc pl-5 space-y-1'>
            <li>
              <strong>Flagged Messages:</strong> Messages with B-word patterns
              or multiple B references are flagged.
            </li>
            <li>
              <strong>Blocked Messages:</strong> Messages containing blacklisted
              terms are marked for review.
            </li>
            <li>
              All messages are logged in the console with [FLAGGED] or [BLOCKED]
              tags for administrative review.
            </li>
          </ul>
        </CardContent>
      </Card>
      <Suspense fallback={<p>Loading messages...</p>}>
        <MessagesTable />
      </Suspense>
    </div>
  );
}
