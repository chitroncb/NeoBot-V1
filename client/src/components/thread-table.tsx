import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Thread } from "@shared/schema";
import { Plus, Filter, Settings, Eye, Ban, Users, Gamepad2 } from "lucide-react";

const threadIcons = {
  "Tech Discussions": Users,
  "Gaming Squad": Gamepad2,
};

export function ThreadTable() {
  const { data: threads = [], isLoading } = useQuery<Thread[]>({
    queryKey: ["/api/threads"],
  });

  if (isLoading) {
    return (
      <Card className="neo-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Threads</CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Thread
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted-foreground rounded-full" />
                  <div>
                    <div className="h-4 bg-muted-foreground rounded w-32 mb-1" />
                    <div className="h-3 bg-muted-foreground rounded w-24" />
                  </div>
                </div>
                <div className="h-6 bg-muted-foreground rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data for demonstration since we don't have real threads
  const mockThreads = [
    {
      id: 1,
      threadId: "thread_1",
      name: "Tech Discussions",
      memberCount: 247,
      messagesCount: 1234,
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      threadId: "thread_2", 
      name: "Gaming Squad",
      memberCount: 89,
      messagesCount: 456,
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const displayThreads = threads.length > 0 ? threads : mockThreads;

  return (
    <Card className="neo-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Threads</CardTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Thread
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
                <TableHead>Thread Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Messages Today</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayThreads.map((thread) => {
                const Icon = threadIcons[thread.name as keyof typeof threadIcons] || Users;
                
                return (
                  <TableRow key={thread.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 neo-gradient rounded-full flex items-center justify-center">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{thread.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{thread.memberCount}</TableCell>
                    <TableCell>{thread.messagesCount}</TableCell>
                    <TableCell>
                      <Badge variant={thread.banned ? "destructive" : "secondary"} className="text-green-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        {thread.banned ? "Banned" : "Active"}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
