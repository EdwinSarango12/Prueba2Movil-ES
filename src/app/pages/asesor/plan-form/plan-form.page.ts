import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { PlanService } from '../../../services/plan.service';
import { StorageService } from '../../../services/storage.service';
import { AuthService } from '../../../services/auth.service';
import { PlanMovil } from '../../../models/plan.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.page.html',
  styleUrls: ['./plan-form.page.scss'],
  standalone: false
})
export class PlanFormPage implements OnInit {
  planForm: FormGroup;
  planId: string | null = null;
  isEditMode = false;
  user: User | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private storageService: StorageService,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.planForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      datosGB: ['', Validators.required],
      minutosVoz: ['', Validators.required],
      sms: ['', Validators.required],
      velocidad: ['', Validators.required],
      redesSociales: ['', Validators.required],
      whatsapp: ['', Validators.required],
      llamadasInternacionales: ['', Validators.required],
      roaming: ['', Validators.required],
      segmento: ['basico', Validators.required],
      activo: [true]
    });
  }

  ngOnInit() {
    this.planId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.planId;

    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });

    if (this.isEditMode && this.planId) {
      this.loadPlan();
    }
  }

  loadPlan() {
    if (this.planId) {
      this.planService.getPlan(this.planId).subscribe({
        next: (plan) => {
          if (plan) {
            this.planForm.patchValue(plan);
            if (plan.imagenUrl) {
              this.imagePreview = plan.imagenUrl;
            }
          }
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validation = this.storageService.validateFile(file);
      if (!validation.valid) {
        this.showAlert('Error', validation.error || 'Archivo inválido');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async savePlan() {
    if (this.planForm.valid && this.user) {
      const loading = await this.loadingController.create({
        message: 'Guardando plan...'
      });
      await loading.present();

      try {
        const planData: PlanMovil = this.planForm.value;

        // Subir imagen si hay una nueva
        if (this.selectedFile) {
          const imageId = this.planId || `plan_${Date.now()}`;
          console.log('Subiendo imagen a Firebase Storage...');
          const imageUrl = await new Promise<string>((resolve, reject) => {
            this.storageService.uploadPlanImage(this.selectedFile!, imageId).subscribe({
              next: (url) => resolve(url),
              error: (error) => reject(error)
            });
          });
          planData.imagenUrl = imageUrl;

          // Eliminar imagen antigua si estamos editando
          if (this.isEditMode && this.planForm.get('imagenUrl')?.value) {
            try {
              console.log('Eliminando imagen antigua...');
              await new Promise<void>((resolve, reject) => {
                this.storageService.deleteImage(this.planForm.get('imagenUrl')?.value).subscribe({
                  next: () => resolve(),
                  error: (error) => reject(error)
                });
              });
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
        }

        if (this.isEditMode && this.planId) {
          console.log('Actualizando plan...');
          await this.planService.updatePlan(this.planId, planData);
        } else {
          console.log('Creando nuevo plan...');
          await this.planService.createPlan(planData, this.user.uid);
        }

        await loading.dismiss();
        this.showAlert('Éxito', 'Plan guardado correctamente', () => {
          this.router.navigate(['/asesor/dashboard']);
        });
      } catch (error: any) {
        await loading.dismiss();
        console.error('Error saving plan:', error);
        this.showAlert('Error', error.message || 'Error al guardar el plan');
      }
    }
  }

  async showAlert(header: string, message: string, handler?: () => void) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{
        text: 'OK',
        handler
      }]
    });
    await alert.present();
  }
}

