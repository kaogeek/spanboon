/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';
import { MainPageSlideFacade, ObservableManager, TwitterService } from '../../../services/services';
import { CookieUtil } from '../../../utils/CookieUtil';

declare var $: any;
const PAGE_NAME: string = '';
const URL_PATH: string = '/@';

@Component({
    selector: 'redirect',
    templateUrl: './Redirect.component.html',
})
export class Redirect implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public redirection: string;
    private router: Router;
    private mainPage: MainPageSlideFacade
    private observManager: ObservableManager;
    private twitterService: TwitterService;
    public accessTokenLink = 'https://api.twitter.com/oauth/access_token';

    public page: any;

    constructor(router: Router, routeActivated: ActivatedRoute, dialog: MatDialog, mainPage: MainPageSlideFacade, twitterService: TwitterService, observManager: ObservableManager) {
        this.router = router;
        this.mainPage = mainPage;
        this.twitterService = twitterService;
        this.observManager = observManager;

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const url: string = decodeURI(this.router.url);
                this.page = CookieUtil.getCookie('page');
                if (url.indexOf(URL_PATH) >= 0) {
                    const substringPath: string = url.substring(url.indexOf(URL_PATH), url.length);
                    const type = substringPath.substring(1);
                    if (type.includes('@')) {
                        let type_substring = type.substring(1);
                        this.mainPage.account(type_substring).then((res: any) => {
                            if (res.type === 'USER') {
                                if (res && res.uniqueId && res.uniqueId !== '' && res.uniqueId !== undefined && res.uniqueId !== null) {
                                    this.router.navigateByUrl('/profile/' + res.uniqueId)
                                } else {
                                    this.router.navigateByUrl('/profile/' + res.id)
                                }
                            } else if (res.type === 'PAGE') {
                                if (res && res.pageUsername && res.pageUsername !== '' && res.pageUsername !== undefined && res.pageUsername !== null) {
                                    this.router.navigateByUrl('/page/' + res.pageUsername)
                                } else {
                                    this.router.navigateByUrl('/page/' + res.id)
                                }
                            }
                        }).catch((err => {
                            console.log(err)
                        }))
                    }
                } else {
                    let doRunAccessToken = false;
                    if (url !== undefined && url !== '') { 
                        let split = url.split('?'); 
                        if (split.length >= 2) {
                            const queryParam = split[1];
                            if (queryParam.includes('tab=connect')) {
                                return;
                            }
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
                            const page = spilt[2].split('/')[1];
                            console.log('page ',page)
                            let user = {
                                token: token,
                                token_secret: token_secret,
                                userId: userId
                            } 

                            window.close();
                            window.opener.location = this.page;
                            this.router.navigateByUrl(this.page, { state: { data: user } })

                        }).catch((err: any) => [
                            console.log('err ', err)
                        ])
                    }

                }
            }
        });

    }
    ngOnInit(): void {
    }
}
