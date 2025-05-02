import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCrimeData,
  getCrimeDataUnverified,
} from "@/lib/actions/get-crime-data";
import { auth } from "@/lib/auth";
import { AlertTriangle, FileText } from "lucide-react";
import { headers } from "next/headers";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: headers() });
  const crimeDataLength = await (await getCrimeData()).length;
  const crimeDataUnverifiedLength = await (
    await getCrimeDataUnverified()
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          <FileText className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{crimeDataLength}</div>
          <CardDescription>All crime reports</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Unverified</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{crimeDataUnverifiedLength}</div>
          <CardDescription>Awaiting verification</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = "force-dynamic";
