import { HashRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./pages/Chat";
import { Toaster } from "react-hot-toast";
import WebSocketProvider from "./providers/WebSocketProvider";

const App = () => {
  return (
    <HashRouter>
      <WebSocketProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
        </Routes>
      </WebSocketProvider>
    </HashRouter>
  );
};

export default App;
