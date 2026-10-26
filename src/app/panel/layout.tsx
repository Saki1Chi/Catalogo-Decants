import { PanelProvider } from "@/panel/store";

export const metadata = {
  title: "Panel de gestión",
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return <PanelProvider>{children}</PanelProvider>;
}
