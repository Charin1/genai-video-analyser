import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User,
  Building,
  Volume2,
  ChevronRight,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface BriefingItem {
  id: string;
  type: "meeting" | "promise_due" | "promise_made" | "relationship_alert" | "strategic";
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  time?: string;
  contact?: string;
  company?: string;
}

const todaysBriefing: BriefingItem[] = [
  {
    id: "1",
    type: "meeting",
    priority: "critical",
    title: "Board Strategy Review",
    description: "Quarterly performance review with full board. Prepare expansion metrics.",
    time: "10:00 AM",
    contact: "Board of Directors",
    company: "Internal"
  },
  {
    id: "2",
    type: "promise_due",
    priority: "high",
    title: "Partnership Proposal Due",
    description: "Sarah Chen is expecting the revised partnership terms today.",
    contact: "Sarah Chen",
    company: "Vertex Capital"
  },
  {
    id: "3",
    type: "relationship_alert",
    priority: "high",
    title: "Relationship Decay Alert",
    description: "No contact with Michael Torres in 28 days. Schedule touchpoint.",
    contact: "Michael Torres",
    company: "Apex Industries"
  },
  {
    id: "4",
    type: "promise_made",
    priority: "medium",
    title: "Follow-up Required",
    description: "You promised to send product roadmap to David Kim by this week.",
    contact: "David Kim",
    company: "TechFlow Inc"
  },
  {
    id: "5",
    type: "strategic",
    priority: "medium",
    title: "Emerging Theme Detected",
    description: "Budget concerns mentioned in 4 meetings this week. Consider addressing proactively.",
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
    case "high": return "bg-warning/20 text-warning border-warning/30";
    default: return "bg-primary/20 text-primary border-primary/30";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "meeting": return <Calendar className="h-4 w-4" />;
    case "promise_due": return <AlertTriangle className="h-4 w-4" />;
    case "promise_made": return <CheckCircle2 className="h-4 w-4" />;
    case "relationship_alert": return <Clock className="h-4 w-4" />;
    case "strategic": return <Sparkles className="h-4 w-4" />;
    default: return <Zap className="h-4 w-4" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "meeting": return "Meeting";
    case "promise_due": return "Promise Due";
    case "promise_made": return "Your Promise";
    case "relationship_alert": return "Relationship";
    case "strategic": return "Strategic Intel";
    default: return "Alert";
  }
};

export function ExecutiveBriefWidget() {
  const [items] = useState<BriefingItem[]>(todaysBriefing);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVoiceBrief = () => {
    setIsPlaying(true);
    toast.success("Playing voice briefing...", {
      description: "AI-generated summary of your daily priorities"
    });
    // Simulate voice playing
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const criticalCount = items.filter(i => i.priority === "critical").length;
  const highCount = items.filter(i => i.priority === "high").length;

  return (
    <Card className="col-span-full glass-morphism border-primary/20 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-space">Executive Intelligence Brief</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-warning/20 text-warning border-warning/30">
                {highCount} High Priority
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleVoiceBrief}
              className={`gap-2 ${isPlaying ? 'bg-primary/20' : ''}`}
            >
              <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              Brief Me
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-2">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className="group p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getPriorityColor(item.priority)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {getTypeLabel(item.type)}
                      </Badge>
                      {item.time && (
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    {(item.contact || item.company) && (
                      <div className="flex items-center gap-3 mt-2">
                        {item.contact && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {item.contact}
                          </span>
                        )}
                        {item.company && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            {item.company}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
