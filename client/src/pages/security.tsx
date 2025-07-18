import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Users, Ban, Plus, Filter } from "lucide-react";

export default function Security() {
  const mockSecurityLogs = [
    {
      id: 1,
      type: "User Banned",
      user: "user123",
      reason: "Spam",
      timestamp: new Date(),
      severity: "high",
    },
    {
      id: 2,
      type: "Command Blocked",
      user: "user456",
      reason: "Insufficient permissions",
      timestamp: new Date(),
      severity: "medium",
    },
    {
      id: 3,
      type: "Rate Limit",
      user: "user789",
      reason: "Too many requests",
      timestamp: new Date(),
      severity: "low",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-500";
      case "medium": return "bg-yellow-500/20 text-yellow-500";
      case "low": return "bg-blue-500/20 text-blue-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Security</h1>
            <p className="text-muted-foreground mt-1">Manage security settings and monitor threats</p>
          </div>
        </header>

        <main className="p-6">
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="neo-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Active Bans</p>
                    <p className="text-2xl font-bold mt-1">12</p>
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-full">
                    <Ban className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neo-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Blocked Commands</p>
                    <p className="text-2xl font-bold mt-1">45</p>
                  </div>
                  <div className="bg-yellow-500/20 p-3 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neo-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Rate Limits</p>
                    <p className="text-2xl font-bold mt-1">23</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Logs */}
          <Card className="neo-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Logs</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSecurityLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Badge variant="outline">{log.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{log.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.reason}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.timestamp.toLocaleTimeString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
