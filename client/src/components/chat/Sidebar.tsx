import { useNavigate } from "react-router-dom";
import ConversationItem from "./ConversationItem";
import { ChevronLeft, Plus } from "lucide-react";

import { useConversationStore } from "../../store/conversationstore";
import { ConversationSkeleton } from "../loaders/skeleton";
import { useState } from "react";
import DeleteDialog from "../common/models";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const conversations = useConversationStore((state) => state.conversations);
  const selectedConversation = useConversationStore(
    (state) => state.selectedConversation
  );
  const deleteConversation = useConversationStore(
    (state) => state.deleteConversation
  );

  const isInitialLoading = useConversationStore(
    (state) => state.isInitialLoading
  );

  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      if (conversationToDelete === selectedConversation?.ID) {
        navigate("/");
      }
      deleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
  };

  return (
    <div>
      <div
        className={`${
          isOpen ? "w-80" : "w-0"
        } h-full transition-all duration-300 bg-gray-950 border-r border-gray-800 relative`}
      >
        <div className={`h-full flex flex-col ${!isOpen && "invisible"}`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto py-4">
            {isInitialLoading ? (
              <>
                <ConversationSkeleton />
                <ConversationSkeleton />
                <ConversationSkeleton />
              </>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.ID}
                  conversation={conv}
                  onDelete={() => setConversationToDelete(conv.ID)}
                  selectedConversationID={
                    selectedConversation?.ID ? selectedConversation.ID : ""
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={!!conversationToDelete}
        onClose={() => setConversationToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Sidebar;
