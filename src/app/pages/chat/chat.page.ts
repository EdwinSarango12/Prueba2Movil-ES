import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { ContratacionService } from '../../services/contratacion.service';
import { AuthService } from '../../services/auth.service';
import { MensajeChat } from '../../models/mensaje.model';
import { Contratacion } from '../../models/contratacion.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {
  @ViewChild('content') content!: ElementRef;
  
  mensajes: MensajeChat[] = [];
  nuevoMensaje: string = '';
  contratacionId: string = '';
  contratacion: Contratacion | null = null;
  user: User | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private contratacionService: ContratacionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.contratacionId = this.route.snapshot.paramMap.get('id') || '';
    
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (user && this.contratacionId) {
        this.loadContratacion();
        this.loadMensajes();
        
        // Enviar mensaje automático si viene en queryParams
        this.route.queryParams.subscribe(params => {
          if (params['mensaje']) {
            setTimeout(() => {
              this.nuevoMensaje = params['mensaje'];
              this.enviarMensaje();
            }, 500);
          }
        });
      }
    });
  }

  loadContratacion() {
    if (this.contratacionId) {
      this.contratacionService.getContratacion(this.contratacionId).subscribe({
        next: (contratacion) => {
          this.contratacion = contratacion || null;
          this.loading = false;
        }
      });
    }
  }

  loadMensajes() {
    if (this.contratacionId) {
      this.chatService.getMensajes(this.contratacionId).subscribe({
        next: (mensajes) => {
          this.mensajes = mensajes;
          setTimeout(() => this.scrollToBottom(), 200);
          
          // Marcar como leídos
          if (this.user) {
            this.chatService.markAsRead(this.contratacionId, this.user.uid);
          }
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.loading = false;
        }
      });
    }
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.user || !this.contratacionId) return;

    const mensajeTexto = this.nuevoMensaje.trim();
    this.nuevoMensaje = ''; // Limpiar inmediatamente para mejor UX

    try {
      await this.chatService.sendMessage({
        contratacionId: this.contratacionId,
        remitenteId: this.user.uid,
        remitenteEmail: this.user.email,
        remitenteRol: this.user.rol,
        mensaje: mensajeTexto
      });
      setTimeout(() => this.scrollToBottom(), 200);
    } catch (error) {
      console.error('Error sending message:', error);
      this.nuevoMensaje = mensajeTexto; // Restaurar mensaje si hay error
    }
  }

  scrollToBottom() {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) {}
  }

  isMyMessage(mensaje: MensajeChat): boolean {
    return mensaje.remitenteId === this.user?.uid;
  }
}

