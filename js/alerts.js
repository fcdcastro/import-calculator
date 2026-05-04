// Sistema de alertas legais e fiscais
const AlertSystem = {
  getAlerts(ncmItem) {
    if (!ncmItem || !ncmItem.alerts) return [];
    return ncmItem.alerts.map(alertText => {
      let type = 'info';
      let icon = 'ℹ️';
      if (alertText.toLowerCase().includes('antidumping')) { type = 'danger'; icon = '⚠️'; }
      else if (alertText.toLowerCase().includes('proibid') || alertText.toLowerCase().includes('controlado')) { type = 'danger'; icon = '🚫'; }
      else if (alertText.toLowerCase().includes('anuência') || alertText.toLowerCase().includes('requer li')) { type = 'warning'; icon = '📋'; }
      else if (alertText.toLowerCase().includes('ex-tarifário')) { type = 'success'; icon = '💰'; }
      else if (alertText.toLowerCase().includes('cota') || alertText.toLowerCase().includes('verificar')) { type = 'warning'; icon = '⚠️'; }
      return { text: alertText, type, icon };
    });
  },

  renderAlerts(ncmItem) {
    const alerts = this.getAlerts(ncmItem);
    if (alerts.length === 0) return '';
    return alerts.map(a =>
      `<div class="alert alert-${a.type}"><span class="alert-icon">${a.icon}</span><span>${a.text}</span></div>`
    ).join('');
  },

  checkWeightAlert(containerKey, weightKg) {
    const result = checkWeightLimit(containerKey, weightKg);
    if (!result.ok) {
      return `<div class="alert alert-danger"><span class="alert-icon">⚠️</span><span>${result.msg}</span></div>`;
    }
    if (result.percentual > 90) {
      return `<div class="alert alert-warning"><span class="alert-icon">⚠️</span><span>Atenção: ${result.msg}</span></div>`;
    }
    return `<div class="alert alert-success"><span class="alert-icon">✅</span><span>${result.msg}</span></div>`;
  }
};
