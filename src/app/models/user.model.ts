export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  rol: 'usuario_registrado' | 'asesor_comercial';
  createdAt: any;
  telefono: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  telefono: string;
  rol: 'usuario_registrado' | 'asesor_comercial';
  photoURL: string;
  createdAt: any;
} 