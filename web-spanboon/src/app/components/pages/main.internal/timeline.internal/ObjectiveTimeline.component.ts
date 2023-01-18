/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, EventEmitter, Output, ViewContainerRef } from '@angular/core';
import { AuthenManager, ObservableManager, ObjectiveFacade, HashTagFacade, PostFacade, PostActionService } from '../../../../services/services';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { TooltipProfile } from '../../../shares/tooltip/TooltipProfile.component';
import { AbstractPage } from '../../AbstractPage';
import { MenuContextualService } from 'src/app/services/services';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import './../../../../../assets/script/canvas';

const PAGE_NAME: string = 'objective';

@Component({
    selector: 'objective-timeline',
    templateUrl: './ObjectiveTimeline.component.html'
})

export class ObjectiveTimeline extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public router: Router;
    public observManager: ObservableManager;
    public objectiveFacade: ObjectiveFacade;
    public postActionService: PostActionService;
    public postFacade: PostFacade;
    public hashTagFacade: HashTagFacade;

    // test

    @Input()
    public isClose: boolean = false;
    @Input()
    public isLike: boolean;
    @Input()
    public isReboon: boolean;
    @Input()
    public isShare: boolean;
    @Input()
    public isComment: boolean;
    @Input()
    public isFulfillQuantity: boolean = false;
    @Input()
    public isFulfill: boolean = false;
    @Input()
    public isPendingFulfill: boolean = false;
    @Input()
    public isImage: boolean = false;
    @Input()
    public isButtonFulfill: boolean = true;
    @Input()
    public isNeedBoxPost: boolean = true;
    @Input()
    public isHide: boolean = true;

    // test

    @Output()
    public logout: EventEmitter<any> = new EventEmitter();

    public userImage: any;

    // ObjectiveData
    public objectiveData: any;
    public pageObjective: any;
    public pageOwner: any;
    public currentDate: any;

    public isFollow: boolean = false;
    public isLoginUser: boolean = false;
    public isLoding: boolean = true;

    public objectiveId: string;

    public apiBaseURL = environment.apiBaseURL;
    private routeActivated: ActivatedRoute;

    constructor(router: Router, authenManager: AuthenManager, private popupService: MenuContextualService, postFacade: PostFacade, postActionService: PostActionService, private viewContainerRef: ViewContainerRef, objectiveFacade: ObjectiveFacade, hashTagFacade: HashTagFacade, observManager: ObservableManager, routeActivated: ActivatedRoute,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.hashTagFacade = hashTagFacade;
        this.postFacade = postFacade;
        this.routeActivated = routeActivated;
        this.postActionService = postActionService;
        this.objectiveFacade = objectiveFacade;

        // You can also pass an optional settings object
        // below listed default settings
        AOS.init({
            // Global settings:
            disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
            startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
            initClassName: 'aos-init', // class applied after initialization
            animatedClassName: 'aos-animate', // class applied on animation
            useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
            disableMutationObserver: false, // disables automatic mutations' detections (advanced)
            debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
            throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)


            // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
            offset: 40, // offset (in px) from the original trigger point
            delay: 0, // values from 0 to 3000, with step 50ms
            duration: 400, // values from 0 to 3000, with step 50ms
            easing: 'ease', // default easing for AOS animations
            once: true, // whether animation should happen only once - while scrolling down
            mirror: false, // whether elements should animate out while scrolling past them
            anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

        });

    }

    public async ngOnInit(): Promise<void> {
        this.isLoginUser = this.isLogin();
        this.routeActivated.params.subscribe((params) => {
            this.objectiveId = params['id'];
        })
        this.currentDate = new Date();

        this.objectiveData = await this.objectiveFacade.getPageObjectiveTimeline(this.objectiveId);
        this.objectiveData.page;
        this.objectiveData.timelines;
        const pageType = { type: "PAGE" };
        const origin = this.objectiveData.page;

        const dataPageTypeAssign = Object.assign(pageType, origin);
        this.objectiveData.page = { owner: dataPageTypeAssign };
        this._groupData();
        this.setData();
    }

    private _groupData(): void {
        let numloop: number = 0

        for (let item of this.objectiveData.timelines) {
            if (item.type === "OBJECTIVE_NEEDS") {
                for (let n of item.post.needs) {
                    let standardItem = item.post.standardItemCollection.find(({ _id }) => _id === n.standardItemId);
                    if (standardItem !== undefined && standardItem !== null) {
                        n.imageURL = standardItem.imageURL;
                    }
                }
            }
            if (item.type === "OBJECTIVE_POST_LIKED") {
                if (item.galleries.length === 0) {
                    this.objectiveData.timelines.splice(numloop, 1);
                }
            }
            numloop++
        }
    }


    public setData(): void {
        this.pageObjective = this.objectiveData.pageObjective;
        this.pageOwner = this.objectiveData.page;

    }

    public setHashtag(tag: any, post: any): any {
        if (post) {
            let dataHashTag = post.trim();
            return dataHashTag.split('#' + tag)[1];
        }
    }

    public clickDataSearch(post: any): void {
        this.router.navigate([]).then(() => {
            window.open('/post/' + post.post._id, '_blank');
        });
    }

    public clickToHashtag(dataId: any, type?: any) {
        this.router.navigate([]).then(() => {
            window.open('/search/?hashtag=' + dataId, '_blank');
        });
    }

    public clickToPage(page: any) {
        this.router.navigate([]).then(() => {
            if (page.pageUsername !== null && page.pageUsername !== undefined && page.pageUsername !== "") {
                window.open('/page/' + page.pageUsername, '_blank');
            } else {
                window.open('/page/' + page.id, '_blank');
            }
        });
    }

    public followObjective() {
        this.objectiveFacade.followObjective(this.objectiveId);
        if (this.objectiveData.isFollow) {
            this.objectiveData.followedCount--
        } else {
            this.objectiveData.followedCount++
        }
        this.objectiveData.isFollow = !this.objectiveData.isFollow;
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public Tooltip(origin: any, data) {
        if (window.innerWidth > 998) {
            this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
                data: data,
            })
        }
    }

    public async actionComment(action: any, index: number, indexa: number) {

        await this.postActionService.actionPost(action, index, undefined, "PAGE").then((res: any) => {
            if (res !== undefined && res !== null) {
                if (res && res.type === "NOTOPIC") {
                } else if (res.type === "TOPIC") {
                } else if (res.type === "UNDOTOPIC") {
                } else if (res.type === "POST") {
                    this.router.navigateByUrl('/post/' + action.pageId);
                } else if (action.mod === 'LIKE') {
                    if (this.objectiveData.timelines[index].posts[indexa].isLike) {
                        this.objectiveData.timelines[index].posts[indexa].likeCount--
                        this.objectiveData.timelines[index].posts[indexa].isLike = !this.objectiveData.timelines[index].posts[indexa].isLike;
                    } else {
                        this.objectiveData.timelines[index].posts[indexa].likeCount++
                        this.objectiveData.timelines[index].posts[indexa].isLike = !this.objectiveData.timelines[index].posts[indexa].isLike;
                    }
                    this.postLike(action, index);
                }
            }
        }).catch((err: any) => {
            console.log('err ', err)
        });
    }

    public postLike(data: any, index: number) {
        if (!this.isLogin()) {
        } else {
            this.postFacade.like(data.postData._id).then((res: any) => {
                if (res.isLike) {
                    if (data.postData._id === res.posts.id) {
                    }
                } else {
                    if (data.postData._id === res.posts.id) {
                    }
                }
            }).catch((err: any) => {
                console.log(err)
            });
        }
    }

    public TooltipClose($event) {

        setTimeout(() => {

            if ($event.toElement.className !== "ng-star-inserted") {
                this.popupService.close(null);
            }

        }, 400);
    }

    public effectFade(odd: boolean): string {
        if (odd) {
            return "fade-left";
        } else {
            return "fade-right";
        }
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
}
