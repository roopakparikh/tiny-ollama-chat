import { useState, useEffect } from "react";
import Sidebar from "../components/chat/Sidebar.tsx";
import { ChevronRight } from "lucide-react";
import ChatView from "../components/chat/ChatView.tsx";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Check screen width and localStorage on initial render
    const savedState = localStorage.getItem('sidebarOpen');
    
    // On mobile (less than 768px width), default to closed regardless of saved state
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    
    // On desktop, use the saved state or default to true
    return savedState !== null ? savedState === 'true' : true;
  });
  
  const { id } = useParams(); // We'll keep it here since it's the parent component

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
  }, [isSidebarOpen]);

  // Handle window resize to close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

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
