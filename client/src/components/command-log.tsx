import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CommandLog } from "@shared/schema";
import { Code, Smile, Bot } from "lucide-react";

const commandIcons = {
  weather: Code,
  joke: Smile,
  ai: Bot,
  help: Code,
  rank: Code,
  ban: Code,
};

const commandColors = {
  weather: "bg-primary",
  joke: "bg-blue-500",
  ai: "bg-purple-500",
  help: "bg-green-500",
  rank: "bg-orange-500",
  ban: "bg-red-500",
};

export function CommandLogComponent() {
  const { data: logs = [], isLoading } = useQuery<CommandLog[]>({
    queryKey: ["/api/command-logs"],
  });

  if (isLoading) {
    return (
      <Card className="neo-shadow">
        <CardHeader>
          <CardTitle>Recent Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted-foreground rounded-full" />
                  <div>
                    <div className="h-4 bg-muted-foreground rounded w-16 mb-1" />
                    <div className="h-3 bg-muted-foreground rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-muted-foreground rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neo-shadow">
      <CardHeader>
        <CardTitle>Recent Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.slice(-5).reverse().map((log) => {
            const Icon = commandIcons[log.commandName as keyof typeof commandIcons] || Code;
            const colorClass = commandColors[log.commandName as keyof typeof commandColors] || "bg-primary";
            
            return (
              <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">/{log.commandName}</p>
                    <p className="text-xs text-muted-foreground">by {log.userId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {log.success ? (
                    <Badge variant="secondary" className="text-green-500">Success</Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
          
          {logs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent commands</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
