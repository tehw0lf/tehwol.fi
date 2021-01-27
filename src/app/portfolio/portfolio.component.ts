import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  gitProviderConfig: { github: string; gitlab: string } = {
    github: 'tehw0lf',
    gitlab: 'tehw0lf'
  };

  constructor() {}

  ngOnInit(): void {}
}
