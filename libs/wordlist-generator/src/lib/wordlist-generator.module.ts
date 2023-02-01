import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WordlistGeneratorComponent } from './wordlist-generator.component';
import { WordlistGeneratorService } from './wordlist-generator.service';

@NgModule({
  declarations: [WordlistGeneratorComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    ReactiveFormsModule,
    ClipboardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule
  ],
  exports: [WordlistGeneratorComponent],
  providers: [WordlistGeneratorService]
})
export class WordlistGeneratorModule {}
