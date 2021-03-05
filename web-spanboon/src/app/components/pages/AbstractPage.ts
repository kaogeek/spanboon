/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { AuthenManager } from '../../services/services';
import { MatDialog } from '@angular/material/dialog';
import { DialogAlert } from '../shares/dialog/DialogAlert.component';
import { MESSAGE } from '../../AlertMessage';
import { EventEmitter, OnInit } from '@angular/core';
import { PLATFORM_NAME_TH, PLATFORM_NAME_ENG, PLATFORM_SOPPORT_EMAIL, PLATFORM_URL, PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT, PLATFORM_GENERAL_TEXT, CONFIRM_MESSAGE } from '../../../custom/variable';
import { Router } from '@angular/router';

const TOKEN_KEY: string = 'token';
const TOKEN_MODE_KEY: string = 'mode';

export abstract class AbstractPage implements OnInit {

  protected name: string;
  protected authenManager: AuthenManager;
  protected dialog: MatDialog;
  protected router: Router;

  public PLATFORM_NAME_TH: string = PLATFORM_NAME_TH;
  public PLATFORM_NAME_ENG: string = PLATFORM_NAME_ENG;
  public PLATFORM_SOPPORT_EMAIL: string = PLATFORM_SOPPORT_EMAIL;
  public PLATFORM_URL: string = PLATFORM_URL;
  public PLATFORM_NEEDS_TEXT: string = PLATFORM_NEEDS_TEXT;
  public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT;
  public PLATFORM_GENERAL_TEXT: string = PLATFORM_GENERAL_TEXT;

  constructor(name: string, authenManager: AuthenManager, dialog: MatDialog, router: Router) {
    this.name = name;
    this.router = router;
    this.authenManager = authenManager;
    this.dialog = dialog;
  }

  public ngOnInit() {
    // this.clicktotop();
  }

  public ngOnDestroy(): void {
    // this.checkIsDirty();
  }

  public checkIsDirty(): any {
    if (this.isPageDirty()) {
      this.showConfirmDialog("คุณต้องการละทิ้งข้อมูลใช่หรือไม่", "ตกลง", "ยกเลิก", this.onDirtyDialogConfirmBtnClick(), this.onDirtyDialogCancelButtonClick());
      return true;
    } else {
      return false;
    }
  }

  public clicktotop() {
    var scrolltotop = document.getElementById("menubottom");
    if (scrolltotop !== undefined && scrolltotop !== null) {

      scrolltotop.scrollTop = 0
    }
  }

  public showAlertDevelopDialog(text?): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: text ? text : "ระบบอยู่ในระหว่างการพัฒนา",
        bottomText2: CONFIRM_MESSAGE,
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
    });
  }

  public getName(): string {
    return this.name;
  }

  public getAuthenManager(): AuthenManager {
    return this.authenManager;
  }

  // public checkAccountStatus(): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     let token = sessionStorage.getItem(TOKEN_KEY) ? sessionStorage.getItem(TOKEN_KEY) : undefined;
  //     token = token ? token : localStorage.getItem(TOKEN_KEY);
  //     let mode = sessionStorage.getItem(TOKEN_MODE_KEY) ? sessionStorage.getItem(TOKEN_MODE_KEY) : undefined;
  //     mode = mode ? mode : localStorage.getItem(TOKEN_MODE_KEY);
  //     if (token) {
  //       this.getAuthenManager().checkAccountStatus(token, mode).then((res) => {
  //         resolve(true);
  //       }).catch((err) => {
  //         resolve(false);
  //       });
  //     } else {
  //       resolve(false);
  //     }
  //   });
  // }

  public isLogin(): boolean {
    return this.authenManager.getCurrentUser() !== undefined && this.authenManager.getCurrentUser() !== null ? true : false;
  }

  public getCurrentUser(): any {
    return this.authenManager.getCurrentUser();
  }

  public getCurrentUserId(): string {
    let userId = undefined;

    if (this.getCurrentUser() !== undefined && this.getCurrentUser() !== null) {
      userId = this.getCurrentUser().id;
    }

    return userId;
  }

  public showAlertLoginDialog(redirection: string): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: MESSAGE.TEXT_TITLE_LOGIN,
        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.router.navigate(["/login", { redirection: redirection }]);
      }
    });
  }

  public showAlertDialog(text: any, cancelText?: string): void {
    this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: text,
        bottomText1: (cancelText) ? cancelText : MESSAGE.TEXT_BUTTON_CANCEL,
        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
  }

  public showDialogWithOptions(dialogOption: any): void {
    this.dialog.open(DialogAlert, {
      disableClose: true,
      data: dialogOption
    });
  }

  public showConfirmDialog(text: any, confirmText?: string, cancelText?: string, confirmClickedEvent?: any, cancelClickedEvent?: any): void {
    this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: text,
        bottomText1: (cancelText) ? cancelText : MESSAGE.TEXT_BUTTON_CANCEL,
        bottomText2: (confirmText) ? confirmText : MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        confirmClickedEvent: confirmClickedEvent,
        cancelClickedEvent: cancelClickedEvent
      }
    });
  }
  public showAlertDialogWarming(alertMessages: any, buttonDisplay?: string): any {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: alertMessages,
        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        btDisplay1: buttonDisplay
      }
    });
    return dialog;
  }
  public showDialogError(error: any, redirection: string) {
    if (error !== undefined) {
      if (error === "AccessDeniedError") {
        let dialog = this.showAlertDialogWarming("เซลชั่นหมดอายุกรุณาเข้าสู่ระบบใหม่อีกครั้ง.", "none");
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.authenManager.clearStorage();
            this.router.navigate(["/login", { redirection: redirection }]);
          }
        });
      } else {
        this.showAlertDialog('error: ' + JSON.stringify(error.error.name));
      }
    }
  }
  public showDialogWarming(text: any, confirmText?: string, cancelText?: string, confirmClickedEvent?: any, cancelClickedEvent?: any): any {
    let dialog = this.dialog.open(DialogAlert, {
      data: {
        disableClose: true,
        text: text,
        bottomText1: (confirmText) ? confirmText : MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomText2: (cancelText) ? cancelText : MESSAGE.TEXT_BUTTON_CANCEL,
        bottomColorText2: "black",
        confirmClickedEvent: confirmClickedEvent,
        cancelClickedEvent: cancelClickedEvent

      }
    });
    return dialog;
  }

  abstract isPageDirty(): boolean;
  abstract onDirtyDialogConfirmBtnClick(): EventEmitter<any>;
  abstract onDirtyDialogCancelButtonClick(): EventEmitter<any>;

}
