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
import { MESSAGE, PageSocialTW, PageSoialFB } from '../../../../models/models';
import { CookieUtil } from '../../../../utils/CookieUtil';
import { environment } from '../../../../../environments/environment';
import { FACEBOOK_AUTO_POST, TWITTER_AUTO_POST } from '../../,,/../../../Config';
import { DialogAlert, DialogListFacebook } from 'src/app/components/shares/shares';

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
    public isLoading: boolean;
    public isLoadingTwitter: boolean;
    private accessToken: any;
    public responseFacabook: any;
    public dataBinding: any;
    public dataBindingTwitter: any;
    public redirection: string;
    public index: number;

    //twitter
    public authorizeLink = 'https://api.twitter.com/oauth/authorize';
    public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
    public accessTokenLink = '';
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
        this.isLoading = true;
        this.isLoadingTwitter = true;

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
        this.socialGetBindingFacebook();
    }

    public connectionSocial(text: string, bind?: boolean) {

        if (text === 'facebook' && !bind) {
            this.isLoading = true;
            this.clickLoginFB();
        } else if (text === 'facebook' && bind) {
            this.isLoading = true;
            this.pageFacade.socialUnBindingFacebook(this.pageId).then((res: any) => {
                // if delete true set false
                if (res.data) {
                    this.connect = false;
                    let slider = {
                        checked: false
                    }
                    this.unBindingSharePost(slider, 'facebook');
                    this.socialGetBindingFacebook();
                }
            }).catch((err: any) => {
                // console.log('err ', err)
                if(err.error && err.error.name){

                    this.showDialogError(err.error.name, this.router.url);
                } else {
                    this.showAlertDialog('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
                }
            });
        } else if (text === 'twitter' && !bind) {
            this.isPreLoadIng = true;
            this.isLoadingTwitter = true;
            CookieUtil.setCookie('page', '/page/' + this.pageId + '/settings');
            let callback = environment.webBaseURL + "/callback";
            this.twitterService.requestToken(callback).then((result: any) => {
                this.authorizeLink += '?' + result;
                window.open(this.authorizeLink, '_blank');
                // this.popup(this.authorizeLink, '', 600, 200, 'yes');
                this.isPreLoadIng = false;

                window.bindTwitter = (resultTwitter) => {
                    if (resultTwitter !== undefined && resultTwitter !== null) {
                        const twitter = new PageSocialTW();
                        twitter.twitterOauthToken = resultTwitter.token;
                        twitter.twitterTokenSecret = resultTwitter.token_secret;
                        twitter.twitterUserId = resultTwitter.userId;
                        twitter.twitterPageName = resultTwitter.name;

                        this.pageFacade.socialBindingTwitter(this.pageId, twitter).then((res: any) => {
                            if (res.data) {
                                this.connectTwitter = res.data;
                                this.isLoadingTwitter = false;
                                this.socialGetBindingTwitter();
                                let check = {
                                    checked: true
                                }
                                this.onChangeSlide(check, 'twitter');
                            }

                        }).catch((err: any) => {
                            if (err.error.message === 'This page was binding with Twitter Account.') {
                                this.showAlertDialog('บัญชีนี้ได้ทำการเชื่อมต่อ Twitter แล้ว');
                            } else {
                                this.showAlertDialog('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
                            }
                            this.connectTwitter = false;
                        });
                    }
                }
            }).catch((error: any) => {
                this.showAlertDialog('เกิดข้อมูลผิดพลาด กรุณาลองใหม่อีกครั้ง');
                this.isPreLoadIng = false;
                this.isLoadingTwitter = false;
            });

        } else if (text === 'twitter' && bind) {
            this.isLoadingTwitter = true;
            this.pageFacade.socialUnBindingTwitter(this.pageId).then((res: any) => {
                // if delete true set false
                if (res.data) {
                    this.connectTwitter = false;
                    let slider = {
                        checked: false
                    }
                    this.unBindingSharePost(slider, 'twitter');
                    this.socialGetBindingTwitter();
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
            if (Object.keys(res.data).length > 0) {
                this.connectTwitter = res.data.data;
                this.isLoadingTwitter = false;
                this.dataBindingTwitter = res.data;
            }

        }).catch((err: any) => {
            console.log('err ', err)
            this.showDialogError(err && err.error.name, undefined);
        });
    }

    public socialGetBindingFacebook() {
        this.pageFacade.socialGetBindingFacebook(this.pageId).then((res: any) => {
            if (Object.keys(res.data).length > 0) {
                this.connect = res.data.data;
                this.isLoading = false;
                this.dataBinding = res.data;
            }
        }).catch((err: any) => {
            console.log('err ', err)
            this.showDialogError(err && err.error.name, this.router.url);
        });
    }

    public getConfigFacebook() {
        this.pageFacade.getConfigByPage(this.pageId, FACEBOOK_AUTO_POST).then((res: any) => {
            this.autoPostFacebook = res.value;
        }).catch((err: any) => {
            console.log('err ', err)
            this.showDialogError(err && err.error.name, undefined);
        })
    }

    public getConfigTwitter() {
        this.pageFacade.getConfigByPage(this.pageId, TWITTER_AUTO_POST).then((res: any) => {
            this.autoPostTwitter = res.value;
        }).catch((err: any) => {
            console.log('err ', err)
            this.showDialogError(err && err.error.name, undefined);
        });
    }

    public unBindingSharePost(event: any, social: string) {
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
                this.isLoading = false;
            } else if (res.name === TWITTER_AUTO_POST) {
                this.autoPostTwitter = res.value;
                this.isLoadingTwitter = false;
            }
        }).catch((err: any) => {
            console.log('err ', err)
        })
    }

    public onChangeSlide(event: any, social: string) { 
        var isAutoPost = false;
        if (social === 'twitter') {
            // twitter
            if (!this.connectTwitter) {
                let dialogRef = this.dialog.open(DialogAlert, {
                    disableClose: true,
                    data: {
                        text: social === 'twitter' ? 'คุณต้องเชื่อมต่อกับ Twitter' : 'คุณต้องเชื่อมต่อกับ Facebook',
                        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                        bottomColorText2: "black",
                        btDisplay1: "none"
                    }
                })
                dialogRef.afterClosed().subscribe(response => {
                    if (response) {
                        this.autoPostTwitter = false; 
                    }
                }); 
            } else {
                isAutoPost = true;
            }
        } else if (social === 'facebook') {
            // facebook  
            if (!this.connect) { 
                let dialogRef = this.dialog.open(DialogAlert, {
                    disableClose: true,
                    data: {
                        text: 'คุณต้องเชื่อมต่อกับ' + social,
                        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                        bottomColorText2: "black",
                        btDisplay1: "none"
                    }
                })
                dialogRef.afterClosed().subscribe(response => {
                    if (response) {
                        this.autoPostFacebook = false; 
                    }
                });
            } else {
                isAutoPost = true;
            }
        } 
        if (isAutoPost && (this.autoPostFacebook || this.autoPostTwitter)) { 
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
            });
        }
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
                this._ngZone.run(() => this.listPageFacebook());

            } else {
                this.isLoading = false;
                this.connect = false;
            }
        }, { scope: 'public_profile,email,user_birthday,user_gender,pages_show_list,pages_read_engagement,pages_manage_posts,publish_to_groups' });
    }

    public listPageFacebook() {
        this.isLoading = false;
        window['FB'].api("/me/accounts?access_token=" + this.accessToken.fbtoken, (response) => {
            if (response && !response.error) {
                /* handle the result */
                this.responseFacabook = response;
                if (this.responseFacabook && this.responseFacabook.data.length > 0 && this.responseFacabook !== undefined) {
                    Object.assign(this.responseFacabook.data[0], { selected: true });
                    this.getListFacebook(this.responseFacabook);
                } else {
                    this.connect = false;
                    this.showAlertDialog('ไม่พบเพจ');
                }
            }
        });
    }

    public getListFacebook(data) {
        let dialog = this.dialog.open(DialogListFacebook, {
            disableClose: true,
            panelClass: 'customize-dialog',
            data: data
        });
        dialog.afterClosed().subscribe((res) => { 
            if (res) {
                this.checkBoxBindingPageFacebook(res);
                let check = {
                    checked: true
                }
                this.onChangeSlide(check, 'facebook');
            } else {
                this.connect = false;
            }
        });
    }

    public getImagePageProfile(pageUserId) {
        window['FB'].api("/" + pageUserId + "/picture?redirect=0&access_token=" + this.accessToken.fbtoken, (picture) => {
            if (picture && !picture.error) {
                // console.log('picture ', picture)
                /* handle the result */
            }
        })
    }

    public checkBoxBindingPageFacebook(access: any, i?: number) {
        const facebook = new PageSoialFB();
        facebook.facebookPageId = access.id;
        facebook.pageAccessToken = access.access_token;
        facebook.facebookPageName = access.name;

        this.pageFacade.socialBindingFacebook(this.pageId, facebook).then((res: any) => {

            if (res.data) {
                this.connect = res.data;
                Object.assign(access, { selected: true });
                this.socialGetBindingFacebook();
                this.isLoading = false;
            }

        }).catch((err: any) => {
            if (err.error.message === 'This page was binding with Facebook Account.') {
                this.showAlertDialog('บัญชีนี้ได้ทำการเชื่อมต่อ facebook แล้ว');
            } else if (err.error.message === 'You cannot access the page.') {
                this.showAlertDialog('คุณไม่มีสิทธื์ในการเข้าถึงเพจได้');
            } else if (err.error.message === 'You cannot access the facebook page.') {
                this.showAlertDialog('คุณไม่มีสิทธื์ในการเข้าถึง facebook ได้');
            } else {
                this.showAlertDialog('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
            }
            this.connect = false;
        });
    }
} 