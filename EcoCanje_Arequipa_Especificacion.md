# EcoCanje Arequipa — Especificación técnica (React Native)

App móvil multiplataforma (Android + iOS) para ubicar centros de acopio de residuos reciclables en Arequipa.

---

## 1. Problema y objetivo

**Problema:** los ciudadanos no saben dónde llevar plástico, vidrio, pilas, cartón o electrónicos.

**Objetivo del MVP:** que una persona encuentre, en menos de 3 toques, el punto de acopio más cercano que acepte su residuo y llegue con Google Maps. Además, que pueda sugerir nuevos puntos.

**Usuarios:** vecinos de Arequipa metropolitana, estudiantes y colegios, pequeñas empresas.

---

## 2. Stack tecnológico

| Capa | Elección | Motivo |
|---|---|---|
| Framework | **React Native + Expo (SDK actual) + TypeScript** | Un solo código para Android/iOS, builds con EAS |
| Navegación | `@react-navigation/native` + `bottom-tabs` + `native-stack` | Estándar de la industria |
| Mapa | `react-native-maps` (Google Maps en Android, Apple Maps o Google en iOS) | Marcadores y región |
| Ubicación | `expo-location` | Distancia al usuario |
| Fotos | `expo-image-picker` | Foto opcional en el reporte |
| Estado global | `zustand` | Simple, sin boilerplate |
| Persistencia local | `@react-native-async-storage/async-storage` | Historial y contador sin backend |
| Abrir rutas | `Linking` (nativo de RN) | Deep link a Google Maps |
| Datos (MVP) | JSON local → luego Firebase Firestore / Supabase | Empezar sin servidor |
| Formularios | `react-hook-form` (opcional) | Validación sencilla |

> Si se usa Google Maps en iOS, se requiere API key de Google Maps SDK. En Android también para builds de producción.

---

## 3. Arquitectura de navegación

```
RootNavigator (Native Stack)
├── MainTabs (Bottom Tabs)
│   ├── Tab "Inicio"   → HomeScreen          (Pantalla 1: Mapa + Lista)
│   ├── Tab "Reportar" → ReportScreen        (Pantalla 3: Formulario)
│   └── Tab "Perfil"   → ProfileScreen       (Pantalla 4: Historial)
└── PointDetailScreen  (Pantalla 2: push desde Inicio)
```

---

## 4. Pantallas

### 4.1 Pantalla 1 — Inicio (Mapa y Lista)

**Objetivo:** descubrir puntos cercanos y filtrarlos.

**Componentes**
- `SearchHeader`: título y selector de vista **Mapa | Lista** (segmented control).
- `CategoryFilterChips`: chips multi-selección: `Plástico`, `Cartón`, `Electrónicos` (+ `Vidrio`, `Pilas`, `Papel`, `Metal` en scroll horizontal).
- `MapView` con `Marker` por punto (color según categoría principal). Al tocar un marcador se muestra una tarjeta resumen inferior.
- `PointCard` (lista): nombre, distancia, chips de categorías, estado de verificación.
- Botón flotante "Mi ubicación".

**Comportamiento**
1. Al abrir, pide permiso de ubicación. Si se niega, centra el mapa en la Plaza de Armas de Arequipa (`-16.3989, -71.5350`).
2. Calcula distancia (fórmula Haversine) y ordena la lista por cercanía.
3. Filtros: un punto aparece si acepta **al menos una** de las categorías seleccionadas. Sin filtros se muestran todos.
4. Tocar una tarjeta o la tarjeta del marcador navega a `PointDetail` con `pointId`.

**Estados:** cargando, sin permisos, sin resultados ("No hay puntos para este filtro. ¡Sugiere uno!" con botón a Reportar).

### 4.2 Pantalla 2 — Detalle de punto

**Contenido**
- Nombre, tipo (planta municipal, empresa, punto RAEE…), insignia de verificación (`verificado`, `parcial`, `por verificar`).
- Dirección y distrito.
- Horario (o "Horario no disponible — llama antes de ir").
- Residuos aceptados: chips y descripción detallada.
- Teléfono con botón "Llamar" (si existe).
- Notas importantes (ej.: "no acepta cantidades pequeñas").
- Botón principal **"Cómo llegar"** → abre ruta en Google Maps.
- Botón secundario **"Registré un aporte aquí"** → suma +1 al contador del perfil.

**Abrir Google Maps (snippet)**

```ts
import { Linking, Platform } from 'react-native';

export async function openRoute(lat: number, lng: number, placeId?: string) {
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
      return Linking.openURL(native);
    }
  } catch {}
  return Linking.openURL(web); // fallback universal
}
```

> iOS: añadir `comgooglemaps` en `LSApplicationQueriesSchemes` (en Expo: `app.json → ios.infoPlist`).

### 4.3 Pantalla 3 — Registro / Reporte rápido

**Objetivo:** que la comunidad sugiera puntos nuevos.

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombre del lugar | texto | Sí | 3–80 caracteres |
| Categoría(s) | multi-select de chips | Sí | mínimo 1 |
| Dirección / referencia | texto | Recomendado | hasta 150 caracteres |
| Ubicación | "Usar mi ubicación actual" o pin en mapa | Sí | lat/lng válidos |
| Foto | `expo-image-picker` (cámara o galería) | No | máx. ~1.5 MB, comprimida |

**Flujo:** completar → "Enviar sugerencia" → pantalla de confirmación → se guarda con estado `pendiente` → incrementa el contador "Puntos registrados" del perfil.

**Moderación:** los reportes no aparecen en el mapa público hasta ser aprobados (en MVP quedan solo en el historial del usuario).

### 4.4 Pantalla 4 — Perfil / Historial

- Avatar genérico y nombre local (opcional, guardado en el dispositivo).
- Dos contadores grandes: **Aportes realizados** y **Puntos registrados**.
- Lista "Mi historial" (fecha, tipo: aporte / sugerencia, nombre del punto, estado `pendiente | aprobado`).
- Mensaje motivacional según nivel (ej.: 0–4 "Eco Semilla", 5–14 "Eco Brote", 15+ "Eco Árbol").

---

## 5. Modelo de datos

```ts
type Categoria =
  | 'plastico' | 'carton' | 'papel' | 'vidrio'
  | 'metal' | 'pilas' | 'electronicos';

type Verificacion = 'verificado' | 'parcial' | 'por_verificar';

interface PuntoAcopio {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  distrito: string;
  lat: number;
  lng: number;
  google_place_id?: string;
  telefono?: string | null;
  horario?: string | null;
  categorias_aceptadas: Categoria[];
  detalle_residuos: string;
  notas?: string;
  verificacion: Verificacion;
}

interface Aporte {
  id: string;
  puntoId: string;
  fecha: string; // ISO
}

interface Sugerencia {
  id: string;
  nombre: string;
  categorias: Categoria[];
  direccion?: string;
  lat: number;
  lng: number;
  fotoUri?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha: string; // ISO
}
```

**Store (zustand, persistido en AsyncStorage):** `aportes[]`, `sugerencias[]`, `addAporte()`, `addSugerencia()`.

---

## 6. Estructura de carpetas

```
ecocanje-arequipa/
├── app.json
├── App.tsx
├── src/
│   ├── data/puntos_reciclaje_arequipa.json
│   ├── navigation/ (RootNavigator.tsx, MainTabs.tsx)
│   ├── screens/ (HomeScreen, PointDetailScreen, ReportScreen, ProfileScreen)
│   ├── components/ (CategoryFilterChips, PointCard, MapMarker, EmptyState, VerificationBadge)
│   ├── store/useEcoStore.ts
│   ├── hooks/ (useLocation.ts, useFilteredPoints.ts)
│   ├── utils/ (distance.ts, openRoute.ts, categories.ts)
│   └── theme/ (colors.ts, spacing.ts)
```

---

## 7. Diseño y UX

- **Paleta:** verde `#2E7D32` (primario), verde claro `#A5D6A7`, azul `#0277BD` (acento acciones/ruta), fondo `#F6FAF6`, texto `#1B1B1B`.
- **Colores por categoría:** plástico `#1E88E5`, cartón/papel `#8D6E63`, vidrio `#00897B`, metal `#757575`, pilas `#F9A825`, electrónicos `#6A1B9A`.
- Tipografía del sistema, tamaños mínimos 14 pt, botones ≥ 48 px de alto.
- Accesibilidad: `accessibilityLabel` en marcadores y botones, contraste AA.
- Idioma: español (Perú). Textos en un archivo `i18n` para facilitar cambios.

---

## 8. Requisitos no funcionales

- Funciona **offline** con los datos locales (el mapa necesita red para los tiles).
- Tiempo de arranque < 3 s en gama media Android.
- Permisos solicitados con explicación previa: ubicación (while-in-use), cámara/galería.
- Privacidad: no se envían datos personales; la ubicación solo se usa en el dispositivo.
- Descargo: "Información referencial, confirma horarios antes de ir".

---

## 9. Criterios de aceptación (MVP)

1. Al abrir la app se muestran los puntos en mapa y lista, ordenados por distancia si hay permiso de ubicación.
2. Al activar el filtro "Plástico" solo se ven puntos que aceptan plástico; se pueden combinar filtros.
3. El detalle muestra dirección, horario (o aviso), residuos aceptados y el botón "Cómo llegar" abre Google Maps con el destino correcto.
4. El formulario no permite enviar sin nombre, categoría y ubicación; la foto es opcional.
5. Tras enviar un reporte, el contador "Puntos registrados" aumenta y persiste al cerrar la app.
6. Tocar "Registré un aporte aquí" incrementa "Aportes realizados".

---

## 10. Plan de trabajo sugerido

| Sprint | Entregable |
|---|---|
| 1 | Proyecto Expo + TS, navegación, tema, carga del JSON |
| 2 | Pantalla Inicio (lista + filtros + mapa + ubicación) |
| 3 | Pantalla Detalle + `openRoute` + llamada |
| 4 | Formulario de reporte (foto, ubicación) + store persistente |
| 5 | Perfil/historial, pulido UX, pruebas en dispositivos, build EAS |

**Fase 2 (futuro):** backend (Firebase/Supabase) con moderación, login, reseñas, "reportar punto cerrado", notificaciones de campañas (ej. TecnoRecicla RAEE), insignias y canjes con comercios aliados (el "Eco-Canje").

---

## 11. Dataset inicial: puntos reales en Arequipa

Datos recopilados desde Google Maps (Places) y notas de prensa locales el 14/10/2026. Guardado también como archivo independiente: `puntos_reciclaje_arequipa.json`.

**Importante sobre la calidad de datos:**
- Arequipa tiene pocos centros de acopio abiertos al público bien documentados en Google Maps. Parte del reciclaje lo hacen recicladores formalizados y campañas municipales temporales (ej. "Trueque Ambiental", "TecnoRecicla RAEE").
- Los registros con `verificacion: "por_verificar"` tienen reseñas que sugieren cierre, datos incompletos o fuentes antiguas (2016). **Deben confirmarse por teléfono o visita antes de publicarse como confiables.**
- Esa limitación es justamente el valor del módulo "Reportar": que la comunidad amplíe y corrija el mapa.
- Se descartó "ECOFLOTA SUR" por no poder confirmar que sea un punto de acopio.

```json
{
  "meta": {
    "ciudad": "Arequipa, Perú",
    "fuente": "Google Maps (Places) + notas de prensa locales (El Búho, Infomercado)",
    "fecha_consulta": "2026-10-14",
    "aviso": "Horarios y materiales deben confirmarse por teléfono antes de ir. Los registros con verificacion = 'por_verificar' tienen datos incompletos o reseñas que indican posible cierre."
  },
  "categorias": ["plastico", "carton", "papel", "vidrio", "metal", "pilas", "electronicos"],
  "puntos": [
    {
      "id": "arq-001",
      "nombre": "Planta de Valorización de Residuos Sólidos de Yanahuara",
      "tipo": "planta_municipal",
      "direccion": "P937+FG, Yura 04016 (planta de la Municipalidad de Yanahuara)",
      "distrito": "Yura / Cerro Colorado",
      "lat": -16.2970906,
      "lng": -71.6355841,
      "google_place_id": "ChIJGXdDGew3QpER8qrQBzxx2_Y",
      "telefono": null,
      "horario": null,
      "categorias_aceptadas": ["plastico", "carton", "papel", "vidrio", "metal"],
      "detalle_residuos": "Papel, cartón, plástico, vidrio y metal. Procesa plástico en productos reciclados (reductores de velocidad, ojos de gato, bolsas).",
      "notas": "Planta municipal; confirmar con la Municipalidad de Yanahuara si recibe público general.",
      "verificacion": "parcial"
    },
    {
      "id": "arq-002",
      "nombre": "Alfrecicla SAC",
      "tipo": "empresa_recicladora",
      "direccion": "Urb. Ca. Francia Mz. A, Cerro Colorado 04017",
      "distrito": "Cerro Colorado",
      "lat": -16.3451254,
      "lng": -71.5901346,
      "google_place_id": "ChIJIWDQMgM3QpERutlUzNXpagw",
      "telefono": "+51 945 118 281",
      "horario": "Lun-Vie 8:00-17:00; Sáb 8:00-22:00 (según Google, confirmar); Dom cerrado",
      "categorias_aceptadas": ["plastico", "carton", "papel"],
      "detalle_residuos": "Reciclaje de materiales (por confirmar tipos exactos al llamar).",
      "notas": "Reseñas mencionan desorganización; llamar antes.",
      "verificacion": "por_verificar"
    },
    {
      "id": "arq-003",
      "nombre": "Recicla Papel",
      "tipo": "empresa_recicladora",
      "direccion": "Av. Independencia 1732, Arequipa 01007",
      "distrito": "Arequipa (Cercado)",
      "lat": -16.40899,
      "lng": -71.53334319999999,
      "google_place_id": "ChIJQcUntzVLQpERXVJnXPf6rLw",
      "telefono": "+51 944 143 695",
      "horario": "Lun-Dom 8:00-18:00 (según Google; reseñas indican que podría variar)",
      "categorias_aceptadas": ["papel", "carton"],
      "detalle_residuos": "Compra papel bond blanco (reseña reporta ~S/ 1.00 por kilo) y cartón. No aceptan cantidades muy pequeñas.",
      "notas": "Una reseña indica que dejó de operar en esa dirección; llamar antes de ir.",
      "verificacion": "por_verificar"
    },
    {
      "id": "arq-004",
      "nombre": "Punto de acopio RAEE Claro - Arequipa Center",
      "tipo": "punto_raee_corporativo",
      "direccion": "Arequipa Center, Av. Aviación 602, Cerro Colorado 04017",
      "distrito": "Cerro Colorado",
      "lat": -16.374349199999997,
      "lng": -71.5577222,
      "google_place_id": "ChIJWe0nRABLQpERimCSESloC7c",
      "telefono": null,
      "horario": null,
      "categorias_aceptadas": ["electronicos", "pilas"],
      "detalle_residuos": "Residuos de aparatos eléctricos y electrónicos pequeños (celulares, accesorios, baterías). Confirmar en tienda.",
      "notas": "Ubicado en el centro de atención al cliente; horario según el del local.",
      "verificacion": "parcial"
    },
    {
      "id": "arq-005",
      "nombre": "Punto de acopio RAEE Claro - Paucarpata",
      "tipo": "punto_raee_corporativo",
      "direccion": "HFJP+VH5, Paucarpata 04002",
      "distrito": "Paucarpata",
      "lat": -16.4178674,
      "lng": -71.5135074,
      "google_place_id": "ChIJsdJyOwBLQpERakN0ah6-zxg",
      "telefono": null,
      "horario": null,
      "categorias_aceptadas": ["electronicos", "pilas"],
      "detalle_residuos": "Residuos electrónicos pequeños (celulares, accesorios, baterías). Confirmar en tienda.",
      "notas": "Centro de atención al cliente.",
      "verificacion": "parcial"
    },
    {
      "id": "arq-006",
      "nombre": "Punto de acopio RAEE Claro - Yanahuara",
      "tipo": "punto_raee_corporativo",
      "direccion": "Av. Ejército 703, Yanahuara 04013",
      "distrito": "Yanahuara",
      "lat": -16.390591,
      "lng": -71.54572809999999,
      "google_place_id": "ChIJj0eKGgBLQpERL6k2ufKVTKA",
      "telefono": null,
      "horario": null,
      "categorias_aceptadas": ["electronicos", "pilas"],
      "detalle_residuos": "Residuos electrónicos pequeños (celulares, accesorios, baterías). Confirmar en tienda.",
      "notas": "Centro de atención al cliente.",
      "verificacion": "parcial"
    },
    {
      "id": "arq-007",
      "nombre": "ARMA - Autoridad Regional Ambiental (acopio de pilas)",
      "tipo": "entidad_publica",
      "direccion": "Calle Jacinto Ibáñez N° 450, Parque Industrial, Cercado",
      "distrito": "Arequipa (Cercado)",
      "lat": -16.4168466,
      "lng": -71.5422976,
      "google_place_id": "ChIJb1Y1D-5KQpERTiwo0GvtvA8",
      "telefono": null,
      "horario": null,
      "categorias_aceptadas": ["pilas"],
      "detalle_residuos": "Pilas usadas (recomendado llevarlas en botellón plástico). Fuente: campaña del Gobierno Regional y Municipalidad de Alto Selva Alegre (2016).",
      "notas": "Coordenadas de la sede regional cercana (Jacinto Ibáñez 320); verificar numeración exacta y vigencia del programa.",
      "verificacion": "por_verificar"
    },
    {
      "id": "arq-008",
      "nombre": "Municipalidad de Alto Selva Alegre - Acopio de pilas (Complejo Roosevelt)",
      "tipo": "entidad_publica",
      "direccion": "Av. Roosevelt N° 802, Alto Selva Alegre (segundo piso)",
      "distrito": "Alto Selva Alegre",
      "lat": -16.3818739,
      "lng": -71.5235034,
      "google_place_id": "ChIJLQbJIbVLQpERcifz9UE7uJ0",
      "telefono": null,
      "horario": "Complejo: 6:00-18:00 todos los días (horario del recinto, no del acopio)",
      "categorias_aceptadas": ["pilas"],
      "detalle_residuos": "Pilas usadas. Fuente: campaña de ARMA y la municipalidad (2016).",
      "notas": "Coordenadas del Complejo Deportivo Roosevelt; confirmar que el acopio sigue activo.",
      "verificacion": "por_verificar"
    },
    {
      "id": "arq-009",
      "nombre": "Centro de Acopio y Segregación Cayma",
      "tipo": "centro_acopio_municipal",
      "direccion": "MF66+M25, Av. Charcani, Arequipa 04018",
      "distrito": "Cayma",
      "lat": -16.3383645,
      "lng": -71.5398787,
      "google_place_id": "ChIJU0HiSpZJQpERCNq-PPFD7uA",
      "telefono": null,
      "horario": null,
      "categorias_aceptadas": ["plastico", "carton", "papel"],
      "detalle_residuos": "Segregación de residuos sólidos (tipos por confirmar).",
      "notas": "Una reseña indica que no funciona como centro de reciclaje abierto al público. Candidato a validar con la comunidad.",
      "verificacion": "por_verificar"
    }
  ]
}
```
