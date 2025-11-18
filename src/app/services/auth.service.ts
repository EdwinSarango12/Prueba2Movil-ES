import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User, UserProfile } from '../models/user.model';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    // Configurar el Observable reactivo
    this.user$ = this.afAuth.authState.pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) {
          this.userSubject.next(null);
          return from(Promise.resolve(null));
        }

        // Obtener el perfil de Firestore
        return from(
          this.firestore.firestore
            .collection('perfiles')
            .doc(firebaseUser.uid)
            .get()
        ).pipe(
          map(profileDoc => {
            const profile = profileDoc.exists ? (profileDoc.data() as UserProfile) : null;
            
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: profile?.displayName || firebaseUser.displayName || '',
              photoURL: profile?.photoURL || firebaseUser.photoURL || '',
              rol: profile?.rol || 'usuario_registrado',
              createdAt: profile?.createdAt || null,
              telefono: profile?.telefono || ''
            };
            
            console.log('Usuario actualizado:', user);
            this.userSubject.next(user);
            return user;
          })
        );
      })
    );

    // Suscribirse para mantener actualizado el BehaviorSubject
    this.user$.subscribe();
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(
    email: string, 
    password: string, 
    displayName: string, 
    telefono: string = '', 
    rol: 'usuario_registrado' | 'asesor_comercial' = 'usuario_registrado'
  ): Promise<User> {
    try {
      console.log('=== INICIO REGISTRO ===');
      console.log('Rol solicitado:', rol);
      
      // Crear usuario en Firebase Auth
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Error al crear el usuario');
      }

      console.log('Usuario creado en Auth, UID:', user.uid);

      // Actualizar el perfil del usuario con el displayName
      await user.updateProfile({ displayName });
      
      // Crear documento de perfil en Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: email,
        displayName: displayName,
        telefono: telefono,
        rol: rol,
        photoURL: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      console.log('Guardando perfil en Firestore:', userProfile);
      
      // Usar la instancia nativa para evitar NG0203 (inject() fuera de contexto)
      await this.firestore.firestore
        .collection('perfiles')
        .doc(user.uid)
        .set(userProfile);
      
      console.log('Perfil guardado, esperando sincronización...');
      
      // Esperar un momento para que Firestore se sincronice
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar que se guardó correctamente
      const savedProfile = await this.firestore.firestore
        .collection('perfiles')
        .doc(user.uid)
        .get();
      console.log('Perfil verificado:', savedProfile.data());
      console.log('=== FIN REGISTRO ===');
      
      // Retornar el usuario creado con su rol
      const createdUser: User = {
        uid: user.uid,
        email: email,
        displayName: displayName,
        photoURL: '',
        rol: rol,
        createdAt: null,
        telefono: telefono
      };
      
      console.log('Usuario retornado:', createdUser);
      return createdUser;
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<void> {
    try {
      console.log('=== INICIO LOGIN ===');
      await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('Login exitoso en Auth');
    } catch (error: any) {
      console.error('Error en login:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtener datos del usuario después del login
   */
  /**
 * Obtener datos del usuario después del login
 */
async getUserAfterLogin(): Promise<User | null> {
  try {
    console.log('=== OBTENIENDO USUARIO DESPUÉS DE LOGIN ===');
    
    // Esperar a que haya un usuario autenticado
    const firebaseUser = await this.afAuth.currentUser;
    
    if (!firebaseUser) {
      console.log('No hay usuario autenticado');
      return null;
    }

    console.log('Usuario autenticado UID:', firebaseUser.uid);

    // Esperar para asegurar sincronización con Firestore
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 🔥 CAMBIO AQUÍ: Usar .ref directamente en lugar de .doc()
    const profileSnapshot = await this.firestore.collection('perfiles').doc(firebaseUser.uid).ref.get();
    
    if (!profileSnapshot.exists) {
      console.error('❌ No se encontró perfil en Firestore');
      throw new Error('No se encontró el perfil del usuario');
    }

    const profile = profileSnapshot.data() as UserProfile;
    console.log('✅ Perfil obtenido de Firestore:', profile);
    console.log('📌 ROL DEL USUARIO:', profile.rol);

    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: profile?.displayName || firebaseUser.displayName || '',
      photoURL: profile?.photoURL || firebaseUser.photoURL || '',
      rol: profile?.rol || 'usuario_registrado',
      createdAt: profile?.createdAt || null,
      telefono: profile?.telefono || ''
    };

    console.log('✅ Usuario final construido:', user);
    console.log('=== FIN OBTENER USUARIO ===');
    
    // Actualizar el BehaviorSubject
    this.userSubject.next(user);
    
    return user;
  } catch (error) {
    console.error('❌ Error en getUserAfterLogin:', error);
    throw error;
  }
}

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.userSubject.next(null);
      this.router.navigate(['/splash']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener el observable del usuario actual
   */
  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  /**
   * Obtener el usuario actual de forma síncrona (snapshot)
   */
  getCurrentUserSnapshot(): User | null {
    return this.userSubject.value;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return user !== null;
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await this.firestore.firestore
        .collection('perfiles')
        .doc(uid)
        .update(data);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Actualizar rol del usuario
   */
  async updateRol(uid: string, rol: 'asesor_comercial' | 'usuario_registrado'): Promise<void> {
    try {
      console.log('Actualizando rol del usuario:', uid, 'a:', rol);
      await this.firestore.firestore
        .collection('perfiles')
        .doc(uid)
        .update({ rol });
      console.log('Rol actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando rol:', error);
      throw error;
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Error al enviar correo de recuperación:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Obtener el UID del usuario actual
   */
  async getCurrentUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    return user ? user.uid : null;
  }

  /**
   * Obtener datos de perfil desde Firestore por UID
   */
  async getUserProfileById(uid: string): Promise<UserProfile | null> {
    try {
      const profileDoc = await this.firestore.firestore
        .collection('perfiles')
        .doc(uid)
        .get();
      return profileDoc.exists ? (profileDoc.data() as UserProfile) : null;
    } catch (error) {
      console.error('Error obteniendo perfil por ID:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(rol: 'usuario_registrado' | 'asesor_comercial'): boolean {
    const user = this.getCurrentUserSnapshot();
    console.log('🔍 Verificando rol. Usuario actual:', user);
    console.log('🔍 Rol buscado:', rol, '| Rol actual:', user?.rol);
    return user?.rol === rol;
  }

  /**
   * Manejador centralizado de errores de autenticación
   */
  private handleAuthError(error: any): Error {
    let errorMessage = 'Ha ocurrido un error';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está registrado';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 4 caracteres';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El correo electrónico no es válido';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este correo electrónico';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Por favor, verifique su internet';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operación no permitida';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas';
          break;
        default:
          errorMessage = error.message || 'Error de autenticación';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Error(errorMessage);
  }
}