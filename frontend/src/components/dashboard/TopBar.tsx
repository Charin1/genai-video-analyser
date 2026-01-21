import { TrendingDown, TrendingUp, Cloud, Clock } from "lucide-react";

export function TopBar() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const stockData = [
    { symbol: "AAPL", price: 178.25, change: +1.2 },
    { symbol: "TSLA", price: 245.80, change: -0.8 },
    { symbol: "MSFT", price: 378.50, change: +0.5 },
  ];

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6 py-2 text-xs">
      <div className="flex items-center gap-6">
        {/* Weather */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cloud className="h-3.5 w-3.5 text-primary" />
          <span>72°F</span>
          <span className="text-muted-foreground/60">San Francisco</span>
        </div>

        {/* Stocks Ticker */}
        <div className="flex items-center gap-4">
          {stockData.map((stock) => (
            <div key={stock.symbol} className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{stock.symbol}</span>
              <span className="text-muted-foreground">${stock.price}</span>
              <span
                className={`flex items-center gap-0.5 ${
                  stock.change > 0 ? "text-emerald-400" : "text-destructive"
                }`}
              >
                {stock.change > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(stock.change)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{currentTime}</span>
      </div>
    </div>
  );
}
