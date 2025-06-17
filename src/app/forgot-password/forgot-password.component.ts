import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';

  constructor(private userService: UserService) {}

  /** Llama al servicio y muestra mensaje según resultado */
  resetPassword(): void {
    if (!this.email.trim()) {
      this.message = 'Introduce un email válido';
      return;
    }

    this.userService.sendResetLink(this.email.trim()).subscribe({
      next: () => {
        this.message = 'Enlace de restablecimiento enviado. Revisa tu correo.';
      },
      error: err => {
        console.error('Error sending reset link', err);
        this.message = 'Error al enviar el enlace. Intenta nuevamente.';
      }
    });
  }
}
