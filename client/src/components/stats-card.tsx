import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  changeColor: string;
}

export function StatsCard({ title, value, change, icon: Icon, iconColor, changeColor }: StatsCardProps) {
  return (
    <Card className="neo-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`${iconColor} p-3 rounded-full`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
          <span className="text-muted-foreground text-sm ml-2">from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}
