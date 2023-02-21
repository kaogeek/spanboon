/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, EventEmitter, ElementRef, NgZone } from "@angular/core";
import { AbstractPage } from '../../AbstractPage';
import { MatDatepicker, DateAdapter, MatDialog } from '@angular/material';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { DialogAlert } from '../../../shares/dialog/DialogAlert.component';
import { ObservableManager } from '../../../../services/ObservableManager.service';
import { AuthenManager } from '../../../../services/AuthenManager.service';
import { MESSAGE } from '../../../../../custom/variable';
import { User } from '../../../../models/User';
import { environment } from '../../../../../environments/environment';
import * as $ from 'jquery';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { TwitterService } from "../../../../services/facade/TwitterService.service";
import { CheckMergeUserFacade } from "src/app/services/facade/CheckMergeUserFacade.service";

const PAGE_NAME: string = 'register/menu';

@Component({
    selector: 'menu-register',
    templateUrl: './MenuRegister.component.html',
})
export class MenuRegister extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    private _ngZone: NgZone;
    private accessToken: any;
    private googleToken: any;
    private activatedRoute: ActivatedRoute;
    private observManager: ObservableManager;
    private twitterService: TwitterService;
    private checkMergeUserFacade: CheckMergeUserFacade;

    public authenManager: AuthenManager;
    public dialog: MatDialog;
    public redirection: string;
    public googleUser = {};
    public auth2: any;

    public modeSwitch: "mergeuser";
    public emailOtp: string;
    public limitOtpCount: number;
    public socialMode: any;
    public pictureSocial: any;
    public login = true;
    public social: any = {
        socialLogin: undefined,
    };
    public mockDataMergeSocial: any = {
        social: undefined,
    };

    private regis_merge: string = 'register.merge';

    public dataUser: any;

    //twitter
    public authorizeLink = 'https://api.twitter.com/oauth/authorize';
    public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
    public accessTokenLink = '';
    public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';

    constructor(authenManager: AuthenManager,
        private socialAuthService: SocialAuthService,
        activatedRoute: ActivatedRoute,
        router: Router,
        dialog: MatDialog,
        observManager: ObservableManager,
        twitterService: TwitterService,
        _ngZone: NgZone,
        checkMergeUserFacade: CheckMergeUserFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.authenManager = authenManager;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.dialog = dialog;
        this._ngZone = _ngZone;
        this.observManager = observManager;
        this.twitterService = twitterService;
        this.checkMergeUserFacade = checkMergeUserFacade;

        this.activatedRoute.params.subscribe(param => {
            this.redirection = param['redirection'];
        });

        this.observManager.createSubject(this.regis_merge);
    }

    ngOnInit(): void {
        super.ngOnInit();
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

    public clickLoginGoogle(): void {
        // this.showAlertDevelopDialog("รองรับการสมัครใช้งานผ่าน Facebook หรือผ่านการสมัคร สมาชิกโดยตรง");
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

    public clickLoginTW() {
        let callback = environment.webBaseURL + "/login";
        this.twitterService.requestToken(callback).then((result: any) => {
            this.authorizeLink += '?' + result;
            this.router.navigate([]).then(() => {
                window.open(this.authorizeLink, '_blank');
            });
        }).catch((error: any) => {
            console.log(error);
        });

    }

    private loginGoogle() {
        let mode = 'GOOGLE';

        this.checkMergeUserFacade.loginWithGoogle(this.googleToken.idToken, this.googleToken.authToken, mode).then((data: any) => {
            if (data.data.status === 2) {
                let dialog = this.dialog.open(DialogAlert, {
                    disableClose: true,
                    data: {
                        text: "พบแอคเคาท์ในระบบแล้ว กรุณาเข้าสู่ระบบด้วยโหมดกูเกิ้ล",
                        btDisplay1: "none"
                    }
                });
                dialog.afterClosed().subscribe((res) => {
                    if (res) {
                        this.router.navigate(['/login']);
                    }
                });
            } else {
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
                    } else if (statusMsg === "This Email not exists") {
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
        }).catch((error) => {
            console.log("err", error);
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
            }
        })

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
        }, { scope: 'public_profile, email' });
    }

    private loginFB() {
        let mode = 'FACEBOOK'

        this.checkMergeUserFacade.loginWithFacebook(this.accessToken.fbtoken, mode).then((data: any) => {
            if (data.data.status === 2) {
                this.observManager.publish(this.regis_merge, {
                    data: data.data,
                    token: this.accessToken.fbtoken
                });
                this.router.navigate(['/login']);
                // let dialog = this.dialog.open(DialogAlert, {
                //     disableClose: true,
                //     data: {
                //         text: "พบแอคเคาท์ในระบบแล้ว กรุณาเข้าสู่ระบบด้วยโหมดเฟสบุ๊ค",
                //         btDisplay1: "none"
                //     }
                // });
                // dialog.afterClosed().subscribe((res) => {
                //     if (res) {
                //         this.router.navigate(['/login']);
                //     }
                // });
            } else {
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
        }).catch((error) => {
            const statusMsg = error.error.message;
            if (statusMsg === "User was not found." && error.error.status === 0) {
                let navigationExtras: NavigationExtras = {
                    state: {
                        accessToken: this.accessToken,
                        redirection: this.redirection
                    },
                    queryParams: { mode: 'facebook' }
                }
                this.router.navigate(['/register'], navigationExtras);
            } else if (statusMsg === 'Baned PageUser.' && error.error.status === 0) {
                this.dialog.open(DialogAlert, {
                    disableClose: true,
                    data: {
                        text: MESSAGE.TEXT_LOGIN_BANED,
                        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                        bottomColorText2: "black",
                        btDisplay1: "none"
                    }
                });
            } else if (statusMsg === "This Email not exists" && error.error.status === 0) {
                let navigationExtras: NavigationExtras = {
                    state: {
                        accessToken: this.accessToken,
                        redirection: this.redirection
                    },
                    queryParams: { mode: 'facebook' }
                }
                this.router.navigate(['/register'], navigationExtras);
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
