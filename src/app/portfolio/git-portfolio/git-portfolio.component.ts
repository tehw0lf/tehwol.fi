import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { GitProviderService } from './git-provider.service';
import { GitProviders, GitRepositories } from './git-repositories-type';
import { GitRepository } from './git-repository-type';

@Component({
  selector: 'app-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss']
})
export class GitProviderComponent implements OnInit {
  @Input()
  gitProviderUserNames: Map<GitProviders, string>;

  @Input()
  showForked = true;

  @Input()
  showOwn = true;

  gitProviders = GitProviders;
  currentRepo: GitRepository;
  gitRepositories$: Observable<GitRepositories>;

  constructor(private gitProviderService: GitProviderService) {}

  ngOnInit(): void {
    this.getRepositories();
  }

  copyToClipboard(githubRepo: GitRepository): void {
    this.currentRepo = githubRepo;
  }

  isCopiedToClipboard(githubRepo: GitRepository): boolean {
    if (!this.currentRepo) {
      return false;
    }
    return this.currentRepo.id === githubRepo.id ? true : false;
  }

  getRepositories(): void {
    this.gitRepositories$ = this.gitProviderService.fetchRepositories(
      this.gitProviderUserNames
    );
  }
}
