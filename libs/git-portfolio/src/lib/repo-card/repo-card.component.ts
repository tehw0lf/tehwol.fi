import { ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import * as githubLanguageColors from 'github-language-colors/colors.json';

import { OcticonDirective } from '../octicon.directive';
import { GitRepository } from '../types/git-repository-type';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Dictionary {
  [id: string]: string;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'repo-card',
    templateUrl: './repo-card.component.html',
    styleUrls: ['./repo-card.component.scss'],
    imports: [
        MatCardModule,
        NgStyle,
        MatButtonModule,
        OcticonDirective,
        ClipboardModule,
        DatePipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepoCardComponent {
  buttonStyle = input.required<any>();
  cardStyle = input.required<any>();
  textStyle = input.required<any>();
  checkColor = input.required<string>();
  forkColor = input.required<string>();
  issueColor = input.required<string>();
  pasteColor = input.required<string>();
  starColor = input.required<string>();

  gitRepo = input.required<GitRepository>();

  isCopied = input(false);

  copiedToClipboard = output<boolean>();

  githubLanguageColors = githubLanguageColors as Dictionary;
}
