/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { GitRepository } from '../types/git-repository-type';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { OcticonDirective } from '../octicon.directive';
import { MatButtonModule } from '@angular/material/button';
import { NgStyle, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const githubLanguageColors = require('github-language-colors/colors.json');

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'repo-card',
    templateUrl: './repo-card.component.html',
    styleUrls: ['./repo-card.component.scss'],
    standalone: true,
    imports: [MatCardModule, NgStyle, MatButtonModule, OcticonDirective, ClipboardModule, DatePipe]
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
