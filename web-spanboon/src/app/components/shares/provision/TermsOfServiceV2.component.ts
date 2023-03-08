/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager, ObservableManager } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'terms-of-service-v2';

@Component({
    selector: 'terms-of-service-v2',
    templateUrl: './TermsOfServiceV2.component.html',
})

export class TermsOfServiceV2 extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    isPageDirty(): boolean {
        throw new Error('Method not implemented.');
    }
    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        throw new Error('Method not implemented.');
    }
    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        throw new Error('Method not implemented.');
    }

    constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, observManager: ObservableManager) {
        super(PAGE_NAME, authenManager, dialog, router);
    }

    public ngOnInit(): void {
    }
}


