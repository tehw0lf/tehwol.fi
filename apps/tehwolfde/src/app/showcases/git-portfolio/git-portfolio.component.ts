import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject
} from '@angular/core';
import {
  GitPortfolioComponent as GitPortfolioComponent_1,
  GitProviderConfig,
  GitProviderService
} from '@tehw0lf/git-portfolio';
import { createGitPortfolioTools } from '@tehw0lf/git-portfolio/webmcp';

import { TranslateService } from '../../i18n/translate.service';
import { ThemeService } from '../../services/theme.service';
import { WebmcpService } from '../../services/webmcp.service';

@Component({
  selector: 'tehw0lf-git-portfolio',
  templateUrl: './git-portfolio.component.html',
  imports: [GitPortfolioComponent_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GitPortfolioComponent {
  private themeService = inject(ThemeService);
  translateService = inject(TranslateService);
  private webmcp = inject(WebmcpService);
  private gitProviderService = inject(GitProviderService);
  private destroyRef = inject(DestroyRef);

  gitProviderConfig: GitProviderConfig = {
    github: 'tehw0lf'
  };

  constructor() {
    afterNextRender(() => {
      // Shares GitProviderService with the rendered component, so tool calls
      // hit the same ten minute cache instead of the provider APIs.
      void this.webmcp.register(
        createGitPortfolioTools(
          this.gitProviderService,
          this.gitProviderConfig
        )
      );
    });

    this.destroyRef.onDestroy(() => void this.webmcp.register());
  }

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
