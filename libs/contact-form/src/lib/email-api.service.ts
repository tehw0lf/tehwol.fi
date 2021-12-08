import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailApiService {
  constructor(private http: HttpClient) {}

  sendEmail(apiURL: string, data: any): Observable<any> {
    return this.http.post(apiURL, data).pipe(
      catchError((error: any) => {
        return of(error.statusText);
      })
    );
  }
}
