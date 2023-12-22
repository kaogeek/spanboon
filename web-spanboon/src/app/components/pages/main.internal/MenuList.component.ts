/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter, Output, HostListener } from '@angular/core';
import { MatAutocompleteTrigger, MatInput, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AbstractPage } from '../AbstractPage';
import { ObservableManager } from 'src/app/services/ObservableManager.service';
import { AssetFacade } from 'src/app/services/facade/AssetFacade.service';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { HttpClient } from '@angular/common/http';

const PAGE_NAME: string = 'menu';
const REFRESH_DATA: string = 'refresh_page';

@Component({
    selector: 'btn-menu-list',
    templateUrl: './MenuList.component.html'
})
export class MenuList extends AbstractPage implements OnInit {

    public router: Router;
    public menuList: any[] = [];

    constructor(router: Router,
        authenManager: AuthenManager,
        private http: HttpClient,
        dialog: MatDialog,
        private dialogRef: MatDialog
    ) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
    }

    public ngOnInit(): void {
        const urlSocial: string = '/assets/data/menu-list.json';
        this.http.get(urlSocial).subscribe((res: any) => {
            if (res) {
                this.menuList = res;
            }
        });
    }

    public ngOnDestroy(): void {
    }

    public clickMenu(): void {
        this.dialogRef.closeAll();
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
