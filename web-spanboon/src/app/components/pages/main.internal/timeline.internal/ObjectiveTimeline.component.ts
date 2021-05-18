/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { AuthenManager, ObservableManager, ObjectiveFacade } from '../../../../services/services';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AbstractPage } from '../../AbstractPage';
import './../../../../../assets/script/canvas';

const PAGE_NAME: string = 'objectivetimeline';

@Component({
    selector: 'objective-timeline',
    templateUrl: './ObjectiveTimeline.component.html'
})
export class ObjectiveTimeline extends AbstractPage implements OnInit {

    public router: Router;
    public observManager: ObservableManager;
    public objectiveFacade: ObjectiveFacade;

    @Output()
    public logout: EventEmitter<any> = new EventEmitter();

    public userImage: any;
    public ObjectiveData: any;

    constructor(router: Router, authenManager: AuthenManager, objectiveFacade: ObjectiveFacade, observManager: ObservableManager,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.objectiveFacade = objectiveFacade;
    }

    public ngOnInit(): void {
        this.objectiveFacade.getPageObjectiveTimeline('60a1e9c7030abb44081a8b6e').then((Objective) => {
            console.log('Objective', Objective);
            this.ObjectiveData = Objective;
        }).catch((err) => {
        });
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
