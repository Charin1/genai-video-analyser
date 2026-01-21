import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationGraph } from "@/components/dashboard/ConversationGraph";
import { EditableField } from "@/components/ui/editable-field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Search,
  User,
  CheckCircle2,
  Circle,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  Newspaper,
  Clock,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface TranscriptEntry {
  id: number;
  speaker: string;
  time: string;
  text: string;
}

interface ActionItem {
  id: number;
  text: string;
  completed: boolean;
}

interface PromiseItem {
  id: number;
  text: string;
  by: string;
  status: "pending" | "completed";
}

interface EntityItem {
  id: number;
  name: string;
  role?: string;
  type: "person" | "company";
  stock?: string;
  price?: number;
  change?: number;
}

export default function MeetingDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  // Editable state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [promisesMade, setPromisesMade] = useState<PromiseItem[]>([]);
  const [nextSteps, setNextSteps] = useState<ActionItem[]>([]);
  const [entities, setEntities] = useState<EntityItem[]>([]);

  // Fetch meeting data
  const { data: meeting, isLoading, refetch } = useQuery({
    queryKey: ["meeting", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/videos/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch meeting");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Effect to populate state when data is fetched
  useEffect(() => {
    if (meeting) {
      // 1. Parse Transcript
      const rawTranscript = meeting.transcript_text || "";
      const transcriptLines = rawTranscript.split('\n').filter((line: string) => line.trim().length > 0);
      const parsedTranscript = transcriptLines.map((line: string, index: number) => {
        const parts = line.split(':');
        if (parts.length > 1) {
          return {
            id: index,
            speaker: parts[0].trim(),
            time: "00:00",
            text: parts.slice(1).join(':').trim()
          };
        }
        return {
          id: index,
          speaker: "Unknown",
          time: "00:00",
          text: line
        };
      });
      setTranscript(parsedTranscript);

      // 2. Parse Summary/Report
      let report: any = {};
      try {
        report = JSON.parse(meeting.summary_text || "{}");
      } catch (e) {
        report = { summary: meeting.summary_text };
      }

      // Action Items
      const actions = report["Action Items"] || report["Next Steps"] || [];
      if (Array.isArray(actions)) {
        setNextSteps(actions.map((text: string, i: number) => ({
          id: i,
          text: text,
          completed: false
        })));
      }

      // Promises / Key Insights
      const insights = report["Key Insights"] || report["Promises"] || [];
      if (Array.isArray(insights)) {
        setPromisesMade(insights.map((text: string, i: number) => {
          return {
            id: i,
            text: text,
            by: "Unknown",
            status: "pending"
          };
        }));
      }

      // 3. Entities / People
      const people = report["People"] || report["Key People"] || [];
      const companies = report["Companies"] || [];

      const newEntities: EntityItem[] = [];
      if (Array.isArray(people)) {
        people.forEach((p: string, i: number) => {
          newEntities.push({ id: i, name: p, type: "person", role: "Participant" });
        });
      }
      if (Array.isArray(companies)) {
        companies.forEach((c: string, i: number) => {
          newEntities.push({ id: people.length + i, name: c, type: "company", stock: "N/A", price: 0, change: 0 });
        });
      }
      setEntities(newEntities);
    }
  }, [meeting]);

  const handleSave = async () => {
    if (!meeting) return;

    const toastId = toast.loading("Saving changes...");
    try {
      // Reconstruct Transcript
      const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');

      // Reconstruct Summary/Report JSON
      let currentReport: any = {};
      try {
        currentReport = JSON.parse(meeting.summary_text || "{}");
      } catch (e) {
        currentReport = { summary: meeting.summary_text };
      }

      // Update fields
      currentReport["Action Items"] = nextSteps.map(s => s.text);
      currentReport["Key Insights"] = promisesMade.map(p => p.text);
      currentReport["People"] = entities.filter(e => e.type === 'person').map(e => e.name);
      currentReport["Companies"] = entities.filter(e => e.type === 'company').map(e => e.name);

      const summaryText = JSON.stringify(currentReport);

      const response = await fetch(`${API_BASE_URL}/api/v1/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript_text: transcriptText,
          summary_text: summaryText,
          title: meeting.title
        })
      });

      if (!response.ok) throw new Error("Failed to save");

      toast.success("Changes saved successfully", { id: toastId });
      refetch(); // Reload data
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes", { id: toastId });
    }
  };

  // Update handlers
  const updateTranscriptEntry = (entryId: number, field: 'speaker' | 'text', value: string) => {
    setTranscript(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, [field]: value } : entry
    ));
  };

  const updatePromise = (promiseId: number, field: 'text' | 'by', value: string) => {
    setPromisesMade(prev => prev.map(p =>
      p.id === promiseId ? { ...p, [field]: value } : p
    ));
  };

  const togglePromiseStatus = (promiseId: number) => {
    setPromisesMade(prev => prev.map(p =>
      p.id === promiseId ? { ...p, status: p.status === 'completed' ? 'pending' : 'completed' } : p
    ));
  };

  const updateNextStep = (stepId: number, value: string) => {
    setNextSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, text: value } : s
    ));
  };

  const toggleStepCompleted = (stepId: number) => {
    setNextSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    ));
  };

  const addNextStep = () => {
    const newId = nextSteps.length > 0 ? Math.max(...nextSteps.map(s => s.id)) + 1 : 1;
    setNextSteps(prev => [...prev, { id: newId, text: "New action item", completed: false }]);
  };

  const updateEntity = (entityId: number, field: string, value: string) => {
    setEntities(prev => prev.map(e =>
      e.id === entityId ? { ...e, [field]: value } : e
    ));
  };

  const filteredTranscript = transcript.filter(entry =>
    entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <MainLayout><div className="p-8 text-center">Loading meeting...</div></MainLayout>;
  if (!meeting) return <MainLayout><div className="p-8 text-center">Meeting not found</div></MainLayout>;

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/meetings" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3 w-3" />
                    NexusInsightStream
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{meeting.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-space font-bold text-foreground">
              {meeting.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(meeting.date).toLocaleDateString()} • {new Date(meeting.date).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSave}>
              <Bookmark className="h-4 w-4 mr-1.5" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100vh-4rem)]">
        {/* Left Column - Transcript */}
        <div className="lg:col-span-4 border-r border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredTranscript.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">No transcript available or loading...</div>
            ) : filteredTranscript.map((entry) => (
              <div
                key={entry.id}
                className={`group p-3 rounded-lg transition-colors hover:bg-muted/50 ${entry.speaker === "You" ? "border-l-2 border-primary" : "border-l-2 border-secondary"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <EditableField
                    value={entry.speaker}
                    onSave={(value) => updateTranscriptEntry(entry.id, 'speaker', value)}
                    className={`text-sm font-medium ${entry.speaker === "You" ? "text-primary" : "text-secondary"
                      }`}
                  />
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                </div>
                <EditableField
                  value={entry.text}
                  onSave={(value) => updateTranscriptEntry(entry.id, 'text', value)}
                  variant="textarea"
                  className="text-sm text-foreground leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center Column - Executive Summary */}
        <div className="lg:col-span-4 border-r border-border overflow-y-auto p-4 space-y-4">

          {/* Summary Text (New) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {meeting.summary_text.startsWith('{') ? (JSON.parse(meeting.summary_text).Summary || JSON.parse(meeting.summary_text).summary) : meeting.summary_text}
              </p>
            </CardContent>
          </Card>


          {/* Promises Made */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-secondary" />
                Promises Made & Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {promisesMade.length === 0 && <p className="text-xs text-muted-foreground">No specific promises detected.</p>}
              {promisesMade.map((promise) => (
                <div
                  key={promise.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 group"
                >
                  <button
                    onClick={() => togglePromiseStatus(promise.id)}
                    className="mt-0.5 shrink-0"
                  >
                    {promise.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <EditableField
                      value={promise.text}
                      onSave={(value) => updatePromise(promise.id, 'text', value)}
                      className={`text-sm text-foreground ${promise.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                    />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>by</span>
                      <EditableField
                        value={promise.by}
                        onSave={(value) => updatePromise(promise.id, 'by', value)}
                        className="text-xs"
                        showIcon={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 group"
                >
                  <Checkbox
                    checked={step.completed}
                    onCheckedChange={() => toggleStepCompleted(step.id)}
                    className="shrink-0"
                  />
                  <EditableField
                    value={step.text}
                    onSave={(value) => updateNextStep(step.id, value)}
                    className={`flex-1 text-sm ${step.completed ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={addNextStep}
                className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add action item
              </Button>
            </CardContent>
          </Card>

          {/* Interactive Conversation Graph */}
          <ConversationGraph entities={entities} meetingTitle={meeting.title} />
        </div>

        {/* Right Column - Intelligence Sidebar */}
        <div className="lg:col-span-4 overflow-y-auto p-4 space-y-4 bg-card/30">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Intelligence
          </h3>

          {entities.length === 0 && <p className="text-sm text-muted-foreground">No entities extracted.</p>}
          {entities.map((entity) => (
            <Card key={entity.id} className="hover:glow-cyan transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                {entity.type === "person" ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
                      <User className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <EditableField
                        value={entity.name}
                        onSave={(value) => updateEntity(entity.id, 'name', value)}
                        className="text-sm font-medium text-foreground group-hover:text-primary transition-colors"
                      />
                      <EditableField
                        value={entity.role || ''}
                        onSave={(value) => updateEntity(entity.id, 'role', value)}
                        className="text-xs text-muted-foreground"
                        placeholder="Add role..."
                      />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <EditableField
                        value={entity.name}
                        onSave={(value) => updateEntity(entity.id, 'name', value)}
                        className="text-sm font-medium text-foreground group-hover:text-primary transition-colors"
                      />
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                        {entity.stock}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-space font-bold text-foreground">
                        ${entity.price}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-sm ${entity.change && entity.change > 0 ? "text-emerald-400" : "text-destructive"
                          }`}
                      >
                        <TrendingUp className="h-3 w-3" />
                        {entity.change && entity.change > 0 ? "+" : ""}{entity.change}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
