export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  rol: 'asesor_comercial' | 'usuario_registrado';
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  rol: 'asesor_comercial' | 'usuario_registrado';
  createdAt: any;
}

