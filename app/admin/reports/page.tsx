import { CrimeReportTableWithData } from "@/components/admin/crime-report-table";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Reports</h1>
      <CrimeReportTableWithData />
    </div>
  );
}
