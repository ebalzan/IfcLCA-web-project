"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  PlusCircle,
  Upload,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Activity as ActivityIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ActivityType } from "@/interfaces/client/activities/IActivity";
import { useActivities } from "@/hooks/activities/use-activities";

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "project_created":
      return <PlusCircle className="h-4 w-4" />;
    case "file_uploaded":
      return <Upload className="h-4 w-4" />;
    case "project_updated":
      return <Pencil className="h-4 w-4" />;
    case "project_deleted":
      return <Trash2 className="h-4 w-4" />;
    case "image_uploaded":
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <ActivityIcon className="h-4 w-4" />;
  }
};

export function ActivityFeed() {
  const {
    activities,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useActivities();

  if (isLoading || isFetchingNextPage) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        {activities.map((activity, index) => (
          <div
            key={activity.id + index}
            className="flex items-center gap-4 py-2 border-b last:border-0"
          >
            <div className="flex-shrink-0 w-8 h-8 relative">
              {activity.user.imageUrl ? (
                <Image
                  src={activity.user?.imageUrl}
                  alt={activity.user?.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {activity.user?.name[0] || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">
                  {activity.user.name}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getActivityIcon(activity.type)}
                  <span className="text-sm">{activity.action}</span>
                </div>
                <Link
                  href={`/projects/${activity.project.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  {activity.project.name}
                </Link>
              </div>
              {activity.details?.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activity.details.description}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
              })}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
