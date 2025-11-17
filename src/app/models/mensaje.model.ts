export interface MensajeChat {
  id?: string;
  contratacionId: string;
  remitenteId: string;
  remitenteEmail: string;
  remitenteRol: 'asesor_comercial' | 'usuario_registrado';
  mensaje: string;
  timestamp: any;
  leido: boolean;
}

