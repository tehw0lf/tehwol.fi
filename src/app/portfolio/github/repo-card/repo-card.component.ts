import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import githubLanguageColors from 'github-language-colors/colors.json';

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

  constructor() {}

  ngOnInit() {}

  copiedToClipboard() {
    this.copiedToClipboardEvent.emit();
  }
}
