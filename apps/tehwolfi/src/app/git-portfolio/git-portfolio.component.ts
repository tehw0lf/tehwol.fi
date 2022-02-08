import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';

import { environment } from '../../environments/environment.prod';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'tehw0lf-git-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './git-portfolio.component.html',
  styleUrls: ['./git-portfolio.component.scss']
})
export class GitPortfolioComponent implements OnInit, OnDestroy {
  backgroundColor = 'rgba(34, 34, 34, 0.75)';
  cardStyle: string[] = [
    'color: "#437da8"',
    `"background-color": ${this.backgroundColor}`,
    '"backdrop-filter": "blur(50px)"'
  ];

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
    this.backgroundColor = 'rgba(255, 255, 255, 0.75)';
  }

  switchToDark(): void {
    this.backgroundColor = 'rgba(34, 34, 34, 0.75)';
  }
}
