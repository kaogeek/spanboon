/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { E } from '@angular/cdk/keycodes';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { find } from 'rxjs/operators';
import { AuthenManager, MenuContextualService, ObservableManager, PageFacade } from 'src/app/services/services';
import { environment } from 'src/environments/environment';
import { AbstractPage } from '../../pages/AbstractPage';


const PAGE_NAME: string = 'tooltiprofile';
declare var $: any;

@Component({
  selector: 'tooltip-profile',
  templateUrl: './TooltipProfile.component.html',
})
export class TooltipProfile extends AbstractPage implements OnInit {
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;
  @Input()
  public data: any;
  @Input()
  public name: string = "ชื่อเพจ";
  @Input()
  public subname: string = "ชื่อรองเพจ";
  @Input()
  public img: string = "../../../../assets/img/profile.svg";
  @Input()
  public userimg: string = "../../../../assets/img/profile.svg";
  @Input()
  public birthday: string = "14 ตุลาคม 2516"
  @Input()
  public category: string = "ประเภท";
  @Input()
  public following: string = "1";
  @Input()
  public fulfill: string = "2";
  @Input()
  public typePage: string;

  public observManager: ObservableManager;
  public pageFacade: PageFacade;
  public unset: any;
  public mainProfileLink: any;
  public resDataPage: any;
  public setTimeing: any

  constructor(authenManager: AuthenManager, router: Router, pageFacade: PageFacade, dialog: MatDialog, observManager: ObservableManager, public popupService: MenuContextualService) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.pageFacade = pageFacade;
    this.observManager = observManager;
    this.popupService = popupService;

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.popupService.close(this.data);
    });

    this.setTimeing = setTimeout(() => {
      this.close();
    }, 20000);

  }
  public apiBaseURL = environment.apiBaseURL;

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public ngOnInit(): void {
    if (this.data.owner.length > 0) {
      this.data.owner = this.data.owner[0];
    }
    Object.assign(this.data.owner, { followers: this.data.followUserCount });
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

  public async clickFollow(owner) {

    if (!this.isLogin()) {
      this.showAlertDialog('กรุณา เข้าสู่ระบบ');
      return
    }

    if (owner.isFollow) {
      owner.followers--;
      owner.isFollow = false;
    } else {
      owner.followers++;
      owner.isFollow = true;
    }

    let follow = await this.pageFacade.follow(owner.id);

    this.data.owner.followUserCount = follow.data.followers;
    this.data.owner.isFollow = follow.data.isFollow;
    //
    this.data.followUserCount = follow.data.followers;
    this.data.isFollow = follow.data.isFollow;

  }

  public clickSend(page) {
    if (page !== null && page !== undefined) {
      let pageId = page.id;
      let uniqueId = page.uniqueId;

      if ((pageId !== null && pageId !== undefined && pageId !== '') && (uniqueId === null || uniqueId === undefined || uniqueId === '')) {
        window.open("/page/" + pageId);
      } else {
        window.open("/page/" + uniqueId);
      }
    }
  }

  public clickMore(page) {

    this.showAlertDevelopDialog();

  }

  public close() {
    this.popupService.close(undefined);
  }

  public Links = [
    {
      label: "ค้นหาการสนับสนุนหรือรายงานเพจ",
      keyword: "1",
      icon: "sms_failed"
    },
    {
      label: "ค้นหาการสนับสนุนหรือรายงานเพจ",
      keyword: "2",
      icon: "sms_failed"
    },
    {
      label: "ค้นหาการสนับสนุนหรือรายงานเพจ",
      keyword: "3",
      icon: "sms_failed"
    },
    {
      label: "ค้นหาการสนับสนุนหรือรายงานเพจ",
      keyword: "4",
      icon: "sms_failed"
    },
  ];

  public tooltipClose(event): any {

    clearTimeout(this.setTimeing);

    // let BUTTON_CLASS: string = "button-follow mat-ripple radius";
    // let BUTTON_CLASS_SEND: string = "but-send mat-stroked-button mat-button-base";
    // let BUTTON_CLASS_RIGHT: string = "tooltip-bottom-right";
    // let TOOLTIP_CLASS: string = "tooltip-body"
    // let ARROW_CLASS: string = "arrow-bottom";
    // let MAT_BUTTON_CLASS: string = "mat-button-wrapper";
    // let TOOLTIP_BUTTON_CLASS: string = "tooltip-bottom";
    // let ICON_CLASS: string = "material-icons";
    // let TOOL_DROP_CLASS: string = "but-send tool-dropdow mat-stroked-button mat-button-base";
    // let DETAIL: string = "detail";
    // let RIGHT: string = "right";
    // let FOLLOW: string = "follow-left";
    // let COUNT: string = "count"

    // if (event.toElement && event.toElement.className && event.toElement.className !== COUNT && event.toElement && event.toElement.className && event.toElement.className !== FOLLOW && event.toElement && event.toElement.className && event.toElement.className !== RIGHT && event.toElement && event.toElement.className && event.toElement.className !== DETAIL && event.toElement && event.toElement.className && event.toElement.className !== TOOL_DROP_CLASS && event.toElement.className !== ICON_CLASS && event.toElement.className !== MAT_BUTTON_CLASS && event.toElement.className !== TOOLTIP_BUTTON_CLASS && event.toElement.className !== TOOLTIP_CLASS && event.toElement.className !== ARROW_CLASS && event.toElement.className !== BUTTON_CLASS && event.toElement.className !== BUTTON_CLASS_RIGHT && event.toElement.className !== BUTTON_CLASS_SEND) {

    //   this.popupService.close(undefined);

    // }
  }

}

