export type Conversation = {
  ID: string;
  Title: string;
  Model: string;
  CreatedAt: string;
  UpdatedAt: string;
  Messages: Message[];
};

export type Message = {
  ID: string;
  ConversationID: string;
  Role: "user" | "assistant";
  Content: string;
  RawContent: string;
  Thinking: string | null;
  ThinkingTime: number | null;
  CreatedAt: string;
};

export type Model = {
  name: string;
  model: string;
  details: {
    parameter_size: string;
  };
};

export type CurrentMessage = {
  role: "assistant";
  content: string;
  thinking: {
    content: string;
    isThinking: boolean;
    timeStart: number;
    timeEnd: number | null;
  } | null;
};
