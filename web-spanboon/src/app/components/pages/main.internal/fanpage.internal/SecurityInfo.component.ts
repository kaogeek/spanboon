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
import { PageSocailTW } from 'src/app/models/models';

const REDIRECT_PATH: string = '/home';
const PAGE_NAME: string = 'security';

@Component({
    selector: 'security-info',
    templateUrl: './SecurityInfo.component.html'
})
export class SecurityInfo extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public connect: boolean = false;
    @Input()
    public data: any; 

    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    private pageFacade: PageFacade;
    private twitterService: TwitterService;

    //twitter
    public authorizeLink = 'https://api.twitter.com/oauth/authorize';
    public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
    public accessTokenLink = 'https://api.twitter.com/oauth/access_token';
    public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade,twitterService: TwitterService,
        dialog: MatDialog, pageFacade: PageFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.assetFacade = assetFacade;
        this.twitterService = twitterService;
        this.pageFacade = pageFacade;
    }

    public ngOnInit(): void {
        console.log('data page ',this.data)
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
                this.bindingTwitter(token, token_secret, userId);

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

    public connectionSocial(text: string) {
        if (text === 'facebook') {

        } else if (text === 'twitter') {
            this.twitterService.requestToken().then((result: any) => {
                this.authorizeLink += '?' + result; 
                // this.authenticateLink += '?' + result;
                console.log('result ', this.authorizeLink) 
                window.open(this.authorizeLink); 
            }).catch((error: any) => {
                console.log(error);
            });

        } else if (text === 'google') {

        }
    }

    public bindingTwitter(token: string, token_secret: string, userId: string){
        console.log('twitter')
        let pageId = this.data;
        const twitter = new PageSocailTW();
        twitter.twitterOauthToken = token;
        twitter.twitterTokenSecret = token_secret;
        twitter.twitterUserId = userId;

        this.pageFacade.socialBindingTwitter(pageId ,twitter).then((res:any)=>{
            console.log('data ',res)
        }).catch((err :any)=>{
            console.log('err ',err)
        })
    }
}
