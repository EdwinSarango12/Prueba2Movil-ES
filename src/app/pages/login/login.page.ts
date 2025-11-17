import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule as NgReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AlertController, LoadingController, IonicModule as IonicAngularModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { first, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgReactiveFormsModule,
    RouterModule,
    IonicAngularModule
  ]
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  private destroy$ = new Subject<void>();
  isLoginInProgress = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async login() {
    if (this.loginForm.invalid || this.isLoginInProgress) {
      return;
    }

    this.isLoginInProgress = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    
    try {
      await loading.present();
      
      // Intentar iniciar sesión
      await this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      // Esperar a que el usuario esté disponible (máximo 5 segundos)
      const user = await new Promise<any>((resolve, reject) => {
        const subscription = this.authService.getCurrentUser()
          .pipe(
            filter(user => user !== null),
            first(),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (user) => {
              subscription.unsubscribe();
              resolve(user);
            },
            error: (err) => {
              subscription.unsubscribe();
              reject(err);
            }
          });
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error('Tiempo de espera agotado'));
        }, 5000);
      });

      await loading.dismiss();
      this.isLoginInProgress = false;
      
      // Navegar según el rol del usuario
      if (user && user.rol === 'asesor_comercial') {
        this.router.navigate(['/asesor/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
      
    } catch (error: any) {
      this.isLoginInProgress = false;
      await loading.dismiss();
      
      let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta. Por favor, intente nuevamente.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada.';
            break;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.presentAlert('Error', errorMessage);
    }
  }

  async loginAsAsesor() {
    if (this.loginForm.invalid || this.isLoginInProgress) {
      return;
    }

    this.isLoginInProgress = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión como asesor...',
      spinner: 'crescent'
    });
    
    try {
      await loading.present();
      
      // Intentar iniciar sesión
      await this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      // Esperar a que el usuario esté disponible (máximo 5 segundos)
      const user = await new Promise<any>((resolve, reject) => {
        const subscription = this.authService.getCurrentUser()
          .pipe(
            filter(user => user !== null),
            first(),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (user) => {
              subscription.unsubscribe();
              resolve(user);
            },
            error: (err) => {
              subscription.unsubscribe();
              reject(err);
            }
          });
        
        // Timeout después de 5 segundos
        setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error('Tiempo de espera agotado'));
        }, 5000);
      });

      await loading.dismiss();
      this.isLoginInProgress = false;
      
      // Verificar si el usuario es asesor
      if (user && user.rol === 'asesor_comercial') {
        this.router.navigate(['/asesor/dashboard']);
      } else {
        await this.presentAlert('Acceso Denegado', 'Esta cuenta no tiene permisos de asesor comercial');
      }
      
    } catch (error: any) {
      this.isLoginInProgress = false;
      await loading.dismiss();
      
      let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta. Por favor, intente nuevamente.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Por favor, intente más tarde.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada.';
            break;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.presentAlert('Error', errorMessage);
    }
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  goBack() {
    this.router.navigate(['/splash']);
  }

  async forgotPassword() {
    if (!this.loginForm.get('email')?.value) {
      await this.presentAlert('Error', 'Por favor ingrese su correo electrónico para recuperar su contraseña.');
      return;
    }

    try {
      await this.authService.sendPasswordResetEmail(this.loginForm.get('email')?.value);
      await this.presentAlert('Correo Enviado', 'Se ha enviado un enlace para restablecer su contraseña a su correo electrónico.');
    } catch (error: any) {
      let errorMessage = 'Error al enviar el correo de recuperación. Por favor, intente nuevamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      }
      
      await this.presentAlert('Error', errorMessage);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
