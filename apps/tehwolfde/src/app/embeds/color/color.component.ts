import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslatePipe } from '../../i18n/translate.pipe';
import { EmbedComponent } from '../embed/embed.component';

function resolveToHex(colorValue: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#000000';
  ctx.fillStyle = '#000000';
  ctx.fillStyle = colorValue;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'tehw0lf-color',
  templateUrl: './color.component.html',
  styleUrl: './color.component.scss',
  standalone: true,
  imports: [EmbedComponent, FormsModule, MatInputModule, MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorComponent {
  @ViewChild(EmbedComponent) private embed: EmbedComponent | undefined;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  color = signal(this.route.snapshot.paramMap.get('color') ?? '8e8e8e');
  inputValue = signal(this.color());

  hexColor = computed(() => resolveToHex(this.color()));

  iframeUrl = computed(
    () => `https://color.tehwolf.de/?${encodeURIComponent(this.color())}`
  );

  apply(): void {
    const value = this.inputValue().trim();
    if (!value) return;
    this.color.set(value);
    this.router.navigate(['/color', value], { replaceUrl: true });
    this.embed?.sendMessage({ type: 'color', color: value });
  }
}
