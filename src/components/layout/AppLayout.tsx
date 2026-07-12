import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar, ModuloAtivo } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  moduloAtivo: ModuloAtivo;
  onMudarModulo: (modulo: ModuloAtivo) => void;
}

export function AppLayout({ children, moduloAtivo, onMudarModulo }: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="bg-slate-200 flex flex-1 overflow-hidden">
        <Sidebar moduloAtivo={moduloAtivo} onMudarModulo={onMudarModulo} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}