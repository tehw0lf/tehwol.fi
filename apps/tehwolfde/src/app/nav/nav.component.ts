import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MobileComponent } from './mobile/mobile.component';
import { DesktopComponent } from './desktop/desktop.component';

@Component({
    selector: 'tehw0lf-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    imports: [DesktopComponent, MobileComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent {}
