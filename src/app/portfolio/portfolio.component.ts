import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  githubUser: string;

  constructor() {}

  ngOnInit() {
    this.githubUser = environment.GITHUB_USER;
  }
}
