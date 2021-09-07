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
  selector: 'dialog-reboon',
  templateUrl: './DialogReboonTopic.component.html',
})
export class DialogReboonTopic {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public title: string;
  public content: any;
  public userAsPage: string;
  public pageUserAsPage: string
  public value: any;

  selected1: string = "แชร์ไปยัง"
  selected2: string = "โพสต์"

  public Editor = ClassicEditor;
  public prefix: any;

  constructor(public dialogRef: MatDialogRef<DialogReboonTopic>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.selected1 = "แชร์ไปยัง"
    this.selected2 = "โพสต์"
    this.prefix = {};
    if (this.data.options.userAsPage !== undefined && this.data.options.userAsPage !== null && this.data.options.userAsPage !== '') {
      this.userAsPage = this.data.options.userAsPage
    } else {
      this.userAsPage = "แชร์เข้าไทมไลน์ของฉัน"
    }
    if (this.data !== undefined && this.data !== null) {
      this.content = this.data.options;
    } if (this.data.options.pageUserAsPage !== null && this.data.options.pageUserAsPage !== undefined) {
      this.pageUserAsPage = (' ไปยัง ' + this.data.options.pageUserAsPage.name)
    }
    console.log('this.data', this.data);
  }

  ngOnInit() {
    this.prefix.header = 'header';
    this.prefix.detail = 'post';
  }

  public dataRepost(data?: any) {
    this.onConfirm(data);
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

  public onConfirm(post?: any): void {
    // filter
    this.value = BadWordUtils.clean(post.detail);

    this.dialogRef.close({
      isConfirm: true,
      text: this.value,
      pageId: post.pageId,
      hashTag: post.hashTags
    });
  }

  public onClose(): void {
    this.dialogRef.close({
      isConfirm: false
    });
  }
}
