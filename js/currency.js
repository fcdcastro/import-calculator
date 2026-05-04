// Integração com AwesomeAPI para cotações de moedas
const CurrencyService = {
  rates: { USD: null, EUR: null },
  lastUpdate: null,
  loading: false,

  async fetchRates() {
    this.loading = true;
    try {
      const resp = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL');
      if (!resp.ok) throw new Error('Falha na API');
      const data = await resp.json();
      this.rates.USD = parseFloat(data.USDBRL.bid);
      this.rates.EUR = parseFloat(data.EURBRL.bid);
      this.lastUpdate = new Date();
      this.loading = false;
      return { success: true, rates: { ...this.rates }, lastUpdate: this.lastUpdate };
    } catch (err) {
      this.loading = false;
      console.error('Erro ao buscar cotações:', err);
      // Fallback values
      if (!this.rates.USD) this.rates.USD = 5.70;
      if (!this.rates.EUR) this.rates.EUR = 6.20;
      return { success: false, error: err.message, rates: { ...this.rates } };
    }
  },

  getRate(currency) {
    if (currency === 'BRL') return 1;
    return this.rates[currency] || 0;
  },

  convert(value, fromCurrency) {
    const rate = this.getRate(fromCurrency);
    return value * rate;
  },

  setManualRate(currency, rate) {
    if (currency === 'USD' || currency === 'EUR') {
      this.rates[currency] = parseFloat(rate);
    }
  },

  formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  },

  formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  }
};
