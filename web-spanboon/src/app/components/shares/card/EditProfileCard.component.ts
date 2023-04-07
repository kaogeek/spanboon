/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { DateAdapter } from 'saturn-datepicker';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { ProfileFacade } from 'src/app/services/facade/ProfileFacade.service';
import { ObservableManager } from 'src/app/services/ObservableManager.service';
import { AbstractPage } from '../../pages/AbstractPage';
import { DialogAlert } from '../dialog/DialogAlert.component';

const PAGE_NAME: string = 'editprofilecard';
const REFRESH_DATA: string = 'refresh_page';

@Component({
  selector: 'edit-profile-card',
  templateUrl: './EditProfileCard.component.html'
})
export class EditProfileCard extends AbstractPage implements OnInit {
  private dateAdapter: DateAdapter<Date>
  public isSend: boolean;
  public isCheck: boolean;
  protected router: Router;
  private profileFacade: ProfileFacade;
  private observManager: ObservableManager;
  public dataUser: any;
  public formProfile: FormGroup;
  public authenManager: AuthenManager;


  @Input()
  public dataProfile: any;
  @Output()
  public success: EventEmitter<any> = new EventEmitter();

  minDate = new Date(1800, 0, 1);
  maxDate = new Date();
  startDate: Date;

  constructor(
    router: Router,
    dialog: MatDialog,
    profileFacade: ProfileFacade,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    dateAdapter: DateAdapter<Date>,
    public formBuilder: FormBuilder,
    authenManager: AuthenManager,
    observManager: ObservableManager
  ) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.router = router;
    this.authenManager = authenManager;
    this.observManager = observManager;
    this.dataUser = {};
    this.dataUser.birthday = new Date();
    this.minDate.setDate(this.minDate.getDate());
    this.minDate.setFullYear(this.minDate.getFullYear() - 200);
    this.maxDate.setDate(this.maxDate.getDate());
    this.maxDate.setFullYear(this.maxDate.getFullYear());

    this.dateAdapter = dateAdapter;
    this.dateAdapter.setLocale('th-TH');
    this.profileFacade = profileFacade;
    this.startDate = this.maxDate;
    if (this.data !== undefined && this.data !== null) {
      this.dataUser = this.data;
    }
  }

  public ngOnInit(): void {
    if (this.data !== '' && this.data !== undefined && this.data !== null) {
      this.getDataUser();
    }
    this._formEditProfile();
    this._setDataFormEditProfile();
  }

  public emailNoti($event) {
    this.profileFacade.setEmailPushNotification($event.checked).then((res) => {
      if (res) {
      }
    })
  }

  public getDataUser() {
    let user = JSON.parse(localStorage.getItem('pageUser'));
    this.data.displayName = user.displayName;
    this.data.firstName = user.firstName;
    this.data.lastName = user.lastName;
    this.data.birthdate = user.birthdate;
    this.data.gender = user.gender;
  }

  public editProfile() {
    const profile = this.formProfile;
    let userId;
    userId = this.getCurrentUserId();
    if (
      profile.get('displayName').value !== this.data.displayName ||
      profile.get('firstName').value !== this.data.firstName ||
      profile.get('lastName').value !== this.data.lastName ||
      profile.get('birthDate').value !== this.data.birthdate ||
      profile.get('gender').value !== this.data.gender ||
      profile.get('subscribeEmail').value !== this._checkSendEmail()
    ) {
      this.success.emit(true);
      let data = {
        displayName: profile.get('displayName').value,
        firstName: profile.get('firstName').value,
        lastName: profile.get('lastName').value,
        birthdate: moment(profile.get('birthDate').value).format('YYYY-MM-DD'),
        gender: profile.get('gender').value
      }
      this.profileFacade.edit(userId, data).then((res: any) => {
        if (res) {
          let pageUser = JSON.parse(localStorage.getItem('pageUser'));
          pageUser.displayName = res.displayName;
          pageUser.firstName = res.firstName;
          pageUser.lastName = res.lastName;
          pageUser.birthdate = res.birthdate;
          pageUser.gender = res.gender;
          localStorage.setItem('pageUser', JSON.stringify(pageUser));
          this.data = res;
          this.observManager.publish(REFRESH_DATA, res);
          this.success.emit(false);
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "แก้ไขโปรไฟล์เสร็จสิ้น",
              bottomColorText2: "black",
              btDisplay1: "none"
            }
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.dialog.closeAll();
            }
          });
        }
      }).catch((err) => {
        if (err) {
          console.log("err", err);
        }
      });
    } else {
      this.success.emit(false);
    }
  }

  private _formEditProfile() {
    this.formProfile = this.formBuilder.group({
      displayName: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      gender: [''],
      subscribeEmail: false,
    })
  }

  private _checkSendEmail() {
    let subscribe = JSON.parse(localStorage.getItem('pageUser'));
    if (subscribe.subscribeEmail) {
      if (subscribe.subscribeEmail === true) {
        this.isSend = true;
        return true;
      } else {
        this.isSend = false;
        return false;
      }
    } else {
      this.isSend = false;
      return false;
    }
  }

  private _setDataFormEditProfile() {
    const profile = this.formProfile;
    profile.get('displayName').setValue(this.data.displayName ? this.data.displayName : '');
    profile.get('firstName').setValue(this.data.firstName ? this.data.firstName : '');
    profile.get('lastName').setValue(this.data.lastName ? this.data.lastName : '');
    profile.get('birthDate').setValue(this.data.birthdate ? this.data.birthdate : '');
    profile.get('gender').setValue(this.data.gender ? this.data.gender : '');
    profile.get('subscribeEmail').setValue(this._checkSendEmail());
  }

  public keyupGetData() {
    const profile = this.formProfile;
    if (
      profile.get('displayName').value !== this.data.displayName ||
      profile.get('firstName').value !== this.data.firstName ||
      profile.get('lastName').value !== this.data.lastName ||
      profile.get('birthDate').value !== this.data.birthdate ||
      profile.get('gender').value !== this.data.gender ||
      profile.get('subscribeEmail').value !== this._checkSendEmail()
    ) {
      this.success.emit(true);
    } else {
      this.success.emit(false);
    }
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
