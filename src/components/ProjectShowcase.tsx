import React, { useState } from "react";
import { Compass, CheckCircle2, ExternalLink, MessageCircle } from "lucide-react";
import { PROJECTS } from "../data/projects";
import { VerticalCoverflow, type CoverflowSlide } from "./ui/vertical-coverflow";

export const ProjectShowcase: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const activeProject = PROJECTS[activeIdx] || PROJECTS[0];

  const slides: CoverflowSlide[] = PROJECTS.map((proj) => ({
    src: proj.image,
    alt: proj.title,
    title: proj.title,
    subtitle: proj.category,
    url: proj.url,
  }));

  return (
    <div className="w-full max-w-[1900px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-1 sm:py-2 flex-1 flex flex-col justify-between h-full">
      {/* Mobile-only Top Brand Header (< 880px) */}
      <div className="block min-[880px]:hidden text-center pt-1.5 pb-5 sm:pb-6 w-full select-none">
        <img
          src="/assets/m-studio-logo.png"
          alt="M Studio"
          className="h-11 sm:h-15 w-auto max-w-[85%] mx-auto object-contain drop-shadow-xs pointer-events-none"
          draggable={false}
        />
        <p
          className="text-xs sm:text-sm tracking-[0.32em] text-zinc-600 italic font-light select-none mt-0.5"
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          Цифровое решение для бизнеса
        </p>
      </div>

      {/* 2-Wing Split: Left Gallery, Right M Studio & About Card (Activates at min-880px, including 960x446 tablet) */}
      <div className="w-full h-full flex-1 grid grid-cols-1 min-[880px]:grid-cols-12 gap-3 sm:gap-5 lg:gap-8 xl:gap-12 items-center min-[880px]:items-stretch">
        
        {/* LEFT WING: Vertically centered 3D Gallery */}
        <div className="min-[880px]:col-span-6 xl:col-span-6 flex items-center justify-center min-[880px]:justify-start relative order-1 self-center w-full">
          <VerticalCoverflow
            slides={slides}
            cardWidth="100%"
            rotate={18}
            depth={0.38}
            perspective={3.0}
            gap={0.16}
            showNavigation={true}
            showPagination={true}
            onSelectSlide={(idx) => setActiveIdx(idx)}
          />
        </div>

        {/* RIGHT WING: Centered vertically, card placed directly under the logo */}
        <div className="min-[880px]:col-span-6 xl:col-span-6 flex flex-col justify-center items-center min-[880px]:items-end order-2 self-center min-[880px]:self-stretch h-full py-0.5 sm:py-1 w-full">
          
          <div className="w-full max-w-[780px] xl:max-w-[850px] 2xl:max-w-[880px] flex flex-col items-center">
            
            {/* Desktop / Tablet Brand Header (>= 880px) */}
            <div className="hidden min-[880px]:flex flex-col items-center justify-center select-none pt-0 mb-1.5 min-[880px]:mb-3 w-full text-center short-h-logo-wrap">
              <img
                src="/assets/m-studio-logo.png"
                alt="M Studio"
                className="h-10 min-[880px]:h-12 lg:h-36 xl:h-48 w-auto max-w-[98%] object-contain drop-shadow-xs select-none pointer-events-none transition-transform hover:scale-[1.02] duration-300 short-h-logo-img"
                draggable={false}
              />
              <p
                className="text-xs min-[880px]:text-xs lg:text-sm xl:text-base tracking-[0.36em] lg:tracking-[0.44em] text-zinc-600 italic font-light select-none mt-0.5 sm:mt-1 short-h-tagline"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                Цифровое решение для бизнеса
              </p>
            </div>

            {/* 2. "About Project" Liquid Glass Card */}
            <div className="w-full liquid-glass-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 text-zinc-950 transition-all duration-300 shadow-xl lg:shadow-2xl short-h-card max-h-[calc(100dvh-75px)] min-[880px]:max-h-[calc(100dvh-85px)] overflow-y-auto glass-scrollbar">
              
              {/* Header: "About project" + Index badge */}
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-white/40 short-h-card-header">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-800" />
                  <h3 
                    className="text-xl sm:text-2xl lg:text-3xl font-normal tracking-wide text-zinc-900 italic"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    About project
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs lg:text-sm font-mono font-semibold px-2.5 sm:px-3 py-0.5 rounded-full liquid-glass text-zinc-800">
                  0{activeIdx + 1} / 0{PROJECTS.length}
                </span>
              </div>

              {/* Project Content */}
              <div className="mt-2.5 sm:mt-3.5 space-y-2.5 sm:space-y-3">
                {/* Title & Category with Demo Link / Private Notice */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-zinc-950 short-h-title">
                      {activeProject.title}
                    </h2>
                    {activeProject.url ? (
                      <a
                        href={activeProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-[13px] font-medium rounded-xl text-emerald-800 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 shadow-xs hover:shadow-sm transition-all group duration-200 short-h-btn"
                        title="Открыть демонстрационное приложение"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-semibold text-emerald-800">Посмотреть демо</span>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono text-zinc-500 rounded-xl bg-zinc-100/90 border border-zinc-200/90 select-none short-h-btn">
                        <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Ссылка только при контакте в личку</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs lg:text-sm font-mono text-zinc-500 mt-0.5 sm:mt-1 font-medium">
                    {activeProject.category}
                  </p>
                </div>

                {/* Key Advantages: 2-COLUMN GRID (responsive pills) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                  {activeProject.advantages.map((advantage, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl liquid-glass text-[11px] sm:text-xs lg:text-[13px] font-medium text-zinc-800 border border-white/40 shadow-2xs short-h-pill"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                      <span className="leading-snug">{advantage}</span>
                    </div>
                  ))}
                </div>

                {/* Business Help: Typography & Legibility */}
                <div className="pt-0.5 sm:pt-1 space-y-0.5 sm:space-y-1">
                  <div className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                    ЧЕМ ПОМОГАЕТ БИЗНЕСУ:
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-zinc-800 font-normal short-h-desc">
                    {activeProject.businessHelp}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
