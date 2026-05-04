// Geração de relatório para impressão
const PrintService = {
  generateReport(data) {
    const now = new Date().toLocaleString('pt-BR');
    const fmt = (v) => CurrencyService.formatBRL(v);
    const fmtN = (v) => CurrencyService.formatNumber(v);

    let html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Relatório de Custo de Importação</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 24px; font-size: 11px; line-height: 1.5; }
      .header { text-align: center; border-bottom: 3px solid #1a1a5e; padding-bottom: 16px; margin-bottom: 20px; }
      .header h1 { font-size: 20px; color: #1a1a5e; margin-bottom: 4px; }
      .header p { color: #666; font-size: 11px; }
      .section { margin-bottom: 16px; page-break-inside: avoid; }
      .section h2 { font-size: 13px; background: #1a1a5e; color: #fff; padding: 6px 12px; margin-bottom: 8px; border-radius: 4px; }
      .section h3 { font-size: 12px; color: #1a1a5e; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 12px 0 6px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      th, td { padding: 5px 8px; border: 1px solid #ddd; text-align: left; }
      th { background: #f0f0f8; font-weight: 600; font-size: 10px; }
      td { font-size: 11px; }
      .text-right { text-align: right; }
      .total-row { background: #e8e8f0; font-weight: 700; }
      .highlight { background: #fffde7; }
      .alert-print { padding: 6px 10px; margin: 4px 0; border-left: 3px solid #e53935; background: #fff3f3; font-size: 10px; }
      .alert-print.warning { border-color: #ff9800; background: #fff8e1; }
      .two-col { display: flex; gap: 16px; }
      .two-col > div { flex: 1; }
      .footer { text-align: center; margin-top: 20px; padding-top: 12px; border-top: 2px solid #1a1a5e; font-size: 10px; color: #666; }
      @media print { body { padding: 12px; } .no-print { display: none !important; } }
    </style></head><body>`;

    // Header
    html += `<div class="header">
      <h1>📦 Relatório de Custo de Importação</h1>
      <p>Gerado em: ${now} | Moeda: BRL (Real Brasileiro)</p>
    </div>`;

    // Dados do Produto
    if (data.produto) {
      html += `<div class="section"><h2>1. Dados do Produto</h2><table>
        <tr><td><strong>NCM:</strong> ${data.produto.ncm || '—'}</td><td><strong>Descrição NCM:</strong> ${data.produto.descNCM || '—'}</td></tr>
        <tr><td><strong>Produto:</strong> ${data.produto.descricao || '—'}</td><td><strong>Quantidade:</strong> ${fmtN(data.produto.quantidade)} ${data.produto.unidade || 'un'}</td></tr>
        <tr><td><strong>Valor Unitário:</strong> ${data.produto.moeda} ${fmtN(data.produto.valorUnit)}</td><td><strong>Valor Total:</strong> ${data.produto.moeda} ${fmtN(data.produto.valorTotal)}</td></tr>
        <tr><td><strong>Peso Bruto:</strong> ${fmtN(data.produto.pesoBruto)} kg</td><td><strong>Peso Líquido:</strong> ${fmtN(data.produto.pesoLiquido)} kg</td></tr>
      </table></div>`;
    }

    // Alertas
    if (data.alertas && data.alertas.length > 0) {
      html += `<div class="section"><h2>⚠️ Alertas Fiscais / Legais</h2>`;
      data.alertas.forEach(a => { html += `<div class="alert-print ${a.type === 'warning' ? 'warning' : ''}">${a.icon} ${a.text}</div>`; });
      html += `</div>`;
    }

    // Câmbio
    if (data.cambio) {
      html += `<div class="section"><h2>2. Câmbio Utilizado</h2><table>
        <tr><th>Moeda</th><th>Cotação</th></tr>
        <tr><td>USD (Dólar)</td><td class="text-right">${fmt(data.cambio.USD)}</td></tr>
        <tr><td>EUR (Euro)</td><td class="text-right">${fmt(data.cambio.EUR)}</td></tr>
      </table></div>`;
    }

    // Valor Aduaneiro
    if (data.valorAduaneiro) {
      const va = data.valorAduaneiro;
      html += `<div class="section"><h2>3. Composição do Valor Aduaneiro</h2><table>
        <tr><td>Valor FOB</td><td class="text-right">${fmt(va.fob)}</td></tr>
        <tr><td>Frete Internacional</td><td class="text-right">${fmt(va.frete)}</td></tr>
        <tr><td>Seguro Internacional</td><td class="text-right">${fmt(va.seguro)}</td></tr>
        <tr class="total-row"><td><strong>Valor Aduaneiro (CIF)</strong></td><td class="text-right"><strong>${fmt(va.total)}</strong></td></tr>
      </table></div>`;
    }

    // Impostos de Entrada
    if (data.impostos) {
      const imp = data.impostos;
      html += `<div class="section"><h2>4. Impostos de Importação</h2><table>
        <tr><th>Imposto</th><th>Alíquota</th><th class="text-right">Valor</th></tr>
        <tr><td>II (Imposto de Importação)</td><td>${fmtN(data.aliquotas?.ii || 0)}%</td><td class="text-right">${fmt(imp.ii)}</td></tr>
        <tr><td>IPI</td><td>${fmtN(data.aliquotas?.ipi || 0)}%</td><td class="text-right">${fmt(imp.ipi)}</td></tr>
        <tr><td>PIS-Importação</td><td>${fmtN(data.aliquotas?.pis || 2.10)}%</td><td class="text-right">${fmt(imp.pisImp)}</td></tr>
        <tr><td>COFINS-Importação</td><td>${fmtN(data.aliquotas?.cofins || 9.65)}%</td><td class="text-right">${fmt(imp.cofinsImp)}</td></tr>
        <tr><td>ICMS ${data.corredorMG ? '(Corredor MG - Diferido)' : ''}</td><td>${fmtN(data.aliquotas?.icms || 18)}%</td><td class="text-right">${fmt(imp.icmsInfo?.icmsAPagar || 0)}</td></tr>
        <tr><td>AFRMM</td><td>25%</td><td class="text-right">${fmt(imp.afrmm)}</td></tr>
        <tr><td>Taxa Siscomex</td><td>—</td><td class="text-right">${fmt(imp.taxaSiscomex)}</td></tr>
        <tr class="total-row"><td colspan="2"><strong>Total Impostos</strong></td><td class="text-right"><strong>${fmt(imp.totalImpostos)}</strong></td></tr>
      </table>`;
      if (data.corredorMG && imp.icmsInfo) {
        html += `<h3>Benefício Corredor de Importação MG</h3><table>
          <tr><td>ICMS Cheio</td><td class="text-right">${fmt(imp.icmsInfo.icmsCheio)}</td></tr>
          <tr class="highlight"><td>ICMS Diferido</td><td class="text-right">${fmt(imp.icmsInfo.icmsDiferido)}</td></tr>
          <tr><td>Crédito Presumido</td><td class="text-right">${fmt(imp.icmsInfo.creditoPresumido)}</td></tr>
          <tr class="total-row"><td><strong>Economia Total</strong></td><td class="text-right"><strong>${fmt(imp.icmsInfo.economiaTotal)}</strong></td></tr>
        </table>`;
      }
      html += `</div>`;
    }

    // Despesas Acessórias
    if (data.despesas && data.despesas.length > 0) {
      html += `<div class="section"><h2>5. Despesas Acessórias</h2><table>
        <tr><th>Descrição</th><th class="text-right">Valor</th></tr>`;
      let totalDesp = 0;
      data.despesas.forEach(d => { html += `<tr><td>${d.nome}</td><td class="text-right">${fmt(d.valor)}</td></tr>`; totalDesp += d.valor; });
      html += `<tr class="total-row"><td><strong>Total Despesas</strong></td><td class="text-right"><strong>${fmt(totalDesp)}</strong></td></tr></table></div>`;
    }

    // Custo Total
    if (data.custoTotal) {
      html += `<div class="section"><h2>6. Custo Total de Importação</h2><table>
        <tr><td>Valor da Mercadoria (BRL)</td><td class="text-right">${fmt(data.custoTotal.valorMercadoria)}</td></tr>
        <tr><td>Total Impostos</td><td class="text-right">${fmt(data.custoTotal.totalImpostos)}</td></tr>
        <tr><td>Total Despesas Acessórias</td><td class="text-right">${fmt(data.custoTotal.totalDespesas)}</td></tr>
        <tr class="total-row"><td><strong>CUSTO TOTAL</strong></td><td class="text-right"><strong>${fmt(data.custoTotal.total)}</strong></td></tr>
        <tr class="highlight"><td><strong>CUSTO UNITÁRIO</strong></td><td class="text-right"><strong>${fmt(data.custoTotal.unitario)}</strong></td></tr>
      </table></div>`;
    }

    // Impostos de Saída
    if (data.saida) {
      html += `<div class="section"><h2>7. Prévia de Impostos de Saída — Lucro Real Trimestral</h2>`;
      const estados = ['RJ', 'SP'];
      html += `<div class="two-col">`;
      estados.forEach(est => {
        const s = data.saida[est];
        if (!s) return;
        html += `<div><h3>Venda para ${est === 'RJ' ? 'Rio de Janeiro' : 'São Paulo'}</h3><table>
          <tr><td>Receita Bruta</td><td class="text-right">${fmt(s.receitaBruta)}</td></tr>
          <tr><td>ICMS Interestadual (${s.aliqICMSInter}%)</td><td class="text-right">${fmt(s.icmsSaida)}</td></tr>
          <tr><td>DIFAL (${s.difal}%)</td><td class="text-right">${fmt(s.difalValor)}</td></tr>
          <tr><td>PIS (1,65% - crédito)</td><td class="text-right">${fmt(s.pisAPagar)}</td></tr>
          <tr><td>COFINS (7,60% - crédito)</td><td class="text-right">${fmt(s.cofinsAPagar)}</td></tr>
          <tr><td>IRPJ (15% + adicional)</td><td class="text-right">${fmt(s.irpjTotal)}</td></tr>
          <tr><td>CSLL (9%)</td><td class="text-right">${fmt(s.csll)}</td></tr>
          <tr class="total-row"><td><strong>Total Impostos Saída</strong></td><td class="text-right"><strong>${fmt(s.totalImpostosSaida)}</strong></td></tr>
          <tr class="highlight"><td><strong>Lucro Líquido Est.</strong></td><td class="text-right"><strong>${fmt(s.lucroLiquido)}</strong></td></tr>
          <tr><td>Margem Líquida</td><td class="text-right">${fmtN(s.margemLiquida)}%</td></tr>
        </table></div>`;
      });
      html += `</div></div>`;
    }

    // Footer
    html += `<div class="footer">
      <p>Relatório gerado pelo <strong>Calculadora de Importação</strong> | ${now}</p>
      <p>⚠️ Este relatório é uma estimativa. Consulte um contador para valores definitivos.</p>
    </div></body></html>`;

    return html;
  },

  print(data) {
    const html = this.generateReport(data);
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
};
