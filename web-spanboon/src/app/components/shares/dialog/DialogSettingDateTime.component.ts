/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material'; 
import { PageCategoryFacade, PageFacade, AuthenManager, AssetFacade, ObservableManager } from '../../../services/services'; 
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { NgxTimepickerFieldComponent } from 'ngx-material-timepicker';
import * as moment from 'moment'; 

const PAGE_NAME: string = 'editcomment'; 

@Component({
  selector: 'dialog-setting-datetime',
  templateUrl: './DialogSettingDateTime.component.html',
})
export class DialogSettingDateTime extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('pickerTime', { static: false }) pickerTime: NgxTimepickerFieldComponent;

  private dateAdapter: DateAdapter<Date>;
  public dataUser: any;
  public datesToHighlight: any[] = [];
  public device_iPhone: boolean = false;
  public device_Android: boolean = false;
  minDate = new Date();
  selectedDate: any;

  constructor(public dialogRef: MatDialogRef<DialogSettingDateTime>, @Inject(MAT_DIALOG_DATA) public data: any,
    dialog: MatDialog, authenManager: AuthenManager, router: Router, dateAdapter: DateAdapter<Date>, observManager: ObservableManager) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.dataUser = {};

    this.dataUser.startDateTime = new Date();
    this.dateAdapter = dateAdapter;
    this.minDate.setDate(this.minDate.getDate());
    this.minDate.setFullYear(this.minDate.getFullYear() - 200);
    this.dateAdapter.setLocale('th-TH');
    if (this.data !== undefined && this.data !== null) {
      this.dataUser = this.data;
      this.selectedDate = this.data.startDateTime
    }

    if (this.data || this.data.time === undefined || this.data.time === null && this.data.time === '') {
      this.data.time = '00:00';
    }
  }

  public ngOnInit(): void {
    this.checkDevice();
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

  public onClickSetiing() {
    const date = new Date(moment(this.selectedDate).format("YYYY-MM-DD"));
    if (this.pickerTime && this.pickerTime.timepickerTime) {
      const hour = this.pickerTime.timepickerTime.split(':')[0];
      const minutes = this.pickerTime.timepickerTime.split(':')[1];
      date.setHours(Number(hour));
      date.setMinutes(Number(minutes));
      date.setSeconds(0);
      let data = {
        startDateTime: date,
        time: this.pickerTime.timepickerTime
      }
      this.dialogRef.close(data);
    } else {
      this.showAlertDialog('กรุณาใส่เวลาที่ต้องการโพสต์')
    }
  }

  onSelect(event) {
    this.selectedDate = event;
  }

  public onClose() {
    this.dialogRef.close();
  }

  public onResize(event) {
    this.checkDevice();
  }

  public checkDevice() {
    // if (window.innerWidth <= 1024) {
    //   if (navigator.userAgent.match(/iPhone/i)) {
    //     this.device_iPhone = true;
    //     // alert('device_iPhone');
    //   } else {
    //     this.device_Android = true;
    //     // alert('device_Android');
    //   }
    // }
  }
}
