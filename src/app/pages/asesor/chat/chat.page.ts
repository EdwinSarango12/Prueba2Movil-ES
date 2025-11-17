import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { ContratacionService } from '../../../services/contratacion.service';
import { AuthService } from '../../../services/auth.service';
import { MensajeChat } from '../../../models/mensaje.model';
import { Contratacion } from '../../../models/contratacion.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-chat-asesor',
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
          setTimeout(() => this.scrollToBottom(), 100);
          
          if (this.user) {
            this.chatService.markAsRead(this.contratacionId, this.user.uid);
          }
        }
      });
    }
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.user || !this.contratacionId) return;

    try {
      await this.chatService.sendMessage({
        contratacionId: this.contratacionId,
        remitenteId: this.user.uid,
        remitenteEmail: this.user.email,
        remitenteRol: this.user.rol,
        mensaje: this.nuevoMensaje.trim()
      });
      this.nuevoMensaje = '';
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
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

