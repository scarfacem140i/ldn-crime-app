"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronDown,
  Flag,
  MoreHorizontal,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CrimeReport,
  CrimeReportWithStats,
  CrimeReportWithStatsAndUser,
} from "@/lib/db/types";
import { InferSelectModel } from "drizzle-orm";
import { user } from "@/lib/db/auth-schema";
import { CrimeReportDetail } from "./crime-report-detail";
import {
  useAdminVerifyCrime,
  useCrimeWithStatsAndUser,
} from "@/lib/hooks/use-crimes";
import { CrimeReportTableSkeleton } from "./crime-report-table-skeleton";

interface CrimeReportTableProps {
  reports: CrimeReportWithStatsAndUser[];
  onVerify: (id: string) => void;
  onUnverify: (id: string) => void;
  onViewDetails: (report: CrimeReportWithStatsAndUser | null) => void;
  selectedReport: CrimeReportWithStatsAndUser | null;
  setSelectedReport: (report: CrimeReportWithStatsAndUser | null) => void;
}

export function CrimeReportTableWithData({
  initialData,
}: {
  initialData?: CrimeReportWithStatsAndUser[];
}) {
  const [selectedReport, setSelectedReport] =
    useState<CrimeReportWithStatsAndUser | null>(null);
  const crimes = useCrimeWithStatsAndUser(initialData);
  const { mutate: verifyCrime } = useAdminVerifyCrime();

  const onVerify = (id: string) => {
    verifyCrime({ crimeId: id, verified: true });
  };

  const onUnverify = (id: string) => {
    verifyCrime({ crimeId: id, verified: false });
  };

  const onViewDetails = (report: CrimeReportWithStatsAndUser | null) => {
    setSelectedReport(report);
  };

  if (crimes.isLoading) {
    return <CrimeReportTableSkeleton />;
  }

  if (crimes.data) {
    return (
      <CrimeReportTable
        reports={crimes.data}
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        onVerify={onVerify}
        onUnverify={onUnverify}
        onViewDetails={onViewDetails}
      />
    );
  }
  return null;
}

export function CrimeReportTable({
  reports,
  onVerify,
  onUnverify,
  onViewDetails,
  selectedReport,
  setSelectedReport,
}: CrimeReportTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<CrimeReportWithStatsAndUser>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "street_name",
      header: "Location",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px]">
          {row.getValue("street_name") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return <div>{format(date, "PPP")}</div>;
      },
    },
    {
      accessorKey: "user",
      header: "Reporter",
      cell: ({ row }) => {
        const user = row.original.user;
        return <div>{user?.name || "Unknown"}</div>;
      },
    },
    {
      accessorKey: "voteCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Votes
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const voteCount =
          row.original.votes.upvotes + row.original.votes.downvotes || 0;
        return (
          <div className="flex items-center gap-1">
            {voteCount > 0 ? (
              <ThumbsUp className="h-4 w-4 text-primary" />
            ) : voteCount < 0 ? (
              <ThumbsDown className="h-4 w-4 text-destructive" />
            ) : null}
            <span>{voteCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "flagCount",
      header: "Flags",
      cell: ({ row }) => {
        const flagCount = row.original.flags || 0;
        return flagCount > 0 ? (
          <div className="flex items-center gap-1">
            <Flag className="h-4 w-4 text-destructive" />
            <span>{flagCount}</span>
          </div>
        ) : (
          <span>0</span>
        );
      },
    },
    {
      accessorKey: "verified",
      header: "Status",
      cell: ({ row }) => {
        const verified = row.getValue("verified") as boolean;
        return (
          <Badge variant={verified ? "outline" : "secondary"}>
            {verified ? "Verified" : "Unverified"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewDetails(report)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.verified ? (
                  <DropdownMenuItem onClick={() => onUnverify(report.id)}>
                    Mark as Unverified
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onVerify(report.id)}>
                    Verify Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reports,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by category..."
          value={
            (table.getColumn("category")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("category")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="capitalize"
                    onClick={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                  >
                    {column.id}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => onViewDetails(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} report(s) total
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crime Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <CrimeReportDetail
              report={selectedReport}
              onVerify={() => {
                onVerify(selectedReport.id);
                setSelectedReport(null);
              }}
              onUnverify={() => {
                onUnverify(selectedReport.id);
                setSelectedReport(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
