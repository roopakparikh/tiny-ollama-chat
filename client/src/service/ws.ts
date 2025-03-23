export type WSMessageType =
  | "message"
  | "start_conversation"
  | "resume_conversation";

export type WSResponseType =
  | "thinking_start"
  | "thinking_chunk"
  | "thinking_end"
  | "conversation_started"
  | "conversation_resumed"
  | "response_chunk"
  | "done"
  | "error";

export interface WSBasePayload {
  type: WSMessageType;
}

export interface WSStartConversationPayload extends WSBasePayload {
  type: "start_conversation";
  model: string;
  message: string;
}

export interface WSMessagePayload extends WSBasePayload {
  type: "message";
  convo_id: string;
  message: string;
  model: string;
}

export interface WSResumeConversationPayload extends WSBasePayload {
  type: "resume_conversation";
  convo_id: string;
}

export interface WSResponse {
  type: WSResponseType;
  content?: string;
}

export type WSEventType =
  | "connected"
  | "disconnected"
  | "thinking_start"
  | "thinking_chunk"
  | "thinking_end"
  | "conversation_started"
  | "conversation_resumed"
  | "response_chunk"
  | "response_done"
  | "error";

type WSEventListener = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number = 1000;
  private eventListeners: Map<WSEventType, WSEventListener[]> = new Map();
  private isConnecting = false;

  constructor(
    options: {
      url?: string;
      forceSecure?: boolean;
      path?: string;
    } = {}
  ) {
    const { url, forceSecure = false, path = "/ws" } = options;

    if (url) {
      // If a complete URL is provided, use it directly
      this.url = url;
    } else {
      // Determine protocol based on page protocol or forceSecure option
      const isSecure = forceSecure || window.location.protocol === "https:";
      const protocol = isSecure ? "wss:" : "ws:";
      
      // Handle base URL when app is served from a subdirectory
      const baseUrl = window.location.pathname.replace(/\/[^/]*$/, '');
      
      // Construct URL from current location
      this.url = `${protocol}//${window.location.host}${baseUrl}${path}`;
    }

    console.log(`WebSocket connecting to: ${this.url}`);
  }

  public connect(): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve(true);
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        this.addEventListener("connected", () => resolve(true));
        this.addEventListener("error", () => resolve(false));
      });
    }

    this.isConnecting = true;

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log("WebSocket Connected 🛜");
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.triggerEvent("connected", null);
          resolve(true);
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} ${event.reason}`);
          this.triggerEvent("disconnected", {
            code: event.code,
            reason: event.reason,
          });
          this.attemptReconnect();
          this.isConnecting = false;
          resolve(false);
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.triggerEvent("error", error);
          this.isConnecting = false;
          resolve(false);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        this.isConnecting = false;
        this.triggerEvent("error", error);
        resolve(false);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const timeout =
      this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect in ${timeout}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, timeout);
  }

  private handleMessage(data: string) {
    try {
      const response = JSON.parse(data) as WSResponse;

      switch (response.type) {
        case "thinking_start":
          this.triggerEvent("thinking_start", null);
          break;

        case "thinking_chunk":
          this.triggerEvent("thinking_chunk", response.content);
          break;

        case "thinking_end":
          this.triggerEvent("thinking_end", null);
          break;

        case "conversation_started":
          this.triggerEvent("conversation_started", response.content);
          break;

        case "conversation_resumed":
          this.triggerEvent("conversation_resumed", response.content);
          break;

        case "response_chunk":
          this.triggerEvent("response_chunk", response.content);
          break;

        case "done":
          this.triggerEvent("response_done", null);
          break;

        case "error":
          this.triggerEvent("error", response.content);
          break;

        default:
          console.warn("Unknown WS message type:", response.type);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error, data);
    }
  }

  public async sendMessage(
    convoID: string,
    message: string,
    model: string
  ): Promise<boolean> {
    const payload: WSMessagePayload = {
      type: "message",
      convo_id: convoID,
      message,
      model,
    };

    return this.sendPayload(payload);
  }

  public async startConversation(
    model: string,
    message: string
  ): Promise<boolean> {
    const payload: WSStartConversationPayload = {
      type: "start_conversation",
      model,
      message,
    };

    return this.sendPayload(payload);
  }

  public async resumeConversation(convoId: string): Promise<boolean> {
    const payload: WSResumeConversationPayload = {
      type: "resume_conversation",
      convo_id: convoId,
    };

    return this.sendPayload(payload);
  }

  private async sendPayload(payload: WSBasePayload): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      const connected = await this.connect();
      if (!connected) {
        return false;
      }
    }

    try {
      this.ws?.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      this.triggerEvent("error", error);
      return false;
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public addEventListener(event: WSEventType, callback: WSEventListener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }

    this.eventListeners.get(event)?.push(callback);
  }

  public removeEventListener(event: WSEventType, callback: WSEventListener) {
    if (!this.eventListeners.has(event)) {
      return;
    }

    const listeners = this.eventListeners.get(event) || [];
    this.eventListeners.set(
      event,
      listeners.filter((listener) => listener !== callback)
    );
  }

  private triggerEvent(event: WSEventType, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }
}

export const wsService = new WebSocketService();
export default wsService;
