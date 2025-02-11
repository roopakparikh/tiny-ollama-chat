import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/stores/useConversationStore";
import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  Trash2,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUIStore } from "@/stores/useUIStore";
import { api } from "@/services/api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Sidebar = () => {
  const { conversations, setConversations, deleteConversation } =
    useConversationStore();
  const { isSidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const currentId = location.pathname.split("/").pop();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getConversations();
        setConversations(data);
      } catch (err) {
        setError("Failed to load conversations");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversations. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [setConversations, toast]);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await api.deleteConversation(id);
      deleteConversation(id);
      if (currentId === id) {
        navigate("/");
      }
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete conversation",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-4 border-b">
        <Button
          variant="default"
          className={cn(
            "w-full transition-all duration-200 hover:bg-primary/90",
            isSidebarOpen ? "justify-start" : "justify-center"
          )}
          onClick={() => navigate("/")}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {isSidebarOpen && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-muted-foreground text-center mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <Loader2 className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.ID}
                className={cn(
                  "group relative rounded-md transition-colors",
                  currentId === conversation.ID
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                )}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-auto p-3 transition-none hover:bg-transparent",
                    isSidebarOpen ? "justify-start" : "justify-center",
                    "relative"
                  )}
                  onClick={() => navigate(`/chat/${conversation.ID}`)}
                  
                >
                  <div
                    className={cn(
                      "flex w-full",
                      isSidebarOpen
                        ? "flex-col items-start"
                        : "items-center justify-center"
                    )}
                  >
                    {isSidebarOpen ? (
                      <>
                        <div className="truncate w-[calc(100%-2.5rem)] font-medium mt-1">
                          {conversation.Title}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(
                            new Date(conversation.UpdatedAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </>
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                </Button>
                {isSidebarOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 p-0",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "hover:bg-destructive/10 hover:text-destructive",
                      "z-10"
                    )}
                    onClick={(e) => handleDeleteClick(e, conversation.ID)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
