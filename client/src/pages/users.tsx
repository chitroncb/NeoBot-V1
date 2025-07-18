import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { BotUser } from "@shared/schema";
import { Plus, Filter, Settings, Eye, Ban, Trophy } from "lucide-react";

export default function Users() {
  const { data: users = [], isLoading } = useQuery<BotUser[]>({
    queryKey: ["/api/users"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 md:ml-64 overflow-auto">
          <header className="bg-card border-b border-border px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">Users</h1>
              <p className="text-muted-foreground mt-1">Manage bot users and their profiles</p>
            </div>
          </header>

          <main className="p-6">
            <Card className="neo-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bot Users</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add User
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
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted-foreground rounded-full" />
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
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground mt-1">Manage bot users and their profiles</p>
          </div>
        </header>

        <main className="p-6">
          <Card className="neo-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bot Users</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add User
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>XP</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{user.name}</span>
                                  {user.verified && (
                                    <Badge variant="secondary" className="text-blue-500">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">ID: {user.uid}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span>{user.level}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.xp}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.language?.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.banned ? "destructive" : "secondary"}>
                              {user.banned ? "Banned" : "Active"}
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
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
