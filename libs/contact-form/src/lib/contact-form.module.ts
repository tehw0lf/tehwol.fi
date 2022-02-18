import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ContactFormComponent } from './contact-form/contact-form.component';
import { EmailApiService } from './email-api.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  declarations: [ContactFormComponent],
  exports: [ContactFormComponent],
  providers: [EmailApiService]
})
export class ContactFormModule {}
