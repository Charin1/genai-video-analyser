import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Brain, TrendingUp } from "lucide-react";

const stats = [
  {
    label: "Meetings Captured",
    value: "127",
    change: "+12 this week",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    label: "Contacts Tracked",
    value: "482",
    change: "+8 this month",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/20",
  },
  {
    label: "AI Insights",
    value: "1.2k",
    change: "+89 this week",
    icon: Brain,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/20",
  },
  {
    label: "Relationship Score",
    value: "87%",
    change: "+3% improvement",
    icon: TrendingUp,
    color: "text-amber-400",
    bgColor: "bg-amber-400/20",
  },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover:glow-cyan transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-space font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
