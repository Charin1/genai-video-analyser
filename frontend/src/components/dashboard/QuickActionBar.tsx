import { Button } from "@/components/ui/button";
import { Mic, Upload, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActionBar() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pl-64">
      <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
        <Button variant="ghost" size="lg" asChild>
          <Link to="/capture" className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>Upload</span>
          </Link>
        </Button>

        <Link to="/capture">
          <Button
            variant="glow"
            size="xl"
            className="rounded-full h-14 w-14 p-0"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </Link>

        <Button variant="ghost" size="lg" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" />
          <span>Quick Note</span>
        </Button>
      </div>
    </div>
  );
}
