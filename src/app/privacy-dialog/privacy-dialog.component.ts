import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-privacy-dialog',
  templateUrl: './privacy-dialog.component.html',
  styleUrls: ['./privacy-dialog.component.scss']
})
export class PrivacyDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<PrivacyDialogComponent>) {}

  ngOnInit(): void {}

  accept = (): void => this.dialogRef.close(true);
  deny = (): void => this.dialogRef.close(false);
}
