import { useRef, type RefObject } from "react";
import Working from "./Components/Working";
import Footer from "./pages/Footer";
import { MainContent } from "./pages/frontPage";
import Header from "./pages/Header";
import "./App.css"

export default function App() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollTo = (target: RefObject<HTMLDivElement | null>) => {
    target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8f4] text-slate-900">
      <Header
        onHowItWorks={() => scrollTo(howItWorksRef)}
        onFeatures={() => scrollTo(featuresRef)}
        onGetStarted={() => scrollTo(workspaceRef)}
      />
      <MainContent workspaceRef={workspaceRef} featuresRef={featuresRef} />
      <div ref={howItWorksRef} className="scroll-mt-24">
        <Working onGetStarted={() => scrollTo(workspaceRef)} />
      </div>
      <Footer />
    </div>
  );
}