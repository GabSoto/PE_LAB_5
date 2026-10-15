import raw from './puntos_reciclaje_arequipa.json';
import type { Dataset, PuntoAcopio } from '@/types';

export const dataset = raw as unknown as Dataset;

export const puntos: PuntoAcopio[] = dataset.puntos;

export function buscarPunto(id: string): PuntoAcopio | undefined {
  return puntos.find((p) => p.id === id);
}
