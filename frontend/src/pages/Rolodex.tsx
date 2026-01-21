import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditableField } from "@/components/ui/editable-field";
import { EditableList } from "@/components/ui/editable-list";
import {
  Search,
  User,
  Building2,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Calendar,
  MessageSquare,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

interface TimelineEvent {
  id: number;
  date: string;
  event: string;
  topics: string[];
  sentiment: string;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  style: string;
  lastContact: string; // matches backend response key
  totalMeetings: number;
  topics: string[];
  timeline: TimelineEvent[];
}

// Helper to map backend keys (snake_case) to frontend (camelCase) if needed
// Actually, let's keep frontend interface matching backend response or handle mapping.
// Backend returns: last_contact, total_meetings.
// Frontend interface demands camelCase. I will map in queryFn.

export default function Rolodex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Fetch contacts
  const { data: contacts = [], refetch } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/contacts`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      // Map to frontend interface
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        company: c.company,
        avatar: c.avatar,
        style: c.style,
        lastContact: c.last_contact,
        totalMeetings: c.total_meetings,
        topics: c.topics || [],
        timeline: c.timeline || []
      }));
    }
  });

  // Select first contact on load
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts]);

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveContact = async (updatedContact: Contact) => {
    // Optimistic update
    setSelectedContact(updatedContact);

    // Convert back to backend format
    const payload = {
      name: updatedContact.name,
      role: updatedContact.role,
      company: updatedContact.company,
      style: updatedContact.style,
      last_contact: updatedContact.lastContact,
      topics: updatedContact.topics,
      timeline: updatedContact.timeline // sending full timeline replacement
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contacts/${updatedContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to save contact");
      toast.success("Saved");
      refetch(); // sync list
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    }
  };

  const updateContactField = (field: keyof Contact, value: any) => {
    if (!selectedContact) return;
    const updated = { ...selectedContact, [field]: value };
    saveContact(updated);
  };

  const updateTimelineEvent = (eventId: number, field: keyof TimelineEvent, value: any) => {
    if (!selectedContact) return;
    const updatedTimeline = selectedContact.timeline.map(t =>
      t.id === eventId ? { ...t, [field]: value } : t
    );
    updateContactField('timeline', updatedTimeline);
  };

  if (!selectedContact) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Left - Contact List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask NEXUS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact: Contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex items-center gap-3 border-b border-border hover:bg-muted/50 transition-colors text-left ${selectedContact.id === contact.id ? "bg-muted/50" : ""
                  }`}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-semibold shrink-0">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.role}, {contact.company}
                  </p>
                </div>
                {selectedContact.id === contact.id && (
                  <ChevronRight className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right - Contact Detail */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-primary-foreground">
                  {selectedContact.avatar}
                </div>
                <div>
                  <EditableField
                    value={selectedContact.name}
                    onSave={(value) => updateContactField('name', value)}
                    variant="heading"
                    className="text-2xl font-space font-bold text-foreground"
                  />
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <EditableField
                      value={selectedContact.role}
                      onSave={(value) => updateContactField('role', value)}
                      className="text-muted-foreground"
                      showIcon={false}
                    />
                    <span>at</span>
                    <EditableField
                      value={selectedContact.company}
                      onSave={(value) => updateContactField('company', value)}
                      className="text-muted-foreground"
                      showIcon={false}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <Twitter className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
              <Button variant="default">
                <Mail className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 lg:col-span-2">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-space font-bold text-foreground">
                    {selectedContact.totalMeetings}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Meetings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-5 w-5 text-secondary mx-auto mb-2" />
                  <EditableField
                    value={selectedContact.lastContact || "Never"}
                    onSave={(value) => updateContactField('lastContact', value)}
                    className="text-2xl font-space font-bold text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Last Contact</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-space font-bold text-foreground">87%</p>
                  <p className="text-xs text-muted-foreground">Relationship Score</p>
                </CardContent>
              </Card>
            </div>

            {/* Psychometric Profile */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-secondary" />
                  <h3 className="text-sm font-medium text-foreground">Communication Style</h3>
                </div>
                <EditableField
                  value={selectedContact.style || "Unknown"}
                  onSave={(value) => updateContactField('style', value)}
                  className="text-sm text-muted-foreground mb-3"
                  placeholder="Set style..."
                />
                <EditableList
                  items={selectedContact.topics}
                  onUpdate={(items) => updateContactField('topics', items)}
                  variant="badges"
                  badgeVariant="secondary"
                  placeholder="Add topic..."
                />
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <EditableField
                    value={selectedContact.company}
                    onSave={(value) => updateContactField('company', value)}
                    className="text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="text-foreground">Technology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">500-1000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Founded</span>
                    <span className="text-foreground">2018</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Relationship Timeline */}
            <Card className="lg:col-span-2">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-4">Relationship Timeline</h3>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {selectedContact.timeline.map((item) => (
                      <div key={item.id} className="flex gap-4 relative group">
                        <div
                          className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center z-10 ${item.sentiment === "positive"
                              ? "bg-emerald-400/20 border-2 border-emerald-400"
                              : item.sentiment === "negative"
                                ? "bg-destructive/20 border-2 border-destructive"
                                : "bg-muted border-2 border-muted-foreground/30"
                            }`}
                        >
                          <div
                            className={`h-2 w-2 rounded-full ${item.sentiment === "positive"
                                ? "bg-emerald-400"
                                : item.sentiment === "negative"
                                  ? "bg-destructive"
                                  : "bg-muted-foreground"
                              }`}
                          />
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <EditableField
                              value={item.event}
                              onSave={(value) => updateTimelineEvent(item.id, 'event', value)}
                              className="text-sm font-medium text-foreground"
                            />
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                          <EditableList
                            items={item.topics}
                            onUpdate={(topics) => updateTimelineEvent(item.id, 'topics', topics)}
                            variant="badges"
                            badgeVariant="outline"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                    {selectedContact.timeline.length === 0 && (
                      <p className="text-sm text-muted-foreground ml-8">No timeline events recorded.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
