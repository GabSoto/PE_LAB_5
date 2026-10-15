import { useEffect, useState } from 'react';

import * as Location from 'expo-location';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export const PLAZA_DE_ARMAS_AREQUIPA: Coordenadas = {
  lat: -16.3989,
  lng: -71.535,
};

export type UbicacionEstado = 'cargando' | 'concedido' | 'denegado';

interface Ubicacion {
  coords: Coordenadas;
  estado: UbicacionEstado;
}

export function useLocation(): Ubicacion {
  const [estado, setEstado] = useState<UbicacionEstado>('cargando');
  const [coords, setCoords] = useState<Coordenadas>(PLAZA_DE_ARMAS_AREQUIPA);

  useEffect(() => {
    let activo = true;

    async function resolver() {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();
        if (permiso.status !== 'granted') {
          if (activo) setEstado('denegado');
          return;
        }

        const posicion = await Location.getLastKnownPositionAsync({
          maxAge: 5 * 60 * 1000,
        });
        if (!posicion) {
          const actual = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (activo) {
            setCoords({
              lat: actual.coords.latitude,
              lng: actual.coords.longitude,
            });
            setEstado('concedido');
          }
          return;
        }

        if (activo) {
          setCoords({
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude,
          });
          setEstado('concedido');
        }
      } catch {
        if (activo) setEstado('denegado');
      }
    }

    resolver();

    return () => {
      activo = false;
    };
  }, []);

  return { coords, estado };
}
