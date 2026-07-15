'use client';

import { useState } from 'react';
import { RelatorioAniversariantes } from './RelatorioAniversariantes';
import { RelatorioAtendimentos } from './RelatorioAtendimentos';
import { RelatorioDemandas } from './RelatorioDemandas';
import { RelatorioIndicacoesOficios } from './RelatorioIndicacoesOficios';
import { RelatorioComunidades } from './RelatorioComunidades';
import { RelatorioAgenda } from './RelatorioAgenda';
import { RelatorioCidadaos } from './RelatorioCidadaos';
import { RelatorioAssessores } from './RelatorioAssessores';

type RelatorioAtivo =
  | 'menu'
  | 'aniversariantes-cidadaos'
  | 'aniversariantes-assessores'
  | 'atendimentos'
  | 'demandas'
  | 'indicacoesOficios'
  | 'comunidades'
  | 'agenda'
  | 'cidadaos'
  | 'assessores';

// Declarado FORA do componente RelatoriosPage: um componente definido
// dentro do corpo de outro é recriado a cada render (nova referência
// de função toda vez), o que o React/lint sinaliza como prática
// arriscada — pode resetar estado interno do componente filho sem
// motivo. Aqui não temos estado interno, mas a correção correta é
// sempre declarar componentes no nível do módulo, não dentro de outro.
function BotaoVoltar({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm cursor-pointer text-emerald-900 hover:text-emerald-500 mb-4"
    >
      ← Voltar aos relatórios
    </button>
  );
}

export function RelatoriosPage() {
  const [ativo, setAtivo] = useState<RelatorioAtivo>('menu');

  function voltar() {
    setAtivo('menu');
  }

  if (ativo === 'aniversariantes-cidadaos') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioAniversariantes tipo="cidadaos" />
      </div>
    );
  }

  if (ativo === 'aniversariantes-assessores') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioAniversariantes tipo="assessores" />
      </div>
    );
  }

  if (ativo === 'atendimentos') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioAtendimentos />
      </div>
    );
  }

  if (ativo === 'demandas') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioDemandas />
      </div>
    );
  }

  if (ativo === 'indicacoesOficios') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioIndicacoesOficios />
      </div>
    );
  }

  if (ativo === 'comunidades') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioComunidades />
      </div>
    );
  }

  if (ativo === 'agenda') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioAgenda />
      </div>
    );
  }

  if (ativo === 'cidadaos') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioCidadaos />
      </div>
    );
  }

  if (ativo === 'assessores') {
    return (
      <div>
        <BotaoVoltar onClick={voltar} />
        <RelatorioAssessores />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl text-emerald-900 font-semibold mb-4">
        Relatórios
      </h1>

      <div className="grid grid-cols-2 text-emerald-900 gap-3 max-w-2xl">
        <button
          onClick={() => setAtivo('aniversariantes-cidadaos')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Cidadãos Aniversariantes</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por mês, com opção de exportação.
          </p>
        </button>

        <button
          onClick={() => setAtivo('aniversariantes-assessores')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Assessores Aniversariantes</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por mês, com opção de exportação.
          </p>
        </button>

        <button
          onClick={() => setAtivo('atendimentos')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Atendimentos</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por status, assessor e período.
          </p>
        </button>

        <button
          onClick={() => setAtivo('demandas')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Demandas</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por status, prioridade, assessor e período.
          </p>
        </button>

        <button
          onClick={() => setAtivo('indicacoesOficios')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Indicações e Ofícios</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por tipo, status, assessor e período.
          </p>
        </button>

        <button
          onClick={() => setAtivo('comunidades')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Comunidades</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por status, assessor e período.
          </p>
        </button>

        <button
          onClick={() => setAtivo('agenda')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Agenda</p>
          <p className="text-sm text-emerald-500 mt-1">
            Filtrar por status e período.
          </p>
        </button>

        <button
          onClick={() => setAtivo('cidadaos')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Cidadãos</p>
          <p className="text-sm text-emerald-500 mt-1">
            Listagem completa, com busca por nome.
          </p>
        </button>

        <button
          onClick={() => setAtivo('assessores')}
          className="text-left border border-emerald-800 rounded-lg p-4 hover:bg-emerald-700 cursor-pointer hover:text-white"
        >
          <p className="font-semibold">Assessores</p>
          <p className="text-sm text-emerald-500 mt-1">
            Listagem completa, com busca por nome.
          </p>
        </button>
      </div>
    </div>
  );
}
