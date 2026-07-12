import { dialog } from 'electron';
import fs from 'fs';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Contrato genérico: qualquer módulo que queira exportar um relatório
// só precisa produzir isso — colunas (chave + rótulo de exibição) e
// linhas já formatadas como string (datas, enums etc. já traduzidos
// para texto legível antes de chegar aqui). Isso mantém esse serviço
// 100% agnóstico sobre o significado dos dados de cada módulo.
export interface DadosRelatorio {
  titulo: string;
  colunas: { chave: string; label: string }[];
  linhas: Record<string, string>[];
}

// Escapamento mínimo de CSV: aspas duplas em campos que contêm vírgula,
// aspas ou quebra de linha, dobrando aspas internas (regra padrão RFC 4180).
function escaparCampoCsv(valor: string): string {
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export async function exportarCsv(
  dados: DadosRelatorio,
): Promise<{ cancelado: boolean }> {
  const resultado = await dialog.showSaveDialog({
    defaultPath: `${dados.titulo}.csv`,
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  });

  if (resultado.canceled || !resultado.filePath) {
    return { cancelado: true };
  }

  const cabecalho = dados.colunas
    .map((c) => escaparCampoCsv(c.label))
    .join(',');
  const linhas = dados.linhas.map((linha) =>
    dados.colunas.map((c) => escaparCampoCsv(linha[c.chave] ?? '')).join(','),
  );

  // BOM UTF-8 no início: sem isso, o Excel no Windows costuma abrir
  // CSVs com acentuação (ã, ç, é) corrompida, interpretando como
  // Latin-1 por padrão. O BOM sinaliza explicitamente "isto é UTF-8".
  const conteudo = '\uFEFF' + [cabecalho, ...linhas].join('\n');

  fs.writeFileSync(resultado.filePath, conteudo, 'utf-8');
  return { cancelado: false };
}

export async function exportarExcel(
  dados: DadosRelatorio,
): Promise<{ cancelado: boolean }> {
  const resultado = await dialog.showSaveDialog({
    defaultPath: `${dados.titulo}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  });

  if (resultado.canceled || !resultado.filePath) {
    return { cancelado: true };
  }

  const workbook = new ExcelJS.Workbook();
  const planilha = workbook.addWorksheet(dados.titulo.slice(0, 31)); // Excel limita nome de aba a 31 caracteres

  planilha.columns = dados.colunas.map((c) => ({
    header: c.label,
    key: c.chave,
    width: Math.max(c.label.length + 2, 15),
  }));

  // Cabeçalho em negrito — único toque de formatação, mantém simples
  // sem virar um exercício de estilização de planilha.
  planilha.getRow(1).font = { bold: true };

  dados.linhas.forEach((linha) => planilha.addRow(linha));

  await workbook.xlsx.writeFile(resultado.filePath);
  return { cancelado: false };
}

export async function exportarPdf(
  dados: DadosRelatorio,
): Promise<{ cancelado: boolean }> {
  const resultado = await dialog.showSaveDialog({
    defaultPath: `${dados.titulo}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (resultado.canceled || !resultado.filePath) {
    return { cancelado: true };
  }

  return new Promise((resolve, reject) => {
    // Orientação paisagem: relatórios tabulares com várias colunas
    // (ex: Atendimentos tem 7+ colunas) cabem melhor na largura do
    // que na altura de uma folha A4 retrato.
    const doc = new PDFDocument({
      margin: 30,
      size: 'A4',
      layout: 'landscape',
    });
    const stream = fs.createWriteStream(resultado.filePath!);
    doc.pipe(stream);

    doc.fontSize(16).text(dados.titulo, { align: 'center' });
    doc.moveDown();

    const larguraUtil = doc.page.width - 60;
    const larguraColuna = larguraUtil / dados.colunas.length;
    const alturaLinha = 20;

    function desenharCabecalho() {
      doc.fontSize(9).font('Helvetica-Bold');
      const yCabecalho = doc.y; // fixa o Y ANTES do loop, todas as colunas usam o mesmo
      dados.colunas.forEach((col, i) => {
        doc.text(col.label, 30 + i * larguraColuna, yCabecalho, {
          width: larguraColuna,
        });
      });
      doc.y = yCabecalho + 15; // avança o cursor manualmente, uma única vez, após desenhar a linha inteira
      doc.font('Helvetica');
    }

    desenharCabecalho();

    dados.linhas.forEach((linha) => {
      // Quebra de página manual: pdfkit não pagina tabelas automaticamente,
      // então checamos se a próxima linha estouraria a página e, se sim,
      // criamos uma nova página e redesenhamos o cabeçalho nela — sem isso,
      // o texto simplesmente desapareceria além da margem inferior.
      if (doc.y + alturaLinha > doc.page.height - 40) {
        doc.addPage();
        desenharCabecalho();
      }

      const yAtual = doc.y;
      dados.colunas.forEach((col, i) => {
        doc
          .fontSize(8)
          .text(linha[col.chave] ?? '', 30 + i * larguraColuna, yAtual, {
            width: larguraColuna,
          });
      });
      doc.y = yAtual + alturaLinha;
    });

    doc.end();

    stream.on('finish', () => resolve({ cancelado: false }));
    stream.on('error', reject);
  });
}
