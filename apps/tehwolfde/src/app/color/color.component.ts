import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

import { EmbedComponent } from '../embed/embed.component';

@Component({
  selector: 'tehw0lf-color',
  templateUrl: './color.component.html',
  styleUrl: './color.component.scss',
  standalone: true,
  imports: [EmbedComponent, FormsModule, MatInputModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColorComponent {
  @ViewChild(EmbedComponent) private embed: EmbedComponent | undefined;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  color = signal(this.route.snapshot.paramMap.get('color') ?? '8e8e8e');
  inputValue = signal(this.color());

  iframeUrl = computed(
    () => `https://color.tehwolf.de?${encodeURIComponent(this.color())}`
  );

  apply(): void {
    const value = this.inputValue().trim();
    if (!value) return;
    this.color.set(value);
    this.router.navigate(['/color', value], { replaceUrl: true });
    this.embed?.sendMessage({ type: 'color', color: value });
  }
}
