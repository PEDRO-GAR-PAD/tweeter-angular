// src/app/services/reaction.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from './storage.service';
import { Observable, throwError } from 'rxjs';
import { Reaction } from '../models/reaction.model';
import { catchError, retry } from 'rxjs/operators';

export interface TweetReaction {
  id: number;
  tweet: { id: number };
  reaction: Reaction;
  user: { id: number; username: string };
}

@Injectable({
  providedIn: 'root'
})
export class ReactionService {
  private baseUrl = 'http://localhost:8080/api/reactions';

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {}

  /** Construye dinámicamente los headers con el token válido */
  private get httpOptions() {
    const token = this.storage.getSession('token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`   // ← espacio tras "Bearer"
      })
    };
  }

  /** Obtener todas las reacciones (para conteos) */
  getAllReactions(page = 0, size = 1000): Observable<{ content: TweetReaction[] }> {
    return this.http.get<{ content: TweetReaction[] }>(
      `${this.baseUrl}/all?page=${page}&size=${size}`,
      this.httpOptions
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /** Obtener tipos de reacción */
  getReactionTypes(): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(
      `${this.baseUrl}/types`,
      this.httpOptions
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /** Crear nueva reacción */
  createReaction(tweetId: number, reactionId: number): Observable<TweetReaction> {
    return this.http.post<TweetReaction>(
      `${this.baseUrl}/create`,
      { tweetId, reactionId },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /** Actualizar reacción existente */
  updateReaction(tweetId: number, reactionId: number): Observable<TweetReaction> {
    return this.http.put<TweetReaction>(
      `${this.baseUrl}/update`,
      { tweetId, reactionId },
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /** Borrar reacción del usuario en ese tweet */
  deleteReaction(tweetId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/tweet/${tweetId}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /** Manejador de errores centralizado */
  private handleError(error: any) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      msg = error.error.message;
    } else {
      // Error del servidor
      msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(msg);
    window.alert(msg);
    return throwError(() => msg);
  }
}
