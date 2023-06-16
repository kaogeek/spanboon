/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AboutPageFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, UserAccessFacade } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { AboutPages } from '../../../../models/AboutPages';
import { Subject } from "rxjs/internal/Subject";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DialogAlert, DialogDropdown } from "src/app/components/shares/dialog/dialog";
import { PROVINCE_LIST } from "../../../../constants/Province";

const PAGE_NAME: string = 'account';
const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0;

declare var $: any;
@Component({
    selector: 'about-page',
    templateUrl: './AboutPage.component.html',
})
export class AboutPage extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;
    private destroy = new Subject<void>();
    @ViewChild('pageUsername', { static: false }) pageUsername: ElementRef;

    @Input()
    public dirtyConfirmEvent: EventEmitter<any>;
    @Input()
    public dirtyCancelEvent: EventEmitter<any>;
    @Input()
    public dataPage: any;
    @Output()
    public dataUpdatePage: EventEmitter<any> = new EventEmitter();

    private userAccessFacade: UserAccessFacade;
    private assetFacade: AssetFacade;
    protected observManager: ObservableManager;
    private routeActivated: ActivatedRoute;
    private pageFacade: PageFacade;
    private aboutPageFacade: AboutPageFacade;

    public groupAbout!: FormGroup;
    public provinces;
    public groups: any = [];
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
    public isCard13: boolean = false;
    public isActiveButton1: boolean = false;
    public isActiveButton2: boolean = false;
    public isActiveButton3: boolean = false;
    public isActiveButton4: boolean = false;
    public isActiveButton5: boolean = false;
    public isActiveButton8: boolean = false;
    public isActiveButton9: boolean = false;
    public isActiveButton10: boolean = false;
    public isActiveButton11: boolean = false;
    public isActiveButton12: boolean = false;
    public isActiveButton13: boolean = false;
    public isActiveButtonEmail: boolean = false;
    public isActiveButtonWeb: boolean = false;

    public selectedProvince: string;
    public selectedGroup: string;

    public isTimeSet: boolean = true;

    public pageId: string;
    public phone: any;
    public resAboutPage: any;
    // public cloneData: any;
    public arrAboutPage: any[] = [];
    public cloneAboutPage: any;
    public dataAboutPage: any;
    public longtitudeAboutPage: any;
    public latitudeAboutPage: any;
    public uuid: boolean;
    public indexCard: number;

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
        observManager: ObservableManager, routeActivated: ActivatedRoute, pageFacade: PageFacade, aboutPageFacade: AboutPageFacade, private formBuilder: FormBuilder) {
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

        this.observManager.createSubject('page.about');
    }

    public ngOnInit(): void {
        this.crateValueAbout();
        this.getProvince();
        this.getGroupList();
        if (!!this.dataPage.group) {
            this.selectedGroup = this.dataPage.group
        }

        if (!!this.dataPage.province) {
            this.selectedProvince = this.dataPage.province
        }
    }

    public async ngOnChanges(changes: SimpleChanges): Promise<void> {
        await this.getDataPage();
    }

    public ngAfterViewInit(): void {
        const groupAbout = this.groupAbout;
        fromEvent(this.pageUsername && this.pageUsername.nativeElement, 'keyup').pipe(
            debounceTime(500)
            , distinctUntilChanged()
        ).subscribe((text: any) => {
            this.checkUniquePageUsername(groupAbout!.get('pageUsername')!.value);
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.destroy.next();
        this.destroy.complete();
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

    public getGroupList() {
        // this.aboutPageFacade.getGroups().then((res) => {
        //     if (res) {
        //         this.groups = res.data;
        //         this.checkGroup();
        //         this.checkProvince();
        //     }
        // })
    }

    public getProvince() {
        this.pageFacade.getProvince().then((res) => {
            if (res) {
                this.provinces = res;
            }
        })
    }

    public checkGroup() {
        if (!this.dataPage.group) {
            let dialog = this.dialog.open(DialogDropdown, {
                disableClose: true,
                data: {
                    text: 'กรุณาเลือกกลุ่ม',
                    group: this.groups,
                    pageId: this.pageId,
                    bottomColorText2: "black"
                }
            });
        }
    }

    public checkProvince() {
        if (!this.dataPage.province) {
            let dialog = this.dialog.open(DialogDropdown, {
                disableClose: true,
                data: {
                    text: 'กรุณาเลือกจังหวัด',
                    pageId: this.pageId,
                    bottomColorText2: "black"
                }
            });
        }
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
        } else if (items === '13') {
            this.isCard13 = true;
        }
    }

    public clickClose($event: Event, items: any, data: any) {
        $event.stopPropagation();
        if (items === '1') {
            this.isCard1 = false;
            this.isActiveButton1 = false;
            document.getElementById('name')!.style.removeProperty("border");
            this.resetValue(data, 1);
        } else if (items === '2') {
            this.isCard2 = false;
            this.isActiveButton2 = false;
            document.getElementById('pageUsername')!.style.removeProperty("border");
            this.resetValue(data, 2);
        } else if (items === '3') {
            this.isCard3 = false;
            this.isActiveButton3 = false;
            document.getElementById('value')!.style.removeProperty("border");
            this.resetValue(data, 3);
        } else if (items === '4') {
            this.isCard4 = false;
            this.isActiveButton4 = false;
            document.getElementById('backgroundStory')!.style.removeProperty("border");
            this.resetValue(data, 4);
        } else if (items === '5') {
            this.isCard5 = false;
            this.isActiveButton5 = false;
            document.getElementById('phone')!.style.removeProperty("border");
            this.resetValue(data, 5);
        } else if (items === '6') {
            this.isCard6 = false;
            this.isActiveButtonWeb = false;
            document.getElementById('websiteURL')!.style.removeProperty("border");
            this.resetValue(data, 6);
        } else if (items === '7') {
            this.isCard7 = false;
            this.isActiveButtonEmail = false;
            document.getElementById('email')!.style.removeProperty("border");
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
            this.isActiveButton12 = false;
            this.resetValue(data, 12);
        } else if (items === '13') {
            this.isCard13 = false;
            this.isActiveButton13 = false;
            this.resetValue(data, 13);
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
            this.isActiveButton3 = false;
        } else if (index === 4) {
            this.isCard4 = false;
            this.isActiveButton4 = false;
        } else if (index === 5) {
            this.isCard5 = false;
            this.isActiveButton5 = false;
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
            this.isActiveButton12 = false;
        } else if (index === 13) {
            this.isCard13 = false;
            this.isActiveButton13 = false;
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

    public async getDataPage() {
        if (!!this.pageId) {
            this.pageId = this.dataPage.id;
            await this.searchAboutPage();
            this.setValueAbout();
        }
    }

    private crateValueAbout() {
        this.groupAbout = this.formBuilder.group({
            name: [''],
            pageUsername: [''],
            value: [''],
            backgroundStory: [''],
            mobileNo: [''],
            websiteURL: [''],
            email: [''],
            lineId: [''],
            facebookURL: [''],
            twitterURL: [''],
            address: [''],
            latitudeAboutPage: [''],
            longtitudeAboutPage: ['']
        });
    }

    private setValueAbout() {
        const groupAbout = this.groupAbout;
        groupAbout!.get('name')!.setValue(this.dataPage && this.dataPage!.name ? this.dataPage!.name : '');
        groupAbout!.get('pageUsername')!.setValue(this.dataPage && this.dataPage!.pageUsername ? this.dataPage!.pageUsername : '');
        groupAbout!.get('value')!.setValue(this.dataAboutPage && this.dataAboutPage!.value ? this.dataAboutPage!.value : '');
        groupAbout!.get('backgroundStory')!.setValue(this.dataPage && this.dataPage!.backgroundStory ? this.dataPage!.backgroundStory : '');
        groupAbout!.get('mobileNo')!.setValue(this.dataPage && this.dataPage!.mobileNo ? this.dataPage!.mobileNo : '');
        groupAbout!.get('websiteURL')!.setValue(this.dataPage && this.dataPage!.websiteURL ? this.dataPage!.websiteURL : '');
        groupAbout!.get('email')!.setValue(this.dataPage && this.dataPage!.email ? this.dataPage!.email : '');
        groupAbout!.get('lineId')!.setValue(this.dataPage && this.dataPage!.lineId ? this.dataPage!.lineId : '');
        groupAbout!.get('facebookURL')!.setValue(this.dataPage && this.dataPage!.facebookURL ? this.dataPage!.facebookURL : '');
        groupAbout!.get('twitterURL')!.setValue(this.dataPage && this.dataPage!.twitterURL ? this.dataPage!.twitterURL : '');
        groupAbout!.get('address')!.setValue(this.dataPage && this.dataPage!.address ? this.dataPage!.address : '');
        groupAbout!.get('latitudeAboutPage')!.setValue(this.latitudeAboutPage && this.latitudeAboutPage!.value ? this.latitudeAboutPage!.value : '');
        groupAbout!.get('longtitudeAboutPage')!.setValue(this.longtitudeAboutPage && this.longtitudeAboutPage!.value ? this.longtitudeAboutPage!.value : '');
    }

    public searchAboutPage() {
        let limit = SEARCH_LIMIT;
        let offset = SEARCH_OFFSET;
        this.aboutPageFacade.searchPageAbout(this.pageId, offset, limit).then((res) => {
            if (res) {
                if (res && res.length > 0) {
                    this.resAboutPage = res;
                    for (let data of this.resAboutPage) {
                        if (data.label === 'หน่วยงาน') {
                            this.dataAboutPage = data;
                            this.groupAbout!.get('value')!.setValue(this.dataAboutPage && this.dataAboutPage!.value ? this.dataAboutPage!.value : '');
                        }
                        if (data.label === 'ละติจูด') {
                            this.latitudeAboutPage = data;
                        }
                        if (data.label === 'ลองจิจูด') {
                            this.longtitudeAboutPage = data;
                        }
                    }
                    this.cloneAboutPage = JSON.parse(JSON.stringify(this.resAboutPage));
                } else {
                    this.groupAbout!.get('value')!.setValue('');
                }
            }
        }).catch((err) => {
            if (err) {
                console.log('error ', err);
                if (err.error && err.error.status === 0 && err.error.message === 'Unable got Page') {
                    this.showAlertDialog('ไม่พบเพจ');
                }
            }
        });
    }

    public checkUniquePageUsername(text: any) {
        const pageUsername = this.dataPage && this.dataPage.pageUsername;
        if (text === pageUsername) {
            this.isActiveButton2 = false;
        } else {
            // if (text.length > 0) {
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
                        document.getElementById('pageUsername').style.border = '2px solid green';
                    } else {
                        document.getElementById('pageUsername').style.border = '2px solid red';
                    }
                    document.getElementById('pageUsername').focus();
                }).catch((err) => {
                    this.uuid = false;
                    this.isActiveButton2 = false;
                    document.getElementById('pageUsername').style.border = '2px solid red';
                    document.getElementById('pageUsername').focus();
                });

            }
            // }
        }
    }

    public changeActive(text: any, index: number) {
        const groupAbout = this.groupAbout;
        if (index === 1) {
            const name = this.dataPage && this.dataPage.name;
            if (text === name || text === '') {
                this.isActiveButton1 = false;
            } else {
                this.isActiveButton1 = true;
            }
        } else if (index === 2) {
            const value = this.dataPage && this.dataPage.pageUsername;
            let pattern = text.match('^[A-Za-z0-9_]*$');
            if (pattern) {
                this.isActiveButton2 = true;
            } else {
                this.isActiveButton2 = false;
            }
        } else if (index === 3) {
            const value = this.cloneAboutPage && this.cloneAboutPage[0].value;
            if (text === value || text === '') {
                this.isActiveButton3 = false;
            } else {
                this.isActiveButton3 = true;
            }
        } else if (index === 4) {
            const backgroundStory = this.dataPage && this.dataPage.backgroundStory;
            if (text === backgroundStory) {
                this.isActiveButton4 = false;
            } else {
                this.isActiveButton4 = true;
            }
        } else if (index === 6) {
            const web = this.dataPage && this.dataPage.websiteURL;
            if (text === web) {
                this.isActiveButtonWeb = false;
            } else {
                this.isActiveButtonWeb = true;
            }
        } else if (index === 8) {
            const lineId = this.dataPage && this.dataPage.lineId;
            if (text === lineId) {
                this.isActiveButton8 = false;
            } else {
                this.isActiveButton8 = true;
            }
        } else if (index === 9) {
            const facebook = this.dataPage && this.dataPage.facebookURL;
            if (text === facebook) {
                this.isActiveButton9 = false;
            } else {
                this.isActiveButton9 = true;
            }
        } else if (index === 10) {
            const twitter = this.dataPage && this.dataPage.twitterURL;
            if (text === twitter) {
                this.isActiveButton10 = false;
            } else {
                this.isActiveButton10 = true;
            }
        } else if (index === 11) {
            const address = this.dataPage && this.dataPage.address;
            if (text === address) {
                this.isActiveButton11 = false;
            } else {
                this.isActiveButton11 = true;
            }
        } else if (index === 12) {
            if (!!this.selectedProvince) {
                this.isActiveButton12 = true;
            }
        } else if (index === 13) {
            if (!!this.selectedGroup) {
                this.isActiveButton13 = true;
            }
        }
    }

    public checkFormatNumber(phone: any) {
        const clonePhone = this.dataPage && this.dataPage.phone;
        if (phone === clonePhone) {
            this.isActiveButton5 = false;
        } else {
            if (phone.length > 0) {
                this.isActiveButton5 = true;
                let pattern = phone.match('^[0-9]{9}$|^[0-9]{10}$');

                if (!pattern) {
                    return document.getElementById('phone').style.border = '2px solid red';
                } else {
                    this.phone = phone;
                    return document.getElementById('phone').style.border = '2px solid green';
                }
            }
        }
    }

    public checkPatternEmail(email: any) {
        if (email.length > 0) {
            this.isActiveButtonEmail = true;
            let pattern = email.match('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}');
            if (!pattern) {
                return document.getElementById('email').style.border = '2px solid red';
            } else {
                return document.getElementById('email').style.border = '2px solid green';
            }
        }
    }

    public editInfoPage(index: number) {
        const groupAbout = this.groupAbout;
        let body;
        if (index === 1) {
            body = {
                name: groupAbout!.get('name')!.value
            }
        } else if (index === 2) {
            body = {
                pageUsername: groupAbout!.get('pageUsername')!.value
            }
        } else if (index === 4) {
            body = {
                backgroundStory: groupAbout!.get('backgroundStory')!.value
            }
        } else if (index === 5) {
            body = {
                mobileNo: groupAbout!.get('mobileNo')!.value
            }
        } else if (index === 6 && !!groupAbout!.get('websiteURL')!.value) {
            body = {
                websiteURL: groupAbout!.get('websiteURL')!.value
            }
        } else if (index === 7 && !!groupAbout!.get('email')!.value) {
            body = {
                email: groupAbout!.get('email')!.value
            }
        } else if (index === 8 && !!groupAbout!.get('lineId')!.value) {
            body = {
                lineId: groupAbout!.get('lineId')!.value
            }
        } else if (index === 9 && !!groupAbout!.get('facebookURL')!.value) {
            body = {
                facebookURL: groupAbout!.get('facebookURL')!.value
            }
        } else if (index === 10 && !!groupAbout!.get('twitterURL')!.value) {
            body = {
                twitterURL: groupAbout!.get('twitterURL')!.value
            }
        } else if (index === 12) {
            body = {
                province: this.selectedProvince
            }
        } else if (index === 13) {
            body = {
                group: this.selectedGroup
            }
        }

        this.pageFacade.updateProfilePage(this.pageId, body).then((res) => {
            if (res.data) {
                this.observManager.publish('page.about', res);
                this.dataPage = res.data;
                this.dataUpdatePage.emit(this.dataPage);
                if (this.dataPage.pageUsername === "") {
                    this.router.navigateByUrl('/page/' + this.pageId + '/settings');
                } else {
                    this.router.navigateByUrl('/page/' + this.dataPage.pageUsername + '/settings');
                }
                this.closeCard(index);
            }
        }).catch((err) => {
            console.log('error ', err)
        });
    }

    public optionClicked(event) {
        event.stopPropagation();
        this.showOptions(event);
    }

    public showOptions(event) {
        if (event.checked) {
            this.isCard11 = true;
        } else {
            this.isCard11 = false;
        }
    }

    public resetValue(data: any, index?: number) {
        const groupAbout = this.groupAbout;
        if (index === 1) {
            if (this.dataPage && this.dataPage.name === undefined) {
                groupAbout!.get('name')!.reset();
            } else {
                groupAbout!.get('name')!.setValue(this.dataPage.name);
            }
        } else if (index === 2) {
            if (this.dataPage && this.dataPage.pageUsername === undefined) {
                groupAbout!.get('pageUsername')!.reset();
            } else {
                groupAbout!.get('pageUsername')!.setValue(this.dataPage.pageUsername);
            }
        } else if (index === 3) {
            if (this.dataAboutPage && this.dataAboutPage.value === undefined) {
                groupAbout!.get('value')!.reset();
            } else {
                groupAbout!.get('value')!.setValue(this.dataAboutPage.value);
            }
        } else if (index === 4) {
            if (this.dataPage && this.dataPage.backgroundStory === undefined) {
                groupAbout!.get('backgroundStory')!.reset();
            } else {
                groupAbout!.get('backgroundStory')!.setValue(this.dataPage.backgroundStory);
            }
        } else if (index === 5) {
            if (this.dataPage && this.dataPage.mobileNo === undefined) {
                groupAbout!.get('mobileNo')!.reset();
            } else {
                groupAbout!.get('mobileNo')!.setValue(this.dataPage.mobileNo);
            }
        } else if (index === 6) {
            if (this.dataPage && this.dataPage.websiteURL === undefined) {
                groupAbout!.get('websiteURL')!.reset();
            } else {
                groupAbout!.get('websiteURL')!.setValue(this.dataPage.websiteURL);
            }
        } else if (index === 7) {
            if (this.dataPage && this.dataPage.email === undefined) {
                groupAbout!.get('email')!.reset();
            } else {
                groupAbout!.get('email')!.setValue(this.dataPage.email);
            }
        } else if (index === 8) {
            if (this.dataPage && this.dataPage.lineId === undefined) {
                groupAbout!.get('lineId')!.reset();
            } else {
                groupAbout!.get('lineId')!.setValue(this.dataPage.lineId);
            }
        } else if (index === 9) {
            if (this.dataPage && this.dataPage.facebookURL === undefined) {
                groupAbout!.get('facebookURL')!.reset();
            } else {
                groupAbout!.get('facebookURL')!.setValue(this.dataPage.facebookURL);
            }
        } else if (index === 10) {
            //twitter
            if (this.dataPage && this.dataPage.twitterURL === undefined) {
                groupAbout!.get('twitterURL')!.reset();
            } else {
                groupAbout!.get('twitterURL')!.setValue(this.dataPage.twitterURL);
            }
        } else if (index === 11) {
            if (this.dataPage && this.dataPage.address === undefined) {
                groupAbout!.get('address')!.reset();
            } else {
                groupAbout!.get('address')!.setValue(this.dataPage.address);
            }

            if (this.latitudeAboutPage && this.latitudeAboutPage!.value === undefined) {
                groupAbout!.get('latitudeAboutPage')!.reset();
            } else {
                groupAbout!.get('latitudeAboutPage')!.setValue(this.latitudeAboutPage!.value);
            }

            if (this.latitudeAboutPage && this.longtitudeAboutPage!.value === undefined) {
                groupAbout!.get('longtitudeAboutPage')!.reset();
            } else {
                groupAbout!.get('longtitudeAboutPage')!.setValue(this.longtitudeAboutPage!.value);
            }
        }
    }

    public selectType($event, index: number) {
        if (index === 12) {
            this.selectedProvince = $event.value;
            this.changeActive('province', index);
        } else if (index === 13) {
            this.selectedGroup = $event.value;
            this.changeActive('group', index);
        }
    }

    public aboutPage(text: string, index: any) {
        const groupAbout = this.groupAbout;
        let pattern1, pattern2;

        if (!!groupAbout!.get('latitudeAboutPage').value && !!groupAbout!.get('longtitudeAboutPage').value) {
            this.isActiveButton11 = true;
        } else {
            this.isActiveButton11 = false;
        }
        this.indexCard = index;
        if (index === '12') {
            pattern1 = text.match(/((\d+)+(\.\d+))$/);
            if (!pattern1) {
                return document.getElementById('latitudeAboutPage').style.border = '2px solid red';
            } else {
                return document.getElementById('latitudeAboutPage').style.border = '2px solid green';
            }
        }
        if (index === '13') {
            pattern2 = text.match(/((\d+)+(\.\d+))$/);
            if (!pattern2) {
                return document.getElementById('longtitudeAboutPage').style.border = '2px solid red';
            } else {
                return document.getElementById('longtitudeAboutPage').style.border = '2px solid green';
            }
        }

        // if (index === '3') {
        //     if (text !== '') {
        //         aboutPage.label = 'หน่วยงาน';
        //         aboutPage.value = text;
        //         aboutPage.ordering = 1;
        //     }
        // } else if (index === '12') {
        //     if (text !== '') {
        //         aboutPage1.label = 'ละติจูด';
        //         aboutPage1.value = text;
        //         aboutPage1.ordering = 1;
        //     }
        //     this.arrAboutPage.push(aboutPage1);
        // }
        // if (index === '13') {
        //     if (text !== '') {
        //         aboutPage.label = 'ลองจิจูด';
        //         aboutPage.value = text;
        //         aboutPage.ordering = 2;
        //     }
        //     this.arrAboutPage.push(aboutPage);
        // }  
        // this.arrAboutPage.push(aboutPage);
    }

    public createAboutPage(name?: string, data?: any, index?: string) {
        const groupAbout = this.groupAbout;
        const aboutPage = new AboutPages();
        if (name === 'organzier') {
            let arr: any = [];
            aboutPage.id = this.dataAboutPage ? this.dataAboutPage.id : '';
            aboutPage.label = 'หน่วยงาน';
            aboutPage.value = data;
            aboutPage.ordering = this.dataAboutPage ? this.dataAboutPage.ordering : 1;
            arr.push(aboutPage);

            if (!!this.dataAboutPage) {
                this.aboutPageFacade.edit(this.pageId, arr).then((res: any) => {
                    if (res) {
                        let indexValue = Number(index);
                        this.closeCard(indexValue);
                    }
                }).catch((err: any) => {
                    console.log('err ', err)
                })
            } else {
                this.aboutPageFacade.create(this.pageId, arr).then((res: any) => {
                    if (res) {
                        let indexValue = Number(index);
                        this.closeCard(indexValue);
                    }
                }).catch((err: any) => {
                    console.log('err ', err)
                })
            }
        } else {
            let body;
            if (!!groupAbout.get('address')!.value) {
                body = {
                    address: groupAbout.get('address')!.value
                }
                this.pageFacade.updateProfilePage(this.pageId, body).then((res) => {
                    if (res.data) {
                        this.dataPage = res.data;
                        this.dataUpdatePage.emit(this.dataPage);
                        this.router.navigateByUrl('/page/' + this.dataPage.pageUsername + '/settings');
                        this.closeCard(11);
                    }
                }).catch((err) => {
                    console.log('error ', err)
                });
            }

            if (!!groupAbout.get('latitudeAboutPage')!.value) {
                aboutPage.label = 'ละติจูด';
                aboutPage.value = groupAbout.get('latitudeAboutPage')!.value;
                aboutPage.ordering = 1;
                this.arrAboutPage.push(aboutPage);
            }

            if (!!groupAbout.get('longtitudeAboutPage')!.value) {
                aboutPage.label = 'ลองจิจูด';
                aboutPage.value = groupAbout.get('longtitudeAboutPage')!.value;
                aboutPage.ordering = 2;
                this.arrAboutPage.push(aboutPage);
            }

            if (this.arrAboutPage.length > 0) {
                this.aboutPageFacade.create(this.pageId, this.arrAboutPage).then((res: any) => {
                    if (res) {
                        let indexValue = Number(this.indexCard);
                        this.closeCard(indexValue);
                    }
                }).catch((err: any) => {
                    console.log('err ', err)
                })
            }
        }
    }

    public getDirtyConfirmEvent(): EventEmitter<any> {
        return this.dirtyConfirmEvent;
    }

    public deletePage() {
        let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
                text: 'ยืนยันการลบเพจ',
                bottomColorText2: "black"
            }
        });
        dialog.afterClosed().subscribe((res) => {
            if (res) {
                this.pageFacade.deletePage(this.pageId).then((res) => {
                    if (res) {
                        this.observManager.publish('page.about', this.pageId);
                        this.router.navigateByUrl("/home");
                    }
                }).catch((err) => {
                    if (err) {
                    }
                });
            }
        });
    }
}
