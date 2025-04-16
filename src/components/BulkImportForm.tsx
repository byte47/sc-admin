"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Define form schema
const formSchema = z.object({
  content: z.string().min(1, "Content is required"),
  type: z.enum(
    ["blocked-names", "blocked-slugs", "allowed-names", "allowed-slugs"],
    {
      required_error: "You need to select a list type",
    }
  ),
  deduplicateEnabled: z.boolean(),
  validateEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BulkImportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importMethod, setImportMethod] = useState<"text" | "file">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    results?: {
      total: number;
      processed: number;
      skipped?: number;
      invalid?: number;
      duplicates?: number;
      failures: number;
      failedItems: Array<{ value: string; reason?: string } | string>;
    };
  } | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      type: "blocked-names",
      deduplicateEnabled: true,
      validateEnabled: true,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split(/\r?\n/).slice(0, 10); // Preview first 10 lines, handle both CRLF and LF
        setCsvPreview(lines);

        // Extract values from CSV and update form
        const allLines = content.split(/\r?\n/);
        const possibleHeaderLine = allLines[0]?.toLowerCase() || "";
        const hasHeader =
          possibleHeaderLine.includes("id") ||
          possibleHeaderLine.includes("value") ||
          possibleHeaderLine.includes("name") ||
          possibleHeaderLine.includes("slug") ||
          possibleHeaderLine.includes("list");

        // Determine if we're dealing with a standardized export format (with list type)
        const isStandardFormat = possibleHeaderLine.includes("list");

        // Get list type from selected radio if using standardized format
        const selectedListType = form.getValues("type");

        // Process lines to extract values
        const values = allLines
          .slice(hasHeader ? 1 : 0) // Skip header row if it exists
          .map((line) => {
            if (!line.trim()) return ""; // Skip empty lines

            const parts = line.split(",");

            if (isStandardFormat && parts.length >= 3) {
              // If standard format, check if we should include based on list type
              const listType = parts[0].trim();
              if (selectedListType && listType !== selectedListType) {
                return ""; // Skip if not matching the selected list type
              }
              return parts[2].trim(); // Return the value part (3rd column)
            } else if (parts.length >= 2) {
              // If simple CSV with at least 2 columns, use the second column
              return parts[1].trim();
            } else {
              // Otherwise use the whole line
              return line.trim();
            }
          })
          .filter((val) => val); // Remove empty lines

        // Update the form with the extracted values
        form.setValue("content", values.join("\n"));
      };
      reader.readAsText(file);
    } else {
      setCsvPreview([]);
    }
  };

  async function onSubmit(data: FormValues) {
    setLoading(true);
    setResult(null);

    try {
      // Parse the content into an array of items
      const items = data.content
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (items.length === 0) {
        setResult({
          success: false,
          message: "No valid items found to import",
        });
        return;
      }

      // Make API request to import items
      const response = await fetch("/api/admin/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          type: data.type,
          deduplicateEnabled: data.deduplicateEnabled,
          validateEnabled: data.validateEnabled,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import items");
      }

      setResult({
        success: true,
        message: result.message,
        results: result.results,
      });

      // Reset form on success
      form.reset();
      setSelectedFile(null);
      setCsvPreview([]);

      // Refresh the page to update the lists
      router.refresh();
    } catch (error) {
      console.error("Error importing items:", error);
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Bulk Import</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={importMethod}
          onValueChange={(value) => setImportMethod(value as "text" | "file")}
        >
          <TabsList className='w-full mb-4'>
            <TabsTrigger value='text' className='flex-1'>
              Enter Text
            </TabsTrigger>
            <TabsTrigger value='file' className='flex-1'>
              Upload CSV
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className='grid grid-cols-2 gap-4'
                      >
                        <div className='space-y-2 border rounded-md p-3'>
                          <p className='text-sm font-medium'>Blocked</p>
                          <FormItem className='flex items-center space-x-2'>
                            <FormControl>
                              <RadioGroupItem
                                value='blocked-names'
                                id='blocked-names'
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor='blocked-names'
                              className='font-normal cursor-pointer'
                            >
                              Names
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-2'>
                            <FormControl>
                              <RadioGroupItem
                                value='blocked-slugs'
                                id='blocked-slugs'
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor='blocked-slugs'
                              className='font-normal cursor-pointer'
                            >
                              Slugs
                            </FormLabel>
                          </FormItem>
                        </div>

                        <div className='space-y-2 border rounded-md p-3'>
                          <p className='text-sm font-medium'>Allowed</p>
                          <FormItem className='flex items-center space-x-2'>
                            <FormControl>
                              <RadioGroupItem
                                value='allowed-names'
                                id='allowed-names'
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor='allowed-names'
                              className='font-normal cursor-pointer'
                            >
                              Names
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-2'>
                            <FormControl>
                              <RadioGroupItem
                                value='allowed-slugs'
                                id='allowed-slugs'
                              />
                            </FormControl>
                            <FormLabel
                              htmlFor='allowed-slugs'
                              className='font-normal cursor-pointer'
                            >
                              Slugs
                            </FormLabel>
                          </FormItem>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value='text'>
                <FormField
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Enter items to import, one per line'
                          className='min-h-[200px]'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Each line will be treated as a separate item. Empty
                        lines will be ignored.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value='file'>
                <FormItem>
                  <FormLabel>Upload CSV File</FormLabel>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='file'
                      accept='.csv'
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className='flex-1'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className='mr-2 h-4 w-4' />
                      Browse
                    </Button>
                  </div>
                  <FormDescription>
                    Upload a CSV file with values to import. If your CSV has
                    headers, the second column will be used.
                  </FormDescription>

                  {selectedFile && (
                    <div className='mt-4'>
                      <p className='text-sm font-medium'>
                        Selected file: {selectedFile.name}
                      </p>

                      {csvPreview.length > 0 && (
                        <div className='mt-2'>
                          <p className='text-sm font-medium'>Preview:</p>
                          <div className='mt-1 p-2 border rounded-md text-xs font-mono bg-slate-50 max-h-[150px] overflow-y-auto'>
                            {csvPreview.map((line, index) => (
                              <div key={index} className='mb-1'>
                                {line}
                              </div>
                            ))}
                            {csvPreview.length === 10 && <div>...</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => <input type='hidden' {...field} />}
                  />
                </FormItem>
              </TabsContent>

              <FormField
                control={form.control}
                name='deduplicateEnabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 mt-4'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 mt-1'
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Skip duplicates</FormLabel>
                      <FormDescription>
                        Skip items that already exist in the list
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='validateEnabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 mt-4'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4 mt-1'
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Validate items</FormLabel>
                      <FormDescription>
                        Check items for validity before adding (length,
                        characters)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Importing...
                  </>
                ) : (
                  "Import Items"
                )}
              </Button>
            </form>
          </Form>
        </Tabs>

        {result && (
          <Alert
            className={`mt-6 ${
              result.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {result.success ? (
              <CheckCircle className='h-4 w-4 text-green-600' />
            ) : (
              <AlertCircle className='h-4 w-4 text-red-600' />
            )}
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>

            {result.results && (
              <div className='mt-4 space-y-3'>
                {/* Import statistics */}
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <p>Total items: {result.results.total}</p>
                    <p>Processed: {result.results.processed}</p>
                    {result.results.skipped !== undefined && (
                      <p>Skipped: {result.results.skipped}</p>
                    )}
                  </div>
                  <div>
                    {result.results.duplicates !== undefined && (
                      <p>Duplicates: {result.results.duplicates}</p>
                    )}
                    {result.results.invalid !== undefined && (
                      <p>Invalid: {result.results.invalid}</p>
                    )}
                    <p>Failures: {result.results.failures}</p>
                  </div>
                </div>

                {/* Failed items */}
                {result.results.failedItems?.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-sm font-medium'>
                      Failed items ({result.results.failedItems.length}):
                    </p>
                    <ul className='text-sm mt-1 list-disc pl-5 max-h-[200px] overflow-y-auto'>
                      {result.results.failedItems.map((item, index) => (
                        <li key={index} className='text-xs'>
                          {typeof item === "string" ? (
                            item
                          ) : (
                            <>
                              <span className='font-medium'>{item.value}</span>
                              {item.reason && (
                                <span className='opacity-70'>
                                  {" "}
                                  - {item.reason}
                                </span>
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Alert>
        )}
      </CardContent>
      <CardFooter className='text-sm text-muted-foreground'>
        Bulk import allows you to add multiple items to a list at once. You can
        either enter items manually or upload a CSV file.
      </CardFooter>
    </Card>
  );
}
