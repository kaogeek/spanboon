/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../../../models/models';

@Component({
  selector: 'dialog-alert-allocate',
  templateUrl: './DialogAlertAllocate.component.html'

})

export class DialogAlertAllocate {

  private isbottom: boolean

  constructor(public dialogRef: MatDialogRef<DialogAlertAllocate>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

  }

  onConfirm(isAuto?): void {
    this.isbottom = true
    if (isAuto) {
      let data = { type: "ISAUTO" }
      this.dialogRef.close(data);
    } else {
      this.dialogRef.close(true);
    }

  }

  onClose(): void {
    this.isbottom = false
    this.dialogRef.close(this.isbottom);

    if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
      this.data.cancelClickedEvent.emit(false);
    }
  }

  public ngOnInit(): void {
  }
}
