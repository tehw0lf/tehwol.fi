import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';

import { environment } from '../../environments/environment.prod';
import { ThemeService } from '../theme.service';
import { GitPortfolioComponent as GitPortfolioComponent_1 } from '../../../../../libs/git-portfolio/src/lib/git-portfolio.component';

@Component({
    selector: 'tehw0lf-git-portfolio',
    templateUrl: './git-portfolio.component.html',
    styleUrls: ['./git-portfolio.component.scss'],
    standalone: true,
    imports: [GitPortfolioComponent_1]
})
export class GitPortfolioComponent implements OnInit, OnDestroy {
  buttonStyle = {
    'background-color': 'rgba(34, 34, 34, 0.75)',
    color: '#cc7832'
  };

  cardStyle = {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)'
  };

  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser
  };

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isLight
      .pipe(
        tap((isLight: boolean) => {
          isLight ? this.switchToLight() : this.switchToDark();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
