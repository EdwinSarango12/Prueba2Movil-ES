import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false
})
export class OnboardingPage implements OnInit, OnDestroy {
  currentSlide = 0;
  private slideInterval: any;
  slides = [
    {
      title: 'Bienvenido',
      description: 'Descubre los mejores planes móviles de Tigo Ecuador',
      icon: 'phone-portrait-outline',
      color: 'primary'
    },
    {
      title: 'Planes Flexibles',
      description: 'Elige el plan que mejor se adapte a tus necesidades',
      icon: 'card-outline',
      color: 'secondary'
    },
    {
      title: 'Atención 24/7',
      description: 'Chatea con nuestros asesores en tiempo real',
      icon: 'chatbubbles-outline',
      color: 'tertiary'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 3000);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  skip() {
    this.router.navigate(['/catalogo']);
  }
}

