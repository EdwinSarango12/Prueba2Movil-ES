import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, of, defer } from 'rxjs';
import { map, switchMap, shareReplay, startWith } from 'rxjs/operators';
import { User, UserProfile } from '../models/user.model';
import * as firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    // Inicializar el Observable usando defer para asegurar el contexto de inyección
    this.user$ = defer(() => {
      return this.afAuth.authState.pipe(
        switchMap((user: any) => {
          if (user) {
            const profileRef = this.firestore.doc<UserProfile>(`perfiles/${user.uid}`);
            return profileRef.valueChanges().pipe(
              map((profile: UserProfile | undefined) => ({
                uid: user.uid,
                email: user.email || '',
                displayName: profile?.displayName || user.displayName || '',
                photoURL: profile?.photoURL || user.photoURL || '',
                rol: profile?.rol || 'usuario_registrado',
                createdAt: profile?.createdAt
              })),
              startWith({
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                rol: 'usuario_registrado' as const,
                createdAt: null
              })
            );
          } else {
            return of(null);
          }
        }),
        shareReplay(1)
      );
    });
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      if (user) {
        await user.updateProfile({ displayName });
        
        // Crear perfil con rol por defecto
        await this.firestore.collection('perfiles').doc(user.uid).set({
          uid: user.uid,
          email: email,
          displayName: displayName,
          rol: 'usuario_registrado',
          createdAt: firebase.default.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      // Esperar un momento para que se actualice el authState
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }

  async updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await this.firestore.collection('perfiles').doc(uid).update(data);
  }

  async updateRol(uid: string, rol: 'asesor_comercial' | 'usuario_registrado'): Promise<void> {
    await this.firestore.collection('perfiles').doc(uid).update({ rol });
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
  }
}

