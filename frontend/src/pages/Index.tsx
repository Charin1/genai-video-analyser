import { MainLayout } from "@/components/layout/MainLayout";
import { TopBar } from "@/components/dashboard/TopBar";
import { GhostProtocolWidget } from "@/components/dashboard/GhostProtocolWidget";
import { TodaysBriefing } from "@/components/dashboard/TodaysBriefing";
import { QuickActionBar } from "@/components/dashboard/QuickActionBar";
import { RecentMeetingsWidget } from "@/components/dashboard/RecentMeetingsWidget";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ExecutiveBriefWidget } from "@/components/dashboard/ExecutiveBriefWidget";
import { FollowUpEngineWidget } from "@/components/dashboard/FollowUpEngineWidget";

const Index = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <MainLayout>
      <TopBar />
      
      <div className="p-6 pb-28 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-space font-bold text-foreground">
            {getGreeting()}, <span className="text-gradient">John</span>
          </h1>
          <p className="text-muted-foreground">
            Here's your executive briefing for today.
          </p>
        </div>

        {/* Executive Intelligence Brief - Priority Feature */}
        <ExecutiveBriefWidget />

        {/* Stats Grid */}
        <StatsGrid />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ghost Protocol */}
          <GhostProtocolWidget />

          {/* Today's Briefing */}
          <TodaysBriefing />
        </div>

        {/* Follow-Up Engine - Priority Feature */}
        <FollowUpEngineWidget />

        {/* Recent Meetings */}
        <RecentMeetingsWidget />
      </div>

      {/* Quick Action Bar */}
      <QuickActionBar />
    </MainLayout>
  );
};

export default Index;
