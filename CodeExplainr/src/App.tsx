import Footer from "./pages/Footer";
import { MainContent } from "./pages/frontPage";
import Header from "./pages/Header";
import "./App.css"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}