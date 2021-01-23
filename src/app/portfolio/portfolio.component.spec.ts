import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { of } from 'rxjs';

import { GitProviderComponent } from './git-portfolio/git-portfolio.component';
import { GitProviderService } from './git-portfolio/git-provider.service';
import { GitRepository } from './git-portfolio/git-repository-type';
import { RepoCardComponent } from './git-portfolio/repo-card/repo-card.component';
import { PortfolioComponent } from './portfolio.component';

const GIT_REPO = new GitRepository();

const gitProviderServiceStub = {
  fetchRepositories() {
    return of([GIT_REPO]);
  }
};

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatCardModule, ClipboardModule],
        declarations: [
          PortfolioComponent,
          GitProviderComponent,
          RepoCardComponent
        ],
        providers: [
          { provide: GitProviderService, useValue: gitProviderServiceStub }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
