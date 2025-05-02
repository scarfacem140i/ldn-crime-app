"use client";

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
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { admin, useSession } from "@/lib/auth-client";
import { user } from "@/lib/db/auth-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferSelectModel } from "drizzle-orm";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTableSearchParams } from "tanstack-table-search-params";
import { UsersTableSkeleton } from "./users-table-skeleton";

type UserWithRole = InferSelectModel<typeof user>;

export function UsersTableWithData() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [impersonating, setImpersonating] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const resp = await admin.listUsers({
        query: { limit: 100 },
      });
      return resp.data;
    },
  });

  const queryClient = useQueryClient();

  const onDelete = useMutation({
    mutationFn: async (userId: string) => {
      await admin.removeUser({ userId });
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onToggleAdmin = useMutation({
    mutationFn: async ({
      userId,
      isAdmin,
    }: {
      userId: string;
      isAdmin: boolean;
    }) => {
      await admin.setRole({
        userId,
        role: isAdmin ? "admin" : "user",
      });
    },
    onSuccess: (_data, variables) => {
      toast.success(
        `User role updated to ${variables.isAdmin ? "admin" : "user"}`
      );
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onBanUser = useMutation({
    mutationFn: async ({
      userId,
      banReason,
    }: {
      userId: string;
      banReason?: string;
    }) => {
      await admin.banUser({ userId, banReason });
    },
    onSuccess: () => {
      toast.success("User banned successfully");
    },
    onError: () => {
      toast.error("Failed to ban user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onUnbanUser = useMutation({
    mutationFn: async (userId: string) => {
      await admin.unbanUser({ userId });
    },
    onSuccess: () => {
      toast.success("User unbanned successfully");
    },
    onError: () => {
      toast.error("Failed to unban user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const impersonateUser = useMutation({
    mutationFn: async (userId: string) => {
      await admin.impersonateUser({ userId });
    },
    onSuccess: () => {
      setImpersonating(true);
      toast.success("Impersonating user");
    },
    onError: () => {
      toast.error("Failed to impersonate user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const stopImpersonatingUser = useMutation({
    mutationFn: async () => {
      await admin.stopImpersonating();
    },
    onSuccess: () => {
      setImpersonating(false);
      toast.success("Stopped impersonating user");
    },
    onError: () => {
      toast.error("Failed to stop impersonating user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  if (usersQuery.isLoading) {
    return <UsersTableSkeleton />;
  }

  if (usersQuery.isError) {
    return <div>Error loading users</div>;
  }

  if (!usersQuery.data || !usersQuery.data.users) {
    return <div>No users found</div>;
  }

  return (
    <UsersTable
      users={usersQuery.data.users}
      onDelete={onDelete.mutate}
      onToggleAdmin={onToggleAdmin.mutate}
      onBanUser={onBanUser.mutate}
      onUnbanUser={onUnbanUser.mutate}
      impersonateUser={impersonateUser.mutate}
      stopImpersonatingUser={stopImpersonatingUser.mutate}
      pagination={pagination}
      setPagination={setPagination}
      impersonating={impersonating}
    />
  );
}

interface UsersTableProps {
  users: UserWithRole[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  impersonating?: boolean;
  setPagination: any;
  onDelete: (userId: string) => void;
  onToggleAdmin: (input: { userId: string; isAdmin: boolean }) => void;
  onBanUser: (input: { userId: string; banReason?: string }) => void;
  impersonateUser: (userId: string) => void;
  stopImpersonatingUser: () => void;
  onUnbanUser: (userId: string) => void;
}

export function UsersTable({
  users,
  onDelete,
  onToggleAdmin,
  onBanUser,
  onUnbanUser,
  impersonateUser,
  stopImpersonatingUser,
  pagination,
  impersonating,
  setPagination,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const session = useSession();
  const currentUser = session.data?.user;

  const columns: ColumnDef<UserWithRole>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const isAdmin = row.getValue("role") === "admin";
        return (
          <Badge variant={isAdmin ? "default" : "secondary"}>
            {isAdmin ? "Admin" : "User"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div>{format(date, "PPP")}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isAdmin = user.role === "admin";
        const isCurrentUser = user.id === currentUser?.id;
        const isBanned = user.banned;

        if (isCurrentUser) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-muted-foreground">
                  You cannot edit your own account
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() =>
                  onToggleAdmin({ userId: user.id, isAdmin: !isAdmin })
                }
              >
                {isAdmin ? "Remove Admin" : "Make Admin"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => impersonateUser(user.id)}>
                Impersonate User
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  isBanned
                    ? onUnbanUser(user.id)
                    : onBanUser({ userId: user.id })
                }
              >
                {isBanned ? "Unban User" : "Ban User"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(user.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-3">
        <Input
          placeholder="Filter users..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          disabled={!impersonating}
          variant="outline"
          onClick={stopImpersonatingUser}
        >
          Stop impersonating user
        </Button>
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}
