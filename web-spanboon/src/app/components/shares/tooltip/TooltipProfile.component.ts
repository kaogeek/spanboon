/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { find } from 'rxjs/operators';
import { AuthenManager, MenuContextualService, ObservableManager } from 'src/app/services/services';
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
  public unset: any;
  public mainProfileLink: any;
  public resDataPage: any;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, observManager: ObservableManager, public popupService: MenuContextualService) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.observManager = observManager;
    this.popupService = popupService;


    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.popupService.close(this.data);
    });
  }
  public apiBaseURL = environment.apiBaseURL;

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public ngOnInit(): void {
    console.log('this.data', this.data)

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

  public clickFollow(): void { }

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
}
