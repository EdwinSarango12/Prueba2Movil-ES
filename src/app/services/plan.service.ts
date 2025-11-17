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

  // Obtener todos los planes activos (para usuarios)
  getPlanesActivos(): Observable<PlanMovil[]> {
    return this.firestore.collection<PlanMovil>(this.collection, ref =>
      ref.where('activo', '==', true).orderBy('precio', 'asc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PlanMovil;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Obtener todos los planes (para asesores)
  getAllPlanes(): Observable<PlanMovil[]> {
    return this.firestore.collection<PlanMovil>(this.collection, ref =>
      ref.orderBy('createdAt', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PlanMovil;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Obtener un plan por ID
  getPlan(id: string): Observable<PlanMovil | undefined> {
    return this.firestore.doc<PlanMovil>(`${this.collection}/${id}`).valueChanges().pipe(
      map(plan => plan ? { id, ...plan } : undefined)
    );
  }

  // Crear plan (solo asesores)
  async createPlan(plan: PlanMovil, userId: string): Promise<string> {
    const planData = {
      ...plan,
      createdBy: userId,
      createdAt: firebase.default.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await this.firestore.collection(this.collection).add(planData);
    return docRef.id;
  }

  // Actualizar plan (solo asesores)
  async updatePlan(id: string, plan: Partial<PlanMovil>): Promise<void> {
    const updateData = {
      ...plan,
      updatedAt: firebase.default.firestore.FieldValue.serverTimestamp()
    };
    await this.firestore.collection(this.collection).doc(id).update(updateData);
  }

  // Eliminar plan (solo asesores)
  async deletePlan(id: string): Promise<void> {
    await this.firestore.collection(this.collection).doc(id).delete();
  }

  // Escuchar cambios en tiempo real
  getPlanesRealtime(): Observable<PlanMovil[]> {
    return this.firestore.collection<PlanMovil>(this.collection, ref =>
      ref.where('activo', '==', true).orderBy('precio', 'asc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as PlanMovil;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
}

