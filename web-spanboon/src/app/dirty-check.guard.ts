import { EventEmitter, Injectable, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    CanDeactivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    UrlTree,
    Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { MESSAGE } from './AlertMessage';
import { AbstractPage } from './components/pages/AbstractPage';
import { DialogAlert } from './components/shares/dialog/DialogAlert.component';
import { DirtyComponent } from './dirty-component';

@Injectable({
    providedIn: 'root'
})
export class DirtyCheckGuard implements CanDeactivate<DirtyComponent> {

    @Output()
    public confirmClickedEvent: EventEmitter<any> = new EventEmitter();
    @Output()
    public cancelClickedEvent: EventEmitter<any> = new EventEmitter();

    public router: Router

    constructor(router: Router,public dialog: MatDialog) {
        this.router = router;
    }

    canDeactivate(component: DirtyComponent, next: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
        if (component && component.canDeactivate()) {
            const dialogRef = this.showConfirmDialog("คุณต้องการละทิ้งข้อมูลใช่หรือไม่", "ตกลง", "ยกเลิก"); 
            dialogRef.afterClosed().subscribe((result) => {  
                if(result){  
                    window.location.reload();
                }
            });
        } else {
            return true;
        }
    }

    public showConfirmDialog(text: any, confirmText?: string, cancelText?: string, confirmClickedEvent?: any, cancelClickedEvent?: any) {
        const dialogRef = this.dialog.open(DialogAlert, {
            autoFocus: false,
            data: {
                text: text,
                bottomText1: (cancelText) ? cancelText : MESSAGE.TEXT_BUTTON_CANCEL,
                bottomText2: (confirmText) ? confirmText : MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black",
                confirmClickedEvent: confirmClickedEvent,
                cancelClickedEvent: cancelClickedEvent
            }
        });

        return dialogRef;
    }

}
