import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

import { GitProviders } from '../../../projects/git-portfolio/src/lib/git-repositories-type';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  gitProviderUserNames: Map<GitProviders, string>;

  constructor() {}

  ngOnInit(): void {
    this.gitProviderUserNames = new Map<GitProviders, string>();
    this.gitProviderUserNames.set(GitProviders.github, environment.GITHUB_USER);
    this.gitProviderUserNames.set(GitProviders.gitlab, environment.GITLAB_USER);
  }
}
