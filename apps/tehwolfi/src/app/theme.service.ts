import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isLightSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  isLight: Observable<boolean>;

  constructor() {
    //
    this.isLight = this.isLightSubject.asObservable();
  }

  dark(): void {
    this.isLightSubject.next(false);
  }

  light(): void {
    this.isLightSubject.next(true);
  }
}
