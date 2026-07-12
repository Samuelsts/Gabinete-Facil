"use client";

import { useSessao } from "@/contexts/SessaoContext";

export function Header() {
  const { usuario, logout } = useSessao();

  return (
    <header className="bg-emerald-800 h-14 border-b border-emerald-300 flex items-center justify-between px-4">
      <span className="font-semibold">Gabinete Fácil</span>

      <div className="flex items-center gap-3 text-sm">
        <span>
          {usuario?.nome} <span className="opacity-60">({usuario?.perfil})</span>
        </span>
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-300"
        >
          Sair
        </button>
      </div>
    </header>
  );
}