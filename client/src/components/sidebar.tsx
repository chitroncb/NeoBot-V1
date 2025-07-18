import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Terminal, 
  Users, 
  BarChart3, 
  Shield, 
  Settings,
  Bot 
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Threads", href: "/threads", icon: MessageSquare },
  { name: "Commands", href: "/commands", icon: Terminal },
  { name: "Users", href: "/users", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-card border-r border-border">
      {/* Sidebar Header */}
      <div className="flex items-center justify-center h-16 neo-gradient">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">NeoBot</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "neo-gradient text-white" 
                    : "text-muted-foreground hover:text-foreground sidebar-hover"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">SN</span>
          </div>
          <div>
            <p className="text-sm font-medium">Saifullah Al Neoaz</p>
            <p className="text-xs text-muted-foreground">Bot Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
