import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgWordlistGeneratorComponent } from './ng-wordlist-generator.component';
import { NgWordlistGeneratorService } from './ng-wordlist-generator.service';

@NgModule({
  declarations: [NgWordlistGeneratorComponent],
  imports: [CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    ReactiveFormsModule,
    ClipboardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,],
  exports: [NgWordlistGeneratorComponent], 
  providers: [NgWordlistGeneratorService]
})
export class NgWordlistGeneratorModule {}
