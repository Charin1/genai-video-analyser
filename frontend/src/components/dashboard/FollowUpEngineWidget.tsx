import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Send, 
  Mail, 
  Clock, 
  User,
  Sparkles,
  CheckCircle,
  FileText,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface FollowUpItem {
  id: string;
  meetingTitle: string;
  meetingDate: string;
  type: "promise" | "next_step" | "action_item";
  content: string;
  recipient: string;
  recipientEmail: string;
  status: "pending" | "drafted" | "sent";
  draftedEmail?: string;
  selected: boolean;
}

const initialFollowUps: FollowUpItem[] = [
  {
    id: "1",
    meetingTitle: "Q4 Planning Session",
    meetingDate: "Yesterday",
    type: "promise",
    content: "Send revised budget projections to finance team",
    recipient: "Sarah Chen",
    recipientEmail: "sarah.chen@vertex.com",
    status: "pending",
    selected: false
  },
  {
    id: "2",
    meetingTitle: "Product Roadmap Review",
    meetingDate: "Jan 16",
    type: "next_step",
    content: "Share updated product timeline with stakeholders",
    recipient: "David Kim",
    recipientEmail: "david.kim@techflow.com",
    status: "drafted",
    draftedEmail: "Hi David,\n\nFollowing our product roadmap discussion, I'm sharing the updated timeline as discussed...",
    selected: false
  },
  {
    id: "3",
    meetingTitle: "Partnership Discussion",
    meetingDate: "Jan 15",
    type: "action_item",
    content: "Provide partnership term sheet for legal review",
    recipient: "Michael Torres",
    recipientEmail: "m.torres@apex.com",
    status: "pending",
    selected: false
  },
  {
    id: "4",
    meetingTitle: "Team Sync",
    meetingDate: "Jan 14",
    type: "promise",
    content: "Schedule follow-up meeting to discuss hiring plan",
    recipient: "Emily Watson",
    recipientEmail: "emily.w@internal.com",
    status: "sent",
    selected: false
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "promise": return <CheckCircle className="h-3 w-3" />;
    case "next_step": return <Zap className="h-3 w-3" />;
    case "action_item": return <FileText className="h-3 w-3" />;
    default: return <Mail className="h-3 w-3" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "sent": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Sent</Badge>;
    case "drafted": return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Draft Ready</Badge>;
    default: return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
  }
};

export function FollowUpEngineWidget() {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(initialFollowUps);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSelect = (id: string) => {
    setFollowUps(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedCount = followUps.filter(f => f.selected).length;
  const pendingCount = followUps.filter(f => f.status === "pending").length;

  const handleGenerateDrafts = () => {
    const selectedItems = followUps.filter(f => f.selected && f.status === "pending");
    if (selectedItems.length === 0) {
      toast.error("Select pending items to generate drafts");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      setFollowUps(prev => prev.map(item => 
        item.selected && item.status === "pending" 
          ? { 
              ...item, 
              status: "drafted" as const,
              draftedEmail: `Hi ${item.recipient.split(' ')[0]},\n\nFollowing up on our ${item.meetingTitle} discussion - ${item.content.toLowerCase()}.\n\nBest regards`
            } 
          : item
      ));
      setIsGenerating(false);
      toast.success(`Generated ${selectedItems.length} email drafts`, {
        description: "Review and send when ready"
      });
    }, 1500);
  };

  const handleSendSelected = () => {
    const draftedItems = followUps.filter(f => f.selected && f.status === "drafted");
    if (draftedItems.length === 0) {
      toast.error("Select drafted items to send");
      return;
    }

    setFollowUps(prev => prev.map(item => 
      item.selected && item.status === "drafted" 
        ? { ...item, status: "sent" as const, selected: false } 
        : item
    ));
    toast.success(`Sent ${draftedItems.length} follow-up emails`, {
      description: "Recipients will receive them shortly"
    });
  };

  return (
    <Card className="glass-morphism border-primary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Send className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg font-space">Follow-Up Engine</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pendingCount} pending follow-ups from recent meetings
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <Badge variant="outline" className="animate-pulse border-warning/50 text-warning">
              {pendingCount} Need Action
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-2">
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {followUps.map((item) => (
              <div 
                key={item.id}
                className={`group p-3 rounded-lg border transition-all cursor-pointer ${
                  item.selected 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-card/50 border-border/50 hover:border-primary/20'
                } ${item.status === 'sent' ? 'opacity-60' : ''}`}
                onClick={() => item.status !== 'sent' && toggleSelect(item.id)}
              >
                <div className="flex items-start gap-3">
                  {item.status !== 'sent' && (
                    <Checkbox 
                      checked={item.selected}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {getTypeIcon(item.type)}
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{item.meetingDate}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-foreground line-clamp-1">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.recipient}</span>
                      <span className="text-[10px] text-muted-foreground/60">{item.recipientEmail}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {selectedCount > 0 ? `${selectedCount} selected` : "Select items to take action"}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateDrafts}
              disabled={selectedCount === 0 || isGenerating}
              className="gap-2"
            >
              <Sparkles className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "Generating..." : "Generate Drafts"}
            </Button>
            <Button 
              size="sm" 
              onClick={handleSendSelected}
              disabled={followUps.filter(f => f.selected && f.status === "drafted").length === 0}
              className="gap-2"
            >
              <Mail className="h-3 w-3" />
              Send Selected
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
