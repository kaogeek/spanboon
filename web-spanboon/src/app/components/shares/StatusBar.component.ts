/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from '../../services/AuthenManager.service';
import { AbstractPage } from '../pages/AbstractPage';

@Component({
  selector: 'status-bar',
  templateUrl: './StatusBar.component.html'
})
export class StatusBar extends AbstractPage implements OnInit {

  @Input()
  public dataName: any;
  @Input()
  public topic: string = "เกาะทุกก้าว !";
  @Input()
  public bgColor: string = "#fff";
  @Input()
  public status: string = "กำลัง" + this.PLATFORM_NEEDS_TEXT;
  @Input()
  public images: string = "https://www.thebangkokinsight.com/wp-content/uploads/2019/09/ad903a3f9339ad274a01ca65a1862735.png";
  @Input()
  public count: number = 10;
  @Input()
  public action: string = "เหตุการณ์";
  @Input()
  public seeAll: string = "ดูทั้งหมด";
  @Input()
  public create: string = "3 วันที่แล้ว";
  @Input()
  public isShow: boolean = false;
  @Input()
  public isSeeAll: boolean = false;
  @Input()
  public isImage: boolean = false;
  @Input()
  public isStausIcon: boolean = false;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  public name: string;

  constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router) {
    super(null, authenManager, dialog, router);
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

  public actions() {
    this.submit.emit();
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }
}
