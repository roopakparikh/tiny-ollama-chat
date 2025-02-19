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
      {/* Toggle Sidebar Button (shown when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 p-1 hover:bg-gray-800 rounded-lg transition-colors duration-200 z-50"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1">
        <ChatView id={id} />
      </div>
    </div>
  );
};

export default ChatPage;
