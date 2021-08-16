/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, EventEmitter, Input, Output, SimpleChanges, ViewContainerRef } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { publish } from 'rxjs/operators';
import { MenuContextualService, AssetFacade } from 'src/app/services/services';
import { TooltipProfile } from '../tooltip/TooltipProfile.component';
import { environment } from 'src/environments/environment';
import { AuthenManager } from '../../../services/services';
import { Router } from '@angular/router';
import { AbstractPage } from '../../pages/AbstractPage';

@Component({
    selector: 'card-contant-home',
    templateUrl: './CardContentHome.component.html'
})
export class CardContentHome extends AbstractPage implements OnInit {

    protected router: Router;
    protected assetFacade: AssetFacade;

    @Input()
    public postData: any;
    @Input()
    public eventData: any;
    @Input()
    public tagData: any;

    // keyOBJ Array
    @Input()
    public keyObjArr: any;

    @Input()
    public smallCard: boolean;
    @Input()
    public mediumCard: boolean;
    @Input()
    public largeCard: boolean;
    @Input()
    public eventCard: boolean;
    @Input()
    public isData: boolean;

    @Input()
    public tagCard: boolean;
    @Input()
    public tagCardIsOpenRight: boolean;
    @Input()
    public isObjective: boolean;

    @Output()
    public clickEvent: EventEmitter<any> = new EventEmitter();

    @Output()
    public isLodingEvent: EventEmitter<any> = new EventEmitter();

    public amountSocial: number = 0;
    public eventDataAct: number = 0;
    public selectIndex: number = 0;

    // LINK //

    public linkUserPage: string;
    public linkPost: string;

    // USER //

    public isUserOfficial: boolean = false;
    public userId: string;
    public userType: string;
    public userName: string;
    public userUniqueId: string;
    public userImageURL: string;

    public postId: string;

    public apiBaseURL = environment.apiBaseURL;
    private mainPostLink: string = window.location.origin + '/post/'
    private mainPageLink: string = window.location.origin + '/page/'

    // card //

    public postCardCoverPageUrl: string = '';
    public postCardTitle: string = '';
    public postCardDescription: string = '';

    // event //
    public eventCoverPageUrl: string = '';
    public eventTitle: string = '';
    public eventDescription: string = '';
    public eventPostCount: string = '';

    public eventRepostCount: number;
    public eventLikeCount: number;
    public eventCommentCount: number;
    public eventShareCount: number;

    public emergencyEventId: string;

    public dateTime: any;

    // hashTag //
    public datahashTagArrPosts: any;
    public datahashTagPost: any;

    public hashTagRepostCount: number;
    public hashTagLikeCount: number;
    public hashTagCommentCount: number;
    public hashTagShareCount: number;

    public isLoad: boolean = true;

    constructor(router: Router, authenManager: AuthenManager, assetFacade: AssetFacade, private popupService: MenuContextualService, dialog: MatDialog, private viewContainerRef: ViewContainerRef) {
        super(null, authenManager, dialog, router);
        this.assetFacade = assetFacade;
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        setTimeout(async () => {

            if (this.isDerTy(this.postData)) {
                if (this.isDerTy(this.postData.post)) {
                    this.postId = this.postData.post._id;
                }
                if (this.isDerTy(this.postData.owner)) {
                    this.getUserData(this.postData.owner);
                }
                if (this.keyObjArr !== undefined && this.keyObjArr !== null && this.keyObjArr !== '') {
                    this.postCardCoverPageUrl = this.duplicateObjFunction(this.postData, this.keyObjArr);
                } else if (this.postData.post) {
                    if (this.postData.post.gallery.length > 0) {
                        this.postCardCoverPageUrl = this.postData.post.gallery[0].signURL ? this.postData.post.gallery[0].signURL : this.postData.post.gallery[0].coverSignURL ? this.postData.post.gallery[0].coverSignURL : this.apiBaseURL + this.postData.post.gallery[0].imageURL + '/image';
                    }
                }

                if (this.smallCard) {
                    this.postData.owner = this.postData.owner;
                }

                this.amountSocial = (this.postData.post ? this.postData.post.likeCount : 0 + this.postData.post ? this.postData.post.repostCount : 0 + this.postData.post ? this.postData.post.shareCount : 0);
            }

            if (this.isDerTy(this.eventData)) {
                this.eventDataAct = this.eventData[0];
                this.eventCoverPageUrl = this.eventData[0].signURL ? this.eventData[0].signURL : this.eventData[0].coverSignURL ? this.eventData[0].coverSignURL : this.eventData[0].coverPageUrl;
                this.eventTitle = this.eventData[0].title;
                this.eventDescription = this.eventData[0].description;
                this.dateTime = this.eventData[0].dateTime;
                this.eventRepostCount = this.eventData[0].repostCount;
                this.eventPostCount = this.eventData[0].postCount;
                this.eventLikeCount = this.eventData[0].likeCount;
                this.eventCommentCount = this.eventData[0].commentCount;
                this.eventShareCount = this.eventData[0].shareCount;
                this.emergencyEventId = this.eventData[0].data.emergencyEventId;

                // for (let index = 0; index < this.eventData.length; index++) {
                //     this.eventData.splice(0, 1);
                //     if (this.eventData.length == 3) {
                //         break
                //     }
                // }
            }
            if (this.isDerTy(this.tagData)) {
                this.datahashTagArrPosts = this.tagData.posts
                if (this.tagCardIsOpenRight) {
                    this.datahashTagPost = this.tagData.posts[0]
                    this.hashTagRepostCount = this.tagData.posts[0].repostCount;
                    this.hashTagLikeCount = this.tagData.posts[0].likeCount;
                    this.hashTagCommentCount = this.tagData.posts[0].commentCount;
                    this.hashTagShareCount = this.tagData.posts[0].shareCount;
                }
            }


            setTimeout(() => {
                this.isLoad = false;
                this.isLodingEvent.emit(this.isLoad);
            }, 400);

        }, 800);


    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    public getUserData(owner): any {
        this.isUserOfficial = owner.isOfficial;
        this.userId = owner.id;
        this.userImageURL = owner.imageURL;
        this.userName = owner.name;
        this.userType = owner.type;
        if (owner.length > 0) {
            if (this.isDerTy(owner[0].uniqueId)) {
                this.userUniqueId = owner.uniqueId;
            } else {
                this.userId = owner[0]._id;
            }
        } else {
            if (this.isDerTy(owner.uniqueId)) {
                this.userUniqueId = owner.uniqueId;
            }
        }

        this.linkPost = (this.mainPostLink + this.postId);
        if (this.isDerTy(this.userUniqueId)) {
            this.linkUserPage = (this.mainPageLink + this.userUniqueId)
        } else if (this.isDerTy(this.userId)) {
            this.linkUserPage = (this.mainPageLink + this.userId)
        }
    }

    public clickDataSearch(data, index?) {
        this.router.navigate([]).then(() => {
            window.open('/emergencyevent/' + data);
        });
    }

    public clickToStory(data) {
        this.router.navigate([]).then(() => {
            window.open('/story/' + data, '_blank');
        });
    }
    public clickDataSearchs(data: any) {
        if (this.isObjective) {
            this.router.navigate([]).then(() => {
                window.open('/search?hashtag=' + data, '_blank');
            });
        }
    }

    public clickToPage(data) {
        this.router.navigate([]).then(() => {
            window.open(data, '_blank');
        });
    }

    public clickDialogDiverlop() {
        this.showAlertDevelopDialog();
    }

    public clickEventEmitMedium(data?) {
        var path = data.path ? data.path[0].className : data.explicitOriginalTarget.className;
        if (path !== 'medium_card' && path !== 'other_topic_coverPage' && path !== 'other_topic_title' && path !== 'other_topic' && path !== 'detail' && path !== 'bottom_medium_card' && path !== 'title' && path !== 'bottom_medium_card_detail') {
            return
        }
        this.clickEvent.emit(this.postData);
    }

    public clickEventEmitLarge(data?) {
        var path = data.path ? data.path[0].className : data.explicitOriginalTarget.className;
        if (path !== 'large_card' && path !== 'other_topic_coverPage' && path !== 'other_topic_title' && path !== 'other_topic') {
            return
        }
        this.clickEvent.emit(this.postData);
    }

    public clickEventEmit(data?: any) {
        if (data.post) {
            this.clickEvent.emit(this.postData);

        } else if (data.data.objectiveId) {
            window.open('/objective/' + data.data.objectiveId);

        } else if (data.data.emergencyEventId) {
            console.log('emergencyevent', data.data.emergencyEventId);
            window.open('/emergencyevent/' + data.data.emergencyEventId);

        } else if (data.owner) {
            window.open('/search?hashtag=' + data.title.substring(1, data.title.length + 1));

        } else if (data.data) {
            window.open('/page/' + data.data._id);
        }
    }

    isDerTy(value): boolean {

        return (value !== null && value !== undefined && value !== '')
    }

    public Tooltip(origin: any, data) {
        if (window.innerWidth > 998) {
            this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
                data: data,
            })
        }
    }

    public TooltipClose($event) {

        setTimeout(() => {

            if ($event.toElement.className !== "ng-star-inserted") {
                this.popupService.close(null);
            }

        }, 400);
    }

    public duplicateObjFunction(Obj, keyObjs: any[]): any {

        let indexKey: number = 1;
        let lastObj: any

        for (let key of keyObjs) {

            if (indexKey === keyObjs.length) {
                if (indexKey === 1) {
                    return this.apiBaseURL + Obj[key] + '/image';
                } else {
                    return this.apiBaseURL + Obj[key] + '/image';
                }

            } else {
                if (typeof Obj[key] == "object") {
                    lastObj = Obj[key];
                }
            }
            indexKey++
        }

        return "Not found"

    }

    /// PUBLIC

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

}

