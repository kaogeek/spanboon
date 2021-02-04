/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { MatAutocompleteTrigger, MatInput, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager, AssetFacade, PageFacade, TwitterService } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { ValidBase64ImageUtil } from '../../../../utils/ValidBase64ImageUtil';
import { PageSocailTW } from '../../../../models/models';
import { CookieUtil } from '../../../../utils/CookieUtil';

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
    public pageId: any;

    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    private pageFacade: PageFacade;
    private twitterService: TwitterService;

    public bindingSocialTwitter: any;
    public isPreLoadTwitter: boolean;

    //twitter
    public authorizeLink = 'https://api.twitter.com/oauth/authorize';
    public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
    public accessTokenLink = 'https://api.twitter.com/oauth/access_token';
    public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade, twitterService: TwitterService,
        dialog: MatDialog, pageFacade: PageFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.assetFacade = assetFacade;
        this.twitterService = twitterService;
        this.pageFacade = pageFacade;
        this.isPreLoadTwitter = false;

    }

    public ngOnInit(): void {
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
        if (text === 'facebook') {

        } else if (text === 'twitter' && !bind) {
            this.isPreLoadTwitter = true;
            CookieUtil.setCookie('page', '/page/' + this.pageId + '/settings');
            let callback = "callback";
            this.twitterService.requestToken(callback).then((result: any) => {
                this.authorizeLink += '?' + result;
                // window.open(this.authorizeLink);
                this.popup(this.authorizeLink, '', 600, 200, 'yes');
                this.isPreLoadTwitter = false;
                window.bindTwitter = (resultTwitter) => { 
                    if (resultTwitter !== undefined && resultTwitter !== null) {
                        const twitter = new PageSocailTW();
                        twitter.twitterOauthToken = resultTwitter.token;
                        twitter.twitterTokenSecret = resultTwitter.token_secret;
                        twitter.twitterUserId = resultTwitter.userId;

                        this.pageFacade.socialBindingTwitter(this.pageId, twitter).then((res: any) => {
                            if (res.data) {
                                this.connectTwitter = res.data;
                                console.log('this.connectTwitter ', this.connectTwitter)
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
            });

        } else if (text === 'twitter' && bind) {
            this.pageFacade.socialUnBindingTwitter(this.pageId).then((res: any) => {
                // if delete true set false
                if (res.data) {
                    this.connectTwitter = false;
                }
            }).catch((err: any) => {
                console.log('err ', err)
                if (err.error.name === 'AccessDeniedError') {
                    this.authenManager.clearStorage();
                }
            });
        } else if (text === 'google') {

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
}
