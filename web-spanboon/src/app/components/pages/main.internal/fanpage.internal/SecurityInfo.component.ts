/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, NgZone } from '@angular/core';
import { MatAutocompleteTrigger, MatInput, MatDialog, MatSlideToggleChange } from '@angular/material';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenManager, ObservableManager, AssetFacade, PageFacade, TwitterService, CacheConfigInfo } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { PageSocailTW } from '../../../../models/models';
import { CookieUtil } from '../../../../utils/CookieUtil';
import { environment } from '../../../../../environments/environment';
import { FACEBOOK_AUTO_POST, TWITTER_AUTO_POST } from '../../,,/../../../Config';
import { MESSAGE } from 'src/app/AlertMessage';
import { DialogAlert } from 'src/app/components/shares/dialog/DialogAlert.component';

const PAGE_NAME: string = 'connect';

declare const window: any;

@Component({
    selector: 'security-info',
    templateUrl: './SecurityInfo.component.html'
})
export class SecurityInfo extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public connect: boolean = false;
    @Input()
    public connectTwitter: boolean = false;
    @Input()
    public autoPostTwitter: boolean = false;
    @Input()
    public autoPostFacebook: boolean = false;
    @Input()
    public pageId: any;

    public router: Router;
    private _ngZone: NgZone;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    private pageFacade: PageFacade;
    private twitterService: TwitterService;
    private cacheConfigInfo: CacheConfigInfo;

    public bindingSocialTwitter: any;
    public isPreLoadIng: boolean;
    private accessToken: any;
    public redirection: string;

    //twitter
    public authorizeLink = 'https://api.twitter.com/oauth/authorize';
    public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
    public accessTokenLink = 'https://api.twitter.com/oauth/access_token';
    public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade, twitterService: TwitterService,
        dialog: MatDialog, pageFacade: PageFacade, cacheConfigInfo: CacheConfigInfo, _ngZone: NgZone) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this._ngZone = _ngZone;
        this.assetFacade = assetFacade;
        this.twitterService = twitterService;
        this.pageFacade = pageFacade;
        this.cacheConfigInfo = cacheConfigInfo;
        this.isPreLoadIng = false;

    }

    public ngOnInit(): void {
        this.getConfigFacebook();
        this.getConfigTwitter();
        this.fbLibrary();
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
        this.socialGetBindingTwitter();
    }

    public connectionSocial(text: string, bind?: boolean) {
        if (text === 'facebook' && !bind) {
            this.clickLoginFB();
        } else if (text === 'facebook' && bind) {
            this.pageFacade.socialUnBindingFacebook(this.pageId).then((res: any) => {
                // if delete true set false
                if (res.data) {
                    this.connect = false;
                    let slider = {
                        checked: false
                    }
                    this.unBindingSharePost(slider, 'facebook');
                }
            }).catch((err: any) => {
                console.log('err ', err)
                this.showDialogError(err.error.name, this.router.url);
            });
        } else if (text === 'twitter' && !bind) {
            this.isPreLoadIng = true;
            CookieUtil.setCookie('page', '/page/' + this.pageId + '/settings');
            let callback = environment.webBaseURL + "/callback";
            this.twitterService.requestToken(callback).then((result: any) => {
                this.authorizeLink += '?' + result;
                window.open(this.authorizeLink);
                // this.popup(this.authorizeLink, '', 600, 200, 'yes');
                this.isPreLoadIng = false;

                window.bindTwitter = (resultTwitter) => {
                    if (resultTwitter !== undefined && resultTwitter !== null) {
                        const twitter = new PageSocailTW();
                        twitter.twitterOauthToken = resultTwitter.token;
                        twitter.twitterTokenSecret = resultTwitter.token_secret;
                        twitter.twitterUserId = resultTwitter.userId;

                        this.pageFacade.socialBindingTwitter(this.pageId, twitter).then((res: any) => {
                            if (res.data) {
                                this.connectTwitter = res.data;
                            }

                        }).catch((err: any) => {
                            if (err.error.message === 'This page was binding with Twitter Account.') {
                                this.showAlertDialog('บัญชีนี้ได้ทำการเชื่อมต่อ Twitter แล้ว');
                            }
                        });
                    }
                }
            }).catch((error: any) => {
                console.log(error);
                this.showAlertDialog('เกิดข้อมูลผิดพลาด กรุณาลองใหม่อีกครั้ง');
                this.isPreLoadIng = false;
            });

        } else if (text === 'twitter' && bind) {
            this.pageFacade.socialUnBindingTwitter(this.pageId).then((res: any) => {
                // if delete true set false
                if (res.data) {
                    this.connectTwitter = false;
                    let slider = {
                        checked: false
                    }
                    this.unBindingSharePost(slider, 'twitter');
                }
            }).catch((err: any) => {
                console.log('err ', err)
                this.showDialogError(err.error.name, this.router.url);
            });
        }
    }

    public popup(url, title, width, height, scroll) {

        var LeftPosition = (screen.width) ? (screen.width - width) / 2 : 0;
        var TopPosition = (screen.height) ? (screen.height - height) / 2 : 0;
        var settings = 'height=' + height + ',width=' + width + ',top=' + TopPosition + ',left=' + LeftPosition + ',scrollbars=' + scroll + ',resizable'

        return window.open(url, title, settings);
    }

    public socialGetBindingTwitter() {
        this.pageFacade.socialGetBindingTwitter(this.pageId).then((res: any) => {
            this.connectTwitter = res.data;
        }).catch((err: any) => {
            console.log('err ', err)
        });
    }

    public getConfigFacebook() {
        this.pageFacade.getConfigByPage(this.pageId, FACEBOOK_AUTO_POST).then((res: any) => {
            this.autoPostFacebook = res.value;
        }).catch((err: any) => {
            console.log('err ', err)
        })
    }

    public getConfigTwitter() {
        this.pageFacade.getConfigByPage(this.pageId, TWITTER_AUTO_POST).then((res: any) => {
            this.autoPostTwitter = res.value;
        }).catch((err: any) => {
            console.log('err ', err)
        });
    }

    public unBindingSharePost(event: any, social: string) {
        let autopost: string = '';
        if (social === 'facebook') {
            autopost = FACEBOOK_AUTO_POST;
        } else if (social === 'twitter') {
            autopost = TWITTER_AUTO_POST;
        }
        console.log('event un ', event)
        let config = {
            value: event.checked,
            type: "boolean"
        }
        this.pageFacade.getEditConfig(this.pageId, config, autopost).then((res: any) => {
            if (res.name === FACEBOOK_AUTO_POST) {
                this.autoPostFacebook = res.value;
            } else if (res.name === TWITTER_AUTO_POST) {
                this.autoPostTwitter = res.value;
            }
        }).catch((err: any) => {
            console.log('err ', err)
        })
    }

    public onChangeSlide(event: any, social: string) {
 
        if (social === 'twitter') {
            // twitter
            if (!this.connectTwitter) {
                this.autoPostTwitter = undefined;
                return this.showAlertDialogWarming('คุณต้องเชื่อมต่อกับ' + social, "none");
            }
        } else if (social === 'facebook') {
            // facebook
            if (!this.connect) {
                this.autoPostFacebook = undefined;
                return this.showAlertDialogWarming('คุณต้องเชื่อมต่อกับ' + social, "none");
            }
        } 

        let autopost: string = '';
        if (social === 'facebook') {
            autopost = FACEBOOK_AUTO_POST;
        } else if (social === 'twitter') {
            autopost = TWITTER_AUTO_POST;
        }
        let config = {
            value: event.checked,
            type: "boolean"
        }
        this.pageFacade.getEditConfig(this.pageId, config, autopost).then((res: any) => {
            if (res.name === FACEBOOK_AUTO_POST) {
                this.autoPostFacebook = res.value;
            } else if (res.name === TWITTER_AUTO_POST) {
                this.autoPostTwitter = res.value;
            }
        }).catch((err: any) => {
            console.log('err ', err)
        })
    }

    public fbLibrary() {
        (window as any).fbAsyncInit = function () {
            window['FB'].init({
                appId: environment.facebookAppId,
                cookie: true,
                xfbml: true,
                version: 'v9.0'
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
        }, { scope: 'public_profile,email,user_birthday,user_gender' });
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
}
