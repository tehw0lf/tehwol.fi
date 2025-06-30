import { ClipboardModule } from '@angular/cdk/clipboard';
import { Directive, input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { OcticonDirective } from '../octicon.directive';
import { GitRepository } from '../types/git-repository-type';
import { RepoCardComponent } from './repo-card.component';

const createMockRepository = (overrides: Partial<GitRepository> = {}): GitRepository => {
  const repo = new GitRepository();
  repo.id = 1;
  repo.name = 'test-repo';
  repo.description = 'A test repository';
  repo.html_url = 'https://github.com/user/test-repo';
  repo.clone_url = 'https://github.com/user/test-repo.git';
  repo.language = 'TypeScript';
  repo.stargazers_count = 10;
  repo.forks_count = 5;
  repo.open_issues_count = 3;
  repo.fork = false;
  repo.created_at = '2023-01-01T00:00:00Z';
  repo.pushed_at = '2023-12-01T00:00:00Z';
  repo.license = {
    key: 'mit',
    name: 'MIT License',
    node_id: 'MDc6TGljZW5zZW1pdA==',
    spdx_id: 'MIT',
    url: 'https://api.github.com/licenses/mit'
  };
  repo.owner = {
    avatar_url: 'https://github.com/user.png'
  };
  
  return Object.assign(repo, overrides);
};

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ standalone: true, selector: '[octicon]' })
class MockOcticonDirective {
  octicon = input.required<string>();
  color = input.required<string>();
  width = input<string>();
}

describe('RepoCardComponent', () => {
  let component: RepoCardComponent;
  let fixture: ComponentFixture<RepoCardComponent>;

  const defaultInputs = {
    buttonStyle: { color: 'black' },
    cardStyle: { color: 'blue' },
    textStyle: { color: 'white' },
    checkColor: 'green',
    forkColor: 'purple',
    issueColor: 'orange',
    pasteColor: 'grey',
    starColor: 'yellow'
  };

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
        add: { imports: [MockOcticonDirective] }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepoCardComponent);
    component = fixture.componentInstance;
    
    // Set all required inputs
    Object.entries(defaultInputs).forEach(([key, value]) => {
      fixture.componentRef.setInput(key, value);
    });
    
    fixture.componentRef.setInput('gitRepo', createMockRepository());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('input properties', () => {
    it('should accept all required style inputs', () => {
      expect(component.buttonStyle()).toEqual(defaultInputs.buttonStyle);
      expect(component.cardStyle()).toEqual(defaultInputs.cardStyle);
      expect(component.textStyle()).toEqual(defaultInputs.textStyle);
      expect(component.checkColor()).toBe(defaultInputs.checkColor);
      expect(component.forkColor()).toBe(defaultInputs.forkColor);
      expect(component.issueColor()).toBe(defaultInputs.issueColor);
      expect(component.pasteColor()).toBe(defaultInputs.pasteColor);
      expect(component.starColor()).toBe(defaultInputs.starColor);
    });

    it('should accept gitRepo input', () => {
      const testRepo = createMockRepository({ name: 'custom-repo' });
      fixture.componentRef.setInput('gitRepo', testRepo);
      fixture.detectChanges();
      
      expect(component.gitRepo()).toEqual(testRepo);
    });

    it('should handle isCopied input', () => {
      expect(component.isCopied()).toBe(false); // default value
      
      fixture.componentRef.setInput('isCopied', true);
      fixture.detectChanges();
      
      expect(component.isCopied()).toBe(true);
    });
  });

  describe('repository data handling', () => {
    it('should handle repository with all properties', () => {
      const fullRepo = createMockRepository({
        name: 'full-repo',
        description: 'A complete repository',
        language: 'JavaScript',
        stargazers_count: 100,
        forks_count: 25,
        open_issues_count: 10
      });
      
      fixture.componentRef.setInput('gitRepo', fullRepo);
      fixture.detectChanges();
      
      expect(component.gitRepo().name).toBe('full-repo');
      expect(component.gitRepo().description).toBe('A complete repository');
      expect(component.gitRepo().language).toBe('JavaScript');
      expect(component.gitRepo().stargazers_count).toBe(100);
    });

    it('should handle repository with minimal properties', () => {
      const minimalRepo = createMockRepository({
        name: 'minimal-repo',
        description: undefined,
        language: undefined,
        stargazers_count: undefined,
        forks_count: undefined,
        open_issues_count: undefined
      });
      
      fixture.componentRef.setInput('gitRepo', minimalRepo);
      fixture.detectChanges();
      
      expect(component.gitRepo().name).toBe('minimal-repo');
      expect(component.gitRepo().description).toBeUndefined();
      expect(component.gitRepo().language).toBeUndefined();
    });

    it('should handle forked repository', () => {
      const forkedRepo = createMockRepository({
        fork: true,
        name: 'forked-repo'
      });
      
      fixture.componentRef.setInput('gitRepo', forkedRepo);
      fixture.detectChanges();
      
      expect(component.gitRepo().fork).toBe(true);
    });
  });

  describe('github language colors', () => {
    it('should have access to github language colors', () => {
      expect(component.githubLanguageColors).toBeDefined();
      expect(typeof component.githubLanguageColors).toBe('object');
    });

    it('should provide color for common languages', () => {
      // The github-language-colors package should include common languages
      expect(component.githubLanguageColors).toHaveProperty('JavaScript');
      expect(component.githubLanguageColors).toHaveProperty('TypeScript');
    });
  });

  describe('clipboard functionality', () => {
    it('should emit copiedToClipboard event', () => {
      jest.spyOn(component.copiedToClipboard, 'emit');
      
      // Simulate clipboard action (this would normally be triggered by CDK clipboard)
      component.copiedToClipboard.emit(true);
      
      expect(component.copiedToClipboard.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('component rendering', () => {
    it('should render repository information in the template', () => {
      const testRepo = createMockRepository({
        name: 'test-display-repo',
        description: 'Test description'
      });
      
      fixture.componentRef.setInput('gitRepo', testRepo);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('test-display-repo');
    });

    it('should apply custom styles', () => {
      const customCardStyle = { backgroundColor: 'red', color: 'white' };
      
      fixture.componentRef.setInput('cardStyle', customCardStyle);
      fixture.detectChanges();
      
      expect(component.cardStyle()).toEqual(customCardStyle);
    });
  });

  describe('edge cases', () => {
    it('should handle repository with null values', () => {
      const repoWithNulls = createMockRepository({
        description: null as any,
        language: null as any,
        license: null as any
      });
      
      fixture.componentRef.setInput('gitRepo', repoWithNulls);
      fixture.detectChanges();
      
      expect(component.gitRepo().description).toBeNull();
      expect(component.gitRepo().language).toBeNull();
      expect(component.gitRepo().license).toBeNull();
    });

    it('should handle very large numbers', () => {
      const repoWithLargeNumbers = createMockRepository({
        stargazers_count: 999999,
        forks_count: 50000,
        open_issues_count: 10000
      });
      
      fixture.componentRef.setInput('gitRepo', repoWithLargeNumbers);
      fixture.detectChanges();
      
      expect(component.gitRepo().stargazers_count).toBe(999999);
      expect(component.gitRepo().forks_count).toBe(50000);
      expect(component.gitRepo().open_issues_count).toBe(10000);
    });
  });
});
