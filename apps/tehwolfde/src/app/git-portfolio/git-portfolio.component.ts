import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  GitPortfolioComponent as GitPortfolioComponent_1,
  GitProviderConfig
} from '@tehw0lf/git-portfolio';

import { ThemeService } from '../theme.service';

@Component({
    selector: 'tehw0lf-git-portfolio',
    templateUrl: './git-portfolio.component.html',
    styleUrls: ['./git-portfolio.component.scss'],
    imports: [GitPortfolioComponent_1],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GitPortfolioComponent {
  private themeService = inject(ThemeService);

  buttonStyle = computed(() => ({
    'background-color': this.themeService.theme() === 'dark' 
      ? 'rgba(34, 34, 34, 0.75)' 
      : 'rgba(255, 255, 255, 0.75)',
    color: '#cc7832'
  }));

  cardStyle = computed(() => ({
    color: '#437da8',
    'background-color': this.themeService.theme() === 'dark' 
      ? 'rgba(34, 34, 34, 0.75)' 
      : 'rgba(255, 255, 255, 0.75)',
    'backdrop-filter': 'blur(50px)'
  }));

  gitProviderConfig: GitProviderConfig = {
    github: 'tehw0lf'
  };
}
