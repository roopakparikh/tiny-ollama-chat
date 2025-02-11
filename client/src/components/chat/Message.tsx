import { Message as MessageType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Message = ({ message }: { message: MessageType }) => {
  const isUser = message.Role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col max-w-[80%] space-y-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Thinking indicator for assistant messages */}
        {!isUser && message.Thinking && (
          <details className="text-sm text-muted-foreground">
            <summary>Thought process ({message.ThinkingTime}s)</summary>
            <p className="mt-2 text-sm">{message.Thinking}</p>
          </details>
        )}

        {/* Message content */}
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {message.Content}
        </div>
      </div>
    </div>
  );
};
