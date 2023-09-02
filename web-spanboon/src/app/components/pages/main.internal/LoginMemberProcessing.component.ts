/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager, BindingMemberFacade, CheckMergeUserFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import jwt_decode from "jwt-decode";
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { MESSAGE } from '../../../../custom/variable';

const PAGE_NAME: string = 'processing';

@Component({
  selector: 'login-member-process',
  templateUrl: './LoginMemberProcessing.component.html',
})
export class LoginMemberProcessing extends AbstractPageImageLoader implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public params: any;
  public route: ActivatedRoute;
  public checkMergeUserFacade: CheckMergeUserFacade;
  public bindingMemberFacade: BindingMemberFacade;

  public data: any;
  public dataId: any;
  public isNotAccess: any;
  public linkPost: any;
  public mainPostLink: string;
  public decodedData: any;

  public isLoading: boolean = true;
  constructor(
    router: Router,
    dialog: MatDialog,
    authenManager: AuthenManager,
    checkMergeUserFacade: CheckMergeUserFacade,
    bindingMemberFacade: BindingMemberFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.checkMergeUserFacade = checkMergeUserFacade;
    this.bindingMemberFacade = bindingMemberFacade;
    // this.route.params.subscribe((param) => {
    //   let token = param['token'];
    //   let decoded = jwt_decode(token)
    //   console.log("decoded", decoded)
    // });
  }

  public ngOnInit(): void {
    let url = this.router.url.split('=');
    this.decodedData = jwt_decode(url[1])
    console.log("decode", this.decodedData)
    if (this.decodedData.membership) {
      this.bindingMemberFacade.binding(this.decodedData, this.getIdUser()).then((res: any) => {
        if (res) {
          if (res.membership.state === 'APPROVED') {
            this.showAlertRedirectDialog('ผ่านการตรวจสอบแล้ว');
            this.isLoading = false;
          }
        }
      }).catch((err) => {
        if (err) {
          console.log("err", err);
          if (err.error.message === 'PENDING_PAYMENT') {
            this.showAlertRedirectDialog('รอการชำระเงิน');
          } else if (err.error.message === 'PENDING_APPROVAL') {
            this.showAlertRedirectDialog('รอการตรวจสอบ');
          } else if (err.error.message === 'REJECTED') {
            this.showAlertRedirectDialog('ไม่ผ่านการตรวจสอบ');
          } else if (err.error.message === 'PROFILE_RECHECKED') {
            this.showAlertRedirectDialog('สมาชิกรอจัดเก็บ');
          } else if (err.error.message === 'ARCHIVED') {
            this.showAlertRedirectDialog('สมาชิกที่จัดเก็บแล้ว');
          } else if (err.error.message === 'You have ever binded this user.') {
            this.showAlertRedirectDialog('คุณเคยผูกสมาชิกไปแล้ว');
          } else if (err.error.message === 'Cannot Update Status Membership User.') {
            this.showAlertRedirectDialog('ไม่สามารถผูกสมาชิกได้');
          } else if (err.error.message === 'User Not Found') {
            this.showAlertRedirectDialog('ไม่พบบัญชีผู้ใช้');
          }
          this.isLoading = false;
        }
      });
    } else {
      if (this.decodedData !== undefined) {
        let data = {
          email: this.decodedData.user.email,
          identification_number: this.decodedData.user.identification_number,
          id: this.decodedData.user.id,
          mobile: this.decodedData.user.mobile
        }

        this.checkMergeUserFacade.checkMergeUser('MFP', data).then((res) => {

        }).catch((error) => {
          const statusMsg = error.error.message;
          if (statusMsg === "User was not found.") {
            let navigationExtras: NavigationExtras = {
              queryParams: { mode: 'mfp' }
            }
            this.router.navigate(['/register'], navigationExtras);
          } else if (error.error.message === 'You cannot merge this user you have had one.') {
            // this.mockDataMergeSocial.social = mode;
            // this.dataUser = error.error;
            // this.emailOtp = error.error.data.email;
            // this.modeSwitch = "mergeuser";
          } else if (statusMsg === "This Email not exists") {
            let navigationExtras: NavigationExtras = {
              queryParams: { mode: 'mfp' }
            }
            this.router.navigate(['/register'], navigationExtras);
          } else if (statusMsg === 'User Banned') {
            this.dialog.open(DialogAlert, {
              disableClose: true,
              data: {
                text: MESSAGE.TEXT_LOGIN_BANED,
                bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black",
                btDisplay1: "none"
              }
            });
          }
        });
      }
    }
  }

  public getIdUser() {
    let user = JSON.parse(localStorage.getItem('pageUser'));
    return user.id;
  }

  public ngOnDestroy(): void {

  }

  public getImageSelector(): string[] {
    throw new Error('Method not implemented.');
  }
  public onSelectorImageElementLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadOK(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadError(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
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