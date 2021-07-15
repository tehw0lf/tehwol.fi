import { Component, EventEmitter, Input, Output } from '@angular/core';

import { GitRepository } from '../git-repository-type';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const githubLanguageColors = require('github-language-colors/colors.json');

@Component({
  selector: 'tehw0lf-repo-card',
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.scss']
})
export class RepoCardComponent {
  @Input()
  gitRepo!: GitRepository;

  @Input()
  public isCopied = false;

  @Output()
  public copiedToClipboardEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  public githubLanguageColors = githubLanguageColors;

  constructor() {
    //
  }
  copiedToClipboard(): void {
    this.copiedToClipboardEvent.emit();
  }
}
