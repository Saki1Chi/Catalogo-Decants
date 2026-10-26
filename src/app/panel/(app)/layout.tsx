import { PanelShell } from "@/components/panel/PanelShell";

export default function PanelAppLayout({ children }: { children: React.ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
