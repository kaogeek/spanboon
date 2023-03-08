/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthenManager, ObservableManager } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'tos';

@Component({
    selector: 'terms-of-service-page',
    templateUrl: './TermsOfServicePage.component.html',
    host: {
        class: 'terms-of-service-page'
    }
})
export class TermsOfServicePage extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;
    protected observManager: ObservableManager;
    public tosParam: string;

    constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, observManager: ObservableManager) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.observManager = observManager;

    }

    public ngOnInit(): void {
        this.tosParam = this.authenManager.getTos();
    }

    isPageDirty(): boolean {
        return false;
    }

    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        return;
    }

    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        return;
    }
}




