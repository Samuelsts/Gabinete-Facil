"use client";

interface PaginationProps {
  pagina: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

export function Pagination({ pagina, totalPaginas, onMudarPagina }: PaginationProps) {
  if (totalPaginas <= 1) return null; // não exibe controles se só há 1 página — nada a navegar

  return (
    <div className="flex text-zinc-300 items-center gap-2 mt-4 text-sm">
      <button
        onClick={() => onMudarPagina(pagina - 1)}
        disabled={pagina <= 1}
        className="px-3 cursor-pointer py-1 rounded border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-800 hover:text-white"
      >
        Anterior
      </button>

      <span className="text-neutral-400">
        Página {pagina} de {totalPaginas}
      </span>

      <button
        onClick={() => onMudarPagina(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className="px-3 py-1 cursor-pointer rounded border border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-800 hover:text-white"
      >
        Próxima
      </button>
    </div>
  );
}