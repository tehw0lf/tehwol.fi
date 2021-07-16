import { Component, OnInit } from '@angular/core';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'ng-airbash-database-editor',
  templateUrl: './ng-airbash-database-editor.component.html',
  styleUrls: ['./ng-airbash-database-editor.component.scss']
})
export class NgAirbashDatabaseEditorComponent implements OnInit, OnDestroy {
  dataSource$: MatDataSource;
  private unsubscribe$ = new Subject<void>();
  constructor(private databaseService: DatabaseService) {}

  ngOnInit(): void {
    this.dataSource$ = this.databaseService.getDataSource();
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
