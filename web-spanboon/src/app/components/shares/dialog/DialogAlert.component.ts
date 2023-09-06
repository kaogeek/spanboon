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
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'dialog-alert',
  templateUrl: './DialogAlert.component.html'

})

export class DialogAlert {
  deviceInfo = null;

  private isbottom: boolean
  public router: Router;
  public apiBaseURL = environment.apiBaseURL;

  constructor(public dialogRef: MatDialogRef<DialogAlert>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private deviceService: DeviceDetectorService, router: Router) {
    this.router = router;

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
    } else {
      window.open('https://play.google.com/store/search?q=mfp+today&c=apps', "_blank");
    }
    localStorage.setItem('appExperience', 'downloaded');
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
  }

  public cancel() {
    if (this.data.options === 'ios' || this.data.options === 'Mac') {
      let date = Date.now();
      localStorage.setItem('timeStampAppEx', JSON.stringify(date));
    }
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
  }

  public register() {
    window.open('https://accounts.moveforwardparty.org/account/register', "_blank");
    this.dialogRef.close(this.isbottom);
  }

  public binding() {
    let navigationExtras: NavigationExtras = {
      state: {
        focus: 'การเชื่อมต่อ'
      },
    }
    this.router.navigate(['/account/settings'], navigationExtras);
    this.dialogRef.close(this.isbottom);
  }
}
