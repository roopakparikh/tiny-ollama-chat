import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Toaster } from "./components/ui/toaster";
import { Chat } from "./pages/Chat";
import { WebSocketProvider } from "./providers/WebSocketProvider";

function App() {
  return (
    <BrowserRouter>
      <WebSocketProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/chat/:id" element={<Chat />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </WebSocketProvider>
    </BrowserRouter>
  );
}

export default App;
