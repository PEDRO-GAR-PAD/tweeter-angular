import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Credential } from '../models/user/Credential';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router
  ) {}

  callLogin(): void {
    const creds: Credential = {
      email: this.email,
      password: this.password
    };

    this.userService.postLogin(creds).subscribe({
      next: data => {
        console.log('user logged:', data);
        this.storageService.setSession('username', data.username);
        this.storageService.setSession('token', data.accessToken);
        this.router.navigate(['/home']);
      },
      error: err => {
        console.error('login error', err);
        alert('Login failed: ' + (err.error?.message || err.message));
        this.email = '';
        this.password = '';
      }
    });
  }
}
