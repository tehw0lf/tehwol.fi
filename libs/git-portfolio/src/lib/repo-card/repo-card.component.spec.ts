import { ClipboardModule } from '@angular/cdk/clipboard';
import { Directive } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { OcticonDirective } from '../octicon.directive';
import { GitRepository } from '../types/git-repository-type';
import { RepoCardComponent } from './repo-card.component';

const GITHUB_REPO: GitRepository = new GitRepository();

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ standalone: true, selector: '[octicon]' })
class MockOcticonDirectiveDirective {}

describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ClipboardModule,
        MatButtonModule,
        MatCardModule,
        RepoCardComponent,
        OcticonDirective
      ]
    })
      .overrideComponent(RepoCardComponent, {
        remove: { imports: [OcticonDirective] },
        add: { imports: [MockOcticonDirectiveDirective] }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('buttonStyle', { color: 'black' });
    fixture.componentRef.setInput('cardStyle', { color: 'blue' });
    fixture.componentRef.setInput('textStyle', { color: 'white' });
    fixture.componentRef.setInput('checkColor', { color: 'green' });
    fixture.componentRef.setInput('forkColor', { color: 'purple' });
    fixture.componentRef.setInput('issueColor', { color: 'green' });
    fixture.componentRef.setInput('pasteColor', { color: 'grey' });
    fixture.componentRef.setInput('starColor', { color: 'yellow' });
    fixture.componentRef.setInput('gitRepo', GITHUB_REPO);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
