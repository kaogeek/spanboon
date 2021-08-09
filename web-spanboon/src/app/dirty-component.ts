import { EventEmitter } from '@angular/core';
import {Observable} from 'rxjs';

export interface DirtyComponent {
    canDeactivate: () => boolean | Observable<boolean>; 
  
} 