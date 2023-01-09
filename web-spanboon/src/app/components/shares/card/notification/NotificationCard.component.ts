/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { AuthenManager } from "src/app/services/services";
import { environment } from "src/environments/environment";
import { AbstractPage } from "../../../pages/AbstractPage";

const PAGE_NAME: string = "NotificationCard";

@Component({
  selector: "notification-card",
  templateUrl: "./NotificationCard.component.html",
})
export class NotificationCard extends AbstractPage implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  public message: any;
  @Input()
  public fullPage: boolean;
  @Input()
  public slide: boolean;
  @Input()
  public date: Date = new Date();

  private apiBaseURL = environment.apiBaseURL;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog) {
    super(PAGE_NAME, authenManager, dialog, router);
  }

  public ngOnInit(): void { }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public close() {
    this.slide = false;
  }

  public navigatetopage(link) {
    this.router.navigate([]).then(() => {
      window.open(link);
    });
  }

  public isPageDirty(): boolean {
    throw new Error("Method not implemented.");
  }
  public onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    throw new Error("Method not implemented.");
  }
  public onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    throw new Error("Method not implemented.");
  }

  /* public setImage(){
    return this.apiBaseURL + payload.data["gcm.notification.image_url"] + '/image' 
  } **/
}
