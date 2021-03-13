import { Component, OnInit } from '@angular/core';

import { environment } from '../../environments/environment.prod';

@Component({
  selector: "app-git-portfolio",
  templateUrl: "./git-portfolio.component.html",
  styleUrls: ["./git-portfolio.component.scss"],
})
export class GitPortfolioComponent implements OnInit {
  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser,
  };

  constructor() {}

  ngOnInit(): void {}
}
