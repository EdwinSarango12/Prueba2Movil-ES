import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private bucket = 'planes-imagenes';
  private maxSize = 5 * 1024 * 1024; // 5MB
  private allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  constructor(private storage: AngularFireStorage) {}

  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxSize) {
      return { valid: false, error: 'El archivo excede el tamaño máximo de 5MB' };
    }
    if (!this.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Solo se permiten archivos JPG y PNG' };
    }
    return { valid: true };
  }

  uploadPlanImage(file: File, planId: string): Observable<string> {
    return new Observable(observer => {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        observer.error(validation.error);
        return;
      }

      const filePath = `${this.bucket}/${planId}_${Date.now()}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe({
            next: (url) => {
              observer.next(url);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        })
      ).subscribe();
    });
  }

  deleteImage(imageUrl: string): Observable<void> {
    return this.storage.refFromURL(imageUrl).delete();
  }
}

