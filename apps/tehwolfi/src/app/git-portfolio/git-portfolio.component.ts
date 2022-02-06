import { ChangeDetectionStrategy, Component } from '@angular/core';

import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'tehw0lf-git-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss']
})
export class GitPortfolioComponent {
  backgroundColor = 'rgba(255, 255, 255, 0.75)';

  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser
  };

  switchToLight(): void {
    this.backgroundColor = 'rgba(255, 255, 255, 0.75)';
  }

  switchToDark(): void {
    this.backgroundColor = 'rgba(34, 34, 34, 0.75)';
  }

  constructor() {
    //
  }
}
