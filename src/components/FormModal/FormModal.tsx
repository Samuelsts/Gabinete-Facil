'use client';

import { ReactNode } from 'react';

interface FormModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  onSalvar: () => void;
  salvando?: boolean;
  children: ReactNode;
}

export function FormModal({
  aberto,
  titulo,
  onFechar,
  onSalvar,
  salvando,
  children,
}: FormModalProps) {
  if (!aberto) return null;

  return (
    // Overlay: clique fora fecha o modal — padrão esperado pelo usuário,
    // evita ficar "preso" numa tela sem saber como sair.
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onFechar}
    >
      {/* stopPropagation: impede que clique DENTRO do modal borbulhe pro
          overlay e feche o modal sem querer (ex: clicar num input). */}
      <div
        className="bg-emerald-800 border border-emerald-800 text-white rounded-lg w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{titulo}</h2>

        <div className="flex flex-col gap-3 mb-5">{children}</div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onFechar}
            disabled={salvando}
            className="px-4 cursor-pointer py-1.5 rounded border border-zinc-700 hover:bg-red-800"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={salvando}
            className="px-4 cursor-pointer py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
