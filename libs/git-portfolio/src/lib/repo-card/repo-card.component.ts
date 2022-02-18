/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { GitRepository } from '../types/git-repository-type';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const githubLanguageColors = require('github-language-colors/colors.json');

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'repo-card',
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.scss']
})
export class RepoCardComponent {
  @Input() buttonStyle!: any;
  @Input() cardStyle!: any;
  @Input() textStyle!: any;
  @Input() checkColor!: string;
  @Input() forkColor!: string;
  @Input() issueColor!: string;
  @Input() pasteColor!: string;
  @Input() starColor!: string;

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
