import Footer from "./pages/Footer";
import { MainContent } from "./pages/frontPage";
import Header from "./pages/Header";
import "./App.css"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8f4] text-slate-900">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}