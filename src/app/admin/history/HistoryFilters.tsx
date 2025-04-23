"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function HistoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [result, setResult] = useState(searchParams.get("result") || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("search", e.target.value);
    router.push(`?${params.toString()}`);
  };

  const handleResultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResult(e.target.value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("result", e.target.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className='flex gap-2 w-full max-w-xl justify-end'>
      <Input
        type='search'
        placeholder='Search by name, slug, or reason...'
        value={search}
        className='w-64'
        onChange={handleSearchChange}
      />
      <select
        className='border rounded px-2 py-1 h-10'
        value={result}
        aria-label='Result filter'
        onChange={handleResultChange}
      >
        <option value=''>All Results</option>
        <option value='allow'>Allow</option>
        <option value='block'>Block</option>
      </select>
    </div>
  );
}
