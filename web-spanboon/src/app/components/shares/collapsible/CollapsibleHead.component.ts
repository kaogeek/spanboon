/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'CollapsibleHead';

@Component({
  selector: 'collapsible-head',
  templateUrl: './CollapsibleHead.component.html',
})
export class CollapsibleHead extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  public groupName: string = 'ชื่อเพจ';
  @Input()
  public count: number = 0;
  @Input()
  public countContact: number = 0;
  @Input()
  public isCaseSelected: boolean;
  @Input()
  public asPage: string = 'asPage';
  @Input()
  public statusColor: string = '#E5E3DD';
  @Input()
  public data: any;
  @Input()
  public showCase: boolean = false;
  @Output()
  public onContactClick: EventEmitter<any> = new EventEmitter();

  public showLoading: boolean = true;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
  }

  public ngOnInit(): void {
    console.log('case > ',this.data)
    setTimeout(() => {
      this.showLoading = false;
    }, 1000);
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

  public getFulfillmentCase(fulfill: any) {
    this.onContactClick.emit(fulfill);
  }

  public clickShow() {
    this.showCase = !this.showCase;
  }
}
