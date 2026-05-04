// Motor de cálculos tributários para importação e saída
const TaxCalculator = {

  // =============== IMPOSTOS DE ENTRADA (IMPORTAÇÃO) ===============

  calcularII(valorAduaneiro, aliquotaII) {
    return valorAduaneiro * (aliquotaII / 100);
  },

  calcularIPI(valorAduaneiro, ii, aliquotaIPI) {
    return (valorAduaneiro + ii) * (aliquotaIPI / 100);
  },

  calcularPISImportacao(valorAduaneiro, aliquotaPIS = 2.10) {
    return valorAduaneiro * (aliquotaPIS / 100);
  },

  calcularCOFINSImportacao(valorAduaneiro, aliquotaCOFINS = 9.65) {
    return valorAduaneiro * (aliquotaCOFINS / 100);
  },

  calcularBaseICMS(valorAduaneiro, ii, ipi, pis, cofins, despesasAduaneiras, aliquotaICMS) {
    // ICMS calculado "por dentro"
    const numerador = valorAduaneiro + ii + ipi + pis + cofins + despesasAduaneiras;
    const base = numerador / (1 - (aliquotaICMS / 100));
    return base;
  },

  calcularICMS(baseICMS, aliquotaICMS) {
    return baseICMS * (aliquotaICMS / 100);
  },

  calcularAFRMM(freteMaritimoBRL) {
    return freteMaritimoBRL * 0.25; // 25% do frete marítimo
  },

  calcularTaxaSiscomex(numAdicoes = 1) {
    const taxaBase = 214.50;
    const taxaAdicao = 107.00;
    return taxaBase + (Math.max(0, numAdicoes - 1) * taxaAdicao);
  },

  // =============== CORREDOR DE IMPORTAÇÃO MG ===============

  calcularICMSCorredorMG(baseICMS, aliquotaICMS, percDiferimento = 100, percCreditoPresumido = 0) {
    const icmsCheio = baseICMS * (aliquotaICMS / 100);
    const icmsDiferido = icmsCheio * (percDiferimento / 100);
    const icmsAPagar = icmsCheio - icmsDiferido;
    const creditoPresumido = icmsCheio * (percCreditoPresumido / 100);
    return {
      icmsCheio,
      icmsDiferido,
      icmsAPagar,
      creditoPresumido,
      economiaTotal: icmsDiferido + creditoPresumido
    };
  },

  // =============== CÁLCULO COMPLETO DE IMPORTAÇÃO ===============

  calcularImportacaoCompleta(params) {
    const {
      valorFOB_BRL, freteInternacional_BRL, seguro_BRL,
      aliquotaII, aliquotaIPI, aliquotaPIS = 2.10, aliquotaCOFINS = 9.65,
      aliquotaICMS = 18, tipoFrete = 'maritimo',
      despesasAcessorias = 0, numAdicoes = 1,
      corredorMG = false, percDiferimento = 100, percCreditoPresumido = 0
    } = params;

    // 1. Valor Aduaneiro
    const valorAduaneiro = valorFOB_BRL + freteInternacional_BRL + seguro_BRL;

    // 2. Impostos federais
    const ii = this.calcularII(valorAduaneiro, aliquotaII);
    const ipi = this.calcularIPI(valorAduaneiro, ii, aliquotaIPI);
    const pisImp = this.calcularPISImportacao(valorAduaneiro, aliquotaPIS);
    const cofinsImp = this.calcularCOFINSImportacao(valorAduaneiro, aliquotaCOFINS);

    // 3. AFRMM (se marítimo)
    const afrmm = tipoFrete === 'maritimo' ? this.calcularAFRMM(freteInternacional_BRL) : 0;

    // 4. Taxa Siscomex
    const taxaSiscomex = this.calcularTaxaSiscomex(numAdicoes);

    // 5. Despesas aduaneiras para base ICMS
    const despesasAduaneiras = afrmm + taxaSiscomex;

    // 6. ICMS
    const baseICMS = this.calcularBaseICMS(valorAduaneiro, ii, ipi, pisImp, cofinsImp, despesasAduaneiras, aliquotaICMS);
    let icmsInfo;
    if (corredorMG) {
      icmsInfo = this.calcularICMSCorredorMG(baseICMS, aliquotaICMS, percDiferimento, percCreditoPresumido);
    } else {
      const icms = this.calcularICMS(baseICMS, aliquotaICMS);
      icmsInfo = { icmsCheio: icms, icmsDiferido: 0, icmsAPagar: icms, creditoPresumido: 0, economiaTotal: 0 };
    }

    // 7. Total de impostos
    const totalImpostos = ii + ipi + pisImp + cofinsImp + icmsInfo.icmsAPagar + afrmm + taxaSiscomex;

    // 8. Custo total
    const custoTotal = valorFOB_BRL + freteInternacional_BRL + seguro_BRL + totalImpostos + despesasAcessorias;

    return {
      valorAduaneiro,
      ii, ipi, pisImp, cofinsImp,
      baseICMS, icmsInfo,
      afrmm, taxaSiscomex,
      totalImpostos,
      despesasAcessorias,
      custoTotal
    };
  },

  // =============== IMPOSTOS DE SAÍDA (VENDA) — LUCRO REAL TRIMESTRAL ===============

  calcularImpostosSaida(params) {
    const {
      precoVenda, custoTotal, quantidade = 1,
      estadoDestino = 'RJ', // 'RJ' ou 'SP'
      conteudoImportado = true, // > 40% conteúdo importado
      corredorMG = false,
      creditosEntrada = {} // { pis, cofins, icms }
    } = params;

    const receitaBruta = precoVenda * quantidade;
    const custoMerc = custoTotal;

    // ICMS Interestadual
    // MG → RJ/SP (Sul/Sudeste): 12% normal, 4% se conteúdo importado > 40%
    const aliqICMSInter = conteudoImportado ? 4 : 12;

    // Alíquotas internas destino
    const aliqICMSInterna = estadoDestino === 'SP' ? 18 : (estadoDestino === 'RJ' ? 20 : 18);

    // DIFAL (Diferencial de Alíquota) - para vendas a consumidor final
    const difal = Math.max(0, aliqICMSInterna - aliqICMSInter);

    // ICMS na saída
    const icmsBruto = receitaBruta * (aliqICMSInter / 100);
    const percCreditoSaida = params.percCreditoSaida || 0;
    const creditoPresumidoSaida = receitaBruta * (percCreditoSaida / 100);
    const icmsSaida = icmsBruto - creditoPresumidoSaida;
    const difalValor = receitaBruta * (difal / 100);

    // PIS/COFINS Saída (não cumulativo - Lucro Real)
    const pisSaida = receitaBruta * 0.0165; // 1,65%
    const cofinsSaida = receitaBruta * 0.076; // 7,60%

    // Créditos de PIS/COFINS da entrada
    const creditoPIS = creditosEntrada.pis || 0;
    const creditoCOFINS = creditosEntrada.cofins || 0;

    const pisAPagar = Math.max(0, pisSaida - creditoPIS);
    const cofinsAPagar = Math.max(0, cofinsSaida - creditoCOFINS);

    // Lucro bruto estimado
    const lucroBruto = receitaBruta - custoMerc - icmsSaida - pisAPagar - cofinsAPagar;

    // IRPJ (15% + adicional 10% sobre excedente de R$ 60k/trimestre)
    const irpjBase = lucroBruto > 0 ? lucroBruto * 0.15 : 0;
    const irpjAdicional = lucroBruto > 60000 ? (lucroBruto - 60000) * 0.10 : 0;
    const irpjTotal = irpjBase + irpjAdicional;

    // CSLL (9%)
    const csll = lucroBruto > 0 ? lucroBruto * 0.09 : 0;

    // Total impostos saída
    const totalImpostosSaida = icmsSaida + pisAPagar + cofinsAPagar + irpjTotal + csll;

    // Lucro líquido
    const lucroLiquido = lucroBruto - irpjTotal - csll;
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    return {
      receitaBruta,
      estadoDestino,
      aliqICMSInter,
      aliqICMSInterna,
      icmsBruto,
      percCreditoSaida,
      creditoPresumidoSaida,
      icmsSaida,
      difal,
      difalValor,
      pisSaida,
      cofinsSaida,
      creditoPIS,
      creditoCOFINS,
      pisAPagar,
      cofinsAPagar,
      lucroBruto,
      irpjBase,
      irpjAdicional,
      irpjTotal,
      csll,
      totalImpostosSaida,
      lucroLiquido,
      margemLiquida
    };
  }
};
