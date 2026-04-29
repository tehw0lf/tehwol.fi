import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GitPortfolioComponent as GitPortfolioComponent_1, GitProviderConfig } from '@tehw0lf/git-portfolio';

import { TranslateService } from '../../i18n/translate.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'tehw0lf-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  imports: [GitPortfolioComponent_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GitPortfolioComponent {
  private themeService = inject(ThemeService);
  translateService = inject(TranslateService);

  buttonStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? 'rgba(34, 34, 34, 0.75)'
        : 'rgba(255, 255, 255, 0.75)',
    color: '#cc7832'
  }));

  cardStyle = computed(() => ({
    color: '#437da8',
    'background-color':
      this.themeService.theme() === 'dark'
        ? 'rgba(34, 34, 34, 0.75)'
        : 'rgba(255, 255, 255, 0.75)',
    'backdrop-filter': 'blur(50px)'
  }));

  gitProviderConfig: GitProviderConfig = {
    github: 'tehw0lf'
  };

  get gitPortfolioLabels() {
    const t = this.translateService.translate.bind(this.translateService);
    return {
      ownRepos: t('gitPortfolio.ownRepos'),
      forkedRepos: t('gitPortfolio.forkedRepos'),
      noOwnRepos: t('gitPortfolio.noOwnRepos'),
      noForkedRepos: t('gitPortfolio.noForkedRepos'),
      copyRepoUrl: t('gitPortfolio.copyRepoUrl'),
      created: t('gitPortfolio.created'),
      updated: t('gitPortfolio.updated')
    };
  }
}
