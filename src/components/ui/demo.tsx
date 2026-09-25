"use client";

import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&h=640&fit=crop&q=70&auto=format`;

const SLIDES = [
  {
    src: UNSPLASH("1551288049-bebda4e38f71"),
    alt: "OpsFlow Engine Dashboard",
    title: "OpsFlow Engine",
    subtitle: "Workflow Automation",
    meta: [
      { label: "Impact", value: "-78% Manual Hours" },
      { label: "Throughput", value: "140K ops/day" },
      { label: "Year", value: "2025" },
    ],
  },
  {
    src: UNSPLASH("1460925895917-afdab827c52f"),
    alt: "SyncLedger ERP Platform",
    title: "SyncLedger ERP",
    subtitle: "Operations & Finance",
    meta: [
      { label: "Speed", value: "24x Faster Close" },
      { label: "Connected Hubs", value: "32 Warehouses" },
      { label: "Year", value: "2025" },
    ],
  },
  {
    src: UNSPLASH("1504868584819-f8e8b4b6d7e3"),
    alt: "PulseIQ Analytics Intelligence",
    title: "PulseIQ Suite",
    subtitle: "Executive Decision Engine",
    meta: [
      { label: "Margin Growth", value: "+6.2% Gross" },
      { label: "Latency", value: "<120ms Query" },
      { label: "Year", value: "2024" },
    ],
  },
  {
    src: UNSPLASH("1451187580459-43490279c0fa"),
    alt: "OmniDoc Automation Pipeline",
    title: "OmniDoc Automation",
    subtitle: "B2B OCR & Invoicing",
    meta: [
      { label: "Savings", value: "$140k/year" },
      { label: "Accuracy", value: "99.8% Extraction" },
      { label: "Year", value: "2024" },
    ],
  },
  {
    src: UNSPLASH("1551836022-d5d88e9218df"),
    alt: "FlowDesk Client Operations Portal",
    title: "FlowDesk B2B",
    subtitle: "Client Operations Portal",
    meta: [
      { label: "CSAT Score", value: "4.9 / 5.0" },
      { label: "Inquiries", value: "-85% Status Noise" },
      { label: "Year", value: "2023" },
    ],
  },
];

export default function DemoOne() {
  return (
    <div className="w-full overflow-hidden bg-background py-6">
      <CoverflowCarousel slides={SLIDES} showCaption showNavigation showPagination />
    </div>
  );
}
