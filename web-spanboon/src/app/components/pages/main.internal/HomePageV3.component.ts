/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthenManager } from '../../../services/services';
import { AbstractPage } from '../AbstractPage';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;

const PAGE_NAME: string = 'homeV3';

@Component({
    selector: 'home-page-v3',
    templateUrl: './HomePageV3.component.html',
})
export class HomePageV3 extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    constructor(
        public router: Router,
        public authenManager: AuthenManager,
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute
    ) {
        super(null, authenManager, dialog, router);
    }

    public ngOnInit(): void {

    }

    public ngAfterViewInit(): void {

    }

    public ngOnDestroy(): void {

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
