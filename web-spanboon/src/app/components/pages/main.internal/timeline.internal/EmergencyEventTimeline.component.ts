/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, EventEmitter, Output, ViewContainerRef } from '@angular/core';
import { AuthenManager, ObservableManager, EmergencyEventFacade, HashTagFacade } from '../../../../services/services';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { TooltipProfile } from '../../../shares/tooltip/TooltipProfile.component';
import { AbstractPage } from '../../AbstractPage';
import { MenuContextualService } from 'src/app/services/services';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import './../../../../../assets/script/canvas';

const PAGE_NAME: string = 'emergencyeventtimeline';

@Component({
    selector: 'emergency-event-timeline',
    templateUrl: './EmergencyEventTimeline.component.html'
})

export class EmergencyEventTimeline extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public router: Router;
    public observManager: ObservableManager;
    public emergencyEventFacade: EmergencyEventFacade;
    public hashTagFacade: HashTagFacade;

    // test

    @Input()
    public isClose: boolean = false;
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

    public objectiveId: string;

    public apiBaseURL = environment.apiBaseURL;
    private routeActivated: ActivatedRoute;

    constructor(router: Router, authenManager: AuthenManager, private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef, emergencyEventFacade: EmergencyEventFacade, hashTagFacade: HashTagFacade, observManager: ObservableManager, routeActivated: ActivatedRoute,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.hashTagFacade = hashTagFacade;
        this.routeActivated = routeActivated;
        this.emergencyEventFacade = emergencyEventFacade;

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
            once: false, // whether animation should happen only once - while scrolling down
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

        this.objectiveData = await this.emergencyEventFacade.getEmergencyTimeline(this.objectiveId);
        console.log('this.objectiveData', this.objectiveData);
        this.objectiveData.page;
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
        this.pageObjective = this.objectiveData.emergencyEvent;
        this.pageOwner = this.objectiveData.page;

    }

    public clickDataSearch(post: any): void {
        this.router.navigate([]).then(() => {
            window.open('/post/' + post.post._id, '_blank');
        });
    }

    public followObjective() {
        // this.objectiveFacade.followObjective(this.objectiveId);
        this.isFollow = !this.isFollow;
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public Tooltip(origin: any, data) {
        console.log('data', data)
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
