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
import { Router } from '@angular/router';
import { ProfileFacade } from 'src/app/services/facade/ProfileFacade.service';

@Component({
  selector: 'dialog-profile',
  templateUrl: './DialogProfile.component.html'

})

export class DialogProfile {
  private isbottom: boolean
  private profileFacade: ProfileFacade;
  public router: Router;
  public apiBaseURL = environment.apiBaseURL;
  public isMember: boolean;
  public isUnbind: boolean = false;
  public isLoading: boolean = false;
  public date: any;

  constructor(public dialogRef: MatDialogRef<DialogProfile>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    profileFacade: ProfileFacade,
    router: Router) {
    this.router = router;
    this.profileFacade = profileFacade;

  }

  onConfirm(): void {
    this.isbottom = true
    this.dialogRef.close(this.isbottom);
  }

  onClose(): void {
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
  }

  public ngOnInit(): void {
    let date = new Date('2567-09-01');
    let time = this.data.user.mfpUser.expiredAt.split(' ')[1].split(':');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let formattedDate = `${day}/${month}/${year} ${time[0]}:${time[1]}`;
    this.date = formattedDate;
  }

  public unbind() {
    this.isLoading = true;
    let user: any = JSON.parse(localStorage.getItem('pageUser'));
    this.profileFacade.updateMember(this.data.userId !== undefined ? this.data.userId : user.id, false).then((res) => {
      localStorage.setItem('membership', String(false));
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(false);
      }, 1000);
    }).catch((err) => {
      if (err) console.log("err", err);
    });
  }

  public acceptUnbind() {
    this.isUnbind = true;
  }

  public cancel() {
    this.isUnbind = false;
  }
}
