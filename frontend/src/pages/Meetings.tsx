import { MainLayout } from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Grid3X3,
  List,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Lightbulb,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { EditableField } from "@/components/ui/editable-field";
import { EditableList } from "@/components/ui/editable-list";
import { toast } from "sonner";

const meetingTypes = ["All", "Strategy", "Investor", "Product", "Sales", "Engineering", "Partnership", "Customer"];

// Mock meetings data removed


import { useQuery } from "@tanstack/react-query";

interface Meeting {
  id: number;
  title: string;
  date: string;
  transcript_text?: string;
  summary_text?: string;
  file_path?: string;
  // Frontend specific or mapped fields
  time?: string;
  duration?: string;
  participants?: { name: string; initials: string }[];
  insights?: number;
  topics?: string[];
  sentiment?: string;
  summary?: string;
  type?: string;
  keyInsights?: string[];
}

export default function Meetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);

  // Fetch meetings from backend
  const { data: fetchedMeetings, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/videos`);
      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }
      const data = await response.json();

      // Map backend data to frontend interface
      return data.map((item: any) => {
        let summaryData: any = {};
        try {
          summaryData = JSON.parse(item.summary_text || "{}");
        } catch (e) {
          summaryData = { summary: item.summary_text };
        }

        const summaryText = summaryData.summary || summaryData.Summary || item.summary_text || "No summary available";

        // Extract insights if they exist in the summary data
        // For now, we'll try to guess structure or use defaults
        const topics = item.topics || [];

        return {
          id: item.id,
          title: item.title,
          date: new Date(item.date).toLocaleDateString(),
          time: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: "Unknown", // Backend doesnt have duration yet
          participants: [], // Backend doesnt have participants yet
          insights: item.insights ? item.insights.length : 0,
          topics: topics,
          sentiment: "neutral", // Analysis service needs to provide this
          summary: summaryText,
          summary_text: item.summary_text, // Pass raw for editing
          type: "General",
          keyInsights: item.insights ? item.insights.map((i: any) => i.content) : [],
        };
      });
    },
  });

  const meetings = fetchedMeetings || []; // Use fetched data or empty array

  const handleSave = async (meetingId: number, field: string, value: string | string[]) => {
    // Map frontend fields to backend fields
    const updateData: any = {};
    const meeting = meetings.find((m: Meeting) => m.id === meetingId);

    if (!meeting) return;

    // Optimistic Update
    // (In a real app, query client setQueryData would be better, but this works for now)
    toast.info("Saving changes...");

    if (field === "title") updateData.title = value;
    if (field === "summary") {
      // We need to update the summary_text JSON
      // We can iterate the existing known fields
      const currentSummary = JSON.parse(meeting.summary_text || "{}"); // This is accessible if we pass it, but interface doesn't have it fully.
      // Actually, we don't have the full original raw object here easily unless we store it.
      // But assuming 'summary' maps to the main summary text.
      updateData.summary_text = JSON.stringify({ ...currentSummary, Summary: value });
    }
    // For insights/topics, it's trickier as they are often derived or in JSON.
    // If we want to support editing insights/topics, we need to reconstruct the JSON.
    // Simplifying assumption: We only support title and summary editing fully for now via this generic handler
    // OR we just send the fields we know.

    // Let's implement robust saving for Title and Main Summary first.
    // For topics/insights, we'd need to fetch the full object, modify it, and send it back.

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/videos/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error("Failed to save");
      toast.success("Saved successfully");
      // Refetch to sync
      // queryClient.invalidateQueries(["meetings"]) // if we had access to queryClient here
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    }
  };

  const filteredMeetings = meetings.filter((meeting: Meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.summary?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (meeting.topics || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (meeting.participants || []).some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === "All" || meeting.type === selectedType;

    // Safety check for sentiment
    const meetingSentiment = meeting.sentiment || "neutral";
    const matchesSentiment = selectedSentiments.length === 0 || selectedSentiments.includes(meetingSentiment);

    return matchesSearch && matchesType && matchesSentiment;
  });

  const sortedMeetings = [...filteredMeetings].sort((a: Meeting, b: Meeting) => {
    if (sortBy === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "insights") {
      return (b.insights || 0) - (a.insights || 0);
    }
    return 0;
  });

  const getSentimentColor = (sentiment: string = "neutral") => {
    switch (sentiment) {
      case "positive":
        return "text-emerald-400";
      case "negative":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getSentimentBg = (sentiment: string = "neutral") => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-400/10";
      case "negative":
        return "bg-destructive/10";
      default:
        return "bg-muted";
    }
  };

  if (isLoading) {
    return <MainLayout><div className="flex items-center justify-center h-screen">Loading meetings...</div></MainLayout>;
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-space font-bold text-foreground">
              NexusInsightStream
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and search your meeting archive • {meetings.length} meetings recorded
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings, topics, or participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>

            <div className="flex gap-2">
              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px] bg-muted/50">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Advanced Filters */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-muted/50">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Sentiment</p>
                      <div className="space-y-2">
                        {["positive", "neutral", "negative"].map((sentiment) => (
                          <label key={sentiment} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedSentiments.includes(sentiment)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedSentiments([...selectedSentiments, sentiment]);
                                } else {
                                  setSelectedSentiments(selectedSentiments.filter((s) => s !== sentiment));
                                }
                              }}
                            />
                            <span className="text-sm capitalize">{sentiment}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] bg-muted/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="insights">Most insights</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border border-border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${viewMode === "list" ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-none ${viewMode === "grid" ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="p-4 lg:p-6">
        {sortedMeetings.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No meetings found matching your criteria</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {sortedMeetings.map((meeting) => (
              <HoverCard key={meeting.id} openDelay={300} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Link to={`/meeting/${meeting.id}`}>
                    <Card className="group hover:glow-cyan transition-all duration-300 cursor-pointer hover:border-primary/50">
                      <CardContent className={`p-4 ${viewMode === "list" ? "flex items-center gap-4" : ""}`}>
                        {viewMode === "list" ? (
                          <>
                            {/* List View */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                  {meeting.title}
                                </h3>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {meeting.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                {meeting.summary}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {meeting.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {meeting.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {meeting.participants.length}
                                </span>
                              </div>
                            </div>

                            {/* Participants */}
                            <div className="flex -space-x-2 shrink-0">
                              {meeting.participants.slice(0, 3).map((p, i) => (
                                <div
                                  key={i}
                                  className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-xs font-medium border-2 border-card"
                                  title={p.name}
                                >
                                  {p.initials}
                                </div>
                              ))}
                              {meeting.participants.length > 3 && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                                  +{meeting.participants.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Insights Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${getSentimentBg(meeting.sentiment)}`}>
                                <TrendingUp className={`h-3 w-3 ${getSentimentColor(meeting.sentiment)}`} />
                                <span className={`text-xs font-medium ${getSentimentColor(meeting.sentiment)}`}>
                                  {meeting.sentiment}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                                <Sparkles className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium text-primary">{meeting.insights}</span>
                              </div>
                            </div>

                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </>
                        ) : (
                          <>
                            {/* Grid View */}
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {meeting.type}
                                    </Badge>
                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${getSentimentBg(meeting.sentiment)}`}>
                                      <span className={`text-xs ${getSentimentColor(meeting.sentiment)}`}>
                                        {meeting.sentiment}
                                      </span>
                                    </div>
                                  </div>
                                  <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                                    {meeting.title}
                                  </h3>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {meeting.summary}
                              </p>

                              <div className="flex flex-wrap gap-1.5">
                                {meeting.topics.slice(0, 3).map((topic, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-border">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {meeting.date.split(",")[0]}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {meeting.duration}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex -space-x-1.5">
                                    {meeting.participants.slice(0, 2).map((p, i) => (
                                      <div
                                        key={i}
                                        className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-[10px] font-medium border border-card"
                                      >
                                        {p.initials}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    <span className="text-xs font-medium text-primary">{meeting.insights}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-96 p-0"
                  side="right"
                  align="start"
                  sideOffset={12}
                >
                  <div className="p-4 space-y-4" onClick={(e) => e.preventDefault()}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {meeting.type}
                          </Badge>
                          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${getSentimentBg(meeting.sentiment)}`}>
                            <TrendingUp className={`h-3 w-3 ${getSentimentColor(meeting.sentiment)}`} />
                            <span className={`text-xs ${getSentimentColor(meeting.sentiment)}`}>
                              {meeting.sentiment}
                            </span>
                          </div>
                        </div>
                        <EditableField
                          value={meeting.title}
                          onSave={(v) => handleSave(meeting.id, "title", v)}
                          className="font-medium text-foreground"
                        />
                      </div>
                    </div>

                    {/* Full Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="font-medium">Summary</span>
                      </div>
                      <EditableField
                        value={meeting.summary}
                        onSave={(v) => handleSave(meeting.id, "summary", v)}
                        variant="textarea"
                        className="text-sm text-muted-foreground leading-relaxed"
                      />
                    </div>

                    {/* Key Insights */}
                    {meeting.keyInsights && meeting.keyInsights.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium">Key Insights ({meeting.keyInsights.length})</span>
                        </div>
                        <EditableList
                          items={meeting.keyInsights}
                          onSave={(items) => handleSave(meeting.id, "keyInsights", items)}
                          variant="list"
                          addLabel="Add insight"
                          icon={<span className="text-primary">•</span>}
                          itemClassName="text-foreground/80 text-sm"
                        />
                      </div>
                    )}

                    {/* Topics */}
                    <div className="pt-2 border-t border-border">
                      <EditableList
                        items={meeting.topics}
                        onSave={(items) => handleSave(meeting.id, "topics", items)}
                        variant="badges"
                        addLabel="Add"
                      />
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {meeting.participants.map(p => p.name).join(", ")}
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
