import { StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { PuntoConDistancia } from '@/hooks/useFilteredPoints';
import { colorPrimarioDe } from '@/utils/categories';

interface Props {
  puntos: PuntoConDistancia[];
  region: Region;
  onPressMarker: (punto: PuntoConDistancia) => void;
}

export function PuntosMapa({ puntos, region, onPressMarker }: Props) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      region={region}
    >
      {puntos.map((punto) => (
        <Marker
          key={punto.id}
          coordinate={{ latitude: punto.lat, longitude: punto.lng }}
          onPress={() => onPressMarker(punto)}
          title={punto.nombre}
          tracksViewChanges={false}
        >
          <View
            accessible
            accessibilityLabel={punto.nombre}
            style={[
              styles.pin,
              { backgroundColor: colorPrimarioDe(punto) },
            ]}
          />
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
