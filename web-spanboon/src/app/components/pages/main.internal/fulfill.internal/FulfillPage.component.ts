/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MESSAGE } from '../../../../AlertMessage';
import { FulfillItemCard } from '../../../../components/shares/card/FulfillItemCard.component';
import { AssetFacade, AuthenManager, ChatFacade, ChatRoomFacade, CheckMessageManager, FulfillFacade, ObservableManager, PostFacade, UserAccessFacade } from '../../../../services/services';
import { FULFILL_GROUP, FULFILL_ORDER_BY } from '../../../../FulfillSort';
import { ValidBase64ImageUtil } from '../../../../utils/ValidBase64ImageUtil';
import { AbstractPage } from '../../AbstractPage';
import { DialogPost } from '../../../../components/shares/dialog/DialogPost.component';
import { FULFILLMENT_STATUS } from '../../../../FulfillmentStatus';
import { DialogFulfill } from '../../../../components/shares/dialog/DialogFulfill.component';
import { DialogAlert, DialogCheckFulfill, DialogConfirmFulfill, DialogFulfillAllocate } from '../../../../components/shares/shares';
import { environment } from '../../../../../environments/environment';
import * as $ from 'jquery';
import * as moment from 'moment';

const PAGE_NAME: string = 'fulfill';
const SEARCH_LIMIT: number = 100;
const SEARCH_OFFSET: number = 0;
const SELECTED_PAGE: string = 'selected.page';
const CHATROOM_ID: string = 'chatroom.id';

@Component({
    selector: 'fulfill-page',
    templateUrl: './FulfillPage.component.html',
})
export class FulfillPage extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    public apiBaseURL = environment.apiBaseURL;
    public accessValue: any = '';
    public sender: any = '';
    public valuePage: any = '';
    public filterSearch: any = '';
    public filterfilGrop: any = '';
    @ViewChild('myTooltip', { static: false }) myTooltip;
    @ViewChild('fulfillItem', { static: false }) fulfillItem: FulfillItemCard;
    @ViewChild('fulfillHeaderTop', { static: false }) fulfillHeaderTop: ElementRef;

    private mainPageLink: string = window.location.origin + '/page/'
    private mainUserLink: string = window.location.origin + '/profile/'
    private mainPostLink: string = window.location.origin + '/post/'
    private mainHashTagLink: string = window.location.origin + '/search/?hashtag='

    public groupingBy = [
        {
            name: 'เพจ',
            type: FULFILL_GROUP.PAGE,
        },
        {
            name: 'โพสต์',
            type: FULFILL_GROUP.POST,
        },
        {
            name: 'ผู้ใช้',
            type: FULFILL_GROUP.USER,
        },
    ];
    public sortingBy = [
        {
            name: 'ล่าสุด',
            type: FULFILL_ORDER_BY.LASTEST
        },
        {
            name: 'วันที่เปิดเรื่อง',
            type: FULFILL_ORDER_BY.DATE
        },
        {
            name: 'วันที่ปิดเคส',
            type: FULFILL_ORDER_BY.APPROVE_DATE_TIME
        }
    ];
    public fulfillStatus = [
        {
            type: FULFILLMENT_STATUS.INPROGRESS
        },
        {
            type: FULFILLMENT_STATUS.CONFIRM
        }
    ];
    public listByStatus = this.fulfillStatus[0].type;
    public groupBy = this.groupingBy[0].name;
    public groupByType = this.groupingBy[0].type;
    public sortBy = this.sortingBy[0].name;
    public sortByType = this.sortingBy[0].type;

    protected observManager: ObservableManager;
    private activatedRoute: ActivatedRoute;
    // Component
    public snackBar: MatSnackBar;
    // Facade
    private postFacade: PostFacade;
    private fulFillFacade: FulfillFacade;
    private userAccessFacade: UserAccessFacade;
    private assetFacade: AssetFacade;
    private chatFacade: ChatFacade;
    private chatRoomFacade: ChatRoomFacade;
    private chatMessage: CheckMessageManager;
    //
    public isAuthen: boolean;
    public isCaseActive: boolean;
    public showLoading: boolean;
    public showChatRoom: boolean;
    public isLoading: boolean;
    public listAsPage: boolean;
    public canAccessCase: boolean;
    public canAccessChatRoom: boolean;
    public isCaseSelected: boolean;
    public isCaseConfirmed: boolean;
    public isCaseHasPost: boolean;
    public canEdit: boolean;
    public showCase: boolean;
    public isActiveClass: boolean;
    public isListItem: boolean;
    public isFirst: boolean;
    public isMobile: boolean;
    public isChecKMobile: boolean;
    public Expand: boolean;
    public isTransition: boolean;
    public isBackArrow: boolean;
    public isRead: boolean;
    public isPreloadLoad: boolean;
    //
    public needsFromState: any;
    public sorting: any;
    public grouping: any;
    public filterType: any;
    public linkPage: string;
    public linkUser: string;
    public linkPost: string;
    public linkEmergency: string;
    public linkObjective: string;
    public label: string;
    public fulfillCase: any[];
    public chatData: any[];
    public reqData: any[];
    public redirection: string;
    public accessPage: any;
    public userClone: any;
    public accessPageImage: any;
    public asPage: string;
    public pageName: string;
    public emergencyEvent: string;
    public objective: string;
    public fulfillCaseId: string;
    public pageImageURL: string;
    public userImageURL: string;
    public statusColor: string;
    public fulfullCaseStatus: string;
    public imageURL: string;
    public name: string;
    public title: string;
    public postDate: any;
    public pageId: string;
    public postId: string;
    public uniqueId: string;
    public fulfillmentPost: string;
    public chatRoomId: string;
    public chatDate: any;
    public approveDate: any;

    constructor(authenManager: AuthenManager, router: Router,
        activatedRoute: ActivatedRoute, observManager: ObservableManager,
        dialog: MatDialog, snackBar: MatSnackBar, postFacade: PostFacade, fulFillFacade: FulfillFacade, chatMessage: CheckMessageManager,
        userAccessFacade: UserAccessFacade, assetFacade: AssetFacade, chatFacade: ChatFacade, chatRoomFacade: ChatRoomFacade) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.observManager = observManager;
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.dialog = dialog;
        this.snackBar = snackBar;
        this.postFacade = postFacade;
        this.fulFillFacade = fulFillFacade;
        this.userAccessFacade = userAccessFacade;
        this.assetFacade = assetFacade;
        this.chatFacade = chatFacade;
        this.chatRoomFacade = chatRoomFacade;
        this.chatMessage = chatMessage;
        this.isAuthen = false;
        this.isCaseActive = true;
        this.showLoading = true;
        this.isLoading = false;
        this.listAsPage = false;
        this.canAccessCase = false;
        this.showChatRoom = false;
        this.canAccessChatRoom = false;
        this.isCaseSelected = false;
        this.isCaseConfirmed = false;
        this.isCaseHasPost = false;
        this.canEdit = false;
        this.showCase = false;
        this.isActiveClass = false;
        this.isListItem = false;
        this.isPreloadLoad = true;
        this.fulfullCaseStatus = this.listByStatus;
        this.statusColor = '#E5E3DD';
        this.asPage = '';
        this.emergencyEvent = '';
        this.objective = '';
        this.linkEmergency = '';
        this.linkObjective = '';
        this.linkPage = '';
        this.linkPost = '';
        this.linkUser = '';
        this.fulfillmentPost = '';
        this.accessPageImage = {};
        this.fulfillCase = [];
        this.chatData = [];
        this.reqData = [];
        this.Expand = true;
        this.accessPage = [];

        this.observManager.createSubject(SELECTED_PAGE);

        this.activatedRoute.params.subscribe((param) => {
            this.redirection = param['redirection'];
        });

        this.needsFromState = this.router.getCurrentNavigation().extras.state; 

        this.observManager.subscribe('authen.check', (data: any) => {
            this.searchAccessPage();
            this.getImage();
            this.listFulfillmentCase(this.listByStatus, this.asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET).then((result) => {
                if (result !== null && result !== undefined) {
                    if (this.needsFromState !== null && this.needsFromState !== undefined) {
                        this.createFulfillCaseFromPost(this.needsFromState);
                    }
                }
            }).catch((err) => {
                console.log('err1 >>>>> ', err);
            });
        });

        this.observManager.subscribe('authen.message', (chat: any) => {
            if (chat && chat.length > 0) {
                for (let data of chat) {
                    for (let caseData of this.fulfillCase) {
                        let index = caseData.cases.map(function (e) { return e.chatRoom; }).indexOf(data._id);
                        if (index !== -1) {
                            caseData.cases[index].unreadMessageCount = data.count;
                            caseData.cases[index].chatMessage = data.message;
                            caseData.cases[index].isRead = false;
                        }
                    }

                }
            }
        });

        this.observManager.subscribe('authen.listcase', (caseId: any) => {
            if (caseId !== undefined && caseId !== '') {
                this.fulFillFacade.listFulfillmentCase(this.listByStatus, this.asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET, caseId).then((result) => {
                    if (result !== null && result !== undefined) {
                        for (let dataCase of result) {
                            for (let newMessage of dataCase.cases) {
                                for (let old of this.fulfillCase) {
                                    const isMessage = old.cases.find(oldMessage => {
                                        return oldMessage.fulfillCaseId === newMessage.fulfillCaseId;
                                    });
                                    if (isMessage) {
                                        isMessage.chatMessage = newMessage.chatMessage;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }).catch((err) => {
                    this.showDialogError(err.name, this.router.url);
                });
            }
        });

    }

    ngOnInit(): void {
        this.checkLoginAndRedirection();

        if (this.authenManager.getUserToken() !== null && this.authenManager.getUserToken() !== undefined) {
            this.searchAccessPage();
            this.getImage();
            this.listFulfillmentCase(this.listByStatus, this.asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET).then((result) => {

                console.log('3', result);
                if (result !== null && result !== undefined) {
                    if (this.needsFromState !== null && this.needsFromState !== undefined) {
                        this.createFulfillCaseFromPost(this.needsFromState);
                    }
                }
            }).catch((err) => {
                console.log('err2 >>>>> ', err);
            });
        }
        this.onResize();

    }

    public ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.isTransition = false;
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

    public changeAccess(data, type) {
        this.canAccessCase = false;
        if (data !== null && data !== undefined) {
            this.accessValue = data;
            if (type === 'page') {
                this.listAsPage = true;
                this.asPage = data.id;
                this.observManager.publish(SELECTED_PAGE, this.asPage);
            } else if (type === 'user') {
                this.listAsPage = false;
                this.asPage = undefined;
                this.observManager.publish(SELECTED_PAGE, '');
            }

            this.listFulfillmentCase(this.fulfullCaseStatus, this.asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
        }
    }

    public searchAccessPage() {
        this.accessValue = this.getCurrentUser();
        this.showLoading = true;

        this.userAccessFacade.getPageAccess().then((res: any) => {
            if (res.length > 0) {
                for (let data of res) {
                    if (data.page && data.page.imageURL !== '' && data.page.imageURL !== null && data.page.imageURL !== undefined) {
                        this.assetFacade.getPathFile(data.page.imageURL).then((image: any) => {
                            if (image.status === 1) {
                                if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                    data.page.imageBase64 = null;
                                } else {
                                    data.page.imageBase64 = image.data;
                                }

                            }
                        }).catch((err: any) => {
                            if (err.error.message === "Unable got Asset") {
                                data.page.imageBase64 = '';
                            }
                        });
                    }
                    setTimeout(() => {
                        this.accessPage = res;
                    }, 1000);
                }

                setTimeout(() => {
                    this.showLoading = false;
                }, 1000);
            } else {
                let data = {
                    user: {
                        displayName: this.accessValue.displayName,
                        id: this.accessValue.id,
                        imageBase64: this.accessValue.imageBase64,
                        imageURL: this.accessValue.imageURL,
                    }
                }
                this.accessPage.push(data);
            }
        }).catch((err: any) => {
            console.log(err);
        });
    }

    public listFulfillmentCase(status?: string, asPage?: string, orderBy?: any, groupBy?: any, filterType?: any, limit?: number, offset?: number, caseId?: string, isFirst?: boolean): Promise<any> {
        return new Promise(async (resolve, reject) => {
            this.canAccessCase = false;
            this.canAccessChatRoom = false;
            this.showLoading = true;
            let fulfillList = await this.fulFillFacade.listFulfillmentCase(status, asPage, orderBy, groupBy, filterType, limit, offset, caseId);

            console.log('1', fulfillList);

            let fulfillCases: any[] = [];
            if (fulfillList.length > 0 && fulfillList !== null && fulfillList !== undefined) {
                this.showCase = true;

                for (let data of fulfillList) {
                    fulfillCases = data.cases;

                    for (let data of fulfillCases) {
                        if (data !== null && data !== undefined) {
                            this.title = data.title;
                            this.emergencyEvent = data.emergencyEvent;
                            this.objective = data.objective;
                            this.userImageURL = data.userImageURL;
                            this.pageImageURL = data.pageImageURL;
                            this.name = data.name;
                            this.postDate = data.postDate;

                            if (data.userImageURL !== '' && data.userImageURL !== null && data.userImageURL !== undefined) {
                                this.assetFacade.getPathFile(data.userImageURL).then((image: any) => {
                                    if (image.status === 1) {
                                        if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                            data.userImageURL = null;
                                        } else {
                                            data.userImageURL = image.data;
                                        }
                                    }
                                }).catch((err: any) => {
                                    if (err.error.message === "Unable got Asset") {
                                        data.userImageURL = '';
                                    }
                                });
                            }

                            if (data.pageImageURL !== '' && data.pageImageURL !== null && data.pageImageURL !== undefined) {
                                this.assetFacade.getPathFile(data.pageImageURL).then((image: any) => {
                                    if (image.status === 1) {
                                        if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                            data.pageImageURL = null;
                                        } else {
                                            data.pageImageURL = image.data;
                                        }
                                    }
                                }).catch((err: any) => {
                                    if (err.error.message === "Unable got Asset") {
                                        data.pageImageURL = '';
                                    }
                                });
                            }
                        }
                        if (isFirst) {
                            for (let value of fulfillList) {
                                for (let cases of value.cases) {
                                    this.fulfillCase.push(value)
                                    this.getChatRoom(cases, this.asPage);
                                    break;
                                }
                            }
                            this.fulfillCase.reverse();
                        } else {
                            this.fulfillCase = fulfillList;
                        }

                    }
                }
                setTimeout(() => {
                    this.showLoading = false;
                    this.isPreloadLoad = false;
                }, 1000);
                resolve(this.fulfillCase);
            } else {
                console.log('2', fulfillList);
                this.fulfillCase = [];
                this.isPreloadLoad = false;
                resolve(this.fulfillCase);
            }
        });
    }

    public createFulfillPost(fulfillCaseId: string, asPage?: string) {
        const data = {
            fulfillCaseId,
            asPage,
            pageId: this.pageId,
            postId: this.postId,
            name: this.pageName,
            fulfillRequest: this.reqData,
            isFulfill: true,
            isListPage: false,
            isEdit: false,
            isFulfillNull: true
        };

        const dialogRef = this.dialog.open(DialogPost, {
            width: 'auto',
            data,
            disableClose: false
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result !== null && result !== undefined) {

                this.snackBar.open("สร้างโพสต์เติมเต็มสำเร็จ", "ไปที่โพสต์").onAction().subscribe(() => {
                    this.router.navigate([]).then(() => {
                        window.open('/post/' + result.id, '_blank');
                    });
                });

                this.fulFillFacade.getFulfillmentCase(fulfillCaseId).then((res: any) => {
                    if (res) {
                        this.approveDate = moment(res.fulfillCase.approveDateTime).format('DD/MM/YYYY');
                    }
                }).catch((err: any) => {
                    console.log('error ', err)
                    this.showDialogError(err.name, this.router.url);
                });

                this.fulfillmentPost = result.id;
                this.asPage = asPage;
                this.isCaseConfirmed = true;
                this.isCaseHasPost = true;
            }
        });
    }

    public getChatRoom(fulfill: any, asPage?: any) {
        this.chatData = [];
        this.reqData = [];

        console.log('fulfill', fulfill)

        if (fulfill !== null && fulfill !== undefined) {
            if (asPage !== null && asPage !== undefined && asPage !== '') {
                this.sender = fulfill.name;
            } else {
                this.sender = fulfill.pageName;
            }

            for (const ff of this.fulfillCase) {
                for (const cases of ff.cases) {
                    if ((cases.fulfillCaseId === fulfill.fulfillCaseId) === true) {
                        cases.isCaseSelected = true;
                    } else {
                        cases.isCaseSelected = false;
                    }
                }
            }

            if ((fulfill.status === FULFILLMENT_STATUS.CONFIRM && (fulfill.fulfillmentPost === null || fulfill.fulfillmentPost === undefined || fulfill.fulfillmentPost === '')) || fulfill.status === FULFILLMENT_STATUS.CANCEL) {
                this.isCaseConfirmed = true;
                this.isCaseHasPost = false;
            } else if ((fulfill.status === FULFILLMENT_STATUS.CONFIRM && (fulfill.fulfillmentPost !== null && fulfill.fulfillmentPost !== undefined && fulfill.fulfillmentPost !== '')) || fulfill.status === FULFILLMENT_STATUS.CANCEL) {
                this.isCaseConfirmed = true;
                this.isCaseHasPost = true;
                this.fulfillmentPost = fulfill.fulfillmentPost;
            } else if ((fulfill.status === FULFILLMENT_STATUS.CONFIRM && (fulfill.fulfillmentPost === null || fulfill.fulfillmentPost === undefined || fulfill.fulfillmentPost === '')) || fulfill.status === FULFILLMENT_STATUS.INPROGRESS) {
                this.isCaseConfirmed = false;
                this.isCaseHasPost = false;
            }

            if (fulfill.pageUsername !== null && fulfill.pageUsername !== undefined && fulfill.pageUsername !== '') {
                this.linkPage = (this.mainPageLink + fulfill.pageUsername);
            } else {
                this.linkPage = (this.mainPageLink + fulfill.pageId);
            }

            if (fulfill.uniqueId !== null && fulfill.uniqueId !== undefined && fulfill.uniqueId !== '') {
                this.linkUser = (this.mainUserLink + fulfill.uniqueId);
            } else {
                this.linkUser = (this.mainUserLink + fulfill.userId);
            }

            if (fulfill.emergencyEvent !== null && fulfill.emergencyEvent !== undefined && fulfill.emergencyEvent !== '') {
                this.emergencyEvent = fulfill.emergencyEvent;
                this.linkEmergency = (this.mainHashTagLink + fulfill.emergencyEvent);
            } else {
                this.emergencyEvent = '';
                this.linkEmergency = '';
            }

            if (fulfill.objective !== null && fulfill.objective !== undefined && fulfill.objective !== '') {
                this.objective = fulfill.objective;
                this.linkObjective = (this.mainHashTagLink + fulfill.objective);
            } else {
                this.objective = '';
                this.linkObjective = '';
            }
            this.pageId = fulfill.pageId;
            this.postId = fulfill.postId;
            this.linkPost = (this.mainPostLink + fulfill.postId);
            this.fulfillCaseId = fulfill.fulfillCaseId;
            this.title = fulfill.title;
            this.uniqueId = fulfill.uniqueId;
            this.userImageURL = fulfill.userImageURL;
            this.pageImageURL = fulfill.pageImageURL;
            this.name = fulfill.name;
            this.postDate = fulfill.createdDate;
            this.chatDate = fulfill.chatDate;
            this.approveDate = fulfill && fulfill.approveDateTime ? moment(fulfill.approveDateTime).format('DD/MM/YYYY') : '';

            this.fulFillFacade.getFulfillmentCase(fulfill.fulfillCaseId, asPage).then((res) => {
                if (res !== null && res !== undefined) {
                    this.showChatRoom = true;

                    this.observManager.publish(CHATROOM_ID, this.chatRoomId);
                    this.chatRoomId = res.chatRoom.id;
                    this.pageName = res.fulfillCase.pageName;
                    this.chatRoomFacade.getChatMessage(res.chatRoom.id, asPage).then((chatData) => {
                        this.canAccessCase = true;
                        this.canAccessChatRoom = true;
                        let chatIds: string[] = [];

                        for (let data of chatData) {
                            if (data !== null && data !== undefined) {
                                if (data.chatMessage !== '' && data.chatMessage !== null && data.chatMessage !== undefined) {
                                    chatIds.push(data.chatMessage.id);
                                    this.chatFacade.markReadChatMessage(chatIds, asPage).then((readResult) => {
                                        if (readResult !== null && readResult !== undefined) {
                                            for (let result of readResult.data) {
                                                if (data.chatMessage.id === result.id) {
                                                    data.chatMessage.isRead = result.isRead;
                                                    fulfill.isRead = result.isRead;
                                                    fulfill.unreadMessageCount = 0;
                                                    chatIds = []; 
                                                }
                                            } 
                                        }
                                    }).catch((error) => {
                                        console.log('error >>>> ', error);
                                    });
                                }

                                if (data.senderImage !== '' && data.senderImage !== null && data.senderImage !== undefined) {
                                    this.assetFacade.getPathFile(data.senderImage).then((image: any) => {
                                        if (image.status === 1) {
                                            if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                                data.senderImage = null;
                                            } else {
                                                data.senderImage = image.data;
                                            }
                                            this.chatDate = data.chatMessage.createdDate;
                                        }
                                    }).catch((err: any) => {
                                        if (err.error.message === "Unable got Asset") {
                                            data.senderImage = '';
                                        }
                                    });
                                } else if (data && data.chatMessage.filePath !== '' && data.chatMessage.filePath !== null && data.chatMessage.filePath !== undefined) {
                                    this.assetFacade.getPathFile(data.chatMessage.filePath).then((image: any) => {
                                        if (image.status === 1) {
                                            if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                                data.chatMessage.filePath = null;
                                            } else {
                                                data.chatMessage.filePath = image.data;
                                            }
                                        }
                                    }).catch((err: any) => {
                                        if (err.error.message === "Unable got Asset") {
                                            data.chatMessage.filePath = '';
                                        }
                                    });
                                } else {
                                    this.chatDate = data.chatMessage.createdDate;
                                    chatIds = [];
                                }
                            }
                        }

                        this.chatData = chatData;
                        setTimeout(() => {
                            this.showChatRoom = false;
                        }, 2000);

                        this.getFulfillmentRequest(fulfill.fulfillCaseId, asPage);
                    }).catch((error) => {
                        this.canAccessCase = false;
                        this.canAccessChatRoom = false;
                        console.log(error.message);
                    });
                } else {
                    setTimeout(() => {
                        this.showChatRoom = false;
                        this.canAccessCase = false;
                        this.canAccessChatRoom = false;
                    }, 1000);
                }
            }).catch((error) => {
                this.showDialogError(error.name, this.router.url);
                this.showChatRoom = false;
                this.canAccessCase = false;
                this.canAccessChatRoom = false;
                console.log(error.name);
            });
        } else {
            setTimeout(() => {
                this.showChatRoom = false;
                this.canAccessCase = false;
                this.canAccessChatRoom = false;
            }, 1000);
        }
        setTimeout(() => {
            this.clickActiveCss();
        }, 0);
    }

    public cancelFulfillmentCase(caseId: string, asPage?: string) {
        if (caseId !== null && caseId !== undefined && caseId !== '') {
            const confirmEventEmitter = new EventEmitter<any>();
            confirmEventEmitter.subscribe(() => {
                this.fulFillFacade.cancelFulfillmentCase(caseId, asPage).then((res) => {
                    this.listFulfillmentCase(FULFILLMENT_STATUS.CANCEL, asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
                }).catch((error) => {
                    console.log('error >>>> ', error.mesage);
                });
            });

            this.showDialogWithOptions({
                text: MESSAGE.TEXT_CANCEL_FULFILL_CASE,
                bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black",
                confirmClickedEvent: confirmEventEmitter,
            });
        }
    }

    public deleteFulfillRequest(fulfill: any, index: number, asPage?: string) {
        if (Object.keys(fulfill).length > 0 && fulfill !== null && fulfill !== undefined) {
            const confirmEventEmitter = new EventEmitter<any>();
            confirmEventEmitter.subscribe(() => {
                this.fulFillFacade.deletetFulfillmentRequest(this.fulfillCaseId, fulfill.requestId, asPage).then((res) => {
                    for (let i = 0; i < this.reqData.length; i++) {
                        if (i === index) {
                            this.reqData.splice(i, 1);
                        }
                    }

                    this.getChatMessage();
                }).catch((error) => {
                    console.log('error >>>> ', error.mesage);
                });
            });

            this.showDialogWithOptions({
                text: MESSAGE.TEXT_DELETE_FULFILL_REQUEST + ' "' + fulfill.name + '" ออกจากรายการเติมเต็มนี้ ?',
                bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black",
                confirmClickedEvent: confirmEventEmitter,
            });
        }
    }

    public deleteAllFulfillList(reqData: any[], asPage?: string) {
        if (reqData !== null && reqData && reqData.length > 0) {
            const confirmEventEmitter = new EventEmitter<any>();
            confirmEventEmitter.subscribe(() => {
                for (let i = 0; i < reqData.length; i++) {
                    this.fulFillFacade.deletetFulfillmentRequest(this.fulfillCaseId, reqData[i].requestId, asPage).then((res) => {
                        this.getFulfillmentRequest(this.fulfillCaseId, asPage);
                    }).catch((error) => {
                        console.log('error >>>> ', error.mesage);
                    });

                    this.reqData.splice(i, 1);
                }

                this.listFulfillmentCase(this.fulfullCaseStatus, asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
            });

            this.showDialogWithOptions({
                text: MESSAGE.TEXT_DELETE_FULFILL_LIST,
                bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black",
                confirmClickedEvent: confirmEventEmitter,
            });
        }
    }

    public saveFulfillQuantity(result: any, requestId: string, item: any) {
        if (result !== null && result !== undefined) {
            if (result.quantity === item.quantity) {
                return;
            }

            const data = { quantity: result.quantity };

            this.fulFillFacade.editFulfillmentRequest(this.fulfillCaseId, requestId, data, this.asPage).then((qtyUpdate: any) => {
                this.canEdit = false;

                this.getFulfillmentRequest(this.fulfillCaseId, this.asPage);
                this.getChatMessage();
            }).catch((error) => {
                console.log('error >>> ', error.mesage);
            });
        }
    }

    public confirmFulfillRequest(fulfillCaseId: string, asPage?: string) {
        if (this.postId !== null && this.postId !== undefined && this.postId !== '') {
            if (fulfillCaseId !== null && fulfillCaseId !== undefined && fulfillCaseId !== '') {
                const confirmEventEmitter = new EventEmitter<any>();
                confirmEventEmitter.subscribe(() => {
                    this.fulFillFacade.confirmFulfillmentCase(fulfillCaseId, asPage).then((res) => {
                        if (res) {
                            this.isCaseConfirmed = true;
                            for (let group of this.fulfillCase) {
                                for (let fulfillStatus of group.cases) {
                                    if (res.id === fulfillStatus.fulfillCaseId) {
                                        fulfillStatus.status = res.status;
                                        break;
                                    }
                                }
                            }

                        }
                    }).catch((err) => {

                    });
                });

                const cancelEventEmitter = new EventEmitter<any>();
                cancelEventEmitter.subscribe(() => { });

                let data = {
                    disableClose: true,
                    item: this.reqData,
                    text: MESSAGE.TEXT_CONFIRM_FULFILL_REQUEST,
                    bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                    bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                    bottomColorText2: "black",
                    confirmClickedEvent: confirmEventEmitter
                }

                let dialog = this.dialog.open(DialogConfirmFulfill, { data });

                dialog.afterClosed().subscribe((res) => {
                    if (res) {
                    }
                });
            }
        } else {


            let data = {
                disableClose: true,
                item: this.reqData,
                pogeId: this.pageId,
                fulfillCaseId: this.fulfillCaseId,
                text: MESSAGE.TEXT_CONFIRM_FULFILL_REQUEST,
                bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black"
            }

            let dialog = this.dialog.open(DialogFulfillAllocate, { data });

            dialog.afterClosed().subscribe((res) => {
                if (res) {
                }
            });

        }

    }

    public cancelConfirmFulfillmentCase(fulfillCaseId: string, asPage?: string) {
        if (fulfillCaseId !== null && fulfillCaseId !== undefined && fulfillCaseId !== '') {
            const confirmEventEmitter = new EventEmitter<any>();
            confirmEventEmitter.subscribe(() => {
                this.fulFillFacade.cancelConfirmFulfillmentCase(fulfillCaseId, asPage).then((res) => {
                    if (res.status === FULFILLMENT_STATUS.INPROGRESS) {
                        // let messageData = {};
                        // let chatMessage = "";

                        // if (this.asPage !== null && this.asPage !== undefined && this.asPage !== '') {
                        //     messageData = { message: chatMessage, asPageId: this.asPage };
                        // } else {
                        //     messageData = { message: chatMessage };
                        // }

                        // this.sendChatMessage(this.chatRoomId, messageData);

                        this.isCaseConfirmed = false;
                    }
                }).catch((err) => {

                });
            });

            this.showDialogWithOptions({
                text: MESSAGE.TEXT_CANCEL_CONFIRM_FULFILL_REQUEST,
                bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                bottomColorText2: "black",
                confirmClickedEvent: confirmEventEmitter,
            });
        }
    }

    public async clickAddPostNeeds(postId: string) {
        const fulfillItem = await this.getPostNeeds(postId);
        if (fulfillItem !== null && fulfillItem !== undefined && fulfillItem.length > 0) {
            let dialog = this.dialog.open(DialogFulfill, {
                width: 'auto',
                data: {
                    isFrom: 'FULFILL',
                    fulfill: fulfillItem,
                    currentFulfillItem: this.reqData
                },
                disableClose: false
            });

            dialog.afterClosed().subscribe((data) => {
                if (data !== null && data !== undefined) {
                    const needs = { needs: data };
                    this.fulFillFacade.createFulfillmentRequest(this.fulfillCaseId, needs, this.asPage).then((res) => {
                        for (const req of res) {
                            this.reqData.push(req);
                        }

                        this.getChatMessage();
                    }).catch((err) => {

                    });
                }

                this.stopLoading();
            });
        }
    }

    public clickChangeTab(status: string) {
        if (status === FULFILLMENT_STATUS.INPROGRESS) {
            this.isCaseActive = true;
        } else if (status === FULFILLMENT_STATUS.CONFIRM) {
            this.isCaseActive = false;
            this.sorting = this.sortingBy[2].type;
            this.sortBy = this.sortingBy[2].name;
        }

        this.fulfullCaseStatus = status;

        this.listFulfillmentCase(status, this.asPage, this.sorting, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
    }

    public viewPost(postId: string) {
        if (postId !== null && postId !== undefined && postId !== '') {
            this.router.navigate([]).then(() => {
                window.open('/post/' + postId, '_blank');
            });
        }
    }

    public clickSorting(data: any) {
        this.sortBy = data.name;
        this.sorting = data.type;

        this.listFulfillmentCase(this.fulfullCaseStatus, this.asPage, this.sorting, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
    }

    public clickSetGrop(data: any) {
        this.groupBy = data.name;
        this.groupByType = data.type;

        this.listFulfillmentCase(this.fulfullCaseStatus, this.asPage, this.sorting, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
    }

    public isLogin(): boolean {
        let user = this.authenManager.getCurrentUser();
        return user !== undefined && user !== null;
    }

    private stopLoading(): void {
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }

    private createFulfillCaseFromPost(result: any) {
        console.log('result', result)
        if (Object.keys(result).length > 0 && result !== null && result !== undefined) {
            const data = result.data;
            let needsResult: any[] = [];

            if (data !== null && data !== undefined) {
                let postId: string;
                let pageId: string;
                let fulfillCaseId: string;
                let fulfillCaseStatus: string;
                let canCreateNewCase = false;

                for (const result of data) {
                    postId = result.postId;
                    pageId = result.pageId
                    needsResult.push(result);
                }

                if (postId !== null && postId !== undefined && postId !== '') {
                    let fulfillData = {
                        postId,
                        requester: this.getCurrentUserId()
                    };

                    this.getFulfillmentFromPost(postId).then((fulfillList) => {
                        if (fulfillList !== null && fulfillList !== undefined) {
                            fulfillList.filter((ff) => {
                                fulfillCaseId = ff.id;
                                fulfillCaseStatus = ff.status;

                                if (this.fulfillCase !== null && this.fulfillCase !== undefined && this.fulfillCase.length > 0) {
                                    this.fulfillCase.filter((ffResult) => {
                                        ffResult.cases.filter((ffcResult) => {
                                            if ((ffcResult.fulfillCaseId === fulfillCaseId) === true) {
                                                this.getChatRoom(ffcResult, this.asPage);
                                            }
                                        });
                                    });

                                    if (fulfillCaseStatus === FULFILLMENT_STATUS.CONFIRM || fulfillCaseStatus === FULFILLMENT_STATUS.CANCEL) {
                                        canCreateNewCase = true;
                                    } else {
                                        canCreateNewCase = false;
                                    }
                                }
                            });
                        } else {
                            canCreateNewCase = true;
                        }

                        if (canCreateNewCase) {
                            Object.assign(fulfillData, { needs: data });
                            this.createFulfillmentCase(fulfillData);
                        } else {
                            this.fulFillFacade.getFulfillmentRequest(fulfillCaseId, this.asPage).then((fulfillRequest) => {
                                const createEventEmitter = new EventEmitter<any>();
                                createEventEmitter.subscribe(() => {
                                    Object.assign(fulfillData, { needs: needsResult });
                                    this.createFulfillmentCase(fulfillData);
                                });

                                const editEventEmitter = new EventEmitter<any>();
                                editEventEmitter.subscribe(() => {
                                    if (fulfillRequest !== null && fulfillRequest !== undefined) {
                                        const fulfillResult = [];
                                        const needsMap: any = {};

                                        for (const request of fulfillRequest) {
                                            needsMap[request.needsId] = request;
                                        }

                                        const needsList: any[] = [];
                                        const needsDuplicate: any[] = data.filter((item: any) => {
                                            if (needsMap[item.id]) {
                                                return true;
                                            } else {
                                                needsList.push(item);
                                            }
                                        });

                                        let needResult: any = { mergeItem: false, needs: [] };
                                        let needDuplicateResult: any = { mergeItem: true, needs: [] };

                                        for (const needs of needsDuplicate) {
                                            const needsData = { id: needs.id, quantity: needs.quantity };
                                            needDuplicateResult.needs.push(needsData);
                                        }

                                        for (const needs of needsList) {
                                            const needsData = { id: needs.id, quantity: needs.quantity };
                                            needResult.needs.push(needsData);
                                        }

                                        fulfillResult.push(needDuplicateResult);
                                        fulfillResult.push(needResult);

                                        if (fulfillResult !== null && fulfillResult !== undefined && fulfillResult.length > 0) {
                                            for (const fulfill of fulfillResult) {
                                                this.createFulfillmentRequest(fulfillCaseId, fulfill, this.asPage).then((createRes) => {
                                                    this.getChatMessage();
                                                });
                                            }
                                        }
                                    }
                                });

                                let dialogData: any = {
                                    disableClose: true,
                                    item: needsResult,
                                    text: MESSAGE.TEXT_CONFIRM_FULFILL_CASE_EXISTS,
                                    bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
                                    bottomText2: MESSAGE.TEXT_BUTTON_FULFILLMENT_CREATE,
                                    bottomText3: MESSAGE.TEXT_BUTTON_FULFILLMENT_EDIT,
                                    bottomColorText2: "black",
                                    confirmClickedEvent: createEventEmitter,
                                    cancelClickedEvent: editEventEmitter
                                }

                                let dialog = this.dialog.open(DialogCheckFulfill, { data: dialogData });

                                dialog.afterClosed().subscribe((res) => {
                                    needsResult = [];
                                });
                            });
                        }
                    }).catch((error) => {
                        console.log('error >>> ', error.message);
                    });
                } else {
                    let fulfillData = {
                        postId,
                        pageId,
                        requester: this.getCurrentUserId()
                    };
                    Object.assign(fulfillData, { items: data });
                    this.createFulfillmentCase(fulfillData);
                }
            } else {
                this.listFulfillmentCase(this.fulfullCaseStatus, this.asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET);
            }
        }
    }

    private async getFulfillmentFromPost(postId: string): Promise<any[]> {
        return await this.fulFillFacade.getFulfillmentFromPost(postId);
    }

    private async createFulfillmentCase(data: any) {
        this.fulFillFacade.createFulfillmentCase(data).then((createResult) => {
            this.listFulfillmentCase(this.fulfullCaseStatus, this.asPage, this.sortByType, this.groupByType, this.filterType, SEARCH_LIMIT, SEARCH_OFFSET, createResult.id, true);
        }).catch((createError) => {
            if (createError.error.error.message === "Create FulfillmentCase Error") {
                this.showAlertDialog('ไม่สามารถสร้างเคสเติมเต็มได้');
            }
        });
    }

    private async getPostNeeds(postId: string): Promise<any[]> {
        let fulfillItem: any[] = [];

        if (postId !== null && postId !== undefined && postId !== '') {
            const result = await this.postFacade.getPostNeeds(postId);

            if (result !== null && result !== undefined && result.length > 0) {
                for (const data of result) {
                    data.isFrom = "FULFILL";
                    fulfillItem.push(data);
                }
            }

            return fulfillItem;
        }
    }

    private getImage() {
        let user = this.authenManager.getCurrentUser();
        this.userClone = user;
        if (this.userClone && this.userClone.imageURL && this.userClone.imageURL !== '' && this.userClone.imageURL !== undefined && this.userClone.imageURL !== null) {
            this.assetFacade.getPathFile(this.userClone.imageURL).then((image: any) => {
                if (image.status === 1) {
                    if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                        this.userClone.imageBase64 = null;
                    } else {
                        this.userClone.imageBase64 = image.data;
                    }
                    this.accessPageImage.imageURL = this.userClone.imageBase64;
                }
            }).catch((err: any) => {
                if (err.error.message === "Unable got Asset") {
                    this.userClone.imageURL = '';
                }
            });
        } else {
            this.accessPageImage = this.userClone;
        }
    }

    private getChatMessage() {
        this.chatRoomFacade.getChatMessage(this.chatRoomId).then((message) => {
            if (message !== null && message !== undefined) {
                for (const msg of message) {
                    if (msg && msg.senderImage !== '' && msg.senderImage !== null && msg.senderImage !== undefined) {
                        this.assetFacade.getPathFile(msg.senderImage).then((image: any) => {
                            if (image.status === 1) {
                                if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                    msg.senderImage = null;
                                } else {
                                    msg.senderImage = image.data;
                                }
                            }
                        }).catch((err: any) => {
                            if (err.error.message === "Unable got Asset") {
                                msg.senderImage = '';
                            }
                        });
                    }
                }

                this.chatData = message;
            }
        }).catch((error) => {

        });
    }

    private createFulfillmentRequest(caseId: string, data: any, asPage?: string) {
        return this.fulFillFacade.createFulfillmentRequest(caseId, data, asPage);
    }

    private getFulfillmentRequest(fulfillCaseId: string, asPage?: any) {
        this.fulFillFacade.getFulfillmentRequest(fulfillCaseId, asPage).then((reqData) => {
            for (let data of reqData) {
                if (data && data.imageURL !== '' && data.imageURL !== null && data.imageURL !== undefined) {
                    this.assetFacade.getPathFile(data.imageURL).then((image: any) => {
                        if (image.status === 1) {
                            if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                                data.imageBase64 = null;
                            } else {
                                data.imageBase64 = image.data;
                            }
                        }
                    }).catch((err: any) => {
                        if (err.error.message === "Unable got Asset") {
                            data.imageBase64 = '';
                        }
                    });
                }
            }

            setTimeout(() => {
                this.showChatRoom = false;
                this.showLoading = false;
                this.reqData = reqData;
            }, 1000);
        });
    }

    private checkLoginAndRedirection(): void {
        if (!this.isLogin()) {
            if (this.redirection) {
                this.router.navigateByUrl(this.redirection);
            } else {
                this.router.navigateByUrl("/home");
            }
        }
    }

    public onResize() {
        // this.onResizeWindow();
        if (window.innerWidth <= 487) {
            this.isChecKMobile = true;
            this.Expand = false;
            this.isBackArrow = false;
        }
        if (window.innerWidth <= 1024) {
            this.isMobile = true;
            this.Expand = false;
            this.isBackArrow = false;
        } else {
            this.isMobile = false;
            this.isChecKMobile = false;
            this.Expand = true;
            var fulfillLeft = document.getElementById("fulfill-left");
            if (fulfillLeft && fulfillLeft.style !== null) {
                fulfillLeft.style.display = 'flex';
            }
            if (window.innerWidth >= 1440) {
                var itemList = document.getElementById("body-story-right");
                if (itemList && itemList.style) {
                    itemList.style.display = 'flex';
                }
            } else if (window.innerWidth < 1440) {
                var itemLists = document.getElementById("body-story-right");
                if (itemLists && itemLists.style) {
                    itemLists.style.display = 'none';
                    // this.isListItem = true;
                }
            }
        }
    }

    public clickActiveCss() {
        if (window.innerWidth <= 1024) {
            if (this.isActiveClass) {
                this.isActiveClass = false;
                var fulfillLeft = document.getElementById("fulfill-left");
                fulfillLeft.style.display = 'flex'
                this.isFirst = false;
            } else {
                var fulfillLeft = document.getElementById("fulfill-left");
                fulfillLeft.style.display = 'none'
                this.isActiveClass = true;
                this.isFirst = true;
            }
        } else {
        }
    }

    public showFulFill() {
        if (window.innerWidth <= 1024) {
            this.showChatRoom = false;
            var itemList = document.getElementById("body-story-right");
            itemList.style.display = 'flex';
            this.isListItem = true;
            this.isFirst = false;
            this.Expand = false;
            this.isBackArrow = false;
        }
    }

    public onBack() {
        if (this.isFirst) {
            var fulfillLeft = document.getElementById("fulfill-left");
            fulfillLeft.style.display = 'flex';
            this.isActiveClass = false;
            this.Expand = false;
            this.isTransition = false;
        } else {
            this.Expand = false;
            this.isTransition = false;
            var itemList = document.getElementById("body-story-right");
            if (itemList.style.display === 'flex') {
                itemList.style.display = 'none';
                this.isListItem = false;
                this.isFirst = true;
            } else {
                itemList.style.display = 'flex';
            }
        }
    }

    public expandMore() {
        this.Expand = !this.Expand;
        this.isTransition = true;
        if (this.Expand) {
            this.isBackArrow = true;
            $('#expand').css({
                transform: 'rotate(180deg)'
            });
        } else {
            this.isBackArrow = false;
            $('#expand').css({
                transform: 'rotate(0)'
            });
        }
    }

    public searchPostNeeds() {
        return this.router.navigateByUrl('/search?type=NEEDS');
    }

    public clickDevelop(index, text) {
        let url = ''
        if (index === 1) {
            url += "emergency=#" + text
        } else if (index === 2) {
            url += "objective=" + text
        }
        let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
                text: "ระบบอยู่ในระหว่างการพัฒนา เหตุการณ์ด่วนและสิ่งที่กำลังทำ คุณต้องการไปหน้า search ไหม",
                bottomText2: "ตกลง",
                bottomText1: "ยกเลิก",
                bottomColorText2: "black",
                // btDisplay1: "none"
            }
        });
        dialog.afterClosed().subscribe((res) => {
            if (res) {
                this.router.navigateByUrl('/search?' + url);
            }
        });
    }
}
