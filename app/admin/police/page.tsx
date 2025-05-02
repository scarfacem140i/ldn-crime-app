"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

async function startPoliceSync(yearMonth: string) {
  await fetch("/api/police-sync", {
    method: "POST",
    body: JSON.stringify({
      yearMonth: yearMonth,
    }),

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer POLICEAPIKEY",
    },
  });
}

export default function PolicePage() {
  const [yearMonth, setYearMonth] = useState("");

  const mtn = useMutation({
    mutationFn: async () => await startPoliceSync(yearMonth),
    onSuccess: () => {
      toast.success("Successfully synced " + yearMonth);
    },
    onError: (error) => {
      toast.error("Failed to sync " + yearMonth + ": " + error.message);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Police Data</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Sync police data from the Police API. This process can take a while (on average 2 minutes) and may take an hour to propogate to clients.
      </p>
      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="yearMonth">Year-Month (YYYY-MM)</label>
          <Input
            required
            id="yearMonth"
            onChange={(e) => setYearMonth(e.target.value)}
            value={yearMonth}
            placeholder="YYYY-MM"
          />
        </div>
        <Button
          loading={mtn.isPending}
          variant="default"
          onClick={async (e) => {
            e.preventDefault();
            await mtn.mutateAsync();
          }}
        >
          Start sync
        </Button>
      </form>
      {mtn.isPending && <p>Syncing...</p>}
      {mtn.isError && <p>Error: {mtn.error.message}</p>}
    </div>
  );
}
