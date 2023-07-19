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
import { MESSAGE } from '../../../../custom/variable';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { TwitterService } from '../../../services/facade/TwitterService.service';
import { CheckMergeUserFacade, NotificationManager, SeoService } from 'src/app/services/services';
import { CountdownConfig, CountdownEvent } from "ngx-countdown";
import { NgOtpInputComponent } from "ng-otp-input/lib/components/ng-otp-input/ng-otp-input.component";
import { DialogConfirmInput } from '../../shares/dialog/DialogConfirmInput.component';

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
  @ViewChild("ngOtpInput", { static: false }) ngOtpInput: NgOtpInputComponent;
  configOtp = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    inputStyles: {
      'border-radius': '15px',
      'text-align': 'center',
      'margin-right': '10px',
      'color': 'rgb(35, 35, 35)',
      'border-color': 'rgb(12, 52, 85)',
      'box-shadow': '5px 5px 10px #cacaca',
    },
  };
  @ViewChild('email', { static: false }) email: ElementRef;
  @ViewChild('password', { static: false }) password: ElementRef;
  public apiBaseURL = environment.apiBaseURL;
  public otpResendIcon: "hide" | "show" = "hide";
  public modeSwitch: "login" | "mergeuser" | "otp" = "login";
  private accessToken: any;
  private googleToken: any;
  public images: any;
  public imagesAvatar: any;
  public data: any;
  private observManager: ObservableManager;
  private _ngZone: NgZone;
  private cacheConfigInfo: CacheConfigInfo;
  private activatedRoute: ActivatedRoute;
  private twitterService: TwitterService;
  private checkMergeUserFacade: CheckMergeUserFacade;
  private seoService: SeoService;
  public imageProfile: string;
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public authenManager: AuthenManager;
  public router: Router;
  public login = true;
  public hide = true;
  public redirection: string;
  public isEmailLogin: boolean;
  public isFBLogin: boolean = false;
  public isTWLogin: boolean = false;
  public isShowFacebook: boolean;
  public isPreloadTwitter: boolean;
  public googleUser = {};
  public auth2: any;
  public emailOtp: string;
  public limitOtpCount: number;
  public socialMode: any;
  public pictureSocial: any;
  public TwAuthToken: string;
  public TwAuthTokenSecret: string;
  public TwUserId: string;
  public otpInput: any;
  public emailFB: string;
  public social: any = {
    socialLogin: undefined,
  };

  public mockDataMergeSocial: any = {
    social: undefined,
  };

  private loginText: string = 'loginSuccess';
  private regis_merge: string = 'register.merge';

  public dataUser: any;
  public passwordOtp: string;
  public countOtp: number;
  public configCountdown: CountdownConfig = { leftTime: 180, format: 'mm:ss' };

  //twitter
  public authorizeLink = 'https://api.twitter.com/oauth/authorize';
  public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
  public accessTokenLink = '';
  public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';
  constructor(authenManager: AuthenManager, private socialAuthService: SocialAuthService, activatedRoute: ActivatedRoute, router: Router, _ngZone: NgZone,
    observManager: ObservableManager, cacheConfigInfo: CacheConfigInfo, dialog: MatDialog, twitterService: TwitterService,
    checkMergeUserFacade: CheckMergeUserFacade, private notificationManager: NotificationManager, private authService: SocialAuthService, seoService: SeoService,
  ) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.activatedRoute = activatedRoute;
    this.router = router;
    this._ngZone = _ngZone;
    this.observManager = observManager;
    this.isShowFacebook = true;
    this.isPreloadTwitter = false;
    this.cacheConfigInfo = cacheConfigInfo;
    this.twitterService = twitterService;
    this.checkMergeUserFacade = checkMergeUserFacade;
    this.seoService = seoService;

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
    this.seoService.updateTitle("เข้าสู่ระบบหรือสมัครสมาชิก");
    this.observManager.subscribe(this.regis_merge, (res: any) => {
      if (res) {
      }
    });
    this.checkLoginAndRedirection();
    this.fbLibrary();
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
      this.twitterService.getAcessToKen(this.accessTokenLink).then((res: any) => {
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
    this.observManager.complete(this.regis_merge);
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

  public otpCountdownHandleEvent(event: CountdownEvent) {
    if (event.action === 'done') {
      this.otpResendIcon = "show";
    }
  }

  public dialogConfirmMerge() {
    let mode = "EMAIL";
    this.checkMergeUserFacade.confirmMergeOtp(this.emailOtp).then((res) => {
      this.limitOtpCount = res.limit;
      this.modeSwitch = "otp";
    }).catch((err) => {
      if (err.error.message === "The Otp have been send more than 3 times, Please try add your OTP again") {
        let dialog = this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: "คุณส่งรหัส OTP เกิน 3 ครั้ง",
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            btDisplay1: "none",
          },
        })
      }
    });
  }
  public loginTwitter(token: string, token_secret: string, userId: string) {
    let mode = 'TWITTER';
    let twitter = {
      twitterOauthToken: token,
      twitterOauthTokenSecret: token_secret,
      twitterUserId: userId
    }
    this.TwAuthToken = twitter.twitterOauthToken;
    this.TwAuthTokenSecret = twitter.twitterOauthTokenSecret;
    this.TwUserId = twitter.twitterUserId;
    this.checkMergeUserFacade.loginWithTwitter(twitter, mode).then((res: any) => {
      if (res) {
        if (res.data.status === 1) {
          this.authenManager.loginWithTwitter(twitter, mode).then((data: any) => {
            if (data) {
              // login success redirect to main page
              this.observManager.publish('authen.check', null);
              if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
              } else {
                this.router.navigate(['home']);
              }
            }
          }).catch((err) => {
            if (err) {
            }
          })
        } else if (res.data.status === 2) {
          this.getTwitterUser(token, token_secret);
          this.mockDataMergeSocial.social = mode;
          this.pictureSocial = res.data.pic;
          const queue = res.data.data.authUser;
          for (let i = 0; i < queue.length; i++) {
            const current = queue.shift()
            if (current === 'EMAIL') {
              this.social.socialLogin = current;
              this.login = false;
              this.emailOtp = res.data.data.data.email;
              this.dataUser = res.data.data;
              this.socialMode = 'TWITTER';
            } else if (current === 'FACEBOOK') {
              this.social.socialLogin = current;
              this.login = false;
              this.emailOtp = res.data.data.data.email;
              this.dataUser = res.data.data;
              this.socialMode = 'TWITTER';
            } else if (current === 'TWITTER') {
              this.social.socialLogin = current;
              this.login = false;
              this.emailOtp = res.data.data.data.email;
              this.dataUser = res.data.data;
              this.socialMode = 'TWITTER';
            } else if (current === 'GOOGLE') {
              this.social.socialLogin = current;
              this.login = false;
              this.emailOtp = res.data.data.data.email;
              this.dataUser = res.data.data;
              this.socialMode = 'TWITTER';
            } else if (current === 'APPLE') {
              this.social.socialLogin = current;
              this.login = false;
              this.emailOtp = res.data.data.data.email;
              this.dataUser = res.data.data;
              this.socialMode = 'TWITTER';
            }
          }
          this.modeSwitch = "mergeuser";
        }
      }
    }).catch((err) => {
      const statusMsg = err.error.message;
      if (err.error.status === 0) {
        let dialog = this.dialog.open(DialogConfirmInput, {
          disableClose: true,
          data: {
            title: "อีเมลของคุณ",
            placeholder: "example@email.com"
          },
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.checkMergeUserFacade.loginWithTwitter(twitter, mode, res).then((data: any) => {
              if (data) {
                if (data.data.status === 2) {
                  this.getTwitterUser(token, token_secret);
                  this.login = false;
                  this.emailOtp = data.data.data.email;
                  this.dataUser = data.data;
                  this.mockDataMergeSocial.social = mode;
                  this.socialMode = 'TWITTER';
                  this.modeSwitch = "mergeuser";
                } else if (data.data.status === 1) {
                  this.authenManager.loginWithTwitter(twitter, mode).then((data: any) => {
                    if (data) {
                      // login success redirect to main page
                      this.observManager.publish('authen.check', null);
                      if (this.redirection) {
                        this.router.navigateByUrl(this.redirection);
                      } else {
                        this.router.navigate(['home']);
                      }
                    }
                  }).catch((err) => {
                    if (err) {
                    }
                  })
                }
              }
            }).catch((error) => {
              if (error) {
                console.log("error", error)
                if (error.error.status === 0) {
                  let navigationExtras: NavigationExtras = {
                    state: {
                      email: res,
                      token: twitter
                    },
                    queryParams: { mode: 'twitter' }
                  }
                  this.router.navigate(['/register'], navigationExtras);
                }
              }
            })
          }
        });
      }
    });
  }

  public clickLoginTwitter() {
    if (!this.isTWLogin) {
      this.isTWLogin = true;
      let callback = environment.webBaseURL + "/login";
      this.twitterService.requestToken(callback).then((result: any) => {
        if (result) {
          let token = result.split('&')[0];
          this.isTWLogin = false;
          this.authorizeLink += '?' + token;
          this.router.navigate([]).then(() => {
            window.open(this.authorizeLink, '_blank');
            this.notificationManager.checkLoginSuccess();
          });
        }
      }).catch((error: any) => {
        this.isTWLogin = false;
        console.log(error);
        if (error && error.message) {
          return this.showAlertDialog('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
        }
      });
    }
  }

  public clickLoginGoogle(): void {
    // continue google ;
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
      console.log('error', error);
    });

  }

  private loginGoogle() {
    let mode = 'GOOGLE';
    this.checkMergeUserFacade.loginWithGoogle(this.googleToken.idToken, this.googleToken.authToken, mode).then((data: any) => {
      // login success redirect to main page  
      this.getGoogleUser();
      this.mockDataMergeSocial.social = mode;
      this.pictureSocial = data.pic;
      this.modeSwitch = "mergeuser";
      const queue = data.data.authUser;
      for (let i = 0; i < queue.length; i++) {
        const current = queue.shift()
        if (current === 'EMAIL') {
          this.social.socialLogin = current;
          this.login = false;
          this.emailOtp = data.data.data.email;
          this.dataUser = data.data;
          this.socialMode = 'GOOGLE';
        } else if (current === 'FACEBOOK') {
          this.social.socialLogin = current;
          this.login = false;
          this.emailOtp = data.data.data.email;
          this.dataUser = data.data;
          this.socialMode = 'GOOGLE';
        } else if (current === 'TWITTER') {
          this.social.socialLogin = current;
          this.login = false;
          this.emailOtp = data.data.data.email;
          this.dataUser = data.data;
          this.socialMode = 'GOOGLE';
        } else if (current === 'GOOGLE') {
          this.social.socialLogin = current;
          this.login = false;
          this.emailOtp = data.data.data.email;
          this.dataUser = data.data;
          this.socialMode = 'GOOGLE';
        } else if (current === 'APPLE') {
          this.social.socialLogin = current;
          this.login = false;
          this.emailOtp = data.data.data.email;
          this.dataUser = data.data;
          this.socialMode = 'GOOGLE';
        }
      }
    }).catch((error) => {
      const statusMsg = error.error.message;
      if (statusMsg === "User was not found.") {
        let navigationExtras: NavigationExtras = {
          state: {
            accessToken: this.googleToken,
            redirection: this.redirection
          },
          queryParams: { mode: 'google' }
        }

        this.router.navigate(['/register'], navigationExtras);
      } else if (statusMsg === "This Email not exists") {
        let navigationExtras: NavigationExtras = {
          state: {
            accessToken: this.googleToken,
            redirection: this.redirection
          },
          queryParams: { mode: 'google' }
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

  public fbLibrary() {
    window['FB'].init({
      appId: environment.facebookAppId,
      cookie: true,
      xfbml: true,
      version: 'v14.0'
    });
    window['FB'].AppEvents.logPageView();

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  }

  public clickLoginFB() {
    if (!this.isFBLogin) {
      this.isFBLogin = true;
      window['FB'].login((response) => {
        if (response.authResponse) {
          this.isFBLogin = false;
          let accessToken = {
            fbid: response.authResponse.userID,
            fbtoken: response.authResponse.accessToken,
            fbexptime: response.authResponse.data_access_expiration_time,
            fbsignedRequest: response.authResponse.signedRequest
          }
          this.accessToken = accessToken;

          this._ngZone.run(() => this.loginFB());
        }
        this.isFBLogin = false;
      }, { scope: 'public_profile, email' });
    }
  }

  public emailLogin() {
    this.isEmailLogin = true;
  }

  private async loginFB() {
    let mode = 'FACEBOOK'
    this.getCurrentUserInfo();
    if (!this.isFBLogin) {
      this.isFBLogin = true;
      await this.checkMergeUserFacade.loginWithFacebook(this.accessToken.fbtoken, mode).then((data: any) => {
        // login success redirect to main page
        this.mockDataMergeSocial.social = mode;
        this.pictureSocial = data.pic;
        this.modeSwitch = "mergeuser";
        const queue = data.data.authUser;
        for (let i = 0; i < queue.length; i++) {
          const current = queue.shift()
          if (current === 'EMAIL') {
            this.social.socialLogin = current;
            this.login = false;
            this.emailOtp = data.data.data.email;
            this.dataUser = data.data;
            this.socialMode = 'FACEBOOK';
          } else if (current === 'FACEBOOK') {
            this.social.socialLogin = current;
            this.login = false;
            this.emailOtp = data.data.data.email;
            this.dataUser = data;
            this.socialMode = 'FACEBOOK';
          } else if (current === 'TWITTER') {
            this.social.socialLogin = current;
            this.login = false;
            this.emailOtp = data.data.data.email;
            this.dataUser = data;
            this.socialMode = 'FACEBOOK';
          } else if (current === 'GOOGLE') {
            this.social.socialLogin = current;
            this.login = false;
            this.emailOtp = data.data.data.email;
            this.dataUser = data.data;
            this.socialMode = 'FACEBOOK';
          } else if (current === 'APPLE') {
            this.social.socialLogin = current;
            this.login = false;
            this.emailOtp = data.data.data.email;
            this.dataUser = data.data;
            this.socialMode = 'FACEBOOK';
          }
        }
      }).catch((error) => {
        const statusMsg = error.error.message;
        if (error.error.status === 0 && this.emailFB === undefined) {
          let dialog = this.dialog.open(DialogConfirmInput, {
            disableClose: true,
            data: {
              title: "อีเมลของคุณ",
              placeholder: "example@email.com"
            },
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.isFBLogin = false;
              this.checkMergeUserFacade.loginWithFacebook(this.accessToken.fbtoken, mode, res).then((data: any) => {
                if (data) {
                  if (data.data.status === 2) {
                    this.mockDataMergeSocial.social = mode;
                    this.pictureSocial = data.pic;
                    this.modeSwitch = "mergeuser";
                    const queue = data.data.authUser;
                    for (let i = 0; i < queue.length; i++) {
                      const current = queue.shift()
                      if (current === 'EMAIL') {
                        this.social.socialLogin = current;
                        this.login = false;
                        this.emailOtp = data.data.data.email;
                        this.dataUser = data.data;
                        this.socialMode = 'FACEBOOK';
                      } else if (current === 'FACEBOOK') {
                        this.social.socialLogin = current;
                        this.login = false;
                        this.emailOtp = data.data.data.email;
                        this.dataUser = data.data;
                        this.socialMode = 'FACEBOOK';
                      } else if (current === 'TWITTER') {
                        this.social.socialLogin = current;
                        this.login = false;
                        this.emailOtp = data.data.data.email;
                        this.dataUser = data.data;
                        this.socialMode = 'FACEBOOK';
                      } else if (current === 'GOOGLE') {
                        this.social.socialLogin = current;
                        this.login = false;
                        this.emailOtp = data.data.data.email;
                        this.dataUser = data.data;
                        this.socialMode = 'FACEBOOK';
                      } else if (current === 'APPLE') {
                        this.social.socialLogin = current;
                        this.login = false;
                        this.emailOtp = data.data.data.email;
                        this.dataUser = data.data;
                        this.socialMode = 'FACEBOOK';
                      }
                    }
                  }
                }
              }).catch((error) => {
                if (error) {
                  this.isFBLogin = false;
                  if (error.error.status === 0) {
                    let navigationExtras: NavigationExtras = {
                      state: {
                        email: res,
                        token: this.accessToken
                      },
                      queryParams: { mode: mode.toLowerCase() }
                    }
                    this.router.navigate(['/register'], navigationExtras);
                  }
                }
              })
            }
          });
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
        } else if (statusMsg === 'You cannot merge this user you have had one.') {
          this.mockDataMergeSocial.social = mode;
          this.dataUser = error.error;
          this.emailOtp = error.error.data.email;
          this.modeSwitch = "mergeuser";
        } else if (error.error.status === 0 && this.emailFB) {
          this.isFBLogin = false;
          if (error.error.status === 0) {
            let navigationExtras: NavigationExtras = {
              state: {
                email: this.emailFB,
                token: this.accessToken
              },
              queryParams: { mode: mode.toLowerCase() }
            }
            this.router.navigate(['/register'], navigationExtras);
          }
        }
      });
    }
  }

  public onClickLogin() {
    let body = {
      email: this.email.nativeElement.value.toLowerCase(),
      password: this.password.nativeElement.value
    }
    let mode = "EMAIL";
    if (this.login) {
      this.login = false;
      if (body.email.trim() === "") {
        this.login = true;
        return this.showAlertDialog("กรุณากรอกอีเมล");
      }
      if (body.password.trim() === "") {
        this.login = true;
        return this.showAlertDialog("กรุณากรอกรหัสผ่าน");
      }
      this.checkMergeUserFacade.checkMergeUser(mode, body).then((data) => {
        this.mockDataMergeSocial.social = mode;
        this.login = false;
        this.emailOtp = body.email;
        this.passwordOtp = body.password;
        this.dataUser = data.data;
        this.socialMode = "EMAIL";
        this.modeSwitch = "mergeuser";
        const queue = data.data.authUser;
        for (let i = 0; i < queue.length; i++) {
          const current = queue.shift()
          this.social.socialLogin = current;
          this.login = false;
          this.emailOtp = data.data.data.email;
          this.dataUser = data.data;
          this.socialMode = 'EMAIL';
        }
        this.login = true;
      }).catch((err) => {
        if (err.error.message === "Invalid Password" && err.status === 400) {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "รหัสผ่านไม่ถูกต้อง",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
            this.login = true;
          });
        }
        if (
          err.error.message === "User Banned" &&
          err.error.status === 0) {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "บัญชีผู้ใช้ถูกแบน",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.login = true;
            }
          });
        }
        if (
          err.error.message === "User was not found." &&
          err.status === 400) {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "ไม่พบบัญชีผู้ใช้ในระบบ",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.router.navigate(["/register"]);
              this.login = true;
            }
          });
        } else {
          console.log(err);
          this.login = true;
        }
      });
    }
  }

  public clickSystemDevelopment(): void {
    // let dialog = this.dialog.open(DialogAlert, {
    //   disableClose: true,
    //   data: {
    //     text: MESSAGE.TEXT_DEVERLOP,
    //     bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
    //     bottomColorText2: "black",
    //     btDisplay1: "none"
    //   }
    // });
    // dialog.afterClosed().subscribe((res) => {
    // });
  }
  public onOtpChange(event: any) {
    if (event && event.length === 6) {
      this.countOtp = event;
      this.otpInput = this.countOtp.toString().length;
    } else {
      this.countOtp = event;
      this.otpInput = this.countOtp.toString().length;
    }
  }

  public sendNewOtp() {
    this.otpResendIcon = "hide";
    this.checkMergeUserFacade.confirmMergeOtp(this.emailOtp).then((res) => {
      this.limitOtpCount = res.limit;
    }).catch((err) => {
      if (err.error.message === "The Otp have been send more than 3 times, Please try add your OTP again") {
        let dialog = this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: "คุณส่งรหัส OTP เกิน 3 ครั้ง",
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            btDisplay1: "none",
          },
        });
      }
    });
  }
  public clickCheckOtp() {
    let mode = this.socialMode;
    if (mode === 'GOOGLE') {
      this.checkMergeUserFacade.checkOtpGG(this.emailOtp, this.googleToken.idToken, this.googleToken.authToken, this.countOtp, mode).then((res) => {
        this.ngOtpInput.otpForm.disable();
        if (res.message === "Loggedin successful" && res.authUser === 'GOOGLE') {
          this.authenManager.loginWithGoogle(this.googleToken.idToken, this.googleToken.authToken, mode).then((data) => {
            if (data) {
              let dialog = this.dialog.open(DialogAlert, {
                disableClose: true,
                data: {
                  text: MESSAGE.TEXT_LOGIN_SUCCESS,
                  bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                  bottomColorText2: "black",
                  btDisplay1: "none",
                },
              });
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  this.observManager.publish("authen.check", null);
                  this.observManager.publish("authen.profileUser", data.user);
                  if (this.redirection) {
                    this.router.navigateByUrl(this.redirection);
                  } else {
                    this.router.navigate(["home"]);
                  }
                }
              });
            }
          });
        }
      }).catch((err) => {
        if (err.error.message === "The OTP is not correct.") {
          this.ngOtpInput.otpForm.enable();
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "รหัส OTP ของท่านไม่ถูกต้อง",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
          });
        }
      });
    } else if (mode === 'FACEBOOK') {
      this.checkMergeUserFacade.checkOtpFB(this.emailOtp, this.accessToken, this.countOtp, mode).then((res) => {
        this.ngOtpInput.otpForm.disable();
        if (res.message === "Loggedin successful" && res.authUser === 'FACEBOOK') {
          this.authenManager.loginWithFacebook(res.data, res.authUser).then((data) => {
            if (data) {
              let dialog = this.dialog.open(DialogAlert, {
                disableClose: true,
                data: {
                  text: MESSAGE.TEXT_LOGIN_SUCCESS,
                  bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                  bottomColorText2: "black",
                  btDisplay1: "none",
                },
              });
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  this.observManager.publish("authen.check", null);
                  this.observManager.publish("authen.profileUser", data.user);
                  if (this.redirection) {
                    this.router.navigateByUrl(this.redirection);
                  } else {
                    this.router.navigate(["home"]);
                  }
                }
              });
            }
          })
        }
      }).catch((err) => {
        if (err.error.message === "The OTP is not correct.") {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "รหัส OTP ของท่านไม่ถูกต้อง",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
          });
        }
      });
    } else if (mode === 'EMAIL') {
      this.checkMergeUserFacade.checkOtp(this.emailOtp, this.countOtp, mode).then((res) => {
        this.ngOtpInput.otpForm.disable();
        if (res.message === "Loggedin successful" && res.authUser === 'EMAIL') {
          this.authenManager.login(this.emailOtp, this.passwordOtp, mode).then((data) => {
            if (data) {
              let dialog = this.dialog.open(DialogAlert, {
                disableClose: true,
                data: {
                  text: MESSAGE.TEXT_LOGIN_SUCCESS,
                  bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                  bottomColorText2: "black",
                  btDisplay1: "none",
                },
              });
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  this.observManager.publish("authen.check", null);
                  this.observManager.publish("authen.profileUser", data.user);
                  if (this.redirection) {
                    this.router.navigateByUrl(this.redirection);
                  } else {
                    this.router.navigate(["home"]);
                  }
                }
              });
            }
          })
        }
      }).catch((err) => {
        if (err.error.message === "The OTP is not correct.") {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "รหัส OTP ของท่านไม่ถูกต้อง",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
          });
        }
      });
    } else if (mode === 'TWITTER') {
      let twitter = {
        twitterOauthToken: this.TwAuthToken,
        twitterOauthTokenSecret: this.TwAuthTokenSecret,
        twitterUserId: this.TwUserId
      }
      this.checkMergeUserFacade.checkOtpTW(twitter, this.emailOtp, this.countOtp, mode).then((res) => {
        this.ngOtpInput.otpForm.disable();
        if (res.message === "Loggedin successful" && res.authUser === 'TWITTER') {
          this.authenManager.loginWithTwitter(twitter, mode).then((data) => {
            if (data) {
              let dialog = this.dialog.open(DialogAlert, {
                disableClose: true,
                data: {
                  text: MESSAGE.TEXT_LOGIN_SUCCESS,
                  bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                  bottomColorText2: "black",
                  btDisplay1: "none",
                },
              });
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  this.observManager.publish("authen.check", null);
                  this.observManager.publish("authen.profileUser", data.user);
                  if (this.redirection) {
                    this.router.navigateByUrl(this.redirection);
                  } else {
                    this.router.navigate(["home"]);
                  }
                }
              });
            }
          })
        }
      }).catch((err) => {
        if (err.error.message === "The OTP is not correct.") {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "รหัส OTP ของท่านไม่ถูกต้อง",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
          dialog.afterClosed().subscribe((res) => {
          });
        }
      });
    }
  }

  public getCurrentUserInfo(): any {
    window['FB'].api('/me', {
      fields: 'name, first_name, last_name,birthday,picture.width(512).height(512),id,email,gender'
    }, (userInfo) => {
      this.emailFB = userInfo.email;
      this.data = userInfo;
      this.data.displayName = userInfo.name;
      this.data.firstName = userInfo.first_name;
      this.data.lastName = userInfo.last_name;
      this.images = userInfo.picture.data.url;
      this.imagesAvatar = {};
      this.getBase64ImageFromUrl(this.images).then((result: any) => {
        if (result) {
          this.imagesAvatar.image = result;
        }
      }).catch(err => {
        console.log("เกิดข้อผิดพลาด");
      });
    });
  }

  public getTwitterUser(token: string, token_secret: string) {
    let body = {
      twitterOauthToken: token,
      twitterOauthTokenSecret: token_secret
    }
    this.twitterService.accountVerify(body).then((account: any) => {
      this.data = account;
      this.data.displayName = account.name;
      let str = account.profile_image_url_https;
      let splitted = str.split("_normal", 2);
      let splitImg = splitted[0] + splitted[1];
      this.images = splitImg;
      this.imagesAvatar = {};
      this.getBase64ImageFromUrl(splitImg).then((result: any) => {
        if (result) {
          this.imagesAvatar.image = result;
        }
      }).catch((err) => {
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
      let str = user.photoUrl;
      let splitted = str.split("s96", 2);
      let splitImg = splitted[0] + "s400" + splitted[1];
      this.images = splitImg;
      this.imagesAvatar = {};
      this.getBase64ImageFromUrl(splitImg).then((result: any) => {
        if (result) {
          this.imagesAvatar.image = result;
        }
      }).catch((err) => {
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

  public checkAuthUser(data: any): string {
    let socialAuthIcon: string;
    for (const socialAuth of data) {
      if (socialAuth) {
        if (socialAuth === 'EMAIL') {
          socialAuthIcon = 'EMAIL';
          break;
        } else if (socialAuth === 'FACEBOOK') {
          socialAuthIcon = 'FACEBOOK';
          break;
        } else if (socialAuth === 'TWITTER') {
          socialAuthIcon = 'TWITTER';
          break;
        } else if (socialAuth === 'GOOGLE') {
          socialAuthIcon = 'GOOGLE';
          break;
        }
      }
    }

    return socialAuthIcon;
  }
}
