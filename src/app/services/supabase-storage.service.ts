import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucket = environment.supabase.bucket;
  private maxSize = 5 * 1024 * 1024; // 5MB
  private allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.maxSize) {
      return { valid: false, error: 'El archivo excede el tamaño máximo de 5MB' };
    }
    if (!this.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Solo se permiten archivos JPG y PNG' };
    }
    return { valid: true };
  }

  async uploadPlanImage(file: File, planId: string): Promise<string> {
    try {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Archivo inválido');
      }

      const fileName = `${planId}_${Date.now()}_${file.name}`;
      const filePath = `planes/${fileName}`;

      console.log('Subiendo imagen a Supabase:', filePath);

      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(error.message);
      }

      // Obtener URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      console.log('Imagen subida exitosamente:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      throw new Error(error.message || 'Error al subir la imagen');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path del URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('planes')).join('/');

      console.log('Eliminando imagen:', filePath);

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) {
        throw new Error(error.message);
      }

      console.log('Imagen eliminada exitosamente');
    } catch (error: any) {
      console.error('Error eliminando imagen:', error);
      throw new Error(error.message || 'Error al eliminar la imagen');
    }
  }

  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
