/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenManager, ObservableManager, TwitterService, UserFacade } from '../../../../services/services';
import { MatDialog } from '@angular/material/dialog';
import { DialogImage } from '../../../shares/dialog/DialogImage.component';
import { DateAdapter } from '@angular/material';
import { AbstractPage } from '../../AbstractPage';
import * as moment from 'moment';
import { MESSAGE } from '../../../../AlertMessage';
import { User } from '../../../../models/User';
import { DialogPassword } from '../../../../components/shares/shares';
import { Asset } from '../../../../models/Asset';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import * as $ from 'jquery';

const PAGE_NAME: string = 'register';

@Component({
  selector: 'register-page',
  templateUrl: './RegisterPage.component.html'
})
export class RegisterPage extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild(MatDatepicker, { static: true }) datapicker: MatDatepicker<Date>;
  @ViewChild("birthday", { static: false }) private datapickerBirthday: any;
  @ViewChild('register', { static: false }) private registerForm: any;
  @ViewChild('birthday', { static: false }) private birthdayForm: ElementRef;

  @Output()
  public dateChange: EventEmitter<MatDatepickerInputEvent<any>>;

  private accessToken: any;
  private activatedRoute: ActivatedRoute;
  private observManager: ObservableManager;
  private userFacade: UserFacade;
  private dateAdapter: DateAdapter<Date>;

  public authenManager: AuthenManager;
  private twitterService: TwitterService;
  public dialog: MatDialog;
  public hide = true;
  public uuid: boolean;
  public email: string = '';

  public avatar: any;
  public images: any;
  public imagesAvatar: any;
  public birthdate: any;
  public whereConditions: string[];
  public redirection: string;

  minDate = new Date(1800, 0, 1);
  maxDate = new Date();
  startDate: Date;

  //
  public data: any;
  public gender: any;
  public mode: string;
  public passwordModeSocial: string = '';
  public repassword: string = '';
  public password: string = '';
  public birthday; Date;

  public user: SocialUser;
  public loggedIn: boolean;
  public active: boolean;
  public activeEmail: boolean;
  public activePass: boolean;
  public activeRePass: boolean;
  public isLoading: boolean;
  public genderTxt: string;
  public account_twitter: any;
  public isCheckDate: any;

  constructor(authenManager: AuthenManager,
    private authService: SocialAuthService,
    activatedRoute: ActivatedRoute,
    router: Router,
    dialog: MatDialog,
    observManager: ObservableManager,
    userFacade: UserFacade,
    dateAdapter: DateAdapter<Date>, twitterService: TwitterService) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.activatedRoute = activatedRoute;
    this.router = router;
    this.dialog = dialog;
    this.observManager = observManager;
    this.userFacade = userFacade;
    this.twitterService = twitterService;

    this.dateAdapter = dateAdapter;
    this.dateAdapter.setLocale('th-TH');

    this.minDate.setDate(this.minDate.getDate());
    this.minDate.setFullYear(this.minDate.getFullYear() - 200);
    this.maxDate.setDate(this.maxDate.getDate());
    this.maxDate.setFullYear(this.maxDate.getFullYear());
    this.startDate = this.maxDate;
    this.data = {};
    this.active = false;
    this.activeEmail = false;
    this.activeRePass = false;
    this.activePass = false;
    this.isCheckDate = true;
    // this.gender = 0;
    this.imagesAvatar = {};
    // this.data.birthday = new Date();
    this.activatedRoute.queryParams.subscribe(params => {
      this.mode = params['mode'];
      if (params['mode'] === 'normal') {
        this.mode = "normal";
      } else if (params['mode'] === 'facebook') {
        this.mode = "facebook";
      } else if (params['mode'] === 'twitter') {
        this.mode = "twitter";
      } else if (params['mode'] === 'google') {
        this.mode = "google";
      } else {
        this.mode = "normal";
      }

      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state;
      if (this.mode !== "normal") {
        if (state) {
          this.redirection = state.redirection;
          this.accessToken = state.accessToken;

          if (this.mode === "facebook") {
            this.getCurrentUserInfo();
          } else if (this.mode === "google") {
            this.getGoogleUser();
          } else if (this.mode === "twitter") {
            this.getTwitterUser();
          }
        } else {
          this.router.navigateByUrl("/login");
        }
      }
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.checkLoginAndRedirection();
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

  private checkLoginAndRedirection(): void {
    if (this.isLogin()) {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigateByUrl("/home");
      }
    }
  }

  public onClickregister(formData) {
    const register = new User();
    register.username = formData.email;
    register.firstName = formData.firstName === undefined ? "" : formData.firstName;
    register.lastName = formData.lastName === undefined ? "" : formData.lastName;
    register.email = formData.email;
    register.password = formData.password;
    // unqueId
    if (formData.username === undefined || formData.username === '') {
      this.generatorUnqueId(formData.displayName).then((isVaild: any) => {
        if (isVaild) {
          register.uniqueId = formData.displayName;
        } else {
          let emailSubstring = formData.email.substring(1, 0);
          let newUnique = formData.displayName + '.' + emailSubstring;
          this.generatorUnqueId(newUnique).then((isVaild1: any) => {
            if (isVaild1) {
              register.uniqueId = newUnique;
            }
          }).catch((err: any) => {
            console.log(err)
          });
        }
      }).catch((err: any) => {
        console.log(err)
      });
    } else {
      register.uniqueId = formData.username;
    }

    if(moment().format('YYYY-MM-DD') !== moment(formData.birthday).format('YYYY-MM-DD')){
      register.birthdate = moment(formData.birthday).format('YYYY-MM-DD'); 
    }  

    register.displayName = formData.displayName;
    register.gender = formData.gender;
    register.customGender = formData.genderTxt === undefined ? "" : formData.genderTxt;
    if (formData.displayName === '' || formData.displayName === undefined) {
      this.active = true;
      document.getElementById('displayName').style.border = "1px solid red";
      return document.getElementById("displayName").focus();
    } else {
      document.getElementById('displayName').style.border = "unset";
      this.active = false;
    }
    if (formData.email === '' || formData.email === undefined) {
      this.activeEmail = true;
      document.getElementById('email').style.border = "1px solid red";
      return document.getElementById("email").focus();
    } else {
      document.getElementById('email').style.border = "unset";
      this.activeEmail = false;
    }

    let emailPattern = "[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}";
    if (!formData.email.match(emailPattern)) {
      this.activeEmail = true;
      document.getElementById('email').style.border = "1px solid red";
      return document.getElementById("email").focus();
    } else {
      document.getElementById('email').style.border = "unset";
      this.activeEmail = false;
    }

    if(this.uuid === false) {
      return;
    }

    if (this.mode === "normal") {
      if (formData.password === "" && formData.repassword === "") {
        this.activePass = true;
        document.getElementById('password').style.border = "1px solid red";
        return document.getElementById("password").focus();
      } else {
        document.getElementById('password').style.border = "unset";
        this.activePass = false;
      }

      if (formData.password.length !== undefined || formData.repassword.length !== undefined) {
        if (formData.password.length < 6 || formData.repassword.length < 6) {
          this.activePass = true;
          document.getElementById('password').style.border = "1px solid red";
          return document.getElementById("password").focus();
        } else {
          document.getElementById('password').style.border = "unset";
          this.activePass = false;
        }
      }
      if (formData.password !== formData.repassword) {
        this.activeRePass = true;
        document.getElementById('repassword').style.border = "1px solid red";
        return document.getElementById("repassword").focus();
      } else {
        document.getElementById('repassword').style.border = "unset";
        this.activeRePass = false;
      }
    }
    if (formData.gender === -1 && formData.genderTxt === undefined) {
      document.getElementById('genderTxt').style.border = "1px solid red";
      return document.getElementById("genderTxt").focus();
    }

    const asset = new Asset();
    if (this.imagesAvatar !== undefined && Object.keys(this.imagesAvatar).length > 0) {
      let data = this.imagesAvatar.image.split(',')[0];
      let typeImage = data.split(':')[1];
      asset.mimeType = typeImage.split(';')[0];
      asset.data = this.imagesAvatar.image.split(',')[1];
      asset.fileName = this.imagesAvatar.name;
      asset.size = this.imagesAvatar.size;
    } else {
      asset
    }
    let image = {
      asset
    }
    let body = Object.assign(register, image)

    if (this.mode === "normal") {
      let modeType = "EMAIL";
      this.authenManager.register(body, modeType).then((res) => {
        if (res.status === 1) {
          let alertMessage: string = 'ลงทะเบียนสำเร็จ ' + MESSAGE.TEXT_TITLE_LOGIN;
          let isValid = false;
          if (res.data) {
            isValid = true;
          }
          let dialog = this.showAlertDialogWarming(alertMessage, "none");
          dialog.afterClosed().subscribe((res) => {
            if (isValid) {
              this.observManager.publish('authen.check', null);
              if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
              } else {
                this.router.navigate(['/login']);
              }
            } else {
              this.router.navigate(['/login']);
            }
          });
        }
      }).catch((err) => {
        if (err.error.status === 0) {
          let alertMessages: string;
          if (err.error.message === 'This Email already exists') {
            alertMessages = 'อีเมลนี้ถูกสมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ';
          } else if (err.error.message === 'Register Failed') {
            alertMessages = 'คุณไม่สามารถสมัครสมาชิกได้ กรุณาติดต่อผู้ดูแลระบบ';
          } else if (err.error.message === 'Facebook was registered.') {
            alertMessages = 'คุณได้สมัครอีเมล์นี้แล้ว กรุณาลองล็อคอินอีกครั้ง';
          }
          let dialog = this.showAlertDialogWarming(alertMessages, "none");
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.observManager.publish('authen.check', null);
              if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
              } else {
                this.router.navigate(['/login']);
              }
            }
          });
        } else {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.mode = this.mode === 'twitter' ? 'TWITTER' : this.mode === 'facebook' ? 'FACEBOOK' : this.mode === 'google' ? 'GOOGLE' : '';
      if (this.passwordModeSocial !== "") {
        register.password = this.passwordModeSocial;
      } else {
        register.password = this.passwordModeSocial === undefined ? "" : this.passwordModeSocial;
      }

      if (this.mode === "facebook" || this.mode === "FACEBOOK") {
        register.fbAccessExpirationTime = this.accessToken.fbexptime;
        register.fbSignedRequest = this.accessToken.fbsignedRequest;
        register.fbToken = this.accessToken.fbtoken;
        register.fbUserId = this.accessToken.fbid;
      } else if (this.mode === "google" || this.mode === "GOOGLE") {
        register.googleUserId = this.accessToken.googleUserId;
        register.authToken = this.accessToken.authToken;
        register.idToken = this.accessToken.idToken;
      } else if (this.mode === "twitter" || this.mode === "TWITTER") {
        register.twitterUserId = this.accessToken.twitterUserId;
        register.twitterOauthToken = this.accessToken.twitterOauthToken;
        register.twitterTokenSecret = this.accessToken.twitterOauthTokenSecret;
      }
      this.authenManager.registerSocial(register, this.mode).then((value: any) => {
        if (value.status === 1) {
          let alertMessage: string = 'ลงทะเบียนสำเร็จ';
          let isValid = false;
          if (value.user) {
            isValid = true;
          }
          let dialog = this.showAlertDialogWarming(alertMessage, "none");
          dialog.afterClosed().subscribe((res) => {
            if (isValid) {
              this.observManager.publish('authen.check', null);
              if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
              } else {
                this.router.navigate(['/login']);
              }
            } else {
              this.router.navigate(['/login']);
            }
          });
        }

      }).catch((err: any) => {
        if (err.error.status === 0) {
          let alertMessages: string;
          if (err.error.message === 'This Email already exists') {
            alertMessages = 'อีเมลนี้ถูกสมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบ';
          } else if (err.error.message === 'Register Facebook Failed') {
            alertMessages = 'คุณไม่สามารถสมัครสมาชิกได้ กรุณาติดต่อผู้ดูแลระบบ';
          } else if (err.error.message === 'Twitter TokenSecret is required') {
            alertMessages = 'โทเค็นของคุณหมดอายุ';
          }
          let dialog = this.showAlertDialogWarming(alertMessages, "none");
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.observManager.publish('authen.check', null);
              if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
              } else {
                this.router.navigate(['/login']);
              }
            }
          });
        } else {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  public generatorUnqueId(text: string): Promise<any> {
    let body = {
      uniqueId: text
    }
    return this.userFacade.checkUniqueId(body);
  }

  public orgValueChange(date: any) {
    this.vaidatorDate(date);
  }

  public vaidatorDate(text: string) {
    const year = Number(text.split('/')[2]) - 543
    text = text.split('/')[0].toString() + '/' + text.split('/')[1] + '/' + year;
    this.isCheckDate = moment(text, 'DD/MM/YYYY', true).isValid() || moment(text, 'D/MM/YYYY', true).isValid() || moment(text, 'DD/M/YYYY', true).isValid() || moment(text, 'D/M/YYYY', true).isValid();
    if (this.isCheckDate) {
      this.data.birthday = moment(text, 'DD/MM/YYYY').toDate();
      return;
    }
  }

  public checkUUID(event) {
    this.isLoading = true
    if (event === '') {
      return;
    }
    if (event.length > 0) {
      let pattern = event.match('^[A-Za-z0-9_.]*$');
      if (!pattern) {
        this.uuid = false;
        document.getElementById('username').focus();
      } else {
        let body = {
          uniqueId: event
        }
        this.uuid = true;
        this.userFacade.checkUniqueId(body).then((res) => {
          if (res && res.data) {
            this.uuid = res.data;
          } else {
            this.uuid = res.error;
          }
          document.getElementById('username').focus();

        }).catch((err) => {
          this.uuid = false;
          document.getElementById('username').focus();
        })
      }
    }

  }

  public onShowDialog() {
    const dialogRef = this.dialog.open(DialogPassword, {
      data: { password: this.passwordModeSocial, repassword: this.repassword }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res.password !== '' && res.password !== null && res.password !== undefined) {
        this.passwordModeSocial = res.password;
        // this.onClickregister(this.registerForm.value);
      }
    });
  }

  public getTwitterUser() {
    let body = {
      twitterOauthToken: this.accessToken.twitterOauthToken,
      twitterOauthTokenSecret: this.accessToken.twitterOauthTokenSecret
    }
    this.twitterService.accountVerify(body).then((account: any) => {
      this.data = account;
      this.data.displayName = account.name;
      this.images = account.profile_image_url_https;
      this.data.gender = -1;
      this.data.birthday = this.data.birthday ? new Date(this.data.birthday) : undefined;
      this.getBase64ImageFromUrl(this.images).then((result: any) => {
        this.imagesAvatar.image = result;
      }).catch(err => {
        console.log("เกิดข้อผิดพลาด");
      });
    }).catch((err: any) => {
      console.log('err ', err)
    })
  }

  public getGoogleUser(): any {
    this.authService.authState.subscribe((user) => {
      this.data = user;
      this.data.email = user.email;
      this.data.displayName = user.name;
      this.data.firstName = user.firstName;
      this.data.lastName = user.lastName;
      this.images = user.photoUrl;
      this.data.gender = -1;
      this.data.birthday = new Date();
      this.getBase64ImageFromUrl(this.images).then((result: any) => {
        this.imagesAvatar.image = result;
      }).catch(err => {
        console.log("เกิดข้อผิดพลาด");
      });
    });
  }

  public getCurrentUserInfo(): any {
    window['FB'].api('/me', {
      fields: 'name, first_name, last_name,birthday,picture,id,email,gender'
    }, (userInfo) => {
      this.data = userInfo;
      this.data.displayName = userInfo.name;
      this.data.firstName = userInfo.first_name;
      this.data.lastName = userInfo.last_name;
      // this.data.gender = userInfo.gender ? userInfo.gender === "female" ? 1 : userInfo.gender === "male" ? 0 : -1 : -1;
      // this.data.birthday = this.data.birthday ? new Date(userInfo.birthday) : undefined; 
      // this.images = 'https://graph.facebook.com/' + this.data.id + '/picture?type=large';
      this.images = userInfo.picture.data.url;
      this.getBase64ImageFromUrl(this.images).then((result: any) => {
        this.imagesAvatar.image = result;
      }).catch(err => {
        console.log("เกิดข้อผิดพลาด");
      });
    });

  }
  public async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        const imagesAvatar = reader.result;
        resolve(imagesAvatar);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    });
  }

  public checkDigitIdentificationCode(citizenId: string): boolean {
    let sum = 0;
    if (citizenId.length != 13) return false;
    for (let i = 0; i < 12; i++)
      sum += parseFloat(citizenId.charAt(i)) * (13 - i);
    if ((11 - sum % 11) % 10 != parseFloat(citizenId.charAt(12)))
      return false; return true;
  }

  public showDialogImage(): void {
    const dialogRef = this.dialog.open(DialogImage, {
      width: 'auto',
      disableClose: true,
      data: this.imagesAvatar
    });

    dialogRef.afterClosed().subscribe(result => {
      this.imagesAvatar = result;
    });
  }

  public clickBlack() {
    this.router.navigateByUrl('/login');
  } 
  
}
