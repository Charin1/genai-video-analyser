import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost, Mail, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { EditableField } from "@/components/ui/editable-field";
import { toast } from "sonner";

const initialRelationships = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "CTO, TechVentures",
    lastContact: "6 months ago",
    avatar: "SC",
    urgency: "high",
  },
  {
    id: 2,
    name: "Michael Ross",
    role: "Partner, Atlas Capital",
    lastContact: "8 months ago",
    avatar: "MR",
    urgency: "critical",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "CEO, GreenTech Solutions",
    lastContact: "7 months ago",
    avatar: "ER",
    urgency: "high",
  },
];

export function GhostProtocolWidget() {
  const [decayingRelationships, setDecayingRelationships] = useState(initialRelationships);

  const handleSave = (id: number, field: string, value: string) => {
    setDecayingRelationships((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    toast.success("Changes saved");
  };

  return (
    <Card variant="glow" className="relative overflow-hidden">
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-50" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              <Ghost className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">"Ghost" Protocol</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Key Relationships Decaying
              </p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {decayingRelationships.map((person) => (
          <div
            key={person.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold">
                {person.avatar}
              </div>
              <div>
                <EditableField
                  value={person.name}
                  onSave={(v) => handleSave(person.id, "name", v)}
                  className="text-sm font-medium text-foreground"
                />
                <EditableField
                  value={person.role}
                  onSave={(v) => handleSave(person.id, "role", v)}
                  className="text-xs text-muted-foreground"
                />
                <EditableField
                  value={person.lastContact}
                  onSave={(v) => handleSave(person.id, "lastContact", v)}
                  className="text-xs text-secondary mt-0.5"
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
            >
              <Mail className="h-4 w-4 mr-1.5" />
              Reconnect
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
