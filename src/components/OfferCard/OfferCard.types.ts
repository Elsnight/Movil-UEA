export interface OfferCardProps {
  titulo: string;
  comercioNombre: string;
  precioOriginal: number;
  precioOferta: number;
  imagenUrl?: string;
  distanciaKm?: number;
  estado: string;
  onPress: () => void;
  isFavorite?: boolean;
  favoriteSyncFailed?: boolean;
  onToggleFavorite?: () => void;
  variant?: 'compact' | 'full';
  accessibilityLabel?: string;
}
