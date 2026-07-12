'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CidadaosPage } from '@/modules/cidadaos/components/CidadaosPage';
import { AtendimentosPage } from '@/modules/atendimentos/components/AtendimentosPage';
import { useSessao } from '@/contexts/SessaoContext';
import { DemandasPage } from '@/modules/demandas/components/DemandasPage';
import { IndicacoesOficiosPage } from '@/modules/indicacoes-oficios/components/IndicacoesOficiosPage';
import { ComunidadesPage } from '@/modules/comunidades/components/ComunidadesPage';
import { AgendaPage } from '@/modules/agenda/components/AgendaPage';
import { AssessoresPage } from '@/modules/assessores/components/AssessoresPage';
import { DashboardPage } from '@/modules/dashboard/components/DashboardPage';
import { RelatoriosPage } from '@/modules/relatorios/components/RelatoriosPage';
import { ConfiguracoesPage } from '@/modules/configuracoes/components/ConfiguracoesPage';
import { UsuariosPage } from '@/modules/usuarios/components/UsuariosPage';

type ModuloAtivo =
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

export default function Home() {
  const { usuario, login } = useSessao();
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [modulo, setModulo] = useState<ModuloAtivo>('dashboard');

  const [usuarioIdAnterior, setUsuarioIdAnterior] = useState(usuario?.id);

  if (usuario?.id !== usuarioIdAnterior) {
    setUsuarioIdAnterior(usuario?.id);
    setModulo('dashboard');
  }

  async function handleLogin() {
    setErro(null);
    const erroLogin = await login(nomeUsuario, senha);
    if (erroLogin) setErro(erroLogin);
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden px-4">
        {/* Brilho ambiente atrás do card — único acento de cor da tela,
          reforça o card como o ponto focal sem distrair do formulário. */}
        <div
          className="pointer-events-none absolute w-[480px] h-[480px] rounded-full blur-3xl gf-animate-glow"
          style={{
            background:
              'radial-gradient(circle, rgba(102, 201, 75, 0.25), transparent 70%)',
          }}
        />

        <div className="relative w-full max-w-sm gf-animate-fade-up">
          <div className="text-center mb-8">
            <p
              className="text-3xl text-emerald-950"
              style={{
                fontFamily: 'var(--font-display), serif',
                fontWeight: 600,
              }}
            >
              Gabinete Fácil
            </p>
            <div className="mx-auto mt-2 h-[2px] w-16 bg-emerald-400 gf-animate-underline" />
            <p className="text-sm text-emerald-700 mt-3">
              Gestão do gabinete, em um só lugar
            </p>
          </div>

          <div className="bg-emerald-950/90 border border-emerald-800 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
            <label className="text-sm text-emerald-400 block mb-1.5">
              Usuário
            </label>
            <input
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Seu nome de usuário"
              className="w-full border border-emerald-700 rounded-lg px-3 py-2 bg-black/40 text-emerald-50 placeholder:text-emerald-700 mb-4 outline-none focus:border-emerald-400 transition-colors"
            />

            <label className="text-sm text-emerald-400 block mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full border border-emerald-700 rounded-lg px-3 py-2 bg-black/40 text-emerald-50 placeholder:text-emerald-600 mb-5 outline-none focus:border-emerald-400 transition-colors"
            />

            {erro && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2 mb-4">
                {erro}
              </p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-emerald-400 cursor-pointer rounded-lg py-2.5 text-sm font-medium text-emerald-950 transition-all hover:brightness-110 active:scale-[0.98]"
              // style={{ background: '#C9A24B' }}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout moduloAtivo={modulo} onMudarModulo={setModulo}>
      {modulo === 'dashboard' && <DashboardPage />}
      {modulo === 'cidadaos' && <CidadaosPage />}
      {modulo === 'atendimentos' && <AtendimentosPage />}
      {modulo === 'demandas' && <DemandasPage />}
      {modulo === 'indicacoesOficios' && <IndicacoesOficiosPage />}
      {modulo === 'comunidades' && <ComunidadesPage />}
      {modulo === 'agenda' && <AgendaPage />}
      {modulo === 'assessores' && <AssessoresPage />}
      {modulo === 'relatorios' && <RelatoriosPage />}
      {modulo === 'configuracoes' && <ConfiguracoesPage />}
      {modulo === 'usuarios' && usuario.perfil === 'ADMINISTRADOR' && (
        <UsuariosPage />
      )}
    </AppLayout>
  );
}
