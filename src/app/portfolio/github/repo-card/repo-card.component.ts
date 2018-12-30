import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import githubLanguageColors from 'github-language-colors/colors.json';
import * as octicons from 'octicons';

import { GithubRepository } from '../github-repository-type';

@Component({
  selector: 'app-repo-card',
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.scss']
})
export class RepoCardComponent implements OnInit {
  @Input()
  githubRepo: GithubRepository;

  @Input()
  public isCopied = false;

  @Output()
  public copiedToClipboardEvent: EventEmitter<boolean> = new EventEmitter<
    boolean
  >();

  public githubLanguageColors = githubLanguageColors;
  public checkIcon: SafeHtml;
  public clippyIcon: SafeHtml;
  public repoForkedIcon: SafeHtml;
  public issueOpenedIcon: SafeHtml;
  public starIcon: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.checkIcon = this.sanitizer.bypassSecurityTrustHtml(
      octicons.check.toSVG({ height: '24px', width: '24px' })
    );
    this.clippyIcon = this.sanitizer.bypassSecurityTrustHtml(
      octicons.clippy.toSVG({ height: '24px', width: '24px' })
    );
    this.repoForkedIcon = this.sanitizer.bypassSecurityTrustHtml(
      octicons['repo-forked'].toSVG()
    );
    this.issueOpenedIcon = this.sanitizer.bypassSecurityTrustHtml(
      octicons['issue-opened'].toSVG()
    );
    this.starIcon = this.sanitizer.bypassSecurityTrustHtml(
      octicons.star.toSVG()
    );
  }

  copiedToClipboard() {
    this.copiedToClipboardEvent.emit();
  }
}
