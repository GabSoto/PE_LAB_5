# EcoCanje Arequipa

App móvil (Android + iOS) para ubicar centros de acopio de residuos reciclables en Arequipa y sugerir nuevos puntos.

Consulta la especificación completa en [`EcoCanje_Arequipa_Especificacion.md`](./EcoCanje_Arequipa_Especificacion.md).

## Stack

- **React Native + Expo (SDK 57) + TypeScript**
- **Expo Router** (file-based routing)
- `react-native-maps` (mapa), `expo-location` (ubicación), `expo-image-picker` (foto)
- `zustand` + `@react-native-async-storage/async-storage` (estado persistente)
- Datos locales en `ecocanje-arequipa/src/data/puntos_reciclaje_arequipa.json`

## Estructura

```
ecocanje-arequipa/
└── src/
    ├── app/          → rutas (Expo Router): inicio, reportar, perfil, punto/[id]
    ├── components/   → chips, tarjeta, mapa, badges
    ├── hooks/        → useLocation, useFilteredPoints
    ├── store/        → useEcoStore (zustand persistido)
    ├── utils/        → distance, openRoute, categories
    ├── theme/        → colors, spacing
    ├── types/        → modelos de datos
    ├── data/         → dataset local
    └── i18n/         → textos en español
```

## Requisitos

- Node.js 20+
- Para ejecutar en un dispositivo/emulador: Android Studio (o EAS Build para iOS)

## Ejecución

```bash
cd ecocanje-arequipa
npm install
npx expo start
```

> **Nota sobre el mapa:** `react-native-maps` incluye código nativo y **no está disponible en Expo Go**. Usa un *development build*:
>
> ```bash
> npx expo run:android   # requiere Android Studio
> ```
>
> o crea uno en la nube: `npx eas build --profile development`.

### Google Maps en Android

Para que los tiles del mapa carguen en Android se requiere una API key de Google Maps SDK. Agrega la clave en `ecocanje-arequipa/app.json`:

```json
"android": {
  "config": { "googleMaps": { "apiKey": "TU_API_KEY" } }
}
```

En iOS el mapa usa Apple Maps por defecto (sin key). El deep link a Google Maps para rutas ya está configurado (`comgooglemaps`).

## Verificación

```bash
cd ecocanje-arequipa
npx tsc --noEmit
npx expo-doctor
```

## Dataset

Los puntos iniciales provienen de Google Maps y notas de prensa (consultado el 14/10/2026). Los registros `verificacion: "por_verificar"` deben confirmarse antes de publicarse como confiables.
