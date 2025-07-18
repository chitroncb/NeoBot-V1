import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/stats-card";
import { ChartPlaceholder } from "@/components/chart-placeholder";
import { CommandLogComponent } from "@/components/command-log";
import { ThreadTable } from "@/components/thread-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BotStats } from "@shared/schema";
import { MessageSquare, Users, Terminal, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<BotStats>({
    queryKey: ["/api/stats"],
  });

  const statsData = [
    {
      title: "Active Threads",
      value: stats?.activeThreads || 0,
      change: "+12.5%",
      icon: MessageSquare,
      iconColor: "bg-primary/20 text-primary",
      changeColor: "text-green-500",
    },
    {
      title: "Total Users", 
      value: stats?.totalUsers || 0,
      change: "+8.3%",
      icon: Users,
      iconColor: "bg-blue-500/20 text-blue-500",
      changeColor: "text-green-500",
    },
    {
      title: "Commands Used",
      value: stats?.commandsUsed || 0,
      change: "+23.1%",
      icon: Terminal,
      iconColor: "bg-purple-500/20 text-purple-500",
      changeColor: "text-green-500",
    },
    {
      title: "Uptime",
      value: stats?.uptime || "0%",
      change: "+0.2%",
      icon: Activity,
      iconColor: "bg-green-500/20 text-green-500",
      changeColor: "text-green-500",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Monitor and manage your NeoBot instance</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <Badge variant="secondary" className="text-green-500">Online</Badge>
              </div>
              {/* Language Selector */}
              <Select defaultValue="en">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bangla</SelectItem>
                  <SelectItem value="vi">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartPlaceholder />
            <CommandLogComponent />
          </div>

          {/* Active Threads Table */}
          <ThreadTable />
        </main>
      </div>
    </div>
  );
}
