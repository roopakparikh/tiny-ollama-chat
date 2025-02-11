import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { Sidebar } from "./Sidebar";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col ${
          isSidebarOpen ? "w-80" : "w-16"
        } border-r transition-all duration-300`}
      >
        <Sidebar />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute left-4 bottom-4 md:flex hidden"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile layout wrapper */}
      <div className="flex flex-1 flex-col h-full">
        {/* Mobile header with menu */}
        <div className="md:hidden h-14 border-b px-4 flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                  <SheetTitle className="text-lg font-semibold">
                    Chat History
                  </SheetTitle>
                  <SheetClose asChild></SheetClose>
                </div>
                <SheetDescription className="sr-only">
                  View your chat history and start new conversations
                </SheetDescription>
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">{children}</main>
      </div>
    </div>
  );
};
