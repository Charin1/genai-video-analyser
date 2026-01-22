import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mic,
  FileText,
  Users,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Neural Capture", href: "/capture", icon: Mic },
  { name: "Deep Recall", href: "/meetings", icon: FileText },
  { name: "Rolodex", href: "/rolodex", icon: Users },
  { name: "Search NEXUS", href: "/search", icon: Search },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary via-secondary to-primary opacity-60 blur-sm animate-pulse" />
              {/* Main logo container */}
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary border border-primary/30">
                {/* Neural network icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Central node */}
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  {/* Outer nodes */}
                  <circle cx="12" cy="4" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="20" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="20" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                  <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                  <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                  {/* Connections */}
                  <line x1="12" y1="10" x2="12" y2="5.5" strokeLinecap="round" />
                  <line x1="12" y1="14" x2="12" y2="18.5" strokeLinecap="round" />
                  <line x1="10" y1="12" x2="5.5" y2="12" strokeLinecap="round" />
                  <line x1="14" y1="12" x2="18.5" y2="12" strokeLinecap="round" />
                  <line x1="10.5" y1="10.5" x2="7" y2="7" strokeLinecap="round" />
                  <line x1="13.5" y1="10.5" x2="17" y2="7" strokeLinecap="round" />
                  <line x1="10.5" y1="13.5" x2="7" y2="17" strokeLinecap="round" />
                  <line x1="13.5" y1="13.5" x2="17" y2="17" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-space text-lg font-bold tracking-tight text-gradient leading-none">NexusInsightStream</span>
              <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Neural Memory</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="relative flex h-9 w-9 items-center justify-center mx-auto">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary via-secondary to-primary opacity-60 blur-sm animate-pulse" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary border border-primary/30">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="4" r="1.5" fill="currentColor" />
                <circle cx="12" cy="20" r="1.5" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="20" cy="12" r="1.5" fill="currentColor" />
                <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                <line x1="12" y1="10" x2="12" y2="5.5" strokeLinecap="round" />
                <line x1="12" y1="14" x2="12" y2="18.5" strokeLinecap="round" />
                <line x1="10" y1="12" x2="5.5" y2="12" strokeLinecap="round" />
                <line x1="14" y1="12" x2="18.5" y2="12" strokeLinecap="round" />
                <line x1="10.5" y1="10.5" x2="7" y2="7" strokeLinecap="round" />
                <line x1="13.5" y1="10.5" x2="17" y2="7" strokeLinecap="round" />
                <line x1="10.5" y1="13.5" x2="7" y2="17" strokeLinecap="round" />
                <line x1="13.5" y1="13.5" x2="17" y2="17" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== "/" && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary glow-cyan"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-semibold text-primary-foreground">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">CEO, Acme Corp</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
