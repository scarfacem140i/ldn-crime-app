import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CrimeReportWithStats } from "@/lib/db/types";
import { useCrimeVicinity } from "@/lib/hooks/use-crimes";
import { useVote } from "@/lib/hooks/use-vote";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CircleAlert,
  Flag,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { MouseEvent } from "react";
import { CrimeIcon } from "./crime-icon";
import { Button } from "./ui/button";

function VoteButton({
  direction,
  active,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  active: boolean;
  disabled?: boolean;
  onClick: (e: MouseEvent) => void;
}) {
  const Icon = direction === "up" ? ThumbsUp : ThumbsDown;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
    </Button>
  );
}

interface CrimeCardProps {
  crime: CrimeReportWithStats;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export function CrimeCard({
  crime,
  isSelected = false,
  onSelect,
}: CrimeCardProps) {
  const { handleVote } = useVote(crime);
  const { data: vicinityCrimes } = useCrimeVicinity(crime);

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
            {vicinityCrimes && vicinityCrimes.length > 0 && (
              <span className="text-red-200/80 font-medium mt-2 text-xs flex items-center gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5" />
                Multiple crimes reported in area
              </span>
            )}
          </div>
          <Badge variant={crime.verified ? "secondary" : "outline"}>
            {crime.verified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grow">
        <p className="text-sm mb-2 max-w-prose">{crime.description}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(crime.created_at), {
              addSuffix: true,
            })}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <VoteButton
                direction="up"
                active={crime.userVote === 1}
                onClick={(e) => handleVote(e, "up")}
              />
              <span>{crime.votes.upvotes}</span>
            </div>
            <div className="flex items-center gap-1">
              <VoteButton
                direction="down"
                active={crime.userVote === -1}
                onClick={(e) => handleVote(e, "down")}
              />
              <span>{crime.votes.downvotes}</span>
            </div>
            {crime.flags > 0 && (
              <span
                className="flex items-center gap-1"
                title={`Flagged ${crime.flags} times`}
              >
                <Flag className="h-3 w-3" />
                <span>{crime.flags}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
      {!crime.verified && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
      )}
    </Card>
  );
}
