import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Clock, Lightbulb, Video, Zap } from "lucide-react";
import { useState } from "react";
import { PreMeetingFlashCard } from "./PreMeetingFlashCard";
import { EditableField } from "@/components/ui/editable-field";
import { toast } from "sonner";

const initialMeetings = [
  {
    id: 1,
    name: "David Kim",
    role: "VP Engineering, Stripe",
    avatar: "DK",
    time: "10:00 AM",
    type: "Video Call",
    lastMet: "3 weeks",
    reminder: "Mentioned interest in your AI ethics whitepaper",
    location: "Zoom Meeting",
    relationshipScore: 87,
    talkingPoints: [
      "The new CTO appointment at Stripe",
      "His AI ethics whitepaper feedback",
      "Q4 roadmap progress on neural network optimization",
    ],
    cautionFlags: [
      "The failed Q3 deal with their competitor",
      "Recent layoffs at his department",
    ],
    recentTopics: ["AI Integration", "Payments API", "Team Scaling", "Tech Stack"],
    sentiment: "positive" as const,
  },
  {
    id: 2,
    name: "Amanda Foster",
    role: "Managing Director, Goldman Sachs",
    avatar: "AF",
    time: "2:00 PM",
    type: "In-person",
    lastMet: "2 months",
    reminder: "Follow up on Series C investment discussion",
    location: "The Capital Grille, Financial District",
    relationshipScore: 72,
    talkingPoints: [
      "Series C investment timeline and terms",
      "Her recent promotion to Managing Director",
      "Market outlook for AI companies in 2025",
    ],
    cautionFlags: [
      "Don't mention competitor funding rounds",
    ],
    recentTopics: ["Valuation", "Due Diligence", "Board Seats", "Growth Metrics"],
    sentiment: "neutral" as const,
  },
  {
    id: 3,
    name: "James Wilson",
    role: "CEO, CloudScale",
    avatar: "JW",
    time: "4:30 PM",
    type: "Video Call",
    lastMet: "1 month",
    reminder: "Partnership proposal pending his review",
    location: "Google Meet",
    relationshipScore: 65,
    talkingPoints: [
      "Partnership proposal response",
      "Their new enterprise product launch",
      "Joint go-to-market strategy",
    ],
    cautionFlags: [
      "Budget constraints mentioned last call",
      "Tensions with their existing vendors",
    ],
    recentTopics: ["Partnership", "Infrastructure", "Pricing", "Integration"],
    sentiment: "negative" as const,
  },
];

export function TodaysBriefing() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashCardOpen, setFlashCardOpen] = useState(false);
  const [todaysMeetings, setTodaysMeetings] = useState(initialMeetings);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % todaysMeetings.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + todaysMeetings.length) % todaysMeetings.length);
  };

  const meeting = todaysMeetings[currentIndex];

  const handleSave = (field: string, value: string) => {
    setTodaysMeetings((prev) =>
      prev.map((m, i) =>
        i === currentIndex ? { ...m, [field]: value } : m
      )
    );
    toast.success("Changes saved");
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Today's Briefing</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {todaysMeetings.length} meetings scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={prevSlide}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {currentIndex + 1} / {todaysMeetings.length}
              </span>
              <Button variant="ghost" size="icon-sm" onClick={nextSlide}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="glass rounded-lg p-5 space-y-4 animate-fade-in" key={meeting.id}>
            {/* Meeting Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {meeting.avatar}
                </div>
                <div>
                  <EditableField
                    value={meeting.name}
                    onSave={(v) => handleSave("name", v)}
                    className="font-semibold text-foreground"
                  />
                  <EditableField
                    value={meeting.role}
                    onSave={(v) => handleSave("role", v)}
                    className="text-sm text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Video className="h-3.5 w-3.5" />
                <span>{meeting.type}</span>
              </div>
            </div>

            {/* Time & Last Met */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{meeting.time}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-muted-foreground">
                Last met: <span className="text-foreground">{meeting.lastMet}</span>
              </span>
            </div>

            {/* Reminder */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <Lightbulb className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-secondary mb-0.5">One Thing to Remember</p>
                <EditableField
                  value={meeting.reminder}
                  onSave={(v) => handleSave("reminder", v)}
                  className="text-sm text-foreground"
                />
              </div>
            </div>

            {/* Flash Card Button */}
            <Button
              variant="command"
              size="sm"
              className="w-full"
              onClick={() => setFlashCardOpen(true)}
            >
              <Zap className="h-4 w-4 mr-2 text-primary" />
              Pre-Meeting Prep
            </Button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {todaysMeetings.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <PreMeetingFlashCard
        open={flashCardOpen}
        onOpenChange={setFlashCardOpen}
        meeting={meeting}
      />
    </>
  );
}
