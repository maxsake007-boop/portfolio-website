import { InteractiveBackground } from "./components/InteractiveBackground";
import { Navbar } from "./components/Navbar";
import { ProjectShowcase } from "./components/ProjectShowcase";

export function App() {
  return (
    <div className="relative min-h-screen min-h-[100dvh] selection:bg-zinc-950 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Interactive cursor-reactive canvas background */}
      <InteractiveBackground />

      {/* Main Single-Screen / Responsive Flow */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Minimal Liquid-Glass Navigation */}
        <Navbar />

        {/* Hero + 3D Coverflow Projects Showcase */}
        <main className="flex-1 flex flex-col justify-center">
          <ProjectShowcase />
        </main>
      </div>

      {/* Minimal subtle copyright watermark */}
      <footer className="relative z-10 py-1.5 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-mono text-zinc-400 shrink-0 short-h-footer">
        &copy; {new Date().getFullYear()} · B2B Software & Automation · Портфолио проектов
      </footer>
    </div>
  );
}

export default App;
