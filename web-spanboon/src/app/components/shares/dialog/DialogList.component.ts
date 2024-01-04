/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import * as $ from 'jquery';
import { AuthenManager } from 'src/app/services/AuthenManager.service';

const PAGE_NAME: string = 'dialoglist';

@Component({
  selector: 'dialog-list',
  templateUrl: './DialogList.component.html',
})
export class DialogList extends AbstractPage {
  public static readonly PAGE_NAME: string = PAGE_NAME;

  public dialog: MatDialog;
  public apiBaseURL = environment.apiBaseURL;

  public isShowVoterName: boolean;

  constructor(public dialogRef: MatDialogRef<DialogList>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    dialog: MatDialog, authenManager: AuthenManager, router: Router) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
  }

  public ngOnInit() {
    this.isShowVoterName = this.data.showVoterName;
  }

  public onClose(): void {
    this.dialogRef.close(false);
  }

  isPageDirty(): boolean {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
}
