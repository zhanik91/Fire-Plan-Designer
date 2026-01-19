import { PlanCanvas } from "@/components/editor/PlanCanvas";
import { Sidebar } from "@/components/editor/Sidebar";
import { Toolbar } from "@/components/editor/Toolbar";
import { Legend } from "@/components/editor/Legend";
import { AIAssistant } from "@/components/editor/AIAssistant";
import { usePlanStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export default function Editor() {
  const { metadata, isAssistantOpen } = usePlanStore();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 relative">
                <PlanCanvas />
            </div>

            <div className="absolute bottom-4 left-4 z-10 w-96">
                <Legend />
            </div>

            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-white/90 p-2 rounded shadow backdrop-blur-sm">
                    <div className="text-xs font-bold">{metadata.buildingName} - Этаж {metadata.floor}</div>
                </div>
                {user && (
                    <div className="bg-white/90 p-2 rounded shadow backdrop-blur-sm flex items-center gap-2">
                         <UserIcon className="h-4 w-4 text-gray-600" />
                         <span className="text-xs font-medium">{user.username} ({user.role})</span>
                         <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={logout} title="Выйти">
                             <LogOut className="h-3 w-3" />
                         </Button>
                    </div>
                )}
            </div>
        </main>

        {isAssistantOpen && <AIAssistant />}
      </div>
    </div>
  );
}
