import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContratacionService } from '../../../services/contratacion.service';
import { AuthService } from '../../../services/auth.service';
import { Contratacion } from '../../../models/contratacion.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: false
})
export class ChatsPage implements OnInit {
  contrataciones: Contratacion[] = [];
  user: User | null = null;
  loading = true;

  constructor(
    private contratacionService: ContratacionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      this.loadChats();
    });
  }

  loadChats() {
    this.contratacionService.getAllContrataciones().subscribe({
      next: (contrataciones) => {
        // Filtrar solo las contrataciones aprobadas o pendientes (que tienen chats)
        this.contrataciones = contrataciones.filter(c => 
          c.estado === 'aprobada' || c.estado === 'pendiente'
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading chats:', error);
        this.loading = false;
      }
    });
  }

  abrirChat(contratacionId: string) {
    this.router.navigate(['/asesor/chat', contratacionId]);
  }
}
