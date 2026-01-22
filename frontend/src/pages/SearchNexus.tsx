import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

const recentSearches = [
  "Who did I talk to about AI ethics last year?",
  "Companies mentioned in Q4 meetings",
  "Sarah Chen discussion topics",
  "Partnership proposals pending",
];

const suggestedQueries = [
  "Find all meetings with investors this quarter",
  "What promises did I make to David Kim?",
  "Show contacts I haven't met in 6+ months",
  "Topics discussed with Goldman Sachs",
];

import { API_BASE_URL } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function SearchNexus() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);
    try {
      // Note: Backend expects query param `query`
      const response = await fetch(`${API_BASE_URL}/api/v1/strategic/search/smart?query=${encodeURIComponent(query)}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      // Fallback mock for demo if backend is offline/no-graph
      setResult({
        answer: "I couldn't connect to the knowledge graph, but generally this would answer: " + query,
        results: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-space font-bold text-foreground mb-2">
            Ask <span className="text-gradient">NEXUS</span>
          </h1>
          <p className="text-muted-foreground max-w-md">
            Search across all your meetings, contacts, and insights using natural language
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Ask anything about your meetings, contacts, or insights..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-14 pl-12 pr-4 text-base bg-card border-border focus:border-primary"
            />
            <Button
              variant="default"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {result ? (
          <div className="w-full max-w-2xl space-y-6">
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-space font-bold text-lg text-foreground">Nexus Answer</h3>
                    <p className="text-foreground/90 leading-relaxed">
                      {result.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.results && result.results.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-sm text-muted-foreground mb-4">Supporting Evidence (Graph Data)</h3>
                  <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(result.results, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Recent Searches</h3>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => { setQuery(search); }} // Just set query, user clicks search to confirm intent
                      className="w-full text-left p-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Queries */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <h3 className="text-sm font-medium text-foreground">Try Asking</h3>
                </div>
                <div className="space-y-2">
                  {suggestedQueries.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => { setQuery(suggestion); }}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
                    >
                      <span>{suggestion}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
