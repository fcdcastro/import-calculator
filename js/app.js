// ============================================
// APP.JS — Controlador principal
// ============================================

const App = {
  state: {
    ncmSelected: null,
    moeda: 'USD',
    container: null,
    corredorMG: false,
    despesas: [
      { nome: 'Frete Nacional', valor: 0 },
      { nome: 'Armazenagem no Porto', valor: 0 },
      { nome: 'Capatazia', valor: 0 },
      { nome: 'Despachante Aduaneiro', valor: 0 },
      { nome: 'Desconsolidação', valor: 0 },
      { nome: 'Demurrage', valor: 0 },
    ],
    resultados: null,
  },

  async init() {
    // Load currency
    const res = await CurrencyService.fetchRates();
    this.updateCurrencyUI(res);
    this.bindEvents();
    this.renderContainers();
    this.renderDespesas();
    this.updateCurrencyLabel();
  },

  // ============ CURRENCY ============
  updateCurrencyUI(res) {
    const usdEl = document.getElementById('usd-rate');
    const eurEl = document.getElementById('eur-rate');
    const updEl = document.getElementById('last-update');
    if (usdEl) usdEl.textContent = CurrencyService.formatNumber(CurrencyService.rates.USD, 4);
    if (eurEl) eurEl.textContent = CurrencyService.formatNumber(CurrencyService.rates.EUR, 4);
    document.getElementById('manual-usd').value = CurrencyService.rates.USD?.toFixed(4) || '';
    document.getElementById('manual-eur').value = CurrencyService.rates.EUR?.toFixed(4) || '';
    if (updEl && CurrencyService.lastUpdate) {
      updEl.textContent = 'Atualizado: ' + CurrencyService.lastUpdate.toLocaleString('pt-BR');
    }
  },

  async refreshCurrency() {
    const btn = document.getElementById('btn-refresh-currency');
    btn.classList.add('loading');
    const res = await CurrencyService.fetchRates();
    btn.classList.remove('loading');
    this.updateCurrencyUI(res);
  },

  updateCurrencyLabel() {
    const moeda = document.getElementById('select-moeda').value;
    this.state.moeda = moeda;
    const labels = document.querySelectorAll('.currency-label');
    labels.forEach(l => l.textContent = moeda);
  },

  // ============ NCM SEARCH ============
  handleNCMSearch(query) {
    const results = searchNCM(query);
    const container = document.getElementById('ncm-results');
    if (results.length === 0 || query.length < 2) {
      container.classList.remove('active');
      return;
    }
    container.innerHTML = results.map(item => {
      const alertBadges = item.alerts.length > 0 ? `<span class="ncm-alerts">${item.alerts.length > 0 ? '⚠️' : ''}</span>` : '';
      return `<div class="ncm-result-item" data-ncm="${item.ncm}">
        <span class="ncm-code">${item.ncm}</span>
        <span class="ncm-desc">${item.desc}</span>
        ${alertBadges}
      </div>`;
    }).join('');
    container.classList.add('active');

    container.querySelectorAll('.ncm-result-item').forEach(el => {
      el.addEventListener('click', () => this.selectNCM(el.dataset.ncm));
    });
  },

  selectNCM(ncmCode) {
    const item = getNCMByCode(ncmCode);
    if (!item) return;
    this.state.ncmSelected = item;
    document.getElementById('ncm-search').value = item.ncm;
    document.getElementById('ncm-results').classList.remove('active');
    document.getElementById('ncm-desc').textContent = item.desc;
    document.getElementById('aliq-ii').value = item.ii;
    document.getElementById('aliq-ipi').value = item.ipi;
    document.getElementById('aliq-pis').value = item.pis;
    document.getElementById('aliq-cofins').value = item.cofins;

    // Render alerts
    const alertsHtml = AlertSystem.renderAlerts(item);
    document.getElementById('ncm-alerts').innerHTML = alertsHtml;
  },

  // ============ CONTAINERS ============
  renderContainers() {
    const grid = document.getElementById('container-grid');
    const containers = getAllContainers();
    const icons = { 'Dry': '📦', 'Reefer': '❄️', 'Open Top': '📭', 'Flat Rack': '🔲', 'Tank': '🛢️' };
    grid.innerHTML = containers.map(c => `
      <div class="container-card" data-id="${c.id}" onclick="App.selectContainer('${c.id}')">
        <div class="c-icon">${icons[c.type] || '📦'}</div>
        <div class="c-name">${c.name}</div>
        <div class="c-weight">${c.cargaUtil.toLocaleString('pt-BR')} kg</div>
        <div class="c-size">Tara: ${c.tara.toLocaleString('pt-BR')} kg${c.volumeM3 ? ' | ' + c.volumeM3 + ' m³' : ''}</div>
      </div>
    `).join('');
  },

  selectContainer(id) {
    this.state.container = id;
    document.querySelectorAll('.container-card').forEach(el => el.classList.remove('selected'));
    const card = document.querySelector(`.container-card[data-id="${id}"]`);
    if (card) card.classList.add('selected');
    this.checkWeight();
  },

  checkWeight() {
    if (!this.state.container) return;
    const peso = parseFloat(document.getElementById('peso-bruto').value) || 0;
    const alertHtml = AlertSystem.checkWeightAlert(this.state.container, peso);
    document.getElementById('weight-alert').innerHTML = alertHtml;

    const info = checkWeightLimit(this.state.container, peso);
    const bar = document.getElementById('weight-progress');
    if (bar) {
      const pct = Math.min(100, info.percentual || 0);
      bar.querySelector('.progress-fill').style.width = pct + '%';
      bar.querySelector('.progress-fill').className = `progress-fill ${pct > 90 ? 'warning' : ''}`;
    }
  },

  // ============ DESPESAS ============
  renderDespesas() {
    const container = document.getElementById('despesas-container');
    container.innerHTML = this.state.despesas.map((d, i) => `
      <div class="expense-row" data-index="${i}">
        <div class="form-group" style="flex:2">
          <label>Descrição</label>
          <input type="text" value="${d.nome}" onchange="App.updateDespesa(${i}, 'nome', this.value)">
        </div>
        <div class="form-group" style="flex:1">
          <label>Valor (R$)</label>
          <input type="number" step="0.01" value="${d.valor}" onchange="App.updateDespesa(${i}, 'valor', parseFloat(this.value)||0)" oninput="App.recalcular()">
        </div>
        <button class="btn-remove" onclick="App.removeDespesa(${i})" title="Remover">✕</button>
      </div>
    `).join('');
  },

  addDespesa() {
    this.state.despesas.push({ nome: 'Nova Despesa', valor: 0 });
    this.renderDespesas();
  },

  removeDespesa(index) {
    if (this.state.despesas.length <= 1) return;
    this.state.despesas.splice(index, 1);
    this.renderDespesas();
  },

  updateDespesa(index, field, value) {
    this.state.despesas[index][field] = value;
    this.recalcular();
  },

  // ============ CORREDOR MG ============
  toggleCorredor() {
    this.state.corredorMG = !this.state.corredorMG;
    const toggle = document.getElementById('toggle-corredor');
    toggle.classList.toggle('active', this.state.corredorMG);
    const fields = document.getElementById('corredor-fields');
    fields.style.display = this.state.corredorMG ? 'grid' : 'none';
    this.recalcular();
  },

  // ============ CÁLCULO PRINCIPAL ============
  recalcular() {
    const moeda = this.state.moeda;
    const taxa = CurrencyService.getRate(moeda);

    // Valores do produto
    const qtd = parseFloat(document.getElementById('quantidade').value) || 0;
    const valorUnit = parseFloat(document.getElementById('valor-unitario').value) || 0;
    const valorTotal = qtd * valorUnit;
    document.getElementById('valor-total').value = CurrencyService.formatNumber(valorTotal);

    // Conversões para BRL
    const valorFOB_BRL = valorTotal * taxa;
    const freteInt = (parseFloat(document.getElementById('frete-internacional').value) || 0) * taxa;
    const seguro = (parseFloat(document.getElementById('seguro').value) || 0) * taxa;
    const tipoFrete = document.getElementById('tipo-frete').value;

    // Alíquotas
    const aliqII = parseFloat(document.getElementById('aliq-ii').value) || 0;
    const aliqIPI = parseFloat(document.getElementById('aliq-ipi').value) || 0;
    const aliqPIS = parseFloat(document.getElementById('aliq-pis').value) || 2.10;
    const aliqCOFINS = parseFloat(document.getElementById('aliq-cofins').value) || 9.65;
    const aliqICMS = parseFloat(document.getElementById('aliq-icms').value) || 18;
    const numAdicoes = parseInt(document.getElementById('num-adicoes').value) || 1;

    // Corredor MG
    const corredorMG = this.state.corredorMG;
    const percDiferimento = parseFloat(document.getElementById('perc-diferimento')?.value) || 100;
    const percCredito = parseFloat(document.getElementById('perc-credito')?.value) || 0;

    // Despesas
    const totalDespesas = this.state.despesas.reduce((sum, d) => sum + (d.valor || 0), 0);

    // Calcular
    const resultado = TaxCalculator.calcularImportacaoCompleta({
      valorFOB_BRL, freteInternacional_BRL: freteInt, seguro_BRL: seguro,
      aliquotaII: aliqII, aliquotaIPI: aliqIPI, aliquotaPIS: aliqPIS, aliquotaCOFINS: aliqCOFINS,
      aliquotaICMS: aliqICMS, tipoFrete, despesasAcessorias: totalDespesas,
      numAdicoes, corredorMG, percDiferimento, percCreditoPresumido: percCredito
    });

    this.state.resultados = resultado;
    const custoUnitario = qtd > 0 ? resultado.custoTotal / qtd : 0;

    // Atualizar UI - Impostos
    this.updateImpostosUI(resultado, aliqII, aliqIPI, aliqPIS, aliqCOFINS, aliqICMS);

    // Custo total
    document.getElementById('res-valor-merc').textContent = CurrencyService.formatBRL(valorFOB_BRL);
    document.getElementById('res-total-impostos').textContent = CurrencyService.formatBRL(resultado.totalImpostos);
    document.getElementById('res-total-despesas').textContent = CurrencyService.formatBRL(totalDespesas);
    document.getElementById('res-custo-total').textContent = CurrencyService.formatBRL(resultado.custoTotal);
    document.getElementById('res-custo-unitario').textContent = CurrencyService.formatBRL(custoUnitario);

    // Gráfico
    this.renderChart(resultado, totalDespesas, valorFOB_BRL);

    // Impostos de Saída
    this.calcularSaida(resultado, qtd, totalDespesas, aliqPIS, aliqCOFINS);

    // Check weight
    this.checkWeight();

    // Summary cards (section 10)
    const sumTotal = document.getElementById('sum-custo-total');
    const sumUnit = document.getElementById('sum-custo-unit');
    const sumImp = document.getElementById('sum-impostos');
    if (sumTotal) sumTotal.textContent = CurrencyService.formatBRL(resultado.custoTotal);
    if (sumUnit) sumUnit.textContent = CurrencyService.formatBRL(custoUnitario);
    if (sumImp) sumImp.textContent = CurrencyService.formatBRL(resultado.totalImpostos);
  },

  updateImpostosUI(res, aliqII, aliqIPI, aliqPIS, aliqCOFINS, aliqICMS) {
    const fmt = CurrencyService.formatBRL;
    document.getElementById('res-va').textContent = fmt(res.valorAduaneiro);
    document.getElementById('res-ii').textContent = fmt(res.ii);
    document.getElementById('res-ipi').textContent = fmt(res.ipi);
    document.getElementById('res-pis').textContent = fmt(res.pisImp);
    document.getElementById('res-cofins').textContent = fmt(res.cofinsImp);
    document.getElementById('res-icms').textContent = fmt(res.icmsInfo.icmsAPagar);
    document.getElementById('res-afrmm').textContent = fmt(res.afrmm);
    document.getElementById('res-siscomex').textContent = fmt(res.taxaSiscomex);

    // Corredor MG info
    const corredorInfo = document.getElementById('corredor-info');
    if (this.state.corredorMG && res.icmsInfo) {
      corredorInfo.style.display = 'block';
      document.getElementById('res-icms-cheio').textContent = fmt(res.icmsInfo.icmsCheio);
      document.getElementById('res-icms-diferido').textContent = fmt(res.icmsInfo.icmsDiferido);
      document.getElementById('res-credito-presumido').textContent = fmt(res.icmsInfo.creditoPresumido);
      document.getElementById('res-economia').textContent = fmt(res.icmsInfo.economiaTotal);
    } else {
      corredorInfo.style.display = 'none';
    }
  },

  renderChart(resultado, totalDespesas, valorFOB_BRL) {
    const items = [
      { label: 'Mercadoria (FOB)', value: valorFOB_BRL, color: 'c-blue' },
      { label: 'Imp. Importação (II)', value: resultado.ii, color: 'c-gold' },
      { label: 'IPI', value: resultado.ipi, color: 'c-purple' },
      { label: 'PIS + COFINS', value: resultado.pisImp + resultado.cofinsImp, color: 'c-cyan' },
      { label: 'ICMS', value: resultado.icmsInfo.icmsAPagar, color: 'c-red' },
      { label: 'Outras Taxas', value: resultado.afrmm + resultado.taxaSiscomex, color: 'c-pink' },
      { label: 'Despesas', value: totalDespesas, color: 'c-green' },
    ].filter(i => i.value > 0);

    const max = Math.max(...items.map(i => i.value), 1);
    const chart = document.getElementById('cost-chart');
    chart.innerHTML = items.map(i => {
      const pct = Math.max(3, (i.value / max) * 100);
      return `<div class="chart-bar">
        <span class="bar-label">${i.label}</span>
        <div class="bar-track"><div class="bar-fill ${i.color}" style="width:${pct}%">${CurrencyService.formatBRL(i.value)}</div></div>
      </div>`;
    }).join('');
  },

  // ============ IMPOSTOS DE SAÍDA ============
  calcularSaida(resultado, qtd, totalDespesas, aliqPIS, aliqCOFINS) {
    const precoVendaRJ = parseFloat(document.getElementById('preco-venda-rj').value) || 0;
    const precoVendaSP = parseFloat(document.getElementById('preco-venda-sp').value) || 0;
    const percCreditoSaida = parseFloat(document.getElementById('perc-credito-saida').value) || 0;
    const conteudoImportado = document.getElementById('conteudo-importado').checked;

    const creditosEntrada = {
      pis: resultado.pisImp,
      cofins: resultado.cofinsImp,
      icms: resultado.icmsInfo.icmsAPagar
    };

    // RJ
    if (precoVendaRJ > 0) {
      const saidaRJ = TaxCalculator.calcularImpostosSaida({
        precoVenda: precoVendaRJ, custoTotal: resultado.custoTotal,
        quantidade: qtd, estadoDestino: 'RJ',
        conteudoImportado, corredorMG: this.state.corredorMG,
        creditosEntrada, percCreditoSaida
      });
      this.renderSaidaUI('rj', saidaRJ);
    }

    // SP
    if (precoVendaSP > 0) {
      const saidaSP = TaxCalculator.calcularImpostosSaida({
        precoVenda: precoVendaSP, custoTotal: resultado.custoTotal,
        quantidade: qtd, estadoDestino: 'SP',
        conteudoImportado, corredorMG: this.state.corredorMG,
        creditosEntrada, percCreditoSaida
      });
      this.renderSaidaUI('sp', saidaSP);
    }
  },

  renderSaidaUI(estado, saida) {
    const fmt = CurrencyService.formatBRL;
    const pre = `res-${estado}`;
    document.getElementById(`${pre}-receita`).textContent = fmt(saida.receitaBruta);
    document.getElementById(`${pre}-icms-bruto`).textContent = fmt(saida.icmsBruto);
    document.getElementById(`${pre}-credito-saida`).textContent = fmt(saida.creditoPresumidoSaida);
    document.getElementById(`${pre}-perc-credito`).textContent = `${saida.percCreditoSaida}%`;
    document.getElementById(`${pre}-icms`).textContent = fmt(saida.icmsSaida);
    document.getElementById(`${pre}-icms-aliq`).textContent = `${saida.aliqICMSInter}%`;
    document.getElementById(`${pre}-difal`).textContent = fmt(saida.difalValor);
    document.getElementById(`${pre}-difal-aliq`).textContent = `${saida.difal}%`;
    document.getElementById(`${pre}-pis`).textContent = fmt(saida.pisAPagar);
    document.getElementById(`${pre}-cofins`).textContent = fmt(saida.cofinsAPagar);
    document.getElementById(`${pre}-irpj`).textContent = fmt(saida.irpjTotal);
    document.getElementById(`${pre}-csll`).textContent = fmt(saida.csll);
    document.getElementById(`${pre}-total`).textContent = fmt(saida.totalImpostosSaida);
    document.getElementById(`${pre}-lucro`).textContent = fmt(saida.lucroLiquido);
    document.getElementById(`${pre}-margem`).textContent = CurrencyService.formatNumber(saida.margemLiquida) + '%';
  },

  // ============ TABS ============
  switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
  },

  // ============ MANUAL CURRENCY ============
  applyManualRate(currency) {
    const val = parseFloat(document.getElementById(`manual-${currency.toLowerCase()}`).value);
    if (val > 0) {
      CurrencyService.setManualRate(currency, val);
      this.updateCurrencyUI({});
      this.recalcular();
    }
  },

  // ============ PRINT ============
  printReport() {
    const fmt = CurrencyService.formatBRL;
    const qtd = parseFloat(document.getElementById('quantidade').value) || 0;
    const moeda = this.state.moeda;
    const res = this.state.resultados;
    if (!res) { alert('Por favor, preencha os dados e calcule primeiro.'); return; }

    const totalDespesas = this.state.despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const precoVendaRJ = parseFloat(document.getElementById('preco-venda-rj').value) || 0;
    const precoVendaSP = parseFloat(document.getElementById('preco-venda-sp').value) || 0;
    const conteudoImportado = document.getElementById('conteudo-importado').checked;
    const creditosEntrada = { pis: res.pisImp, cofins: res.cofinsImp, icms: res.icmsInfo.icmsAPagar };

    let saidaRJ = null, saidaSP = null;
    if (precoVendaRJ > 0) {
      saidaRJ = TaxCalculator.calcularImpostosSaida({ precoVenda: precoVendaRJ, custoTotal: res.custoTotal, quantidade: qtd, estadoDestino: 'RJ', conteudoImportado, creditosEntrada });
    }
    if (precoVendaSP > 0) {
      saidaSP = TaxCalculator.calcularImpostosSaida({ precoVenda: precoVendaSP, custoTotal: res.custoTotal, quantidade: qtd, estadoDestino: 'SP', conteudoImportado, creditosEntrada });
    }

    const ncm = this.state.ncmSelected;
    const data = {
      produto: {
        ncm: document.getElementById('ncm-search').value,
        descNCM: ncm?.desc || document.getElementById('ncm-desc').textContent,
        descricao: document.getElementById('desc-produto').value,
        quantidade: qtd,
        unidade: document.getElementById('unidade').value,
        valorUnit: parseFloat(document.getElementById('valor-unitario').value) || 0,
        valorTotal: qtd * (parseFloat(document.getElementById('valor-unitario').value) || 0),
        moeda,
        pesoBruto: parseFloat(document.getElementById('peso-bruto').value) || 0,
        pesoLiquido: parseFloat(document.getElementById('peso-liquido').value) || 0,
      },
      alertas: ncm ? AlertSystem.getAlerts(ncm) : [],
      cambio: { USD: CurrencyService.rates.USD, EUR: CurrencyService.rates.EUR },
      valorAduaneiro: {
        fob: res.valorAduaneiro - (parseFloat(document.getElementById('frete-internacional').value) || 0) * CurrencyService.getRate(moeda) - (parseFloat(document.getElementById('seguro').value) || 0) * CurrencyService.getRate(moeda),
        frete: (parseFloat(document.getElementById('frete-internacional').value) || 0) * CurrencyService.getRate(moeda),
        seguro: (parseFloat(document.getElementById('seguro').value) || 0) * CurrencyService.getRate(moeda),
        total: res.valorAduaneiro,
      },
      aliquotas: {
        ii: parseFloat(document.getElementById('aliq-ii').value) || 0,
        ipi: parseFloat(document.getElementById('aliq-ipi').value) || 0,
        pis: parseFloat(document.getElementById('aliq-pis').value) || 2.10,
        cofins: parseFloat(document.getElementById('aliq-cofins').value) || 9.65,
        icms: parseFloat(document.getElementById('aliq-icms').value) || 18,
      },
      impostos: res,
      corredorMG: this.state.corredorMG,
      despesas: this.state.despesas.filter(d => d.valor > 0),
      custoTotal: {
        valorMercadoria: res.valorAduaneiro,
        totalImpostos: res.totalImpostos,
        totalDespesas: totalDespesas,
        total: res.custoTotal,
        unitario: qtd > 0 ? res.custoTotal / qtd : 0,
      },
      saida: { RJ: saidaRJ, SP: saidaSP },
    };

    PrintService.print(data);
  },

  // ============ BIND EVENTS ============
  bindEvents() {
    // NCM search
    const ncmInput = document.getElementById('ncm-search');
    ncmInput.addEventListener('input', (e) => this.handleNCMSearch(e.target.value));
    ncmInput.addEventListener('blur', () => setTimeout(() => document.getElementById('ncm-results').classList.remove('active'), 200));

    // Currency
    document.getElementById('btn-refresh-currency').addEventListener('click', () => this.refreshCurrency());
    document.getElementById('select-moeda').addEventListener('change', () => { this.updateCurrencyLabel(); this.recalcular(); });

    // Recalculate on any input change
    document.querySelectorAll('.calc-input').forEach(el => {
      el.addEventListener('input', () => this.recalcular());
      el.addEventListener('change', () => this.recalcular());
    });

    // Toggle corredor
    document.getElementById('toggle-corredor').addEventListener('click', () => this.toggleCorredor());

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Print
    document.getElementById('btn-print').addEventListener('click', () => this.printReport());

    // Manual currency
    document.getElementById('btn-apply-usd').addEventListener('click', () => this.applyManualRate('USD'));
    document.getElementById('btn-apply-eur').addEventListener('click', () => this.applyManualRate('EUR'));
  }
};

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
