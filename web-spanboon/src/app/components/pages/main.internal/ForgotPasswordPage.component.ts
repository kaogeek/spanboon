/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { FotgotPasswordFacade } from '../../../services/facade/FotgotPasswordFacade.service';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { DialogResetForgotPassword } from '../../shares/dialog/DialogResetForgotPassword.component';
import { AbstractPage } from '../AbstractPage';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';

const PAGE_NAME: string = 'forgotpassword';
declare var $: any;
var currentTab = 0;

@Component({
  selector: 'forgot-password-page',
  templateUrl: './forgotPasswordPage.component.html',
})
export class forgotPasswordPage extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('email', { static: false }) public email: ElementRef;
  @ViewChild('passwd', { static: false }) public passwd: ElementRef;
  @ViewChild('repasswd', { static: false }) public repasswd: ElementRef;
  @ViewChild('uuid', { static: false }) public uuid: ElementRef;

  private forgetPasswordFacade: FotgotPasswordFacade;
  private assetFacade: AssetFacade;

  public isShow1: boolean;
  public isShow2: boolean;
  public isEmail: boolean;
  public invaildEmail: boolean;
  public invaildPasswd: boolean;
  public invaildUUID: boolean;
  public isLastButton: boolean;
  public invaildRePasswd: boolean;
  public invaildPattern: boolean;
  public resUser: any;
  public centered: string;
  public hide: boolean;
  public hiderepasswd: boolean;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, forgetPasswordFacade: FotgotPasswordFacade, assetFacade: AssetFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.forgetPasswordFacade = forgetPasswordFacade;
    this.assetFacade = assetFacade;
    this.isEmail = true;
    this.invaildEmail = false;
  }

  public ngOnInit(): void {
    currentTab = 0;
    this.isShow1 = true;
    this.isShow2 = true;
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
  
  public ngAfterViewInit(): void {
    this.tabWizard(currentTab);
  }

  public forgetPassword(n) {
    const email = this.email.nativeElement.value;
    var x, y, i, valid = true;
    x = document.getElementsByClassName("box-forgot");
    y = x[currentTab].getElementsByClassName("input-forgot");
    let emailPattern = "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}";
    if (email === '') {
      !this.validateForm();
    }
    if (!email.match(emailPattern)) {
      this.invaildEmail = true;
      y[0].classList.add("invalid");
      return document.getElementById("email").focus();
    }

    let data = {
      username: email
    }
    this.forgetPasswordFacade.forgot(data).then((res) => {
      if (res.message === 'Your Activation Code has been sent to your email inbox.') {
        this.isEmail = false;
        this.nextPrev(n);
      }
    }).catch((err) => {
      if (err.error.message === "Invalid Username") {
        this.invaildEmail = true;
        y[0].classList.add("invalid");
      }
    });
  }

  public changePassword(n) {
    var x, y, i, valid = true;
    x = document.getElementsByClassName("box-forgot");
    y = x[currentTab].getElementsByClassName("input-forgot");
    const uuid = this.uuid.nativeElement.value;
    const passwd = this.passwd.nativeElement.value;
    const repasswd = this.repasswd.nativeElement.value;
    const email = this.email.nativeElement.value;



    // $(uuid).on('input', function () {              //Using input event for instant effect
    //   let text = $(this).val()                             //Get the value
    //   text = text.replace(/\D/g, '')                        //Remove illegal characters 
    //   if (text.length > 3) text = text.replace(/.{3}/, '$&-')  //Add hyphen at pos.4
    //   if (text.length > 7) text = text.replace(/.{7}/, '$&-')  //Add hyphen at pos.8
    //   $(this).val(text);                                 //Set the new text
    // });

    if (uuid === '') {
      !this.validateForm();
    }
    // if (uuid.length !== 6) {
    //   this.invaildUUID = true;
    //   y[0].classList.add("invalid");
    //   return document.getElementById("uuid").focus();
    // } else {
    //   this.invaildUUID = false;
    //   y[0].classList.remove("invalid");
    // }
    let pattern = "[A-Z0-9]{6}$";
    if (!uuid.match(pattern)) {
      this.invaildPattern = true;
      y[0].classList.add("invalid");
      return document.getElementById("uuid").focus();
    } else {
      this.invaildPattern = false;
      y[0].classList.remove("invalid");
    }

    if (passwd.length < 6) {
      this.invaildPasswd = true;
      y[1].classList.add("invalid");
      return document.getElementById("passwd").focus();
    } else {
      this.invaildPasswd = false;
      y[1].classList.remove("invalid");
    }

    if (repasswd.length < 6) {
      this.invaildRePasswd = true;
      y[2].classList.add("invalid");
      return document.getElementById("repasswd").focus();
    } else {
      this.invaildRePasswd = false;
      y[2].classList.remove("invalid");
    }

    if (passwd !== repasswd) {
      this.invaildRePasswd = true;
      y[2].classList.add("invalid");
      return document.getElementById("repasswd").focus();
    } else {
      this.invaildRePasswd = false;
      y[2].classList.remove("invalid");
    }

    let data = {
      code: uuid,
      email: email,
      password: this.passwd.nativeElement.value
    }

    this.forgetPasswordFacade.changePassword(data).then((res) => {
      if (res.status === 1) {
        this.resUser = res.data;
        if (this.resUser && this.resUser.imageURL !== '' && this.resUser.imageURL !== undefined && this.resUser.imageURL !== null) {
          this.getDataIcon(this.resUser.imageURL)
        } 
        this.isLastButton = true;
        this.nextPrev(n);
      }
    }).catch((err) => {
      if (err.error.message === 'Cannot Change Password') {
        this.invaildPattern = true;
        y[0].classList.add("invalid");
        return document.getElementById("uuid").focus();
      }
    })
  }

  private getDataIcon(imageURL): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (ValidBase64ImageUtil.validBase64Image(res.data)) {
          Object.assign(this.resUser, { imageBase64: res.data });
        } else {
          Object.assign(this.resUser, { imageBase64: '' });
        }

      }
    }).catch((err: any) => {
      console.log(err)
    });
  }

  public tabWizard(n) {
    var x = document.getElementsByClassName("box-forgot");
    x[n].setAttribute("style", "display: block");
    if (n == 0) {
      document.getElementById("prevBtn").style.display = "none";
    } else {
      document.getElementById("prevBtn").style.display = "inline-block";
    }

    if (n == (x.length - 1)) {
      document.getElementById("nextBtn").innerHTML = "เสร็จ";
      this.isShow1 = false;
      this.isShow2 = true;
    } else {
      document.getElementById("nextBtn").innerHTML = "ถัดไป";
      this.isShow1 = true;
      this.isShow2 = true;
    }

    this.fixStepIndicator(n);
  }

  public nextPrev(n) {
    var x = document.getElementsByClassName("box-forgot");
    if (n == 1 && !this.validateForm()) return false;
    x[currentTab].setAttribute("style", "display: none");
    currentTab = currentTab + n;

    if (currentTab >= x.length) {
      this.router.navigate(['login']);
      return false;
    }
    if (n === -1) {
      this.isEmail = true;
      this.resetForm(false);
    }
    this.tabWizard(currentTab);
  }

  public validateForm() {
    var x, y, i, valid = true;
    x = document.getElementsByClassName("box-forgot");
    y = x[currentTab].getElementsByClassName("input-forgot");
    for (i = 0; i < y.length; i++) {
      if (y[i].value == "") {
        y[i].classList.add("invalid");
        valid = false;
      } else {
        y[i].classList.remove("invalid");
        valid = true;
      }
    }

    if (valid) {
      var cs = document.getElementsByClassName("step");
      if ((cs === undefined || cs === null) && (cs != undefined || cs != null)) {
        document.getElementsByClassName("step")[currentTab].classList.remove("finish");
      }
    }
    return valid;
  }

  public fixStepIndicator(n) {
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
      x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
  }

  public clickClose(): void {
    if (this.email.nativeElement.value !== '' || this.uuid.nativeElement.value !== '' || this.passwd.nativeElement.value !== '' || this.repasswd.nativeElement.value !== '') {
      let dialog = this.dialog.open(DialogAlert, {
        disableClose: true,
        data: {
          text: "คุณต้องการจะออกจากหน้านี้",
          bottomText2: "ตกลง",
          bottomColorText2: "black",
          btDisplay1: "black"
        }
      });
      dialog.afterClosed().subscribe((res) => {
        $(".but-canc").removeClass("cdk-focused");
        $(".but-canc").removeClass("cdk-program-focused");

        if (res) {
          this.router.navigate(['login']);
        }
      });
    } else {
      this.router.navigate(['login']);
    }
  }

  public clickReset(): void {
    let dialog = this.dialog.open(DialogResetForgotPassword, {
      disableClose: true,
      data: this.email.nativeElement.value
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.nextPrev(-1);
        this.resetForm(true);
      }
    });
  }

  public resetForm(isShow: boolean) {
    if (isShow) {
      this.email.nativeElement.value = '';
    }
    this.uuid.nativeElement.value = '';
    this.passwd.nativeElement.value = '';
    this.repasswd.nativeElement.value = '';
    var x, y, i;
    x = document.getElementsByClassName("box-forgot");
    y = x[currentTab].getElementsByClassName("input-forgot");
    for (i = 0; i < y.length; i++) {
      y[i].classList.remove("invalid");
    }
  }
}
