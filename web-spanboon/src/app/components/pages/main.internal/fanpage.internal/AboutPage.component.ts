/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import { AboutPageFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, UserAccessFacade } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { AboutPages } from '../../../../models/AboutPages'; 

const PAGE_NAME: string = 'about-page';
const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0; 

declare var $: any;
@Component({
    selector: 'about-page',
    templateUrl: './AboutPage.component.html',
})
export class AboutPage extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public dirtyConfirmEvent: EventEmitter<any>;
    @Input()
    public dirtyCancelEvent: EventEmitter<any>;

    private userAccessFacade: UserAccessFacade;
    private assetFacade: AssetFacade;
    protected observManager: ObservableManager;
    private routeActivated: ActivatedRoute;
    private pageFacade: PageFacade;
    private aboutPageFacade: AboutPageFacade;
   
    public isCard1: boolean = false;
    public isCard2: boolean = false;
    public isCard3: boolean = false;
    public isCard4: boolean = false;
    public isCard5: boolean = false;
    public isCard6: boolean = false;
    public isCard7: boolean = false;
    public isCard8: boolean = false;
    public isCard9: boolean = false;
    public isCard10: boolean = false;
    public isCard11: boolean = false;
    public isCard12: boolean = false;
    public isActiveButton1: boolean = false;
    public isActiveButton2: boolean = false;
    public isActiveButton3: boolean = false;
    public isActiveButton4: boolean = false;
    public isActiveButton5: boolean = false;
    public isActiveButton8: boolean = false;
    public isActiveButton9: boolean = false;
    public isActiveButton10: boolean = false;
    public isActiveButton11: boolean = false;
    public isActiveButtonEmail: boolean = false;
    public isActiveButtonWeb: boolean = false;

    public isTimeSet: boolean = true;

    @ViewChild('website', { static: false }) website: ElementRef;
    @ViewChild('email', { static: false }) email: ElementRef;
    @ViewChild('facebookURL', { static: false }) facebook: ElementRef;
    @ViewChild('twitter', { static: false }) twitter: ElementRef;
    @ViewChild('lineId', { static: false }) lineId: ElementRef;
    @ViewChild('background', { static: false }) background: ElementRef;

    public pageId: string;
    public phone: any;
    public resDataPage: any;
    public resAboutPage: any;
    public cloneData: any;
    public cloneAboutPage: any;
    public uuid: boolean;

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
        {
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
        },
        // {
        //     link: "",
        //     icon: "favorite",
        //     label: "เติมเต็ม",
        // }
    ];

    public opens = [
        {
            label: "เปิดทำการเฉพาะช่วงเวลา",
            value: "1",
            checked: true,
            click: "time",
        },
        {
            label: "เปิดทำการตลอดเวลา",
            value: "2",
            checked: false,
            click: "none",
        },
        {
            label: "ไม่มีเวลาทำการ",
            value: "3",
            checked: false,
            click: "none",
        },
        {
            label: "ปิดทำการถาวร",
            value: "4",
            checked: false,
            click: "none",
        },
    ];

    public dates = [
        {
            label: "วันจันทร์",
            isDateShow: false,
        },
        {
            label: "วันอังคาร",
            isDateShow: false,
        },
        {
            label: "วันพุธ",
            isDateShow: false,
        },
        {
            label: "วันพฤหัสบดี",
            isDateShow: false,
        },
        {
            label: "วันศุกร์",
            isDateShow: false,
        },
        {
            label: "วันเสาร์",
            isDateShow: false,
        },
        {
            label: "วันอาทิตย์",
            isDateShow: false,
        },
    ];

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router, userAccessFacade: UserAccessFacade, assetFacade: AssetFacade,
        observManager: ObservableManager, routeActivated: ActivatedRoute, pageFacade: PageFacade, aboutPageFacade: AboutPageFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog
        this.userAccessFacade = userAccessFacade;
        this.assetFacade = assetFacade
        this.observManager = observManager;
        this.routeActivated = routeActivated;
        this.pageFacade = pageFacade;
        this.aboutPageFacade = aboutPageFacade;
        this.dirtyConfirmEvent = new EventEmitter();
        this.dirtyCancelEvent = new EventEmitter();

        this.routeActivated.params.subscribe(async (params) => {
            this.pageId = params['id'];
        });
 
    }

    public ngOnInit(): void {
        this.getDataPage();
        this.searchAboutPage(); 
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public isPageDirty(): boolean {
        if (this.isActiveButton1 || this.isActiveButton2 || this.isActiveButton3 || this.isActiveButton4 || this.isActiveButton5 || this.isActiveButton8 || this.isActiveButton9 || this.isActiveButton10 || this.isActiveButton11 || this.isActiveButtonEmail || this.isActiveButtonWeb) {
            return true; 
        }
        return false;
    }

    public onDirtyDialogConfirmBtnClick(): EventEmitter<any> { 
        return this.dirtyConfirmEvent;
    }

    public onDirtyDialogCancelButtonClick(): EventEmitter<any> { 
        return this.dirtyCancelEvent;
    }

    public clickCard(items: any) {
        if (items === '1') {
            this.isCard1 = true;
        } else if (items === '2') {
            this.isCard2 = true;
        } else if (items === '3') {
            this.isCard3 = true;
        } else if (items === '4') {
            this.isCard4 = true;
        } else if (items === '5') {
            this.isCard5 = true;
        } else if (items === '6') {
            this.isCard6 = true;
        } else if (items === '7') {
            this.isCard7 = true;
        } else if (items === '8') {
            this.isCard8 = true;
        } else if (items === '9') {
            this.isCard9 = true;
        } else if (items === '10') {
            this.isCard10 = true;
        } else if (items === '11') {
            this.isCard11 = true;
        } else if (items === '12') {
            this.isCard12 = true;
        }
    }

    public clickClose($event: Event, items: any, data: any) {
        $event.stopPropagation();
        if (items === '1') {
            this.isCard1 = false;
            this.isActiveButton1 = false;
            this.resetValue(data, 1);
        } else if (items === '2') {
            this.isCard2 = false;
            this.isActiveButton2 = false;
            document.getElementById('pageUsername').style.removeProperty("border");
            this.resetValue(data);
        } else if (items === '3') {
            this.isCard3 = false;
            this.isActiveButton4 = false;
            this.resetValue(data, 3);
        } else if (items === '4') {
            this.isCard4 = false;
            this.isActiveButton5 = false;
            this.resetValue(data, 4);
        } else if (items === '5') {
            this.isCard5 = false;
            this.isActiveButton3 = false;
            this.resetValue(data, 5);
        } else if (items === '6') {
            this.isCard6 = false;
            this.isActiveButtonWeb = false;
            this.resetValue(data, 6);
        } else if (items === '7') {
            this.isCard7 = false;
            this.isActiveButtonEmail = false;
            this.resetValue(data, 7);
        } else if (items === '8') {
            this.isCard8 = false;
            this.isActiveButton8 = false;
            this.resetValue(data, 8);
        } else if (items === '9') {
            this.isCard9 = false;
            this.isActiveButton9 = false;
            this.resetValue(data, 9);
        } else if (items === '10') {
            this.isCard10 = false;
            this.isActiveButton10 = false;
            this.resetValue(data, 10);
        } else if (items === '11') {
            this.isCard11 = false;
            this.isActiveButton11 = false;
            this.resetValue(data, 11);
        } else if (items === '12') {
            this.isCard12 = false;
            this.resetValue(data, 12);
        }
    }

    public closeCard(index: number) {
        if (index === 1) {
            this.isCard1 = false;
            this.isActiveButton1 = false;
        } else if (index === 2) {
            this.isCard2 = false;
            this.isActiveButton2 = false;
        } else if (index === 3) {
            this.isCard3 = false;
            this.isActiveButton4 = false;
        } else if (index === 4) {
            this.isCard4 = false;
            this.isActiveButton5 = false;
        } else if (index === 5) {
            this.isCard5 = false;
            this.isActiveButton3 = false;
        } else if (index === 6) {
            this.isCard6 = false;
            this.isActiveButtonWeb = false;
        } else if (index === 7) {
            this.isCard7 = false;
            this.isActiveButtonEmail = false;
        } else if (index === 8) {
            this.isCard8 = false;
            this.isActiveButton8 = false;
        } else if (index === 9) {
            this.isCard9 = false;
            this.isActiveButton9 = false;
        } else if (index === 10) {
            this.isCard10 = false;
            this.isActiveButton10 = false;
        } else if (index === 11) {
            this.isCard11 = false;
            this.isActiveButton11 = false;
        } else if (index === 12) {
            this.isCard12 = false;
        }
    }

    public clickTimeSone(set: any) {
        if (set === 'time') {
            this.isTimeSet = true;
        } else {
            this.isTimeSet = false;
        }
    }

    public clickAddTime(event: Event, i) {
        if (this.dates[i] != undefined || this.dates[i] != null) {
            this.dates[i].isDateShow = true;
        }
    }

    public getDataPage() {
        this.pageFacade.getProfilePage(this.pageId).then((res) => {
            this.resDataPage = res.data
            this.cloneData = JSON.parse(JSON.stringify(this.resDataPage));
        }).catch((err) => {
            console.log('error ', err)
        });
    }

    public searchAboutPage() {
        let limit = SEARCH_LIMIT;
        let offset = SEARCH_OFFSET;
        this.aboutPageFacade.searchPageAbout(this.pageId, offset, limit).then((res) => {
            if (res && res.length > 0) {
                this.resAboutPage = res;
                this.cloneAboutPage = JSON.parse(JSON.stringify(this.resAboutPage));
            }
        }).catch((err) => {
            console.log('error ', err)
        });
    }

    public checkUniquePageUsername(text: any) {
        if (text === '') {
            this.isActiveButton2 = false;
            return;
        }
        const pageUsername = this.cloneData && this.cloneData.pageUsername;
        if (text === pageUsername) {
            this.isActiveButton2 = false;
        } else {
            if (text.length > 0) {
                this.isActiveButton2 = true;
                let pattern = text.match('^[A-Za-z0-9_.]*$');
                if (!pattern) {
                    this.uuid = false;
                    document.getElementById('pageUsername').style.border = '2px solid red';
                    document.getElementById('pageUsername').focus();
                } else {
                    let body = {
                        pageUsername: text
                    }
                    this.uuid = true;
                    document.getElementById('pageUsername').style.border = '2px solid green';
                    this.pageFacade.checkUniqueId(this.pageId, body).then((res) => {
                        if (res && res.data) {
                            this.uuid = res.data;
                            document.getElementById('pageUsername').style.border = '2px solid green';
                        } else {
                            this.uuid = res.error;
                            document.getElementById('pageUsername').style.border = '2px solid red';
                        }
                        document.getElementById('pageUsername').focus();
                    }).catch((err) => {
                        this.uuid = false;
                        document.getElementById('pageUsername').style.border = '2px solid red';
                        document.getElementById('pageUsername').focus();
                    });

                }
            }
        }
    }

    public changeActive(text: any, index: number) {
        if (index === 1) {
            const name = this.cloneData && this.cloneData.name;
            if (text === name || text === '') {
                this.isActiveButton1 = false;
            } else {
                this.isActiveButton1 = true; 
            }
        } else if (index === 3) {
            const value = this.cloneAboutPage && this.cloneAboutPage[0].value;
            if (text === value || text === '') {
                this.isActiveButton4 = false;
            } else {
                this.isActiveButton4 = true;
            }
        } else if (index === 4) {
            const backgroundStory = this.cloneData && this.cloneData.backgroundStory;
            if (text === backgroundStory || text === '') {
                this.isActiveButton5 = false;
            } else {
                this.isActiveButton5 = true;
            }
        } else if (index === 6) {
            const web = this.cloneData && this.cloneData.websiteURL;
            if (text === web || text === '') {
                this.isActiveButtonWeb = false;
            } else {
                this.isActiveButtonWeb = true;
            }
        } else if (index === 8) {
            const lineId = this.cloneData && this.cloneData.lineId;
            if (text === lineId || text === '') {
                this.isActiveButton8 = false;
            } else {
                this.isActiveButton8 = true;
            }
        } else if (index === 9) {
            const facebook = this.cloneData && this.cloneData.facebookURL;
            if (text === facebook || text === '') {
                this.isActiveButton9 = false;
            } else {
                this.isActiveButton9 = true;
            }
        } else if (index === 10) {
            const twitter = this.cloneData && this.cloneData.twitterURL;
            if (text === twitter || text === '') {
                this.isActiveButton10 = false;
            } else {
                this.isActiveButton10 = true;
            }
        } else if (index === 11) {
            const address = this.cloneData && this.cloneData.address;
            if (text === address || text === '') {
                this.isActiveButton11 = false;
            } else {
                this.isActiveButton11 = true;
            }
        }
    }

    public checkFormatNumber(phone: any) {
        if (phone === '') {
            this.isActiveButton3 = false;
            return;
        }
        const clonePhone = this.cloneData && this.cloneData.phone;
        if (phone === clonePhone) {
            this.isActiveButton3 = false;
        } else {
            if (phone.length > 0) {
                this.isActiveButton3 = true;
                let pattern = phone.match('^[0-9]{9}$|^[0-9]{10}$');
                if (!pattern) {
                    document.getElementById('phone').style.border = '2px solid red';

                } else {
                    document.getElementById('phone').style.border = '2px solid green';
                    this.editInfoPage(5);
                }
            }
        }
    }

    public checkPatternEmail(mail: any) {
        if (mail === '') {
            this.isActiveButtonEmail = false;
            document.getElementById('email').style.border = 'unset';
            return;
        }
        if (mail.length > 0) {
            this.isActiveButtonEmail = true;
            let pattern = mail.match('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}');
            if (!pattern) {
                return document.getElementById('email').style.border = '2px solid red';
            } else {
                return document.getElementById('email').style.border = '2px solid green';
            }
        }
    }

    public editInfoPage(index: number) {
        let body;
        if (index === 1) {
            body = {
                name: this.resDataPage.name
            }
        } else if (index === 2) {
            body = {
                pageUsername: this.resDataPage.pageUsername
            }
        } else if (index === 4) {
            body = {
                backgroundStory: this.background.nativeElement.value
            }
        } else if (index === 5) {
            body = {
                mobileNo: this.phone
            }
        } else if (index === 6 && this.website.nativeElement.value !== '' && this.website.nativeElement.value !== undefined && this.website.nativeElement.value !== null) {
            body = {
                websiteURL: this.website.nativeElement.value
            }
        } else if (index === 7 && this.email.nativeElement.value !== '' && this.email.nativeElement.value !== undefined && this.email.nativeElement.value !== null) {
            body = {
                email: this.email.nativeElement.value
            }
        } else if (index === 8 && this.lineId.nativeElement.value !== '' && this.lineId.nativeElement.value !== undefined && this.lineId.nativeElement.value !== null) {
            body = {
                lineId: this.lineId.nativeElement.value
            }
        } else if (index === 9 && this.facebook.nativeElement.value !== '' && this.facebook.nativeElement.value !== undefined && this.facebook.nativeElement.value !== null) {
            body = {
                facebookURL: this.facebook.nativeElement.value
            }
        } else if (index === 10 && this.twitter.nativeElement.value !== '' && this.twitter.nativeElement.value !== undefined && this.twitter.nativeElement.value !== null) {
            body = {
                twitterURL: this.twitter.nativeElement.value
            }
        }
        this.pageFacade.updateProfilePage(this.pageId, body).then((res) => { 
            if (res.data) {
                this.resDataPage = res.data;
                this.router.navigateByUrl('/page/' + this.resDataPage.pageUsername + '/settings;id=' + this.pageId);
                this.closeCard(index); 
            }
        }).catch((err) => {
            console.log('error ', err)
        });
    }

    public showOptions(event) {
        if (event.checked) {
            this.isCard11 = true;
        } else {
            this.isCard11 = false;
        }
    }

    public resetValue(data: any, index?: number) {
        if (index === 1) {
            if (this.cloneData && this.cloneData.name === undefined) {
                this.resDataPage.name = '';
            } else {
                this.resDataPage.name = this.cloneData.name;
            }
        } else if (index === 2) {
            if (this.cloneData && this.cloneData.pageUsername === undefined) {
                this.resDataPage.pageUsername = '';
            } else {
                this.resDataPage.pageUsername = this.cloneData.pageUsername;
            }
        } else if (index === 4) {
            if (this.cloneData && this.cloneData.backgroundStory === undefined) {
                this.resDataPage.backgroundStory = '';
            } else {
                this.resDataPage.backgroundStory = this.cloneData.backgroundStory;
            }
        } else if (index === 5) {
            if (this.cloneData.mobileNo === undefined) {
                this.resDataPage.mobileNo = '';
            } else {
                this.resDataPage.mobileNo = this.resDataPage.mobileNo;
            }
        } else if (index === 6) {
            if (this.cloneData.websiteURL === undefined) {
                this.resDataPage.websiteURL = '';
            } else {
                this.resDataPage.websiteURL = this.resDataPage.websiteURL;
            }
        } else if (index === 7) {
            if (this.cloneData.email === undefined) {
                this.resDataPage.email = '';
            } else {
                this.resDataPage.email = this.resDataPage.email;
            }
        } else if (index === 8) {
            if (this.cloneData.lineId === undefined) {
                this.resDataPage.lineId = '';
            } else {
                this.resDataPage.lineId = this.resDataPage.lineId;
            }
        } else if (index === 9) {
            if (this.cloneData.facebookURL === undefined) {
                this.resDataPage.facebookURL = '';
            } else {
                this.resDataPage.facebookURL = this.resDataPage.facebookURL;
            }
        } else if (index === 10) {
            //twitter
            if (this.cloneData.twitterURL === undefined) {
                this.resDataPage.twitterURL = '';
            } else {
                this.resDataPage.twitterURL = this.resDataPage.twitterURL;
            }
        } else if (index === 11) {
            if (this.cloneData.address === undefined) {
                this.resDataPage.address = '';
            } else {
                this.resDataPage.address = this.resDataPage.address;
            }
        }
    }

    public aboutPage(text: string, index: any) {
        const aboutPage = new AboutPages();
        let arr = [];
        if (index === '3') {
            if (text !== '') {
                aboutPage.label = 'หน่วยงาน';
                aboutPage.value = text;
                aboutPage.ordering = 1;
            }
        } else if (index === '13') {
            if (text !== '') {
                aboutPage.label = 'ละติจูด';
                aboutPage.value = text;
                aboutPage.ordering = 1;
            }
        } else if (index === '14') {
            if (text !== '') {
                aboutPage.label = 'ลองจิจูด';
                aboutPage.value = text;
                aboutPage.ordering = 2;
            }
        }
        arr.push(aboutPage);
        this.aboutPageFacade.create(this.pageId, arr).then((res: any) => {
            arr = [];  
            let indexValue = Number(index);
            this.closeCard(indexValue);
        }).catch((err: any) => {
            console.log('ere ', err)
        })
    }

    public getDirtyConfirmEvent(): EventEmitter<any> {
        return this.dirtyConfirmEvent;
    }
}
