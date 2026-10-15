import type { Categoria } from '@/types';

export const CATEGORIAS: Categoria[] = [
  'plastico',
  'carton',
  'papel',
  'vidrio',
  'metal',
  'pilas',
  'electronicos',
];

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  plastico: 'Plástico',
  carton: 'Cartón',
  papel: 'Papel',
  vidrio: 'Vidrio',
  metal: 'Metal',
  pilas: 'Pilas',
  electronicos: 'Electrónicos',
};

export const CATEGORIA_COLOR: Record<Categoria, string> = {
  plastico: '#1E88E5',
  carton: '#8D6E63',
  papel: '#8D6E63',
  vidrio: '#00897B',
  metal: '#757575',
  pilas: '#F9A825',
  electronicos: '#6A1B9A',
};

export function colorParaCategoria(categoria: Categoria): string {
  return CATEGORIA_COLOR[categoria];
}

export function colorPrimarioDe(punto: { categorias_aceptadas: Categoria[] }): string {
  const primera = punto.categorias_aceptadas[0];
  return primera ? CATEGORIA_COLOR[primera] : '#757575';
}
