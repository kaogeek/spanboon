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
import { MainPageSlideFacade } from 'src/app/services/services';

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

    constructor(router: Router, routeActivated: ActivatedRoute, dialog: MatDialog, mainPage: MainPageSlideFacade) {
        this.router = router;
        this.mainPage = mainPage
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    const url: string = decodeURI(this.router.url);
                    if (url.indexOf(URL_PATH) >= 0) {
                        const substringPath: string = url.substring(url.indexOf(URL_PATH), url.length);
                        const type = substringPath.substring(1); 
                        if(type.includes('@')){
                            let type_substring = type.substring(1);
                            this.mainPage.account(type_substring).then((res : any)=>{
                                console.log(res)
                                if(res.type === 'USER'){
                                    if(res && res.uniqueId && res.uniqueId !== '' && res.uniqueId !== undefined && res.uniqueId !== null ){
                                        this.router.navigateByUrl('/profile/'+res.uniqueId)
                                    } else {
                                        this.router.navigateByUrl('/profile/'+res.id)
                                    }
                                } else if(res.type === 'PAGE'){
                                    if(res && res.pageUsername && res.pageUsername !== '' && res.pageUsername !== undefined && res.pageUsername !== null ){
                                        this.router.navigateByUrl('/page/'+res.pageUsername)
                                    } else {
                                        this.router.navigateByUrl('/page/'+res.id)
                                    }
                                }
                            }).catch((err=>{
                                console.log(err)
                            }))
                        } 
                    }
                }
            });

    }


    public ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }


    private stopLoading(): void {
        setTimeout(() => {
            // this.isLoading = false;
        }, 1000);
    }
}
