export class WebSocketService {
  private ws: WebSocket | null = null;

  private readonly url: string = "ws://localhost:8080/ws";

  private messageHandlers: ((data: any) => void)[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket Connected ✅");
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach((handler) => handler(data));
      };

      this.ws.onclose = () => {
        console.log("WebSocket Disconnected - Retrying in 5s");
        setTimeout(() => this.connect(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
    } catch (error) {
      console.error("WebSocket Connection Error:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  public sendMessage(message: {
    type: "start_conversation" | "resume_conversation" | "message";
    model?: string;
    message?: string;
    convo_id?: string;
  }) {
    console.log("Sending Message: ", message);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  public subscribe(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  public isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
