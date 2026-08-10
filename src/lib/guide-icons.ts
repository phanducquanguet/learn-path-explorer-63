import {
  Rocket,
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Layers,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  rocket: Rocket,
  dashboard: LayoutDashboard,
  users: Users,
  clipboard: ClipboardList,
  book: BookOpen,
  layers: Layers,
  check: CheckCircle2,
  chart: BarChart3,
  shield: ShieldCheck,
  help: LifeBuoy,
};

export function guideIcon(key: string): LucideIcon {
  return map[key] ?? BookOpen;
}
