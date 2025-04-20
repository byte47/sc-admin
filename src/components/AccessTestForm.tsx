"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccessTestForm() {
  const [result, setResult] = useState<{
    result: string;
    reason?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    setResult(null);

    try {
      // Make API request to check access
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to check access");
      }

      const accessResult = await response.json();
      setResult(accessResult);
    } catch (error) {
      console.error("Error checking access:", error);

      // Check for database connection error patterns
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("database connection is not open") ||
        errorMessage.includes("Failed to check access")
      ) {
        setResult({
          result: "error",
          reason:
            "Database connection error. Please try refreshing the page or contact the administrator.",
        });
      } else {
        setResult({
          result: "error",
          reason:
            "An error occurred while checking access. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name to check</FormLabel>
                <FormControl>
                  <Input placeholder='Enter a name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' disabled={loading}>
            {loading ? "Checking..." : "Check Access"}
          </Button>
        </form>
      </Form>

      {result && (
        <Card
          className={result.result === "allow" ? "bg-green-50" : "bg-red-50"}
        >
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-semibold mb-1'>
                  Result: {result.result?.toUpperCase()}
                </div>
                {result.reason && (
                  <div className='text-sm text-muted-foreground'>
                    Reason: {result.reason}
                  </div>
                )}
              </div>
              <div
                className={`text-2xl ${
                  result.result === "allow" ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.result === "allow" ? "✓" : "✕"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
