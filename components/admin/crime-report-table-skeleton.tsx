"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CrimeReportTableSkeleton() {
  // Number of skeleton rows to display
  const rows = Array.from({ length: 6 });
  // Columns: ID, Category, Location, Date, Reporter, Votes, Flags, Status, Actions
  const columns = [
    "ID",
    "Category",
    "Location",
    "Date",
    "Reporter",
    "Votes",
    "Flags",
    "Status",
    "Actions"
  ];

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-8 w-32 rounded ml-auto" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={col + idx}>
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-6 w-32 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}