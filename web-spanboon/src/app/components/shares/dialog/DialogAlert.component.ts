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
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'dialog-alert',
  templateUrl: './DialogAlert.component.html'

})

export class DialogAlert {
  deviceInfo = null;

  private isbottom: boolean
  public apiBaseURL = environment.apiBaseURL;

  constructor(public dialogRef: MatDialogRef<DialogAlert>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private deviceService: DeviceDetectorService) {

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

  public downloadApp() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    if (this.data.type === 'ios' || this.deviceInfo.os === 'Mac') {
      window.open('https://apps.apple.com/us/app/mfp-today/id6444463783', "_blank");
      localStorage.setItem('appExperience', 'downloaded');
    } else {
      window.open('https://play.google.com/store/search?q=mfp+today&c=apps', "_blank");
      localStorage.setItem('appExperience', 'downloaded');
    }
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
  }

  public cancel() {
    let date = Date.now();
    localStorage.setItem('timeStampAppEx', JSON.stringify(date));
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
  }
}
