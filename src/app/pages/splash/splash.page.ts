import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false
})
export class SplashPage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Verificar si ya está autenticado
    this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {
      if (user) {
        if (user.rol === 'asesor_comercial') {
          this.router.navigate(['/asesor/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      }
    });
  }

  goToCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegistro() {
    this.router.navigate(['/registro']);
  }

}
