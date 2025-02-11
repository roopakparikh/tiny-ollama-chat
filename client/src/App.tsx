import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Toaster } from "./components/ui/toaster";
import { Chat } from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />
        </Routes>
      </MainLayout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
