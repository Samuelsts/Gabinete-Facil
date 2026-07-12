'use client';

import { useSessao } from '@/contexts/SessaoContext';

export type ModuloAtivo =
  | 'dashboard'
  | 'cidadaos'
  | 'atendimentos'
  | 'demandas'
  | 'indicacoesOficios'
  | 'comunidades'
  | 'agenda'
  | 'assessores'
  | 'relatorios'
  | 'configuracoes'
  | 'usuarios';

// Só os módulos já implementados viram botões clicáveis; os demais
// (Demandas, Agenda, Dashboard) continuam listados como preview do
// que vem a seguir, mas desabilitados — evita a ilusão de uma tela
// funcional que na verdade não faz nada ao clicar.
const MODULOS: { label: string; valor: ModuloAtivo | null }[] = [
  { label: 'Dashboard', valor: 'dashboard' },
  { label: 'Cidadãos', valor: 'cidadaos' },
  { label: 'Atendimentos', valor: 'atendimentos' },
  { label: 'Demandas', valor: 'demandas' },
  { label: 'Indicações e Ofícios', valor: 'indicacoesOficios' },
  { label: 'Comunidades', valor: 'comunidades' },
  { label: 'Agenda', valor: 'agenda' },
  { label: 'Assessores', valor: 'assessores' },
  { label: 'Relatórios', valor: 'relatorios' },
  { label: 'Configurações', valor: 'configuracoes' },
  { label: "Usuários", valor: "usuarios" },
];

interface SidebarProps {
  moduloAtivo: ModuloAtivo;
  onMudarModulo: (modulo: ModuloAtivo) => void;
}

export function Sidebar({ moduloAtivo, onMudarModulo }: SidebarProps) {
  const { usuario } = useSessao();

  // "Usuários" só aparece para quem tem perfil ADMINISTRADOR — é a
  // forma mais simples de garantir a regra "só admin gerencia
  // usuários", sem precisar duplicar checagem no backend.
  const modulosVisiveis = MODULOS.filter(
    (m) => m.valor !== 'usuarios' || usuario?.perfil === 'ADMINISTRADOR',
  );

  return (
    <nav className="w-56 bg-slate-300 border-r border-slate-200 p-3 flex flex-col gap-1">
      {modulosVisiveis.map((modulo) => (
        <button
          key={modulo.label}
          disabled={!modulo.valor}
          onClick={() => modulo.valor && onMudarModulo(modulo.valor)}
          className={`cursor-pointer text-slate-950 text-left px-3 py-2 rounded text-sm ${
            modulo.valor === moduloAtivo
              ? 'bg-emerald-600 text-white'
              : modulo.valor
                ? 'hover:bg-emerald-700 hover:text-slate-200'
                : 'opacity-40 cursor-not-allowed'
          }`}
        >
          {modulo.label}
        </button>
      ))}
    </nav>
  );
}
