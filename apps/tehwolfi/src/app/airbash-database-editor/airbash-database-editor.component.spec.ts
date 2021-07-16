import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgAirbashDatabaseEditorModule } from '@tehw0lf/ng-airbash-database-editor';

import { AirbashDatabaseEditorComponent } from './airbash-database-editor.component';

describe('AirbashDatabaseEditorComponent', () => {
  let component: AirbashDatabaseEditorComponent;
  let fixture: ComponentFixture<AirbashDatabaseEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgAirbashDatabaseEditorModule],
      declarations: [AirbashDatabaseEditorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirbashDatabaseEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
