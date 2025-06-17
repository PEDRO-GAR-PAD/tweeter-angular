import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user/User';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent {
  myNewUser: User = {
    id: 0,
    email: '',
    username: '',   // <-- AGREGA ESTA LÍNEA
    password: '',
    firstName: '',
    lastName: ''
  };
  
  message: string = '';

  constructor(private userService: UserService) {}

  /** Suscríbete al Observable para procesar la respuesta */
  register(): void {
    this.userService.createUser(this.myNewUser).subscribe({
      next: user => {
        this.myNewUser = user;
        this.message = 'Usuario creado con éxito. ¡Ya puedes loguearte!';
      },
      error: err => {
        console.error('Error creating user', err);
        this.message = 'Error al crear el usuario. Intenta de nuevo.';
      }
    });
  }
}
