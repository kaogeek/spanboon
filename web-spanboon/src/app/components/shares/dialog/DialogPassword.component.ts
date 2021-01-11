/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from 'src/app/models/DialogData';

@Component({
    selector: 'dialog-password',
    templateUrl: './DialogPassword.component.html'

})
export class DialogPassword {

    private isActionBtn: boolean;
    public isConfirm: boolean;
    public isCheck: boolean;

    constructor(public dialogRef: MatDialogRef<DialogPassword>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
         }
        
    public onClose(): void {
        this.isActionBtn = false;
        this.dialogRef.close(this.data);

        if(this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined){
            this.data.cancelClickedEvent.emit(false)
        }
    }

    public onCheckPassword(){
       
        let password = this.data.password.trim();
        let repassword = this.data.repassword.trim();
        if(this.data.password.length < 6 || this.data.repassword.length < 6 ){
            return this.isCheck = true;
        } else {
            this.isCheck = false;
        }
        if(password == "" || repassword == "" || password !== repassword){
            this.isConfirm = true;
        } else {
            this.onClose();
        }
    }

    
}

