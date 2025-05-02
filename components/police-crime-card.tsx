import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api_crime_report } from "@/lib/db/schema";
import { formatDistanceToNow } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import { CrimeIcon } from "./crime-icon";

type ApiCrimeReport = InferSelectModel<typeof api_crime_report>;

interface CrimeCardProps {
  crime: ApiCrimeReport;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function CrimeCard({
  crime,
  isSelected = false,
  onSelect,
}: CrimeCardProps) {
  return (
    <Card
      className={`relative flex flex-col transition-colors ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect?.(crime.id)}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="flex gap-3 items-center">
              <CrimeIcon className="h-4 w-4" category={crime.category} />
              <CardTitle className="text-base mb-0.5">
                {crime.category}
              </CardTitle>
            </span>
            <CardDescription className="line-clamp-1">
              {crime.street_name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grow">
        <p className="text-sm mb-2 max-w-prose">
          {crime.outcome_status ?? "No further details available"}
        </p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(crime.month), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
