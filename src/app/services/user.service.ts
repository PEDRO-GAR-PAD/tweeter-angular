import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Credential } from '../models/user/Credential';
import { Token } from '../models/user/Token';
import { User } from '../models/user/User';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiURL = 'https://tweeter-springboot.onrender.com/';

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  /**
   * Autenticación de usuario: devuelve Token con accessToken y username
   */
  postLogin(creds: Credential): Observable<Token> {
    const body = {
      username: creds.email,
      password: creds.password
    };
    return this.http
      .post<Token>(`${this.apiURL}api/auth/signin`, body, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Registro de un nuevo usuario
   */
  createUser(user: User): Observable<User> {
    const body = {
      email: user.email,
      username: user.username,  // <-- AGREGA ESTA LÍNEA
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName
    };
    return this.http
      .post<User>(`${this.apiURL}api/auth/signup`, body, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Solicita enlace de reset de contraseña al email
   */
  sendResetLink(email: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiURL}api/auth/forgot-password`, { email }, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Resetea contraseña usando token
   */
  resetPassword(email: string, newPassword: string, token: string): Observable<any> {
    const body = { email, password: newPassword, token };
    return this.http
      .post<any>(`${this.apiURL}api/auth/reset-password`, body, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo genérico de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // Cliente
      msg = error.error.message;
    } else {
      // Servidor
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(msg);
    return throwError(() => new Error(msg));
  }
}