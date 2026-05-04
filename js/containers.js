// Dados de contêineres — tipos e capacidades
const CONTAINERS = {
  "dry_20": { name: "Dry Standard 20'", type: "Dry", size: "20 pés", tara: 2200, cargaUtil: 28000, volumeM3: 33.2, compInt: 5.9, largInt: 2.35, altInt: 2.39 },
  "dry_40": { name: "Dry Standard 40'", type: "Dry", size: "40 pés", tara: 3800, cargaUtil: 28700, volumeM3: 67.7, compInt: 12.03, largInt: 2.35, altInt: 2.39 },
  "dry_40hc": { name: "Dry High Cube 40'", type: "Dry", size: "40 HC", tara: 3900, cargaUtil: 28500, volumeM3: 76.3, compInt: 12.03, largInt: 2.35, altInt: 2.69 },
  "reefer_20": { name: "Reefer 20'", type: "Reefer", size: "20 pés", tara: 3100, cargaUtil: 21000, volumeM3: 28.3, compInt: 5.44, largInt: 2.29, altInt: 2.27 },
  "reefer_40": { name: "Reefer 40'", type: "Reefer", size: "40 pés", tara: 4800, cargaUtil: 26000, volumeM3: 59.3, compInt: 11.58, largInt: 2.29, altInt: 2.24 },
  "reefer_40hc": { name: "Reefer High Cube 40'", type: "Reefer", size: "40 HC", tara: 5200, cargaUtil: 29000, volumeM3: 67.5, compInt: 11.58, largInt: 2.29, altInt: 2.54 },
  "opentop_20": { name: "Open Top 20'", type: "Open Top", size: "20 pés", tara: 2200, cargaUtil: 28000, volumeM3: 32.5, compInt: 5.9, largInt: 2.35, altInt: 2.35 },
  "opentop_40": { name: "Open Top 40'", type: "Open Top", size: "40 pés", tara: 3800, cargaUtil: 26500, volumeM3: 66.4, compInt: 12.03, largInt: 2.35, altInt: 2.35 },
  "flatrack_20": { name: "Flat Rack 20'", type: "Flat Rack", size: "20 pés", tara: 2700, cargaUtil: 28200, volumeM3: null, compInt: 5.7, largInt: 2.23, altInt: 2.23 },
  "flatrack_40": { name: "Flat Rack 40'", type: "Flat Rack", size: "40 pés", tara: 4200, cargaUtil: 39000, volumeM3: null, compInt: 12.08, largInt: 2.40, altInt: 2.14 },
  "tank_20": { name: "Tank Container 20'", type: "Tank", size: "20 pés", tara: 3600, cargaUtil: 26000, volumeM3: 26, compInt: null, largInt: null, altInt: null },
};

function getContainerInfo(key) {
  return CONTAINERS[key] || null;
}

function getAllContainers() {
  return Object.entries(CONTAINERS).map(([key, val]) => ({ id: key, ...val }));
}

function checkWeightLimit(containerKey, weightKg) {
  const c = CONTAINERS[containerKey];
  if (!c) return { ok: false, msg: "Contêiner não encontrado" };
  if (weightKg > c.cargaUtil) {
    return { ok: false, msg: `Peso excede o limite! ${weightKg.toLocaleString('pt-BR')} kg > ${c.cargaUtil.toLocaleString('pt-BR')} kg (limite)`, excesso: weightKg - c.cargaUtil };
  }
  const pct = ((weightKg / c.cargaUtil) * 100).toFixed(1);
  return { ok: true, msg: `${pct}% da capacidade utilizada`, percentual: parseFloat(pct) };
}
