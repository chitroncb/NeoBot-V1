import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";

export function ChartPlaceholder() {
  return (
    <Card className="neo-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Overview</CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container h-64 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chart will be rendered here</p>
            <p className="text-sm text-muted-foreground mt-2">
              Implement Chart.js or similar for activity visualization
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
