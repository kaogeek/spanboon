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
import { CookieUtil } from 'src/app/utils/CookieUtil';

const PAGE_NAME: string = 'connect';

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
    public data: any;

    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    private pageFacade: PageFacade;
    private twitterService: TwitterService;
    public bindingSocial: any;
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

        // let resultTwitter = this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state;
        // console.log('info ', resultTwitter)
        // if (resultTwitter !== undefined && resultTwitter !== null) {
        //     console.log('data >????? ', resultTwitter)
        //     this.bindingTwitter(resultTwitter.data.token, resultTwitter.data.token_secret, resultTwitter.data.userId);
        // }

    }

    public ngOnInit(): void {

    }

    public ngAfterViewInit(): void {
        this.socialGetBindingTwitter();
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

    public connectionSocial(text: string, bind?: boolean) { 
        if (text === 'facebook') {

        } else if (text === 'twitter' && !bind) {
            CookieUtil.setCookie('page', this.router.url);
            let callback = "callback";
            this.twitterService.requestToken(callback).then((result: any) => {
                this.authorizeLink += '?' + result;
                console.log('result ', this.authorizeLink)
                window.open(this.authorizeLink);
            }).catch((error: any) => {
                console.log(error);
            });

        } else if (text === 'twitter' && bind) {
            this.pageFacade.socialUnBindingTwitter(this.data).then((res: any) => {
                // if delete true set false
                if(res.data){ 
                    this.connectTwitter = false;
                }
            }).catch((err: any) => {
                console.log('err ', err)
            });
        } else if (text === 'google') {

        }
    }

    public socialGetBindingTwitter() {
        this.pageFacade.socialGetBindingTwitter(this.data).then((res: any) => {
            this.connectTwitter = res.data;
        }).catch((err: any) => {
            console.log('err ', err)
        });
    }

    // public bindingTwitter(token: string, token_secret: string, userId: string) {
    //     console.log('twitter')
    //     let pageId = this.data;
    //     const twitter = new PageSocailTW();
    //     twitter.twitterOauthToken = token;
    //     twitter.twitterTokenSecret = token_secret;
    //     twitter.twitterUserId = userId;

    //     this.pageFacade.socialBindingTwitter(pageId, twitter).then((res: any) => {
    //         console.log('data ', res)
    //         this.bindingSocial = res.data;
    //     }).catch((err: any) => {
    //         console.log('err ', err)
    //     })
    // }
}
