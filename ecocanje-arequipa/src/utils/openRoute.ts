import { Linking, Platform } from 'react-native';

export async function openRoute(
  lat: number,
  lng: number,
  placeId?: string,
): Promise<void> {
  const web =
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` +
    (placeId ? `&destination_place_id=${placeId}` : '') +
    `&travelmode=driving`;

  const native = Platform.select({
    ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
    android: `google.navigation:q=${lat},${lng}`,
  });

  try {
    if (native && (await Linking.canOpenURL(native))) {
      await Linking.openURL(native);
      return;
    }
  } catch {
    // ignore and fall back to web
  }
  await Linking.openURL(web);
}

export async function llamar(telefono: string): Promise<void> {
  const numero = telefono.replace(/\s+/g, '');
  await Linking.openURL(`tel:${numero}`);
}
