'use client';

import { useEffect, useState } from 'react';
import type { UsuarioGestao, PerfilUsuario } from '@/types/electron';
import {
  listarUsuariosGestao,
  inativarUsuarioGestao,
  resetarDadosSistema,
} from '../services/usuariosGestaoService';
import { useSessao } from '@/contexts/SessaoContext';
import { UsuarioFormModal } from './UsuarioFormModal';
import { ResetarSenhaModal } from './ResetarSenhaModal';

const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  EDITOR: 'Editor',
  VISUALIZADOR: 'Visualizador',
};

export function UsuariosPage() {
  const { usuario } = useSessao();

  // Só a conta padrão "Administrador" (não qualquer usuário com perfil
  // ADMINISTRADOR) pode ver o botão de reset — usuarioPadrao + perfil
  // juntos isolam exatamente essa conta específica.
  const podeResetarSistema =
    usuario?.usuarioPadrao && usuario?.perfil === 'ADMINISTRADOR';

  const [usuarios, setUsuarios] = useState<UsuarioGestao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioGestao | null>(
    null,
  );
  const [usuarioResetandoSenha, setUsuarioResetandoSenha] =
    useState<UsuarioGestao | null>(null);

  const [resetando, setResetando] = useState(false);
  const [mensagemReset, setMensagemReset] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const dados = await listarUsuariosGestao();
        if (!ignore) setUsuarios(dados);
      } catch (e) {
        if (!ignore) setErro((e as Error).message);
      } finally {
        if (!ignore) setCarregando(false);
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [versao]);

  function recarregar() {
    setVersao((v) => v + 1);
  }

  async function handleInativar(id: number) {
    if (!confirm('Deseja inativar este usuário?')) return;
    try {
      await inativarUsuarioGestao(id);
      recarregar();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleResetarSistema() {
    // Dupla confirmação: ação irreversível (mesmo com backup
    // automático), então exige mais fricção que um confirm() simples.
    const primeiraConfirmacao = confirm(
      'Isso vai APAGAR TODOS os dados do sistema (cidadãos, atendimentos, demandas, etc.), mantendo apenas os usuários e o assessor padrão. Um backup será feito automaticamente antes. Deseja continuar?',
    );
    if (!primeiraConfirmacao) return;

    const textoDigitado = prompt('Para confirmar, digite exatamente: RESETAR');
    if (textoDigitado !== 'RESETAR') {
      alert('Confirmação incorreta. Nenhum dado foi apagado.');
      return;
    }

    setResetando(true);
    setMensagemReset(null);
    try {
      const caminhoBackup = await resetarDadosSistema();
      setMensagemReset(
        `Sistema resetado com sucesso. Backup de segurança salvo em: ${caminhoBackup}`,
      );
      recarregar();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setResetando(false);
    }
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <div className="flex gap-2">
          {podeResetarSistema && (
            <button
              onClick={handleResetarSistema}
              disabled={resetando}
              className="px-4 py-1.5 cursor-pointer rounded border border-red-700 text-red-400 hover:bg-red-950 text-sm disabled:opacity-50"
            >
              {resetando ? 'Resetando...' : 'Resetar sistema'}
            </button>
          )}
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-1.5 text-white cursor-pointer rounded bg-blue-600 hover:bg-blue-500 text-sm"
          >
            Novo Usuário
          </button>
        </div>
      </div>

      {mensagemReset && (
        <p className="text-green-400 text-sm mb-3">{mensagemReset}</p>
      )}
      {erro && <p className="text-red-400 mb-2">{erro}</p>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-800">
              <th className="py-2">Nome</th>
              <th>Perfil</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-neutral-900">
                <td className="py-2">{u.nome}</td>
                <td>{PERFIL_LABEL[u.perfil]}</td>
                <td className="text-neutral-500">
                  {u.usuarioPadrao ? 'Padrão do sistema' : 'Personalizado'}
                </td>
                <td>
                  <button
                    onClick={() => setUsuarioEditando(u)}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    {u.usuarioPadrao ? 'Ver' : 'Editar'}
                  </button>
                  <button
                    onClick={() => setUsuarioResetandoSenha(u)}
                    className="text-yellow-400 hover:text-yellow-300 mr-3"
                  >
                    Resetar senha
                  </button>
                  <button
                    onClick={() => handleInativar(u.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Inativar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <UsuarioFormModal
        key={usuarioEditando ? usuarioEditando.id : 'novo'}
        aberto={modalAberto || !!usuarioEditando}
        usuario={usuarioEditando}
        onFechar={() => {
          setModalAberto(false);
          setUsuarioEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setUsuarioEditando(null);
          recarregar();
        }}
      />

      <ResetarSenhaModal
        aberto={!!usuarioResetandoSenha}
        usuario={usuarioResetandoSenha}
        onFechar={() => setUsuarioResetandoSenha(null)}
        onSalvo={() => {
          setUsuarioResetandoSenha(null);
          alert('Senha atualizada com sucesso.');
        }}
      />
    </div>
  );
}
