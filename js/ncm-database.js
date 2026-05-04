// Base de dados de NCMs com alíquotas e alertas
const NCM_DATABASE = [
  // CAPÍTULO 01-05: ANIMAIS VIVOS E PRODUTOS DO REINO ANIMAL
  { ncm: "0201.10.00", desc: "Carcaças e meias-carcaças de bovino, frescas ou refrigeradas", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência VIGIAGRO/MAPA"] },
  { ncm: "0304.61.00", desc: "Filés de tilápias, congelados", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência VIGIAGRO/MAPA"] },
  { ncm: "0402.10.10", desc: "Leite em pó, granulado, teor de gordura ≤1,5%", ii: 14, ipi: 0, pis: 0, cofins: 0, alerts: ["Produto sujeito a cota tarifária", "Requer LI"] },

  // CAPÍTULO 15: GORDURAS E ÓLEOS (COMPLETO)
  { ncm: "1507.10.00", desc: "Óleo de soja em bruto, mesmo degomado", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA"] },
  { ncm: "1507.90.11", desc: "Óleo de soja refinado", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA"] },
  { ncm: "1508.10.00", desc: "Óleo de amendoim em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1509.20.00", desc: "Azeite de oliva extra virgem", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["⭐ PRODUTO DESTAQUE", "Requer anuência ANVISA/MAPA", "Verificar classificação de pureza"] },
  { ncm: "1509.30.00", desc: "Azeite de oliva virgem", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA/MAPA"] },
  { ncm: "1509.40.10", desc: "Outros azeites de oliva virgens (Tipo Único)", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1510.10.00", desc: "Óleo de bagaço de azeitona em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1511.10.00", desc: "Óleo de palma em bruto (Dendê)", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1511.90.00", desc: "Óleo de palma refinado", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1512.11.10", desc: "Óleo de girassol em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1512.19.11", desc: "Óleo de girassol refinado", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1513.11.00", desc: "Óleo de coco (copra) em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1513.21.10", desc: "Óleo de amêndoa de palma (palmiste) em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1514.11.00", desc: "Óleo de nabo ou de colza em bruto (baixo teor de ácido erúcico)", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1515.11.00", desc: "Óleo de linhaça em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1515.21.00", desc: "Óleo de milho em bruto", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1515.30.00", desc: "Óleo de rícino e suas frações", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1515.50.00", desc: "Óleo de gergelim e suas frações", ii: 10, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "1516.20.00", desc: "Gorduras e óleos vegetais hidrogenados", ii: 12, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Verificar restrições de gordura trans"] },
  { ncm: "1517.10.00", desc: "Margarina (exceto margarina líquida)", ii: 16, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA"] },
  { ncm: "1517.90.10", desc: "Misturas de óleos vegetais refinados", ii: 16, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },

  // CAPÍTULO 17-21: ALIMENTOS PREPARADOS
  { ncm: "1701.14.00", desc: "Açúcar de cana, em bruto", ii: 16, ipi: 5, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "2103.90.91", desc: "Molho Pesto e preparações para molhos", ii: 16, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA"] },
  { ncm: "2106.90.10", desc: "Preparações alimentícias (concentrados de proteínas)", ii: 16, ipi: 5, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA"] },

  // CAPÍTULO 22: BEBIDAS E LÍQUIDOS ALCOÓLICOS (EXPANDIDO)
  { ncm: "2201.10.00", desc: "Águas minerais e águas gaseificadas", ii: 20, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA/MAPA"] },
  { ncm: "2202.10.00", desc: "Águas com adição de açúcar ou de outros edulcorantes (Refrigerantes)", ii: 20, ipi: 4, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA"] },
  { ncm: "2202.99.00", desc: "Outras bebidas não alcoólicas (Néctares de frutas)", ii: 20, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA"] },
  { ncm: "2203.00.00", desc: "Cervejas de malte", ii: 20, ipi: 6, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI obrigatório"] },
  { ncm: "2204.10.10", desc: "Vinhos espumantes (Champanhe)", ii: 20, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2204.21.00", desc: "Vinhos de uvas frescas em recipientes <= 2l", ii: 20, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2204.29.10", desc: "Vinhos de uvas frescas em recipientes > 10l (Granel)", ii: 20, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA"] },
  { ncm: "2205.10.00", desc: "Vermutes e outros vinhos de uvas frescas (aromatizados)", ii: 20, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA"] },
  { ncm: "2206.00.90", desc: "Outras bebidas fermentadas (Sidra, saquê)", ii: 20, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA"] },
  { ncm: "2207.10.10", desc: "Álcool etílico não desnaturado >= 80% (Para fins industriais)", ii: 20, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA/Cex"] },
  { ncm: "2208.20.00", desc: "Aguardentes de vinho ou de bagaço (Conhaque, Brandy)", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.30.10", desc: "Uísques em recipientes <= 2l", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.30.20", desc: "Uísque (outros)", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.40.00", desc: "Rum e outras aguardentes de cana", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.50.00", desc: "Gim e aguardentes de zimbro", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.60.00", desc: "Vodca", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.70.00", desc: "Licores", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2208.90.00", desc: "Tequila, Pisco e outras bebidas espirituosas", ii: 20, ipi: 30, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA", "Selo de IPI"] },
  { ncm: "2209.00.00", desc: "Vinagres e seus sucedâneos", ii: 20, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência MAPA"] },

  // OUTROS CAPÍTULOS
  { ncm: "2523.29.10", desc: "Cimento Portland", ii: 10, ipi: 5, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "2710.12.59", desc: "Outras gasolinas", ii: 0, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Produto controlado ANP", "Requer LI"] },
  { ncm: "2811.21.00", desc: "Dióxido de carbono", ii: 12, ipi: 5, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "3004.90.99", desc: "Medicamentos dosados para venda a retalho", ii: 8, ipi: 0, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA", "Requer LI"] },
  { ncm: "3304.99.10", desc: "Produtos de beleza/maquiagem", ii: 18, ipi: 12, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANVISA"] },
  { ncm: "3926.90.90", desc: "Outras obras de plásticos", ii: 18, ipi: 10, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "4011.10.00", desc: "Pneus novos de borracha para automóveis", ii: 16, ipi: 15, pis: 2.10, cofins: 9.65, alerts: ["Verificar INMETRO", "Antidumping"] },
  { ncm: "6109.10.00", desc: "T-shirts de malha de algodão", ii: 35, ipi: 0, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "6403.99.90", desc: "Calçados com sola de borracha e parte superior de couro", ii: 35, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Antidumping China"] },
  { ncm: "7318.15.00", desc: "Parafusos e porcas de ferro/aço", ii: 18, ipi: 10, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "8471.30.19", desc: "Notebooks / computadores portáteis", ii: 16, ipi: 15, pis: 2.10, cofins: 9.65, alerts: [] },
  { ncm: "8517.12.99", desc: "Telefones celulares", ii: 16, ipi: 15, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência ANATEL"] },
  { ncm: "8703.23.10", desc: "Automóveis de passageiros 1500-3000cc", ii: 35, ipi: 25, pis: 2.10, cofins: 9.65, alerts: ["Requer LI"] },
  { ncm: "9503.00.99", desc: "Outros brinquedos", ii: 20, ipi: 10, pis: 2.10, cofins: 9.65, alerts: ["Requer anuência INMETRO"] },
];

// Função de busca por NCM ou descrição
function searchNCM(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().replace(/[.\-\s]/g, '');
  return NCM_DATABASE.filter(item => {
    const ncmClean = item.ncm.replace(/[.\-\s]/g, '');
    return ncmClean.includes(q) || item.desc.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 15);
}

function getNCMByCode(code) {
  const clean = code.replace(/[.\-\s]/g, '');
  return NCM_DATABASE.find(item => item.ncm.replace(/[.\-\s]/g, '') === clean) || null;
}
