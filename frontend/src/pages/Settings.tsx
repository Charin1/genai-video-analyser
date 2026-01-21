import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  HelpCircle,
  LogOut,
} from "lucide-react";

export default function Settings() {
  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-space font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your NEXUS preferences</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-primary-foreground">
                JD
              </div>
              <div className="flex-1">
                <Input defaultValue="John Doe" className="mb-2" />
                <Input defaultValue="CEO, Acme Corp" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ghost-alerts">Ghost Protocol Alerts</Label>
              <Switch id="ghost-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="meeting-prep">Pre-Meeting Reminders</Label>
              <Switch id="meeting-prep" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="insights">AI Insight Notifications</Label>
              <Switch id="insights" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="encryption">End-to-End Encryption</Label>
              <Switch id="encryption" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-delete">Auto-delete after 1 year</Label>
              <Switch id="auto-delete" />
            </div>
            <Button variant="outline" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Theme</p>
            <div className="flex gap-2">
              <Button variant="default" size="sm">Dark</Button>
              <Button variant="outline" size="sm">Light</Button>
              <Button variant="outline" size="sm">System</Button>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              Export All Data
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
              Delete All Data
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
