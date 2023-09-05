/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager, BindingMemberFacade, CheckMergeUserFacade, ProfileFacade } from '../../../services/services';
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
  public profileFacade: ProfileFacade;

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
    bindingMemberFacade: BindingMemberFacade,
    profileFacade: ProfileFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.checkMergeUserFacade = checkMergeUserFacade;
    this.bindingMemberFacade = bindingMemberFacade;
    this.profileFacade = profileFacade;
    // this.route.params.subscribe((param) => {
    //   let token = param['token'];
    //   let decoded = jwt_decode(token)
    //   console.log("decoded", decoded)
    // });
  }

  public ngOnInit(): void {
    let url = this.router.url.split('=');
    let userid;
    let splitUrl;
    let token;
    let mode;
    if (url[2]) {
      userid = url[2].split('.')[0];
      splitUrl = url[2].split('.');
      mode = url[2].split('.')[4];
      token = splitUrl[1] + '.' + splitUrl[2] + '.' + splitUrl[3];
    }
    this.decodedData = jwt_decode(url[1]);
    let methodMFP = localStorage.getItem('methodMFP');
    localStorage.setItem('methodMFP', (methodMFP === 'binding' ? 'binding' : (methodMFP === 'login' ? 'login' : 'binding')));
    if (methodMFP === 'binding') {
      this.bindingMemberFacade.binding(this.decodedData, userid ? userid : this.getIdUser(), mode, token).then((res: any) => {
        if (res === 'APPROVED') {
          this.router.navigateByUrl('/process/success');
          this.isLoading = false;
        }
      }).catch((err) => {
        if (err) {
          console.log("err", err);
          let message;
          if (err.error.message === 'PENDING_PAYMENT') {
            message = 'รอการชำระเงิน';
          } else if (err.error.message === 'PENDING_APPROVAL') {
            message = 'รอการตรวจสอบ';
          } else if (err.error.message === 'REJECTED') {
            message = 'ไม่ผ่านการตรวจสอบ';
          } else if (err.error.message === 'PROFILE_RECHECKED') {
            message = 'สมาชิกรอจัดเก็บ';
          } else if (err.error.message === 'ARCHIVED') {
            message = 'สมาชิกที่จัดเก็บแล้ว';
          } else if (err.error.message === 'You have ever binded this user.') {
            message = 'คุณเคยผูกสมาชิกไปแล้ว';
          } else if (err.error.message === 'Cannot Update Status Membership User.') {
            message = 'ไม่สามารถผูกสมาชิกได้';
          } else if (err.error.message === 'User Not Found') {
            message = 'ไม่พบบัญชีผู้ใช้';
          }
          let navigationExtras: NavigationExtras = {
            state: {
              message: message,
            },
          }
          this.router.navigate(['/process/reject'], navigationExtras);
          this.isLoading = false;
        }
      });
    } else {
      if (methodMFP === 'login') {
        let data = {
          email: this.decodedData.membership.email,
          identification_number: this.decodedData.membership.identification_number,
          id: this.decodedData.membership.id,
          mobile: this.decodedData.membership.mobile
        }
        this.checkMergeUserFacade.checkMergeUser('MFP', data).then((res) => {
          if (res) {
            let token = res.token;
            let navigationExtras: NavigationExtras = {
              queryParams: { token: token }
            }
            this.router.navigate(['/process/success'], navigationExtras);
          }
        }).catch((error) => {
          const statusMsg = error.error.message;
          if (statusMsg === 'User was not found.') {
            // let navigationExtras: NavigationExtras = {
            //   state: {
            //     email: this.decodedData.membership.email
            //   },
            //   queryParams: { mode: 'mfp' }
            // }
            // this.router.navigate(['/register'], navigationExtras);
            window.open('/register', '_blank');
          } else if (statusMsg === 'Membership has expired.') {
            this.router.navigate(['/home']);
          } else if (error.error.message === 'You cannot merge this user you have had one.') {
            // this.mockDataMergeSocial.social = mode;
            // this.dataUser = error.error;
            // this.emailOtp = error.error.data.email;
            // this.modeSwitch = "mergeuser";
          } else if (statusMsg === 'This Email not exists') {
            let navigationExtras: NavigationExtras = {
              state: {
                email: this.decodedData.membership.email
              },
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