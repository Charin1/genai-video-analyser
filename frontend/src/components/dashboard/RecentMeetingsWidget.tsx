import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";

const recentMeetings = [
  {
    id: 1,
    title: "Q4 Strategy Review",
    participants: ["Sarah Chen", "Michael Ross"],
    date: "Yesterday",
    insights: 3,
  },
  {
    id: 2,
    title: "Investment Committee",
    participants: ["Amanda Foster", "James Wilson"],
    date: "2 days ago",
    insights: 5,
  },
  {
    id: 3,
    title: "Product Roadmap",
    participants: ["David Kim"],
    date: "Last week",
    insights: 2,
  },
];

export function RecentMeetingsWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Recent Meetings</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {recentMeetings.map((meeting) => (
          <Link
            key={meeting.id}
            to={`/meeting/${meeting.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {meeting.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{meeting.participants.join(", ")}</span>
                  <span>•</span>
                  <span>{meeting.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <Brain className="h-3 w-3" />
              <span>{meeting.insights} insights</span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
