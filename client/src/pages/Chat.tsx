import { useState } from "react";
import Sidebar from "../components/chat/Sidebar.tsx";
import { ChevronRight } from "lucide-react";
import ChatView from "../components/chat/ChatView.tsx";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { id } = useParams(); // We'll keep it here since it's the parent component

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Toggle Sidebar Button (shown when sidebar is closed) */}
      {!isSidebarOpen && (
        <div className="absolute top-0 left-0 z-10 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center justify-center"
            aria-label="Open sidebar"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        <ChatView id={id} />
      </div>
    </div>
  );
};

export default ChatPage;
