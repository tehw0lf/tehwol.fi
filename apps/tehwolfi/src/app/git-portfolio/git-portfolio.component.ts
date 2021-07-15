import { Component } from '@angular/core';

import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'tehw0lf-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss']
})
export class GitPortfolioComponent {
  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser
  };

  constructor() {
    //
  }
}
