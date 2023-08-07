/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { AuthenManager, ObjectiveFacade, ObservableManager } from "src/app/services/services";
import { environment } from '../../../../../environments/environment';
import { AbstractPage } from "../../../pages/AbstractPage";

const NOTI_READ_SUBJECT: string = 'noti.read';
const NOTI_ACTION: string = 'noti.action';

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
  public isShow: boolean = false;
  public isActionSlide: boolean = false;

  private observManager: ObservableManager;
  private objectiveFacade: ObjectiveFacade;
  public apiBaseURL = environment.apiBaseURL;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, observManager: ObservableManager, objectiveFacade: ObjectiveFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
    this.objectiveFacade = objectiveFacade;
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public close() {
    this.slide = false;
  }

  public navigatetopage(link, type?) {
    let value = {
      objectiveId: link.objectiveId,
      pageId: link.pageId,
      joiner: link.joinerId,
      notificationId: link.id,
    }
    if (type === 'approve') {
      Object.assign(value, { join: true, approve: true });
      this.objectiveFacade.approveInvite(value).then((res) => {
        if (res) {
          this.message.approve = true;
        }
      }).catch((err) => {
        if (err) {
          console.log("err", err)
          if (err.error.message === 'You have been join this objective.') {
            let dialogJoinError = this.showAlertDialogWarming('คุณได้เข้าร่วมสิ่งที่กำลังทำนี้ไปแล้ว', "none");
            dialogJoinError.afterClosed().subscribe((res) => {
              if (res) {
              }
            });
          }
        }
      });
    } else if (type === 'reject') {
      this.isShow = true;
      this.message = {};
      this.objectiveFacade.disJoinObjective(value).then((res) => {
        if (res) {
          this.observManager.createSubject(NOTI_ACTION);
          this.observManager.publish(NOTI_ACTION, 1);
        }
      }).catch((err) => {
        if (err) { }
      });
    } else {
      this.router.navigate([]).then(() => {
        this.observManager.publish(NOTI_READ_SUBJECT, {
          data: {
            title: link.title,
            body: link.body,
            image: link.image,
            status: link.status,
            isRead: true,
            link: link.link,
            displayName: link.displayName,
            id: link.id,
            type: link.type
          },
        });
        window.open(link.link);
      });
    }
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
