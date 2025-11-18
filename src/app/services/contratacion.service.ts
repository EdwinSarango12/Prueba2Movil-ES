import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Contratacion } from '../models/contratacion.model';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class ContratacionService {
  private collection = 'contrataciones';

  constructor(private firestore: AngularFirestore) {}

  // Crear solicitud de contratación
  async createContratacion(contratacion: Omit<Contratacion, 'id' | 'fechaSolicitud' | 'estado'>): Promise<string> {
    const contratacionData = {
      ...contratacion,
      estado: 'pendiente' as const,
      fechaSolicitud: firebase.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await this.firestore.firestore.collection(this.collection).add(contratacionData);
    return docRef.id;
  }

  // Obtener contrataciones de un usuario
  getContratacionesByUsuario(usuarioId: string): Observable<Contratacion[]> {
    // Usar la instancia nativa de Firestore para evitar problemas de contexto de inyección
    const query = this.firestore.firestore
      .collection(this.collection)
      .where('usuarioId', '==', usuarioId)
      .orderBy('fechaSolicitud', 'desc');
    
    return new Observable(observer => {
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const contrataciones = snapshot.docs.map(doc => {
            const data = doc.data() as Contratacion;
            return { id: doc.id, ...data };
          });
          observer.next(contrataciones);
        },
        (error) => {
          console.error('Error obteniendo contrataciones:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  // Obtener todas las contrataciones pendientes (para asesores)
  getContratacionesPendientes(): Observable<Contratacion[]> {
    const query = this.firestore.firestore
      .collection(this.collection)
      .where('estado', '==', 'pendiente')
      .orderBy('fechaSolicitud', 'desc');
    
    return new Observable(observer => {
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const contrataciones = snapshot.docs.map(doc => {
            const data = doc.data() as Contratacion;
            return { id: doc.id, ...data };
          });
          observer.next(contrataciones);
        },
        (error) => {
          console.error('Error obteniendo contrataciones pendientes:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  // Obtener todas las contrataciones (para asesores)
  getAllContrataciones(): Observable<Contratacion[]> {
    const query = this.firestore.firestore
      .collection(this.collection)
      .orderBy('fechaSolicitud', 'desc');
    
    return new Observable(observer => {
      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const contrataciones = snapshot.docs.map(doc => {
            const data = doc.data() as Contratacion;
            return { id: doc.id, ...data };
          });
          observer.next(contrataciones);
        },
        (error) => {
          console.error('Error obteniendo todas las contrataciones:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  // Actualizar estado de contratación
  async updateEstado(id: string, estado: Contratacion['estado'], asesorId?: string, observaciones?: string): Promise<void> {
    const updateData: any = {
      estado,
      fechaAprobacion: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (asesorId) updateData.asesorId = asesorId;
    if (observaciones) updateData.observaciones = observaciones;
    
    await this.firestore.firestore.collection(this.collection).doc(id).update(updateData);
  }

  // Obtener contratación por ID
  getContratacion(id: string): Observable<Contratacion | undefined> {
    const docRef = this.firestore.firestore.collection(this.collection).doc(id);
    
    return new Observable(observer => {
      const unsubscribe = docRef.onSnapshot(
        (doc) => {
          if (doc.exists) {
            const data = doc.data() as Contratacion;
            observer.next({ id: doc.id, ...data });
          } else {
            observer.next(undefined);
          }
        },
        (error) => {
          console.error('Error obteniendo contratación:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }
}

