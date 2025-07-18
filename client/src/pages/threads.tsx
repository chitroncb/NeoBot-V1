import { Sidebar } from "@/components/sidebar";
import { ThreadTable } from "@/components/thread-table";

export default function Threads() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 overflow-auto">
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Threads</h1>
            <p className="text-muted-foreground mt-1">Manage your bot's active threads and conversations</p>
          </div>
        </header>

        <main className="p-6">
          <ThreadTable />
        </main>
      </div>
    </div>
  );
}
