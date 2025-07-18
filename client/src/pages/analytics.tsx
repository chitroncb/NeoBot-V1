import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPlaceholder } from "@/components/chart-placeholder";
import { BarChart3, TrendingUp, Users, MessageSquare } from "lucide-react";

export default function Analytics() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">View detailed analytics and performance metrics</p>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartPlaceholder />
            
            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container h-64 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Usage trends chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container h-64 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">User growth chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="chart-container h-64 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Message volume chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
