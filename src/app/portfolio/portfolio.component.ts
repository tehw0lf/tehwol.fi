import { Component, OnInit } from '@angular/core';

import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  gitProviderConfig: { github: string; gitlab: string } = {
    github: environment.githubUser,
    gitlab: environment.gitlabUser
  };

  constructor() {}

  ngOnInit(): void {}
}
