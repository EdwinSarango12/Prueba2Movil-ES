import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MensajeChat } from '../models/mensaje.model';
import * as firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private collection = 'mensajes_chat';

  constructor(private firestore: AngularFirestore) {}

  // Enviar mensaje
  async sendMessage(mensaje: Omit<MensajeChat, 'id' | 'timestamp' | 'leido'>): Promise<void> {
    const mensajeData = {
      ...mensaje,
      timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
      leido: false
    };
    await this.firestore.collection(this.collection).add(mensajeData);
  }

  // Obtener mensajes de una contratación (tiempo real)
  getMensajes(contratacionId: string): Observable<MensajeChat[]> {
    return this.firestore.collection<MensajeChat>(this.collection, ref =>
      ref.where('contratacionId', '==', contratacionId)
         .orderBy('timestamp', 'asc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as MensajeChat;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Marcar mensajes como leídos
  async markAsRead(contratacionId: string, userId: string): Promise<void> {
    const batch = this.firestore.firestore.batch();
    const mensajes = await this.firestore.collection<MensajeChat>(this.collection, ref =>
      ref.where('contratacionId', '==', contratacionId)
         .where('remitenteId', '!=', userId)
         .where('leido', '==', false)
    ).get().toPromise();

    mensajes?.forEach(doc => {
      batch.update(doc.ref, { leido: true });
    });

    if (mensajes && mensajes.size > 0) {
      await batch.commit();
    }
  }

  // Obtener conversaciones para un usuario
  getConversaciones(userId: string, rol: string): Observable<MensajeChat[]> {
    if (rol === 'asesor_comercial') {
      // Asesores ven todas las contrataciones
      return this.firestore.collection<MensajeChat>(this.collection, ref =>
        ref.orderBy('timestamp', 'desc')
      ).snapshotChanges().pipe(
        map(actions => {
          const mensajes = actions.map(a => {
            const data = a.payload.doc.data() as MensajeChat;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
          // Filtrar únicos por contratacionId
          const unique = new Map();
          mensajes.forEach(msg => {
            if (!unique.has(msg.contratacionId)) {
              unique.set(msg.contratacionId, msg);
            }
          });
          return Array.from(unique.values());
        })
      );
    } else {
      // Usuarios ven solo sus contrataciones
      return this.firestore.collection<MensajeChat>(this.collection, ref =>
        ref.where('remitenteId', '==', userId)
           .orderBy('timestamp', 'desc')
      ).snapshotChanges().pipe(
        map(actions => {
          const mensajes = actions.map(a => {
            const data = a.payload.doc.data() as MensajeChat;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
          const unique = new Map();
          mensajes.forEach(msg => {
            if (!unique.has(msg.contratacionId)) {
              unique.set(msg.contratacionId, msg);
            }
          });
          return Array.from(unique.values());
        })
      );
    }
  }
}

