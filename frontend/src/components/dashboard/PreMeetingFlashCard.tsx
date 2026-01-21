import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  X,
  Zap,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EditableField } from "@/components/ui/editable-field";
import { EditableList } from "@/components/ui/editable-list";
import { toast } from "sonner";

interface PreMeetingFlashCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: {
    name: string;
    role: string;
    avatar: string;
    time: string;
    location?: string;
    lastMet: string;
    relationshipScore: number;
    talkingPoints: string[];
    cautionFlags: string[];
    recentTopics: string[];
    sentiment: "positive" | "neutral" | "negative";
  };
}

export function PreMeetingFlashCard({
  open,
  onOpenChange,
  meeting,
}: PreMeetingFlashCardProps) {
  const [editedMeeting, setEditedMeeting] = useState(meeting);

  useEffect(() => {
    setEditedMeeting(meeting);
  }, [meeting]);

  const handleSave = (field: string, value: string | string[]) => {
    setEditedMeeting((prev) => ({ ...prev, [field]: value }));
    toast.success("Changes saved");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-emerald-400";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 bg-background border-border overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-background p-6 pb-8">
          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Meeting Time Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              <Zap className="h-3 w-3 mr-1" />
              Starting Soon
            </Badge>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-primary-foreground shrink-0 ring-4 ring-background/50">
              {editedMeeting.avatar}
            </div>
            <div className="flex-1">
              <EditableField
                value={editedMeeting.name}
                onSave={(v) => handleSave("name", v)}
                variant="heading"
                className="text-xl font-space font-bold text-foreground"
              />
              <EditableField
                value={editedMeeting.role}
                onSave={(v) => handleSave("role", v)}
                className="text-sm text-muted-foreground"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-primary mb-1" />
              <span className="text-sm font-medium text-foreground">{editedMeeting.time}</span>
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-secondary mb-1" />
              <EditableField
                value={editedMeeting.lastMet}
                onSave={(v) => handleSave("lastMet", v)}
                className="text-sm font-medium text-foreground text-center"
                showIcon={false}
              />
              <span className="text-xs text-muted-foreground">Last Met</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-background/50 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-emerald-400 mb-1" />
              <span className="text-sm font-medium text-foreground">{editedMeeting.relationshipScore}%</span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Sentiment */}
          <div className="flex items-center gap-3 p-3 rounded-lg glass">
            <div className={`flex items-center gap-2 ${getSentimentColor(editedMeeting.sentiment)}`}>
              {getSentimentIcon(editedMeeting.sentiment)}
              <span className="text-sm font-medium capitalize">{editedMeeting.sentiment} History</span>
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              Based on past interactions
            </span>
          </div>

          {/* The Hook - Talking Points */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Ask About</h3>
            </div>
            <div className="pl-10">
              <EditableList
                items={editedMeeting.talkingPoints}
                onSave={(items) => handleSave("talkingPoints", items)}
                variant="card"
                addLabel="Add talking point"
                itemClassName="bg-primary/5 border-primary/10"
                iconClassName="text-primary"
              />
            </div>
          </div>

          {/* The Caution - Things to Avoid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Avoid Discussing</h3>
            </div>
            <div className="pl-10">
              <EditableList
                items={editedMeeting.cautionFlags}
                onSave={(items) => handleSave("cautionFlags", items)}
                variant="card"
                addLabel="Add caution flag"
                itemClassName="bg-destructive/5 border-destructive/10"
                iconClassName="text-destructive"
              />
            </div>
          </div>

          {/* Recent Topics */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Past Topics</h3>
            </div>
            <div className="pl-10">
              <EditableList
                items={editedMeeting.recentTopics}
                onSave={(items) => handleSave("recentTopics", items)}
                variant="badges"
                addLabel="Add topic"
              />
            </div>
          </div>

          {/* Location if available */}
          {editedMeeting.location && (
            <div className="flex items-center gap-3 p-3 rounded-lg glass">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <EditableField
                value={editedMeeting.location}
                onSave={(v) => handleSave("location", v)}
                className="text-sm text-foreground flex-1"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card/50">
          <Button variant="default" className="w-full" onClick={() => onOpenChange(false)}>
            Ready for Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
