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
import { MESSAGE } from '../../../../AlertMessage';
import { User } from '../../../../models/User';
import { environment } from 'src/environments/environment';
import * as $ from 'jquery';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';

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

    public authenManager: AuthenManager;
    public dialog: MatDialog;
    public redirection: string;
    public googleUser = {};
    public auth2: any;

    constructor(authenManager: AuthenManager,
        private socialAuthService: SocialAuthService,
        activatedRoute: ActivatedRoute,
        router: Router,
        dialog: MatDialog,
        observManager: ObservableManager,
        _ngZone: NgZone,) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.authenManager = authenManager;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.dialog = dialog;
        this._ngZone = _ngZone
        this.observManager = observManager;

        // if ((this.router.url === "/register/menu")) {
        //     $(".icon-post-bottom").css({
        //         'display': "none"
        //     });
        // }

        this.activatedRoute.params.subscribe(param => {
            this.redirection = param['redirection'];
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

    public clickLoginGoogle(): void {
        this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then((result) => {
            console.log('result >>> ', result);

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
        }, { scope: 'public_profile,email,user_birthday' });
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
