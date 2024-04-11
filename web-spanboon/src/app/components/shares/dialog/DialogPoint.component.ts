import { Component, Inject, EventEmitter, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, ThemePalette } from '@angular/material';
import { AuthenManager } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = 'point';

@Component({
  selector: 'dialog-point',
  templateUrl: './DialogPoint.component.html',
})
export class DialogPoint extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public dialog: MatDialog;
  public apiBaseURL = environment.apiBaseURL;
  public countTab: number = 0;

  constructor(public dialogRef: MatDialogRef<DialogPoint>, @Inject(MAT_DIALOG_DATA) public data: any,
    dialog: MatDialog, authenManager: AuthenManager, router: Router) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;

  }

  public ngOnInit() {
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

  public onClose(data?) {
    if (!!data) {
      this.dialogRef.close(data);
    } else {
      this.dialogRef.close(false);
    }
  }

  public calculatePercentage(max: number, value: number): number {
    const remaining = max - value;
    const percentage = (remaining / max) * 100;

    return Math.max(0, Math.min(100, percentage));
  }
}
