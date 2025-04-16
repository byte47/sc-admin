"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { slugify } from "@/lib/utils";
import {
  addToAllowedNamesAction,
  addToAllowedSlugsAction,
  addToBlockedNamesAction,
  addToBlockedSlugsAction,
} from "@/lib/actions";

// Define form schema
const formSchema = z.object({
  value: z.string().min(1, "Value is required"),
  listType: z.enum([
    "allowed-names",
    "allowed-slugs",
    "blocked-names",
    "blocked-slugs",
  ]),
});

type FormValues = z.infer<typeof formSchema>;

export default function ListForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSlugPreview, setShowSlugPreview] = useState(false);
  const [slugPreview, setSlugPreview] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
      listType: "blocked-names",
    },
  });

  // Update slug preview when value changes
  const value = form.watch("value");
  const listType = form.watch("listType");

  // Update slug preview when value or list type changes
  useEffect(() => {
    if (value) {
      const slug = slugify(value);
      setSlugPreview(slug);
    } else {
      setSlugPreview("");
    }

    // Show preview if it's a "names" list type
    setShowSlugPreview(listType.includes("names"));
  }, [value, listType]);

  async function onSubmit(data: FormValues) {
    setLoading(true);

    try {
      // Add to the appropriate list
      const { value, listType } = data;

      if (listType === "allowed-names") {
        await addToAllowedNamesAction(value);
      } else if (listType === "allowed-slugs") {
        await addToAllowedSlugsAction(value);
      } else if (listType === "blocked-names") {
        await addToBlockedNamesAction(value);
      } else if (listType === "blocked-slugs") {
        await addToBlockedSlugsAction(value);
      }

      // Reset form
      form.reset();

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error("Error adding to list:", error);
      alert("Failed to add item to list. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='value'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input placeholder='Enter name or slug' {...field} />
              </FormControl>
              <FormMessage />
              {showSlugPreview && slugPreview && (
                <p className='text-xs text-muted-foreground'>
                  Slug preview: <span className='font-mono'>{slugPreview}</span>
                </p>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='listType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>List</FormLabel>
              <FormControl>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='space-y-2 border rounded-md p-2'>
                    <p className='text-sm font-medium'>Blocked</p>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='blocked-names'
                        checked={field.value === "blocked-names"}
                        onChange={() => field.onChange("blocked-names")}
                        className='w-4 h-4'
                      />
                      <span className='text-sm'>Names</span>
                    </label>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='blocked-slugs'
                        checked={field.value === "blocked-slugs"}
                        onChange={() => field.onChange("blocked-slugs")}
                        className='w-4 h-4'
                      />
                      <span className='text-sm'>Slugs</span>
                    </label>
                  </div>

                  <div className='space-y-2 border rounded-md p-2'>
                    <p className='text-sm font-medium'>Allowed</p>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='allowed-names'
                        checked={field.value === "allowed-names"}
                        onChange={() => field.onChange("allowed-names")}
                        className='w-4 h-4'
                      />
                      <span className='text-sm'>Names</span>
                    </label>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        value='allowed-slugs'
                        checked={field.value === "allowed-slugs"}
                        onChange={() => field.onChange("allowed-slugs")}
                        className='w-4 h-4'
                      />
                      <span className='text-sm'>Slugs</span>
                    </label>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={loading}>
          {loading ? "Adding..." : "Add to List"}
        </Button>
      </form>
    </Form>
  );
}
