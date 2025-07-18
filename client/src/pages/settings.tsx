import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Settings as SettingsIcon, Bot, Shield, Globe } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your NeoBot instance</p>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bot Configuration */}
            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Bot Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input id="botName" defaultValue="NeoBot" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prefix">Command Prefix</Label>
                  <Input id="prefix" defaultValue="/" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">Bangla</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea 
                    id="welcomeMessage" 
                    placeholder="Enter welcome message..."
                    defaultValue="Welcome to our group! 🎉"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="autoModeration" />
                  <Label htmlFor="autoModeration">Enable Auto Moderation</Label>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUid">Admin UID</Label>
                  <Input id="adminUid" placeholder="Enter admin Facebook UID" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCommands">Max Commands per Minute</Label>
                  <Input id="maxCommands" type="number" defaultValue="10" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enableLogging" defaultChecked />
                  <Label htmlFor="enableLogging">Enable Command Logging</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enableBlacklist" defaultChecked />
                  <Label htmlFor="enableBlacklist">Enable Blacklist System</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enableRateLimit" defaultChecked />
                  <Label htmlFor="enableRateLimit">Enable Rate Limiting</Label>
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>API Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weatherApi">Weather API Key</Label>
                  <Input id="weatherApi" type="password" placeholder="Enter weather API key" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gptApi">OpenAI API Key</Label>
                  <Input id="gptApi" type="password" placeholder="Enter OpenAI API key" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input id="webhookUrl" placeholder="Enter webhook URL" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Facebook Account Settings</Label>
                  <p className="text-sm text-muted-foreground">
                    Configure your Facebook account cookies in the account.json file
                  </p>
                  <Button variant="outline" className="w-full">
                    Upload Account File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="neo-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bot Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-500">Online</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Facebook Connection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-500">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Commands Loaded</span>
                  <span className="text-sm font-medium">6</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Events Loaded</span>
                  <span className="text-sm font-medium">1</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    Restart Bot
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
