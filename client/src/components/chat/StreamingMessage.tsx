import { CurrentMessage } from "@/lib/types"; // Update your types file
import { Message } from "./Message";

export const StreamingMessage = ({
  currentMessage,
}: {
  currentMessage: CurrentMessage;
}) => {
  const messageData = {
    ID: "streaming",
    Role: "assistant" as const,
    Content: currentMessage.content,
    CreatedAt: new Date().toISOString(),
    ConversationID: "",
    RawContent: currentMessage.content,
    Thinking: currentMessage.thinking?.content || null,
    ThinkingTime: currentMessage.thinking
      ? ((currentMessage.thinking.timeEnd || Date.now()) -
          currentMessage.thinking.timeStart) /
        1000
      : null,
  };
  return <Message message={messageData} />;
};
