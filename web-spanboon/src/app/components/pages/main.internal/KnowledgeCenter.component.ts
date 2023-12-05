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

const PAGE_NAME: string = 'support';

@Component({
    selector: 'knowledge-center',
    templateUrl: './KnowledgeCenter.component.html',
})
export class KnowledgeCenter extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;
    protected observManager: ObservableManager;

    constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, observManager: ObservableManager) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.observManager = observManager;

    }

    public ngOnInit(): void {
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




