import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgAirbashDatabaseEditorComponent } from './ng-airbash-database-editor.component';

@NgModule({
  declarations: [NgAirbashDatabaseEditorComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,],
    exports: [NgAirbashDatabaseEditorComponent]
})
export class NgAirbashDatabaseEditorModule {}
