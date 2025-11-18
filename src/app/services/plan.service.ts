import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlanMovil } from '../models/plan.model';
import * as firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private collection = 'planes_moviles';

  constructor(private firestore: AngularFirestore) {}

  // Obtener todos los planes activos (para usuarios) - Optimizado
  getPlanesActivos(): Observable<PlanMovil[]> {
    return new Observable(observer => {
      // Usar la instancia nativa para mejor rendimiento
      this.firestore.firestore
        .collection(this.collection)
        .where('activo', '==', true)
        .orderBy('precio', 'asc')
        .onSnapshot(
          snapshot => {
            const planes = snapshot.docs.map(doc => {
              const data = doc.data() as PlanMovil;
              return { id: doc.id, ...data };
            });
            observer.next(planes);
          },
          error => observer.error(error)
        );
    });
  }

  // Obtener todos los planes (para asesores) - Optimizado
  getAllPlanes(): Observable<PlanMovil[]> {
    return new Observable(observer => {
      // Usar la instancia nativa para mejor rendimiento
      this.firestore.firestore
        .collection(this.collection)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          snapshot => {
            const planes = snapshot.docs.map(doc => {
              const data = doc.data() as PlanMovil;
              return { id: doc.id, ...data };
            });
            observer.next(planes);
          },
          error => observer.error(error)
        );
    });
  }

  // Obtener un plan por ID - Optimizado
  getPlan(id: string): Observable<PlanMovil | undefined> {
    return new Observable(observer => {
      this.firestore.firestore
        .collection(this.collection)
        .doc(id)
        .onSnapshot(
          doc => {
            if (doc.exists) {
              const data = doc.data() as PlanMovil;
              observer.next({ id: doc.id, ...data });
            } else {
              observer.next(undefined);
            }
          },
          error => observer.error(error)
        );
    });
  }

  // Crear plan (solo asesores) - Optimizado
  async createPlan(plan: PlanMovil, userId: string): Promise<string> {
    const planData = {
      ...plan,
      createdBy: userId,
      createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await this.firestore.firestore
      .collection(this.collection)
      .add(planData);
    return docRef.id;
  }

  // Actualizar plan (solo asesores) - Optimizado
  async updatePlan(id: string, plan: Partial<PlanMovil>): Promise<void> {
    const updateData = {
      ...plan,
      updatedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    };
    await this.firestore.firestore
      .collection(this.collection)
      .doc(id)
      .update(updateData);
  }

  // Eliminar plan (solo asesores) - Optimizado
  async deletePlan(id: string): Promise<void> {
    await this.firestore.firestore
      .collection(this.collection)
      .doc(id)
      .delete();
  }

  // Escuchar cambios en tiempo real - Optimizado
  getPlanesRealtime(): Observable<PlanMovil[]> {
    return new Observable(observer => {
      this.firestore.firestore
        .collection(this.collection)
        .where('activo', '==', true)
        .orderBy('precio', 'asc')
        .onSnapshot(
          snapshot => {
            const planes = snapshot.docs.map(doc => {
              const data = doc.data() as PlanMovil;
              return { id: doc.id, ...data };
            });
            observer.next(planes);
          },
          error => observer.error(error)
        );
    });
  }
}

