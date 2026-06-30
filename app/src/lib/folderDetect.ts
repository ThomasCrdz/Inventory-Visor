import type { SourceKey } from '../types';

export function detectSourceKey(filename: string): SourceKey | null {
  const n = filename.toLowerCase();

  if (n.includes('unidades'))                              return 'unidades';
  if (n.includes('inventory_custom') || n.includes('inventory custom') || n.includes('inventorycustom')) return 'invCustom';
  if (n.includes('inventoryreport') || n.includes('inventory_report') || n.includes('inventoryreport')) return 'inventory';
  if (n.includes('listado de hardware') || n.includes('listado_de_hardware') || n.includes('listado hardware')) return 'hardware';
  if (n.includes('hardware_list') || n.includes('hardware list'))  return 'hwList';
  if (n.startsWith('sims') || n.includes('m2m sims') || n.includes('m2m_sims')) return 'sims';
  if (n.startsWith('pod ') || n === 'pod' || n.startsWith('pod_')) return 'pod';
  if (n.includes('provisional') || n.includes('imei gen3') || n.includes('imei_gen3')) return 'imeiExtra';
  if (n.includes('versiones') || n.includes('howen') || n.includes('ffc versiones')) return 'ffcVersiones';

  return null;
}
