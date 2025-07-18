import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Command } from "@shared/schema";
import { Plus, Filter, Settings, Eye, Ban } from "lucide-react";

export default function Commands() {
  const { data: commands = [], isLoading } = useQuery<Command[]>({
    queryKey: ["/api/commands"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 md:ml-64 overflow-auto">
          <header className="bg-card border-b border-border px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">Commands</h1>
              <p className="text-muted-foreground mt-1">Manage bot commands and their configurations</p>
            </div>
          </header>

          <main className="p-6">
            <Card className="neo-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bot Commands</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Command
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted-foreground rounded-full" />
                        <div>
                          <div className="h-4 bg-muted-foreground rounded w-32 mb-1" />
                          <div className="h-3 bg-muted-foreground rounded w-48" />
                        </div>
                      </div>
                      <div className="h-6 bg-muted-foreground rounded w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 0: return "All Users";
      case 2: return "Bot Admin";
      case 3: return "Group Admin";
      default: return "Unknown";
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0: return "bg-green-500/20 text-green-500";
      case 2: return "bg-red-500/20 text-red-500";
      case 3: return "bg-blue-500/20 text-blue-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Commands</h1>
            <p className="text-muted-foreground mt-1">Manage bot commands and their configurations</p>
          </div>
        </header>

        <main className="p-6">
          <Card className="neo-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bot Commands</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Command
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
                      <TableHead>Command</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commands.map((command) => (
                      <TableRow key={command.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            /{command.name}
                          </code>
                        </TableCell>
                        <TableCell>{command.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{command.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(command.role)}>
                            {getRoleLabel(command.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>{command.usageCount}</TableCell>
                        <TableCell>
                          <Badge variant={command.enabled ? "secondary" : "destructive"}>
                            {command.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
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
