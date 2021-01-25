/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, NgZone, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { ObservableManager } from '../../../services/ObservableManager.service';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { AbstractPage } from '../AbstractPage';
// import { LOGIN_FACEBOOK_ENABLE } from '../../../Constants';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { MESSAGE } from '../../../AlertMessage';
import * as $ from 'jquery';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { TwitterService } from '../../../services/facade/TwitterService.service';


const PAGE_NAME: string = 'login';


@Component({
  selector: 'login-page',
  templateUrl: './LoginPage.component.html',
})
export class LoginPage extends AbstractPage implements OnInit {

  protected TWITTER_API_KEY = environment.consumerKeyTwitter
  protected TWITER_API_SECRET_KEY = environment.consumerSecretTwitter
  protected TWITTER_ACCESS_TOKEN = environment.accessTokenTwitter
  protected TWITTER_TOKEN_SECRET = environment.accessTokenSecretTwitter

  @ViewChild('email', { static: false }) email: ElementRef;
  @ViewChild('password', { static: false }) password: ElementRef;
  private accessToken: any;
  private googleToken: any;
  private observManager: ObservableManager;
  private _ngZone: NgZone;
  private cacheConfigInfo: CacheConfigInfo;
  private activatedRoute: ActivatedRoute;
  private twitterService: TwitterService;

  public static readonly PAGE_NAME: string = PAGE_NAME;
  public authenManager: AuthenManager;
  public router: Router;

  public hide = true;
  public redirection: string;
  public isEmailLogin: boolean;
  public isShowFacebook: boolean;
  public googleUser = {};
  public auth2: any;

  //twitter
  public authorizeLink = 'https://api.twitter.com/oauth/authorize';
  public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
  public accessTokenLink = 'https://api.twitter.com/oauth/access_token';
  public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';

  constructor(authenManager: AuthenManager, private socialAuthService: SocialAuthService, activatedRoute: ActivatedRoute, router: Router, _ngZone: NgZone,
    observManager: ObservableManager, cacheConfigInfo: CacheConfigInfo, dialog: MatDialog, twitterService: TwitterService) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.activatedRoute = activatedRoute;
    this.router = router;
    this._ngZone = _ngZone;
    this.observManager = observManager;
    this.isShowFacebook = true;
    this.cacheConfigInfo = cacheConfigInfo;
    this.twitterService = twitterService;

    // this.cacheConfigInfo.getConfig(LOGIN_FACEBOOK_ENABLE).then((config: any) => {
    //   if (config.value !== undefined) {
    //     this.isShowFacebook = (config.value.toLowerCase() === 'true');
    //   }
    // }).catch((error: any) => {
    //   // console.log(error) 
    // });

    this.activatedRoute.params.subscribe((param) => {
      this.redirection = param['redirection'];
    });

  }

  public ngOnInit() {
    this.checkLoginAndRedirection();

    let doRunAccessToken = false;
    const fullURL = window.location.href;
    if (fullURL !== undefined && fullURL !== '') {
      let split = fullURL.split('?');
      if (split.length >= 2) {
        const queryParam = split[1];
        this.accessTokenLink += '?' + queryParam;
        doRunAccessToken = true;
      }
    }

    if (doRunAccessToken) {
      let httpOptions: any = {
        responseType: 'text'
      };
      this.twitterService.getAcessToKen(this.accessTokenLink, httpOptions).then((res: any) => {
        let spilt = res.split('&');
        const token = spilt[0].split('=')[1];
        const token_secret = spilt[1].split('=')[1];
        const userId = spilt[2].split('=')[1];
        const name = spilt[3];
        this.loginTwitter(token, token_secret, userId);

      }).catch((err: any) => [
        console.log('err ', err)
      ])
    }

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
    if (!this.isLogin()) {
      this.fbLibrary();
    } else {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigateByUrl("/home");
      }
    }
  }

  public loginTwitter(token: string, token_secret: string, userId: string) {
    let mode = 'TWITTER';
    let twitter = {
      twitterOauthToken: token,
      twitterOauthTokenSecret: token_secret,
      twitterUserId: userId
    }
    this.authenManager.loginWithTwitter(twitter, mode).then((data: any) => {
      // login success redirect to main page
      this.observManager.publish('authen.check', null);
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigate(['home']);
      }
    }).catch((err) => {
      const statusMsg = err.error.message;
      if (statusMsg === "Twitter was not registed.") {
        let navigationExtras: NavigationExtras = {
          state: {
            accessToken: twitter,
            redirection: this.redirection
          },
          queryParams: { mode: 'twitter' }
        }
        this.router.navigate(['/register'], navigationExtras);
      } else if (err.error.message === 'Baned PageUser.') {
        this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: MESSAGE.TEXT_LOGIN_BANED,
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            btDsplay1: "none"
          }
        });
      }
    });
  }

  public clickLoginTwitter() {
    // this.showAlertDevelopDialog("รองรับการเข้าใช้ผ่าน Facebook หรือผ่านการสมัคร สมาชิกโดยตรง");
    let callback = "login";
    this.twitterService.requestToken(callback).then((result: any) => {
      this.authorizeLink += '?' + result;
      // this.authenticateLink += '?' + result;
      // console.log('result ', this.authorizeLink) 
      window.open(this.authorizeLink);
    }).catch((error: any) => {
      console.log(error);
    });
  }

  public clickLoginGoogle(): void {
    // this.showAlertDevelopDialog("รองรับการเข้าใช้ผ่าน Facebook หรือผ่านการสมัคร สมาชิกโดยตรง");
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((result) => { 

      if (result !== null && result !== undefined) {
        let googleToken = {
          googleUserId: result.id,
          authToken: result.authToken,
          idToken: result.idToken
        };

        this.googleToken = googleToken;

        this._ngZone.run(() => this.loginGoogle());
      }
    }).catch((error) => {
      console.log('error >>> ', error);
    });
  }

  private loginGoogle() {
    let mode = 'GOOGLE';

    this.authenManager.loginWithGoogle(this.googleToken.idToken, this.googleToken.authToken, mode).then((data: any) => {
      // login success redirect to main page
      this.observManager.publish('authen.check', null);
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigate(['home']);
      }
    }).catch((err) => {
      const statusMsg = err.error.message;
      if (statusMsg === "User was not found.") {
        let navigationExtras: NavigationExtras = {
          state: {
            accessToken: this.googleToken,
            redirection: this.redirection
          },
          queryParams: { mode: 'google' }
        }
        this.router.navigate(['/register'], navigationExtras);
      } else if (err.error.message === 'Baned PageUser.') {
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

  public fbLibrary() {
    (window as any).fbAsyncInit = function () {
      window['FB'].init({
        appId: environment.facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v3.1'
      });
      window['FB'].AppEvents.logPageView();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  }

  public clickLoginFB() {
    window['FB'].login((response) => {
      if (response.authResponse) {
        let accessToken = {
          fbid: response.authResponse.userID,
          fbtoken: response.authResponse.accessToken,
          fbexptime: response.authResponse.data_access_expiration_time,
          fbsignedRequest: response.authResponse.signedRequest
        }
        this.accessToken = accessToken;

        this._ngZone.run(() => this.loginFB());
      }
      // user_birthday
    }, { scope: 'public_profile,email' });
  }

  public emailLogin() {
    this.isEmailLogin = true;
  }

  private loginFB() {
    let mode = 'FACEBOOK'
    this.authenManager.loginWithFacebook(this.accessToken.fbtoken, mode).then((data: any) => {
      // login success redirect to main page
      this.observManager.publish('authen.check', null);
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigate(['home']);
      }
    }).catch((err) => {
      const statusMsg = err.error.message;
      if (statusMsg === "User was not found.") {
        let navigationExtras: NavigationExtras = {
          state: {
            accessToken: this.accessToken,
            redirection: this.redirection
          },
          queryParams: { mode: 'facebook' }
        }
        this.router.navigate(['/register'], navigationExtras);
      } else if (err.error.message === 'Baned PageUser.') {
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

  public onClickLogin() {
    let body = {
      email: this.email.nativeElement.value,
      password: this.password.nativeElement.value
    }
    let mode = "EMAIL"
    if (body.email.trim() === "") {
      return this.showAlertDialog("กรุณากรอกอีเมล");
    }
    if (body.password.trim() === "") {
      return this.showAlertDialog("กรุณากรอกรหัสผ่าน");
    }
    this.authenManager.login(body.email, body.password, mode).then((data) => {
      if (data) {
        let dialog = this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: MESSAGE.TEXT_LOGIN_SUCCESS,
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            btDisplay1: "none"
          }
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.observManager.publish('authen.check', null);
            this.observManager.publish('authen.profileUser', data.user);
            if (this.redirection) {
              this.router.navigateByUrl(this.redirection);
            } else {
              this.router.navigate(['home']);
            }
          }

        });
      }
    }).catch((err) => {
      if (err.error.status === 0) {
        let alertMessages: string;
        if (err.error.message === 'Invalid username') {
          alertMessages = 'กรุณาใส่อีเมลให้ถูกต้อง';
        } else if (err.error.message === 'Baned PageUser.') {
          alertMessages = 'บัญชีผู้ใช้ถูกแบน';
        } else if (err.error.message === "Invalid Password") {
          alertMessages = 'รหัสผ่านไม่ถูกต้อง';
        }
        this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: alertMessages,
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            btDisplay1: "none"
          }
        });
      }
    });
  }

  public clickSystemDevelopment(): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: "ระบบอยู่ในระหว่างการพัฒนา",
        bottomText2: "ตกลง",
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
    });
  }
}
