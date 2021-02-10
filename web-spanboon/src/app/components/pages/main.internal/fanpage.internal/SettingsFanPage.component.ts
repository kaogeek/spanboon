/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { Component } from "@angular/core";
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { PageSocailTW } from '../../../../models/PageSocailTW';
import { environment } from '../../../../../environments/environment';
import { AssetFacade, AuthenManager, ObservableManager, PageFacade, UserAccessFacade } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { SettingsInfo } from './SettingsInfo.component';

const PAGE_NAME: string = 'settings';
const URL_PATH: string = '/page/';

declare var $: any;
@Component({
    selector: 'settings-fanpage',
    templateUrl: './SettingsFanPage.component.html',
})
export class SettingsFanPage extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    private routeActivated: ActivatedRoute;
    private userAccessFacade: UserAccessFacade;
    private assetFacade: AssetFacade;
    private pageFacade: PageFacade;
    private observManager: ObservableManager;

    @ViewChild('settingInfo', { static: false }) settingInfo: SettingsInfo;

    public redirection: string;
    public isTop: boolean = false;
    public selected: any;
    public resListPage: any;
    public link: any;
    public linkSetting: any;
    public isPreload: boolean;
    public isMobile: boolean;
    public bindingSocialTwitter: any;

    @Input()
    public dirtyCancelEvent: EventEmitter<any>;
    @Input()
    public dirtyConfirmEvent: EventEmitter<any>;

    public apiBaseURL = environment.apiBaseURL;

    public pageId: string;
    public navLinks = [
        {
            label: "จัดการเพจ",
            keyword: "",
        },
        {
            label: "โพสต์ของเพจ",
            keyword: "",
        },
    ];
    public activeLink = this.navLinks[0].label;

    public links = [
        {
            link: "",
            icon: "edit",
            label: "ข้อมูลเพจ",
        },
        {
            link: "",
            icon: "person",
            label: "บทบาทในเพจ",
        },
        // {
        //     link: "",
        //     icon: "insert_comment",
        //     label: "โพสต์ทั้งหมด",
        // },
        // {
        //     link: "",
        //     icon: "speaker_notes",
        //     label: "โพสต์ฉบับร่าง",
        // },
        // {
        //     link: "",
        //     icon: "access_time",
        //     label: "โพสต์ตั้งเวลา",
        // },
        // {
        //     link: "",
        //     icon: "favorite",
        //     label: "เติมเต็ม",
        // }
    ];
    public arrayLink = {
        links: [{
            link: "",
            keyword: "account",
            icon: "edit",
            label: "ข้อมูลเพจ",
        },
        {
            link: "",
            keyword: "roles",
            icon: "person",
            label: "บทบาทในเพจ",
        },
        {
            link: "",
            keyword: "connect",
            icon: "security",
            label: "การเชื่อมต่อ",
        }],

        linksPost: [{
            link: "",
            icon: "insert_comment",
            label: "โพสต์ทั้งหมด",
        },
        {
            link: "",
            icon: "speaker_notes",
            label: "โพสต์ฉบับร่าง",
        },
        {
            link: "",
            icon: "access_time",
            label: "โพสต์ตั้งเวลา",
        }]

    }

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router, routeActivated: ActivatedRoute,
        userAccessFacade: UserAccessFacade, assetFacade: AssetFacade, pageFacade: PageFacade, observManager: ObservableManager) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog;
        this.routeActivated = routeActivated;
        this.userAccessFacade = userAccessFacade;
        this.observManager = observManager;
        this.assetFacade = assetFacade;
        this.pageFacade = pageFacade;
        this.isPreload = true;
        this.isMobile = false;
        this.selected = this.links[0].label;
        this.dirtyCancelEvent = new EventEmitter();
        this.dirtyCancelEvent.subscribe(() => {
        });

        this.dirtyConfirmEvent = new EventEmitter();
        this.dirtyConfirmEvent.subscribe((res) => {
            if (this.isTop) {
                this.activeLink = this.linkSetting.label;
                if (this.activeLink === 'จัดการเพจ') {
                    this.selected = 'ข้อมูลเพจ';
                } else if (this.activeLink === 'โพสต์ของเพจ') {
                    this.selected = 'โพสต์ทั้งหมด';
                }
            } else {
                this.selected = this.link.label;
            }
        });

        this.routeActivated.params.subscribe(async (params) => {
            this.pageId = params['id'];
            if (this.pageId !== undefined && this.pageId !== '') {
                this.getAccessPage();
            }
        });

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                const url: string = decodeURI(this.router.url);
                if (url.indexOf(URL_PATH) >= 0) {
                    const substringPath: string = url.substring(url.indexOf(URL_PATH), url.length);
                    let substringPage = substringPath.replace(URL_PATH, '');
                    const replaceCommentURL: string = substringPage.replace('/page/', '');
                    const splitTextId = replaceCommentURL.split('?tab=')[1];
                    if (splitTextId === 'connect') {
                        this.selected = 'การเชื่อมต่อ';
                    } else if (splitTextId === 'account') {
                        this.selected = 'ข้อมูลเพจ';
                    } else if (splitTextId === 'roles') {
                        this.selected = 'บทบาทในเพจ';
                    }
                    this.getAccessPage();
                }
            }
        });
    }

    ngOnInit(): void {
        if (!this.isLogin()) {
            this.router.navigateByUrl("/home");
        } else {
            this.getAccessPage();
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

    public selectedSetting(link: any) {
        this.showAlertDevelopDialog();
        // this.linkSetting = link;
        // const isDirty: boolean = this.settingInfo && this.settingInfo.checkIsDirty();
        // if (!isDirty) {
        //     this.activeLink = this.linkSetting.label;
        //     if (this.activeLink === 'จัดการเพจ') {
        //         this.selected = 'ข้อมูลเพจ';
        //     } else if (this.activeLink === 'โพสต์ของเพจ') {
        //         this.selected = 'โพสต์ทั้งหมด';
        //     }
        // } else {
        //     this.isTop = true;
        // }
    }

    public selecedInformation(link: any) {
        this.link = link;
        this.isMobile = true;
        const isDirty: boolean = this.settingInfo.checkIsDirty();
        if (!isDirty) {
            this.router.navigateByUrl('page/' + this.pageId + '/settings?tab=' + link.keyword);
            this.selected = this.link.label;
        }
    }

    public getAccessPage() {
        this.pageFacade.getProfilePage(this.pageId).then((res) => {
            if (res.data) {
                if (res.data && res.data.imageURL !== '' && res.data.imageURL !== null && res.data.imageURL !== undefined) {
                    this.assetFacade.getPathFile(res.data.imageURL).then((image: any) => {
                        if (image.status === 1) {
                            if (!this.validBase64Image(image.data)) {
                                res.data.imageURL = null
                            } else {
                                res.data.imageURL = image.data
                            }
                            this.resListPage = res.data;
                            setTimeout(() => {
                                this.isPreload = false;
                            }, 1000);
                        }

                    }).catch((err: any) => {
                        if (err.error.message === "Unable got Asset") {
                            res.data.imageURL = ''
                            this.resListPage = res.data
                        }
                    });
                } else {
                    this.resListPage = res.data;
                    setTimeout(() => {
                        this.isPreload = false;
                    }, 3000);
                }

            }
        }).catch((err: any) => {
            // if (err.error.status === 0) {
            //   if (err.error.message === 'Unable got Page') {
            //     this.msgPageNotFound = true;
            //   }
            //   // else if(err.error.message === 'Unable got Asset'){
            //   //   console.log("1111")
            //   // }
            //   this.stopLoading(); 
        });
    }

    private validBase64Image(base64Image: string): boolean {
        const regex = /^data:image\/(?:gif|png|jpeg)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;
        return base64Image && regex.test(base64Image) ? true : false;
    }

    public backSetting() {
        this.isMobile = false;
        
    }
}
