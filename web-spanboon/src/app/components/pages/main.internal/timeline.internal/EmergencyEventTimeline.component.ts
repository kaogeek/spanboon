/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';

const PAGE_NAME: string = 'emergencyeventtimeline';

@Component({
    selector: 'emergency-event-timeline',
    templateUrl: './EmergencyEventTimeline.component.html'
})
export class EmergencyEventTimeline extends AbstractPage implements OnInit {
    
    public static readonly PAGE_NAME: string = PAGE_NAME;

    public router: Router;
    public observManager: ObservableManager;

    @Output()
    public logout: EventEmitter<any> = new EventEmitter();

    public userImage: any;

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
    }

    public ngOnInit(): void {
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
