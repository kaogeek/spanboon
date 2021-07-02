/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { AuthenManager, ObservableManager, ObjectiveFacade, HashTagFacade } from '../../../../services/services';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { AbstractPage } from '../../AbstractPage';
import AOS from 'aos';
import 'aos/dist/aos.css'; // You can also use <link> for styles
import './../../../../../assets/script/canvas';

const PAGE_NAME: string = 'objectivetimeline';

@Component({
    selector: 'objective-timeline',
    templateUrl: './ObjectiveTimeline.component.html'
})

export class ObjectiveTimeline extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public router: Router;
    public observManager: ObservableManager;
    public objectiveFacade: ObjectiveFacade;
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

    public apiBaseURL = environment.apiBaseURL;

    constructor(router: Router, authenManager: AuthenManager, objectiveFacade: ObjectiveFacade, hashTagFacade: HashTagFacade, observManager: ObservableManager,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.hashTagFacade = hashTagFacade;
        this.objectiveFacade = objectiveFacade;

    }

    public async ngOnInit(): Promise<void> {
        this.objectiveData = await this.objectiveFacade.getPageObjectiveTimeline('60a1e9c7030abb44081a8b6e');
        console.log('this.objectiveData', this.objectiveData);
        this._groupData();
        this.setData();

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
            offset: 120, // offset (in px) from the original trigger point
            delay: 0, // values from 0 to 3000, with step 50ms
            duration: 400, // values from 0 to 3000, with step 50ms
            easing: 'ease', // default easing for AOS animations
            once: false, // whether animation should happen only once - while scrolling down
            mirror: false, // whether elements should animate out while scrolling past them
            anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

        });

    }

    private _groupData(): void {
        let numloop: number = 0

        for (let item of this.objectiveData.timelines) {
            if (item.type === "OBJECTIVE_NEEDS") {
                for (let n of item.post.needs) {
                    let standardItem = item.post.standardItemCollection.find(({ _id }) => _id === n.standardItemId);
                    n.imageURL = standardItem.imageURL;
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
}
