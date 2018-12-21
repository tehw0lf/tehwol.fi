import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { GithubRepository } from './github-repository-type';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private API_URL = environment.API_URL;
  private GITHUB_USER = environment.GITHUB_USER;

  constructor(private http: HttpClient) {}

  fetchRepositories(): Observable<GithubRepository[]> {
    return this.http.get<GithubRepository[]>(
      `${this.API_URL}/users/${this.GITHUB_USER}/repos`
    );
  }
}
