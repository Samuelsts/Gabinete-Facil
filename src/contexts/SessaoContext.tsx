'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
interface Usuario {
  id: number;
  nome: string;
  perfil: string;
  usuarioPadrao: boolean;
}

interface SessaoContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<string | null>;
  logout: () => void;
}

const SessaoContext = createContext<SessaoContextType | null>(null);

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Retorna string de erro (ou null se sucesso) em vez de lançar
  // exceção — assim a tela de login trata o erro sem try/catch,
  // só verificando o retorno.
  async function login(
    nomeUsuario: string,
    senha: string,
  ): Promise<string | null> {
    const res = await window.electronAPI.login(nomeUsuario, senha);

    if (!res.sucesso || !res.usuario) {
      return res.erro ?? 'Erro desconhecido';
    }

    setUsuario(res.usuario);
    return null;
  }
  function logout() {
    setUsuario(null);
  }

  return (
    <SessaoContext.Provider value={{ usuario, login, logout }}>
      {children}
    </SessaoContext.Provider>
  );
}

// Hook customizado: evita repetir `useContext(SessaoContext)` +
// checagem de null em todo componente que precisar da sessão.
export function useSessao() {
  const ctx = useContext(SessaoContext);
  if (!ctx) {
    throw new Error('useSessao deve ser usado dentro de um SessaoProvider');
  }
  return ctx;
}
