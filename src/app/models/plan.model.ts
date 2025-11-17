export interface PlanMovil {
  id?: string;
  nombre: string;
  precio: number;
  datosGB: number | string; // Puede ser número o "ILIMITADOS"
  minutosVoz: number | string; // Puede ser número o "ILIMITADOS"
  sms: string;
  velocidad: string;
  redesSociales: string;
  whatsapp: string;
  llamadasInternacionales: string;
  roaming: string;
  segmento: 'basico' | 'medio' | 'premium';
  activo: boolean;
  imagenUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string; // UID del asesor que lo creó
}

