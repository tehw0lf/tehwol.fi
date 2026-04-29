import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { WordlistGeneratorComponent as WordlistGeneratorComponent_1 } from '@tehw0lf/wordlist-generator';

import { TranslateService } from '../../i18n/translate.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'tehw0lf-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  imports: [WordlistGeneratorComponent_1],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordlistGeneratorComponent {
  themeService = inject(ThemeService);
  translateService = inject(TranslateService);

  buttonStyle = computed(() => ({
    'background-color':
      this.themeService.theme() === 'dark'
        ? '#333333'
        : 'rgba(255, 255, 255, 0.75)',
    color: '#cc7832'
  }));

  get wordlistLabels() {
    const t = this.translateService.translate.bind(this.translateService);
    return {
      generating: t('wordlistGenerator.generating'),
      generate: t('wordlistGenerator.generate'),
      chooseFormat: t('wordlistGenerator.chooseFormat'),
      downloadAs: t('wordlistGenerator.downloadAs'),
      processingLarge: t('wordlistGenerator.processingLarge'),
      prefix: t('wordlistGenerator.prefix'),
      charsetPosition: t('wordlistGenerator.charsetPosition'),
      suffix: t('wordlistGenerator.suffix'),
      generatedWordlist: t('wordlistGenerator.generatedWordlist'),
      tooLarge: t('wordlistGenerator.tooLarge')
    };
  }
}
