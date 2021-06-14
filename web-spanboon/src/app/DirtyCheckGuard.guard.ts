import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DirtyComponent } from './DirtyComponent';

@Injectable({
  providedIn: 'root'
})
export class DirtyCheckGuard implements CanDeactivate<DirtyComponent> {
  canDeactivate(
    component: DirtyComponent,
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    console.log('component ', component);
    if (component.canDeactivate()) {
      return confirm(
        'There are changes you have made to the page. If you quit, you will lose your changes.'
      );
    } else {
      return true;
    }
  }

}
