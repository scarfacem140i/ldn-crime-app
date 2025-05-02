"use client";

import { UsersTableWithData } from "@/components/admin/users-table";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">User Management</h1>
      <UsersTableWithData />
    </div>
  );
}
