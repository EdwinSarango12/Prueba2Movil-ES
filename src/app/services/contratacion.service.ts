import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contratacion } from '../models/contratacion.model';
import * as firebase from 'firebase/compat/app';

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
      fechaSolicitud: firebase.default.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await this.firestore.collection(this.collection).add(contratacionData);
    return docRef.id;
  }

  // Obtener contrataciones de un usuario
  getContratacionesByUsuario(usuarioId: string): Observable<Contratacion[]> {
    return this.firestore.collection<Contratacion>(this.collection, ref =>
      ref.where('usuarioId', '==', usuarioId)
         .orderBy('fechaSolicitud', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Contratacion;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Obtener todas las contrataciones pendientes (para asesores)
  getContratacionesPendientes(): Observable<Contratacion[]> {
    return this.firestore.collection<Contratacion>(this.collection, ref =>
      ref.where('estado', '==', 'pendiente')
         .orderBy('fechaSolicitud', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Contratacion;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Obtener todas las contrataciones (para asesores)
  getAllContrataciones(): Observable<Contratacion[]> {
    return this.firestore.collection<Contratacion>(this.collection, ref =>
      ref.orderBy('fechaSolicitud', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Contratacion;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Actualizar estado de contratación
  async updateEstado(id: string, estado: Contratacion['estado'], asesorId?: string, observaciones?: string): Promise<void> {
    const updateData: any = {
      estado,
      fechaAprobacion: firebase.default.firestore.FieldValue.serverTimestamp()
    };
    if (asesorId) updateData.asesorId = asesorId;
    if (observaciones) updateData.observaciones = observaciones;
    
    await this.firestore.collection(this.collection).doc(id).update(updateData);
  }

  // Obtener contratación por ID
  getContratacion(id: string): Observable<Contratacion | undefined> {
    return this.firestore.doc<Contratacion>(`${this.collection}/${id}`).valueChanges().pipe(
      map(contratacion => contratacion ? { id, ...contratacion } : undefined)
    );
  }
}

