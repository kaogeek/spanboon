/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { AuthenManager, ObservableManager } from "src/app/services/services";
import { environment } from "src/environments/environment";
import { AbstractPage } from "../../../pages/AbstractPage";

const NOTI_READ_SUBJECT: string = 'noti.read';

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

  private observManager: ObservableManager;
  private apiBaseURL = environment.apiBaseURL;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, observManager: ObservableManager) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public close() {
    this.slide = false;
  }

  public navigatetopage(link) {
    this.router.navigate([]).then(() => {
      this.observManager.publish(NOTI_READ_SUBJECT, {
        data: {
          title: link.title,
          body: link.body,
          image: link.image,
          status: link.status,
          isRead: true,
          link: link.link,
          displayName: link.displayName
        },
      });
      window.open(link.link);
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
}
