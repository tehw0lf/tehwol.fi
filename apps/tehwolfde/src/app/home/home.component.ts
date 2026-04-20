import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NgStyle } from '@angular/common';

import { ThemeService } from '../theme.service';

interface LibraryCard {
  title: string;
  description: string;
  route: string;
  previewUrl: SafeResourceUrl;
}

@Component({
  selector: 'tehw0lf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);

  libraries: LibraryCard[] = [
    {
      title: 'git-portfolio',
      description: 'Customizable Git repository portfolio supporting GitHub and GitLab. Displays repos with stats, language colors, and links.',
      route: '/portfolio',
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl('/portfolio')
    },
    {
      title: 'wordlist-generator',
      description: 'Cartesian product-based wordlist generator with drag-and-drop charset management and multiple export formats.',
      route: '/wordlist-generator',
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl('/wordlist-generator')
    },
    {
      title: 'contact-form',
      description: 'Flexible contact form built with ngx-formly. Supports dynamic fields, validation, and custom API callbacks.',
      route: '/contact-form',
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl('/contact-form')
    }
  ];

  cardStyle = computed(() => ({
    'background-color': this.themeService.theme() === 'dark'
      ? 'rgba(34, 34, 34, 0.75)'
      : 'rgba(255, 255, 255, 0.75)',
    'backdrop-filter': 'blur(50px)',
    color: '#437da8'
  }));

  buttonStyle = computed(() => ({
    'background-color': this.themeService.theme() === 'dark'
      ? '#333333'
      : 'rgba(255, 255, 255, 0.75)',
    color: '#cc7832'
  }));
}
