import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { ThemeService } from '../../services/theme.service';

interface LibraryCard {
  titleKey: string;
  descriptionKey: string;
  route: string;
  previewUrl: SafeResourceUrl;
}

@Component({
  selector: 'tehw0lf-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, NgStyle, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private themeService = inject(ThemeService);
  private sanitizer = inject(DomSanitizer);
  translateService = inject(TranslateService);

  libraries: LibraryCard[] = [
    {
      titleKey: 'git-portfolio',
      descriptionKey: 'home.gitPortfolioDescription',
      route: '/portfolio',
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl('/portfolio')
    },
    {
      titleKey: 'wordlist-generator',
      descriptionKey: 'home.wordlistGeneratorDescription',
      route: '/wordlist-generator',
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
        '/wordlist-generator'
      )
    },
    {
      titleKey: 'contact-form',
      descriptionKey: 'home.contactFormDescription',
      route: '/contact-form',
      previewUrl: this.sanitizer.bypassSecurityTrustResourceUrl('/contact-form')
    }
  ];

  cardStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? 'rgba(34, 34, 34, 0.75)'
        : 'rgba(255, 255, 255, 0.75)',
    'backdrop-filter': 'blur(50px)',
    color: '#437da8'
  }));

  buttonStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? '#333333'
        : 'rgba(255, 255, 255, 0.75)',
    color: '#cc7832'
  }));
}
