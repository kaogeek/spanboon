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
        this.setData();
    }

    public setData(): void {
        this.pageObjective = this.objectiveData.pageObjective;
        this.pageOwner = this.objectiveData.page;
        console.log('this.objectiveData', this.objectiveData);
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
