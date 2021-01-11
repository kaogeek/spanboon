/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { FotgotPasswordFacade } from '../../../services/facade/FotgotPasswordFacade.service';
import { AbstractPage } from '../../pages/AbstractPage';


@Component({
    selector: 'dialog-reset-forgot-password',
    templateUrl: './DialogResetForgotPassword.component.html'

})
export class DialogResetForgotPassword extends AbstractPage implements OnInit {

    private forgetPasswordFacade: FotgotPasswordFacade;
    
    constructor(authenManager: AuthenManager,dialog: MatDialog,public dialogRef: MatDialogRef<DialogResetForgotPassword>, @Inject(MAT_DIALOG_DATA) public data: any,forgetPasswordFacade: FotgotPasswordFacade,
    router: Router) {
        super(null, authenManager, dialog, router);
        this.forgetPasswordFacade = forgetPasswordFacade;
    }

    public ngOnInit(): void { 
    }
    public ngOnDestroy(): void {
      super.ngOnDestroy();
    }
     
    isPageDirty(): boolean {
      // throw new Error('Method not implemented.');
      return false;
    }
    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
      // throw new Error('Method not implemented.');
      return;
    }
    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
      // throw new Error('Method not implemented.');
      return;
    }

    public replyPasswotd(){ 

    let data = {
      username: this.data
    }
    this.dialogRef.close();
    this.forgetPasswordFacade.forgot(data).then((res) => {
      if (res.message === 'Your Activation Code has been sent to your email inbox.') {
         this.showAlertDialog('ส่งรหัสการกู้คืนแล้ว กรุณาตรวจสอบอีเมลอีกครั้ง');
      }
    }).catch((err) => {
      if (err.error.message === "Invalid Username") {
        // this.nextPrev(n);
      }
    });
    }

    public changeEmail() {
      this.dialogRef.close(true);
    }

    public onClose(): void {
        this.dialogRef.close(false);
    }

    public clickClose(): void{
        this.dialogRef.close(false);
    }
}

