/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../../../models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'dialog-alert',
  templateUrl: './DialogAlert.component.html'

})

export class DialogAlert {

  private isbottom: boolean
  public apiBaseURL = environment.apiBaseURL;

  constructor(public dialogRef: MatDialogRef<DialogAlert>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

  }

  onConfirm(): void {
    this.isbottom = true
    this.dialogRef.close(this.isbottom);

    if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
      this.data.confirmClickedEvent.emit(true);
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
