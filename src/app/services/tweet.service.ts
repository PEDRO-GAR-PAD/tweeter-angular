import { Injectable } from '@angular/core';
import { Tweet } from '../models/tweets/Tweet';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TweetService {
  private apiURL = 'http://localhost:8080/';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  /** Construye dinámicamente los headers con el token válido */
  private get httpOptions() {
    const token = this.storageService.getSession('token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`   // <-- ojo al espacio tras "Bearer"
      })
    };
  }

  /** Obtiene la lista de tweets paginados */
  getTweets(): Observable<Tweet> {
    return this.http
      .get<Tweet>(`${this.apiURL}api/tweets/all`, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /** Publica un nuevo tweet */
  postTweet(myTweet: string): Observable<any> {
    const body = { tweet: myTweet };
    return this.http
      .post(`${this.apiURL}api/tweets/create`, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  /** Manejador de errores centralizado */
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = error.error.message;
    } else {
      // Error del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    window.alert(errorMessage);
    return throwError(() => errorMessage);
  }

  createTweet(text: string): Observable<Tweet> {
    return this.http.post<Tweet>('http://localhost:8080/api/tweets', { tweet: text });
  }
  
}
