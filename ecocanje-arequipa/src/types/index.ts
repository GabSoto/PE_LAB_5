export type Categoria =
  | 'plastico'
  | 'carton'
  | 'papel'
  | 'vidrio'
  | 'metal'
  | 'pilas'
  | 'electronicos';

export type Verificacion = 'verificado' | 'parcial' | 'por_verificar';

export interface PuntoAcopio {
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

export interface Aporte {
  id: string;
  puntoId: string;
  fecha: string;
}

export interface Sugerencia {
  id: string;
  nombre: string;
  categorias: Categoria[];
  direccion?: string;
  lat: number;
  lng: number;
  fotoUri?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha: string;
}

export type TipoHistorial = 'aporte' | 'sugerencia';

export interface HistorialItem {
  id: string;
  tipo: TipoHistorial;
  fecha: string;
  nombre: string;
  estado: 'pendiente' | 'aprobado';
}

export interface Dataset {
  meta: {
    ciudad: string;
    fuente: string;
    fecha_consulta: string;
    aviso: string;
  };
  categorias: Categoria[];
  puntos: PuntoAcopio[];
}
