import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailApiService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  constructor(private http: HttpClient) {}

  sendEmail(apiURL: string, data: any): Observable<any> {
    return this.http.post(apiURL, JSON.stringify(data), this.httpOptions).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error: any) => {
        return of(error.statusText);
      })
    );
  }
}
