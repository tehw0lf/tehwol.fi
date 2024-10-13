import { Component, effect } from '@angular/core';
import { GitPortfolioComponent as GitPortfolioComponent_1 } from '@tehw0lf/git-portfolio';

import { environment } from '../../environments/environment.prod';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'tehw0lf-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss'],
  standalone: true,
  imports: [GitPortfolioComponent_1]
})
export class GitPortfolioComponent {
  buttonStyle = {
    'background-color': 'rgba(34, 34, 34, 0.75)',
    color: '#cc7832'
  };

  cardStyle = {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)'
  };

  gitProviderConfig: { github?: string; gitlab?: string } = {
    github: environment.githubUser
  };

  constructor(private themeService: ThemeService) {
    effect(() =>
      this.themeService.theme() === 'dark'
        ? this.switchToDark()
        : this.switchToLight()
    );
  }

  switchToLight(): void {
    this.buttonStyle = {
      'background-color': 'rgba(255, 255, 255, 0.75)',
      color: '#cc7832'
    };

    this.cardStyle = {
      color: '#437da8',
      'background-color': 'rgba(255, 255, 255, 0.75)',
      'backdrop-filter': 'blur(50px)'
    };
  }

  switchToDark(): void {
    this.buttonStyle = {
      'background-color': 'rgba(34, 34, 34, 0.75)',
      color: '#cc7832'
    };

    this.cardStyle = {
      color: '#437da8',
      'background-color': 'rgba(34, 34, 34, 0.75)',
      'backdrop-filter': 'blur(50px)'
    };
  }
}
