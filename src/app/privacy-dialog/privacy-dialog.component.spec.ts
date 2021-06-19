import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { PrivacyDialogComponent } from './privacy-dialog.component';

const mockDialogRef = {
  close: jest.fn()
};

const mockMatDialog = {
  close: (value) => {
    return {
      afterClosed: () => of(value)
    };
  }
};

describe('PrivacyDialogComponent', () => {
  let component: PrivacyDialogComponent;
  let fixture: ComponentFixture<PrivacyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivacyDialogComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true on accept', () => {
    component.accept();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should return false on deny', () => {
    component.deny();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
