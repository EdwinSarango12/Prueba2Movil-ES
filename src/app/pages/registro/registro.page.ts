import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage implements OnInit {
  registroForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.registroForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword) {
      if (password.value && password.value.length < 4) {
        password.setErrors({ minLength: true });
      }
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else {
        if (confirmPassword.hasError('passwordMismatch')) {
          confirmPassword.setErrors(null);
        }
      }
    }
    
    return null;
  }

  ngOnInit() {
  }

  async register(rol: 'usuario_registrado' | 'asesor_comercial') {
    if (this.registroForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...'
      });
      await loading.present();

      try {
        const createdUser = await this.authService.register(
          this.registroForm.value.email,
          this.registroForm.value.password,
          this.registroForm.value.displayName,
          this.registroForm.value.telefono,
          rol
        );

        console.log('✅ Usuario registrado:', createdUser);
        console.log('📌 Rol del usuario registrado:', createdUser.rol);

        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Cuenta creada exitosamente',
          buttons: [{
            text: 'OK',
            handler: () => {
              if (createdUser.rol === 'asesor_comercial') {
                console.log('Navegando a dashboard de asesor');
                this.router.navigate(['/asesor/dashboard']);
              } else {
                console.log('Navegando a home de usuario');
                this.router.navigate(['/home']);
              }
            }
          }]
        });
        await alert.present();
      } catch (error: any) {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'Error al crear la cuenta',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/splash']);
  }
}
