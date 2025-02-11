import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Toaster } from "./components/ui/toaster";

const NewChat = () => <div className="p-4">New Chat Page</div>;
const Chat = () => <div className="p-4">Chat Page</div>;
function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<NewChat />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Routes>
      </MainLayout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
