/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from 'src/app/models/models';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { BadWordUtils } from '../../../utils/BadWordUtils';

const PAGE_NAME: string = 'editcomment';

@Component({
  selector: 'newcon-edit-comment-page',
  templateUrl: './DialogEditComment.component.html',
})
export class DialogEditComment {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public title: string;
  public content: string;

  public Editor = ClassicEditor;

  constructor(public dialogRef: MatDialogRef<DialogEditComment>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (this.data !== undefined && this.data !== null) {
      this.content = this.data.text;
    }
  }

  ngOnInit() {
  }

  private isEmptyString(value: string): boolean {
    if (value === undefined || value === '') {
      return true;
    }

    const regEx = /^\s+$/;
    if (value.match(regEx)) {
      return true;
    }

    return false;
  }

  public onConfirm(): void {
    if (this.content === undefined || this.content === null || this.content === '') {
      alert('กรุณากรอกเนื้อหา');
      return;
    }

    if (this.isEmptyString(this.content)) {
      alert('กรุณากรอกเนื้อหา');
      return;
    }

    // filter
    this.content = BadWordUtils.clean(this.content);

    this.dialogRef.close({
      isConfirm: true,
      text: this.content
    });

    if ((this.data !== undefined && this.data !== null) && this.data.confirmClickedEvent !== undefined) {
      this.data.confirmClickedEvent.emit({
        isConfirm: true,
        text: this.content
      });
    }
  }

  public onClose(): void {
    this.dialogRef.close({
      isConfirm: false
    });

    if ((this.data !== undefined && this.data !== null) && this.data.cancelClickedEvent !== undefined) {
      this.data.cancelClickedEvent.emit({ isConfirm: false });
    }
  }
}
