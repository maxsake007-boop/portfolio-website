"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  url?: string;
  meta?: { label: string; value: string }[];
  onClick?: () => void;
}

export interface VerticalCoverflowProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  /** Fixed or responsive width of the 16:9 card */
  cardWidth?: string;
  /** Optional container height */
  containerHeight?: string;
  gap?: number;
  loop?: boolean;
  showNavigation?: boolean;
  showPagination?: boolean;
  label?: string;
  className?: string;
  cardClassName?: string;
  onSelectSlide?: (index: number) => void;
}

export function VerticalCoverflow({
  slides,
  rotate = 26,
  depth = 0.5,
  perspective = 2.8,
  falloff = 0.65,
  fade = 0.25,
  cardWidth = "100%",
  containerHeight,
  gap = 0.15,
  loop = true,
  showNavigation = true,
  showPagination = true,
  label = "Галерея проектов",
  className,
  cardClassName,
  onSelectSlide,
}: VerticalCoverflowProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const heightRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    y: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);
  const wheelThrottleRef = React.useRef<number>(0);

  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const paint = React.useCallback(() => {
    const height = heightRef.current;
    if (!height) return;
    const pitch = height * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      // Tilt around X-axis: items above tilt back, items below tilt forward
      const tilt = Math.min(rotate * ramp, 60) * Math.sign(offset);
      // Selected card is full scale (1.0), unselected cards scale down smoothly to ~0.75
      const scale = Math.max(0.74, 1 - 0.22 * Math.min(ramp, 1.2));

      card.style.transform =
        `translateY(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * height * ramp}px) ` +
        `rotateX(${tilt}deg) ` +
        `scale(${scale})`;

      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance * 10));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      const newIndex = indexAt(target);
      setSelected(newIndex);
      if (onSelectSlide) onSelectSlide(newIndex);

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, onSelectSlide, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      y: event.clientY,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = heightRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    // Moving up or down changes the position
    posRef.current = clamp(drag.pos - (event.clientY - drag.y) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) {
      setSelected(index);
      if (onSelectSlide) onSelectSlide(index);
    }
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  // Smooth mouse wheel navigation
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - wheelThrottleRef.current < 260) return;
    if (Math.abs(event.deltaY) > 8) {
      wheelThrottleRef.current = now;
      nudge(Math.sign(event.deltaY));
    }
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      heightRef.current = card.offsetHeight;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  // Wheel listener: scrolling inside carousel navigates slides; global scroll is only captured if page does not require vertical scrolling
  React.useEffect(() => {
    const handleGlobalWheel = (event: WheelEvent) => {
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight + 16;
      const frame = frameRef.current;
      const target = event.target as Node | null;
      const isInsideFrame = frame && target ? frame.contains(target) : false;

      if (isInsideFrame) {
        event.preventDefault();
        const now = performance.now();
        if (now - wheelThrottleRef.current < 230) return;
        if (Math.abs(event.deltaY) > 6) {
          wheelThrottleRef.current = now;
          nudge(Math.sign(event.deltaY));
        }
      } else if (!isScrollable) {
        // On single-screen desktop with no overflow, allow wheel anywhere to navigate
        event.preventDefault();
        const now = performance.now();
        if (now - wheelThrottleRef.current < 230) return;
        if (Math.abs(event.deltaY) > 6) {
          wheelThrottleRef.current = now;
          nudge(Math.sign(event.deltaY));
        }
      }
    };

    window.addEventListener("wheel", handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleGlobalWheel);
    };
  }, [nudge]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return (
    <div
      className={cn("w-full select-none flex items-center justify-start gap-3 sm:gap-5", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative w-full flex items-center justify-start">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden min-[880px]:overflow-visible rounded-2xl min-[880px]:rounded-none py-1 min-[880px]:py-4 outline-none active:cursor-grabbing w-full flex items-center justify-start short-h-frame"
          style={{
            perspective: `calc(400px * ${perspective})`,
            touchAction: "pan-x",
            height: containerHeight || "clamp(230px, 52vh, 520px)",
          }}
        >
          {/* Central 3D Container - Left aligned, expanded width for maximum readability */}
          <div
            className="relative w-full max-w-[560px] sm:max-w-[660px] lg:max-w-[740px] xl:max-w-[800px]"
            style={{
              height: "calc(100% * 0.72)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => {
              const isCurrent = index === selected;

              return (
                <div
                  key={index}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} из ${count}`}
                  onClick={() => {
                    if (isCurrent && slide.onClick) {
                      slide.onClick();
                    } else {
                      goTo(index);
                    }
                  }}
                  className={cn(
                    "absolute left-0 right-0 top-1/2 overflow-hidden rounded-2xl cursor-pointer will-change-transform group",
                    "border border-white/60 shadow-xl transition-shadow",
                    isCurrent && "shadow-2xl ring-1 ring-white/80",
                    cardClassName,
                  )}
                  style={{ width: cardWidth, aspectRatio: "1920 / 990" }}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    draggable={false}
                    className="h-full w-full select-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />

                  {/* Gradient shadow for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Liquid Glass Overlay Tag on Card */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-3 text-white pointer-events-none">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-300 truncate">
                        {slide.subtitle || `Проект 0${index + 1}`}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white truncate">
                        {slide.title}
                      </div>
                    </div>

                    {isCurrent && slide.url && slide.url !== "#" && (
                      <a
                        href={slide.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="liquid-glass-button p-2 rounded-xl text-zinc-900 shadow-md shrink-0 pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-all group/btn hover:text-emerald-700 flex items-center justify-center"
                        title="Открыть сайт проекта"
                        aria-label="Открыть сайт проекта"
                      >
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unified Vertical Liquid-Glass Navigation Pill (beside gallery) */}
        {showNavigation && (
          <div className="relative lg:static z-[200] ml-1 sm:ml-3 shrink-0">
            <div className="liquid-glass rounded-2xl py-1.5 sm:py-3 px-1 sm:px-2 flex flex-col items-center gap-1.5 sm:gap-2.5 shadow-md">
              <button
                type="button"
                aria-label="Предыдущий проект"
                onClick={() => nudge(-1)}
                className="liquid-glass-button rounded-xl p-1.5 sm:p-2 text-zinc-900 active:scale-90 transition-transform"
                title="Предыдущий проект (Вверх / ↑)"
              >
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Vertical Pagination Dots & Active Indicator */}
              {showPagination && (
                <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-0.5 sm:py-1">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Перейти к проекту ${index + 1}`}
                      aria-current={index === selected}
                      onClick={() => goTo(index)}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        index === selected
                          ? "h-3.5 sm:h-5 w-1.5 bg-zinc-950"
                          : "h-1 sm:h-1.5 w-1 sm:w-1.5 bg-zinc-400/60 hover:bg-zinc-700",
                      )}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                aria-label="Следующий проект"
                onClick={() => nudge(1)}
                className="liquid-glass-button rounded-xl p-1.5 sm:p-2 text-zinc-900 active:scale-90 transition-transform"
                title="Следующий проект (Вниз / ↓)"
              >
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerticalCoverflow;
