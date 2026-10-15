import { useMemo } from 'react';

import { puntos } from '@/data';
import type { Categoria, PuntoAcopio } from '@/types';
import { distanciaKm } from '@/utils/distance';

export interface PuntoConDistancia extends PuntoAcopio {
  distanciaKm: number;
}

export function useFilteredPoints(
  seleccionadas: Categoria[],
  ubicacion?: { lat: number; lng: number },
): PuntoConDistancia[] {
  return useMemo(() => {
    const filtradas =
      seleccionadas.length === 0
        ? puntos
        : puntos.filter((p) =>
            p.categorias_aceptadas.some((c) => seleccionadas.includes(c)),
          );

    const conDistancia = filtradas.map((p) => ({
      ...p,
      distanciaKm: ubicacion
        ? distanciaKm(ubicacion.lat, ubicacion.lng, p.lat, p.lng)
        : Number.POSITIVE_INFINITY,
    }));

    return conDistancia.sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [seleccionadas, ubicacion]);
}
