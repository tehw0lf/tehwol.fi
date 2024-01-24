/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import * as githubLanguageColors from 'github-language-colors/colors.json';

import { OcticonDirective } from '../octicon.directive';
import { GitRepository } from '../types/git-repository-type';

interface Dictionary {
  [id: string]: string;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'repo-card',
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    NgStyle,
    MatButtonModule,
    OcticonDirective,
    ClipboardModule,
    DatePipe
  ]
})
export class RepoCardComponent {
  @Input({ required: true }) buttonStyle!: any;
  @Input({ required: true }) cardStyle!: any;
  @Input({ required: true }) textStyle!: any;
  @Input({ required: true }) checkColor!: string;
  @Input({ required: true }) forkColor!: string;
  @Input({ required: true }) issueColor!: string;
  @Input({ required: true }) pasteColor!: string;
  @Input({ required: true }) starColor!: string;

  @Input({ required: true })
  gitRepo!: GitRepository;

  @Input()
  public isCopied = false;

  @Output()
  public copiedToClipboardEvent: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  public githubLanguageColors = githubLanguageColors as Dictionary;

  copiedToClipboard(): void {
    this.copiedToClipboardEvent.emit();
  }
}
