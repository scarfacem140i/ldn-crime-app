"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { user } from "@/lib/db/auth-schema";
import { CrimeReportWithStats } from "@/lib/db/types";
import { format } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import {
  Calendar,
  CheckCircle,
  Flag,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";

type CrimeReportUnion = CrimeReportWithStats & {
  user: InferSelectModel<typeof user>;
};

interface CrimeReportDetailProps {
  report: CrimeReportUnion;
  onVerify: () => void;
  onUnverify: () => void;
}

export function CrimeReportDetail({
  report,
  onVerify,
  onUnverify,
}: CrimeReportDetailProps) {
  const getStatusBadge = () => {
    return report.verified ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Flag className="h-3 w-3" />
        Unverified
      </Badge>
    );
  };

  const totalVotes = report.votes.upvotes + report.votes.downvotes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{report.category}</h2>
            {getStatusBadge()}
          </div>
          <div className="flex items-center text-gray-500 gap-1">
            <MapPin className="h-4 w-4" />
            <span>
              {report.street_name || `${report.latitude}, ${report.longitude}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">ID: {report.id}</Badge>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="votes">
            Votes {report.votes.upvotes + report.votes.downvotes}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Incident Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    <span className="font-medium">Date & Time: </span>
                    {format(new Date(report.created_at), "PPP 'at' p")}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground p-3 rounded-md border bg-muted">
                    {report.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Location Coordinates
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Latitude: {report.latitude}, Longitude: {report.longitude}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Reporter Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User"
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {report.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.user?.email || "No email provided"}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">User ID: </span>
                  {report.user_id}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Submitted: </span>
                  {format(new Date(report.created_at), "PPP 'at' p")}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="votes" className="pt-4">
          {report.votes && totalVotes > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Total votes:</span>
                <div className="flex items-center gap-1">
                  {totalVotes && totalVotes > 0 ? (
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  ) : totalVotes && totalVotes < 0 ? (
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span>{totalVotes}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No votes for this report yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end gap-4">
        {report.verified ? (
          <Button variant="outline" onClick={onUnverify}>
            Mark as Unverified
          </Button>
        ) : (
          <Button onClick={onVerify}>Verify Report</Button>
        )}
      </div>
    </div>
  );
}
