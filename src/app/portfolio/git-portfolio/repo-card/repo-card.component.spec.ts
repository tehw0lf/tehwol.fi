import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';

import { GitRepository } from '../git-repository-type';
import { RepoCardComponent } from './repo-card.component';

const GITHUB_REPO: GitRepository = new GitRepository();

describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ClipboardModule, MatCardModule],
        declarations: [RepoCardComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    component.gitRepo = GITHUB_REPO;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit copy event', () => {
    const sub = component.copiedToClipboardEvent
      .asObservable()
      .subscribe((copied) => {
        expect(copied).toBeTruthy;
      });
    component.copiedToClipboard();
    sub.unsubscribe();
  });
});
