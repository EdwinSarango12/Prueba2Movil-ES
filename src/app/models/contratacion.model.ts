export interface Contratacion {
  id?: string;
  planId: string;
  planNombre: string;
  usuarioId: string;
  usuarioEmail: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  fechaSolicitud: any;
  fechaAprobacion?: any;
  asesorId?: string;
  observaciones?: string;
}

