/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { POST_TYPE, USER_LEVEL } from '../../../../TypePost';
import { AccountFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, UserAccessFacade } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { Input } from '@angular/core';

const PAGE_NAME: string = 'roles';

export interface State {
    img: string;
    name: string;
}
declare var $: any;
@Component({
    selector: 'settings-admin-roles',
    templateUrl: './SettingsAdminRoles.component.html',
})
export class SettingsAdminRoles extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public dirtyConfirmEvent: EventEmitter<any>;
    @Input()
    public dirtyCancelEvent: EventEmitter<any>;

    private userAccessFacade: UserAccessFacade;
    private assetFacade: AssetFacade;
    protected observManager: ObservableManager;
    private routeActivated: ActivatedRoute;
    private accountFacade: AccountFacade;
    private pageFacade: PageFacade;

    stateCtrl = new FormControl();
    filteredStates: Observable<State[]>;

    @Input()
    public isDirty: boolean = false;
    @Output()
    public submitDialog: EventEmitter<any> = new EventEmitter();
    @Output()
    public submitCanCelDialog: EventEmitter<any> = new EventEmitter();

    public isHow: boolean = true;
    public isEdit: boolean = false;
    public isCancel: boolean = false;
    public isLoading: boolean = false;
    public isActive: boolean = false;
    public isButtonActive: boolean = false;
    public valueSt: any = '';
    public editIndex: any;
    public editAdminIndex: any;
    public editOwnerIndex: any;
    public moderatorPostIndex: any;
    public moderatorChatIndex: any;
    public moderatorFulFillIndex: any;
    public indexTitle: any;
    public indexTitleEdit: any;
    public resListPage: any;
    public dataUser: any;
    public accessPage: any;
    public pageId: string;

    @ViewChild('formfield', { static: false }) formfield: ElementRef;
    @ViewChild('selectroles', { static: false }) selectroles: ElementRef;
    @ViewChild('search', { static: false }) search: ElementRef;

    public selectPower: any;
    public selected: string = "ผู้ดูแล";
    public selectedPostModerator: string = "ผู้จัดการโพสต์";
    public selectedChatModerator: string = "ผู้จัดการแชท";
    public selectedFulFillModerator: string = "ผู้จัดการ" + this.PLATFORM_FULFILL_TEXT;
    public selectedEdit: string;

    states: State[] = [
        {
            name: 'Arkansas',
            // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
            img: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
        },
        {
            name: 'California',
            // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
            img: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
        },
        {
            name: 'Florida',
            // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
            img: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
        },
        {
            name: 'Texas',
            // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
            img: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
        }
    ];

    public powers = [

        {
            label: "ผู้ดูแล",
            keyword: "ADMIN",
            value: 1,
            check: true,
            title: "สามารถจัดการทุกแง่มุมของเพจได้ พวกเขาจะสามารถเผยแพร่และส่งข้อความ Messenger ในนามของเพจ, ตอบกลับและลบความคิดเห็นบนเพจ, ดูว่าใครสร้างโพสต์หรือแสดงความคิดเห็น, ดูข้อมูลเชิงลึก, และกำหนดบทบาทในเพจได้",
        },
        {
            label: "ผู้จัดการ",
            keyword: "MODERATOR",
            value: 2,
            check: false,
            title: "สามารถส่งข้อความ Messenger ในฐานะของเพจ, ตอบกลับและลบความคิดเห็นบนเพจ, ดูว่าใครสร้างโพสต์หรือแสดงความคิดเห็น",
        },
        {
            label: "ผู้จัดการโพสต์",
            keyword: "POST_MODERATOR",
            value: 3,
            check: false,
            title: "ตอบกลับและลบความคิดเห็นบนเพจ, ดูว่าใครสร้างโพสต์หรือแสดงความคิดเห็น",
        },
        {
            label: "ผู้จัดการ" + this.PLATFORM_FULFILL_TEXT,
            keyword: "FULFILLMENT_MODERATOR",
            value: 4,
            check: false,
            title: "สามารถส่งข้อความ จัดการโพสต์ที่" + this.PLATFORM_FULFILL_TEXT + "ได้",
        },
        {
            label: "ผู้จัดการแชท",
            keyword: "CHAT_MODERATOR",
            value: 5,
            check: false,
            title: "สามารถส่งข้อความ Messenger ในฐานะของเพจ ",
        },
        {
            label: "เจ้าของเพจ",
            keyword: "OWNER",
            value: 6,
            check: false,
            title: "สามารถเผยแพร่เนื้อหาและส่งข้อความใน Messenger ในฐานะเพจ, ตอบกลับและลบความคิดเห็นบนเพจ, ดูว่าใครเป็นคนสร้างโพสต์หรือแสดงความคิดเห็น, และดูข้อมูลเชิงลึกต่างๆได้",
        },
    ];

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router, userAccessFacade: UserAccessFacade, assetFacade: AssetFacade,
        observManager: ObservableManager, routeActivated: ActivatedRoute, accountFacade: AccountFacade, pageFacade: PageFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog
        this.userAccessFacade = userAccessFacade;
        this.assetFacade = assetFacade;
        this.observManager = observManager;
        this.routeActivated = routeActivated;
        this.accountFacade = accountFacade;
        this.pageFacade = pageFacade;
        this.indexTitle = 1;
        this.indexTitleEdit = 2;
        this.selectedEdit = "ผู้จัดการ"
        this.filteredStates = this.stateCtrl.valueChanges
            .pipe(
                startWith(''),
                map(state => state ? this._filterStates(state) : this.states.slice())
            );

        this.selectPower = this.powers[0];

        this.routeActivated.params.subscribe(async (params) => {
            this.pageId = params['id'];
        });

        this.observManager.subscribe('authen.check', (data: any) => {
            this.getAccessPage();
        });

        this.dirtyConfirmEvent = new EventEmitter();
        this.dirtyCancelEvent = new EventEmitter();
    }

    ngOnInit(): void {
        if (this.isLogin) {
            this.getAccessPage();
        }
    }

    ngAfterViewInit(): void {

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
        return this.dirtyConfirmEvent;
    }
    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return this.dirtyCancelEvent;
    }

    public clickChange(data) {
        this.valueSt = data;
    }

    private _filterStates(value: string): State[] {
        const filterValue = value.toLowerCase();

        return this.states.filter(state => state.name.toLowerCase().indexOf(filterValue) === 0);
    }

    public clickRoles(i) {
        if (this.powers[i].check != true) {
            this.isHow = false;
        } else {
            this.isHow = true;
        }
    }

    public clickEditAdmin(i, type?: string) {
        if (type === USER_LEVEL.POST_MODERATOR) {
            this.moderatorPostIndex = i
        } else if (type === USER_LEVEL.CHAT_MODERATOR) {
            this.moderatorChatIndex = i
        } else if (type === USER_LEVEL.FULFILLMENT_MODERATOR) {
            this.moderatorFulFillIndex = i
        } else if (type === USER_LEVEL.OWNER) {
            this.editOwnerIndex = i
        } else {
            this.editAdminIndex = i;
        }
    }

    public clickEdit(i) {
        this.editIndex = i;
    }

    public getDataTitle(index: number) {
        this.indexTitle = index;
    }

    public getDataTitleEdit(index: number) {
        this.indexTitleEdit = index;
        this.isButtonActive = true;
    }

    public keyUpAutoComp(text) {
        if (text === '') {
            this.isActive = false;
            return;
        }
        this.isLoading = true;
        let data = {
            keyword: text
        }
        this.isActive = true;
        this.accountFacade.search(data).then((res) => {
            this.dataUser = res;
            if (this.dataUser) {
                for (let data of this.dataUser) {
                    let index = 0;
                    if (data && data.imageURL && data.imageURL !== '' && data.imageURL !== undefined && data.imageURL !== null) {
                        this.getImageBase64(data, index);
                    }
                    index++;
                }
            }
            this.isLoading = false;
        }).catch((err) => {
            this.isLoading = false;
            console.log(err)
        });
    }

    public getImageBase64(dataImage: any, index: number) {
        this.assetFacade.getPathFile(dataImage.imageURL).then((image: any) => {
            if (image.status === 1) {
                if (!this.validBase64Image(image.data)) {
                    dataImage.imageURL = null;
                } else {
                    dataImage.imageURL = image.data;
                }
            }

        }).catch((err: any) => {
            if (err.error.message === "Unable got Asset") {
                dataImage.imageURL = '';
            }
        });
    }

    public getAccessPage() {
        this.userAccessFacade.getPageAccessUser(this.pageId).then((res: any) => {
            if (res.length > 0) {
                for (let data of res) {
                    if (data.page && data.page.imageURL !== '' && data.page.imageURL !== null && data.page.imageURL !== undefined) {
                        this.assetFacade.getPathFile(data.page.imageURL).then((image: any) => {
                            if (image.status === 1) {
                                if (!this.validBase64Image(image.data)) {
                                    data.page.imageURL = null
                                } else {
                                    data.page.imageURL = image.data
                                }
                                setTimeout(() => {
                                    this.resListPage = res
                                }, 1000);
                            }

                        }).catch((err: any) => {
                            if (err.error.message === "Unable got Asset") {
                                data.page.imageURL = ''
                                this.resListPage = res
                            }
                        });
                    } else {
                        this.resListPage = res
                    }
                    if (data.user && data.user.imageURL !== '' && data.user.imageURL !== null && data.user.imageURL !== undefined) {
                        this.assetFacade.getPathFile(data.user.imageURL).then((image: any) => {
                            if (image.status === 1) {
                                if (!this.validBase64Image(image.data)) {
                                    data.user.imageURL = null
                                } else {
                                    data.user.imageURL = image.data
                                }
                                setTimeout(() => {
                                    this.resListPage = res
                                }, 1000);
                            }

                        }).catch((err: any) => {
                            if (err.error.message === "Unable got Asset") {
                                data.user.imageURL = ''
                                this.resListPage = res
                            }
                        });
                    } else {
                        this.resListPage = res
                    }
                }
            }
        }).catch((err: any) => {
            console.log(err)
        });
    }

    private validBase64Image(base64Image: string): boolean {
        const regex = /^data:image\/(?:gif|png|jpeg)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;
        return base64Image && regex.test(base64Image) ? true : false;
    }

    public addUserLevel() {
        if(this.valueSt === ''){
            return;
        }
        this.isActive = true;
        let levelUser = this.getLevelUser(this.selectPower.label); 
        let access = {
            level: levelUser,
            user: this.valueSt.id || this.valueSt.uniqueId
        }
        this.pageFacade.addAccess(this.pageId, access).then((res) => {
            if (res.message === "Successfully adding User Page Access") {
                this.clearInputData();
                this.getAccessPage();
                if (res) {
                    this.accessPage = res;
                }
            }
        }).catch((err) => {
            console.log(err)
            if (err.error.message === 'Access Level was duplicated.') {
                this.showAlertDialog('ไม่สามารถแอดสิทธิซ้ำได้');
            }
        })
    }

    public getLevelUser(selected) {
        let levelUser;
        if (selected === 'ผู้จัดการ') {
            levelUser = USER_LEVEL.MODERATOR
        } else if (selected === 'ผู้ดูแล') {
            levelUser = USER_LEVEL.ADMIN
        } else if (selected === 'ผู้จัดการโพสต์') {
            levelUser = USER_LEVEL.POST_MODERATOR
        } else if (selected === 'ผู้จัดการแชท') {
            levelUser = USER_LEVEL.CHAT_MODERATOR
        } else if (selected === 'ผู้จัดการเติมเต็ม') {
            levelUser = USER_LEVEL.FULFILLMENT_MODERATOR
        }
        return levelUser;
    }

    public clicksave(userList?: any) {
        let levelUser = this.getLevelUser(this.selectedEdit);
        let body = {
            level: levelUser,
            user: userList.user.id || userList.user.uniqueId
        }
        this.pageFacade.updateSettingPage(this.pageId, body, userList.id).then((res) => {
            if (res) {
                this.getAccessPage();
            }
        }).catch((err) => {
            console.log(err)
            if (err.error.message === 'Access Level was existed.') {
                this.showAlertDialog('ไม่สามารถแอดสิทธิซ้ำได้');
            }
        })
    }

    public clickDelete(access?: any) {
        if (access === undefined) {
            return;
        }
        const confirmEventEmitter = new EventEmitter<any>();
        confirmEventEmitter.subscribe(() => {
            this.submitDialog.emit();
        });
        const canCelEventEmitter = new EventEmitter<any>();
        canCelEventEmitter.subscribe(() => {
            this.submitCanCelDialog.emit();
        });

        let dialog = this.showDialogWarming("คุณต้องการลบสิทธิ์ " + access.user.displayName + " ใช่หรือไม่", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
        dialog.afterClosed().subscribe((res) => {
            if (res) {
                this.userAccessFacade.deleteInfoAdmin(access.page.id, access.id).then((res) => {
                    if (res) {
                        if (res.message === 'Successfully got PageAccessLV') {
                            return this.showAlertDialog('ทำรายการสำเร็จ');
                        }
                    }
                    this.getAccessPage();
                }).catch((err) => {
                    console.log(err)
                    if (err.error.message === 'Access Level was existed.') {
                        this.showAlertDialog('ไม่สามารถแอดสิทธิซ้ำได้');
                    }
                });
            } else {
            }
        });
    }

    public clearInputData() {
        this.search.nativeElement.value = '';
    }

    public clickcancel() {
        this.isCancel = true;

    }
}
