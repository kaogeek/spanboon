/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core'; 
import { MatAutocompleteTrigger, MatInput, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager, AssetFacade } from '../../../../services/services'; 
import { AbstractPage } from '../../AbstractPage'; 

const DEFAULT_USER_ICON: string = '../../../../assets/img/profile.svg';
const REDIRECT_PATH: string = '/home';
const PAGE_NAME: string = 'account';

@Component({
    selector: 'setting-account',
    templateUrl: './SettingAccount.component.html'
})
export class SettingAccount extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade; 
    public selected: any;

    public links = [
        {
            link: "",
            icon: "settings",
            label: "ทั่วไป",
        },
        {
            link: "",
            icon: "security",
            label: "ความปลอดภัยและล็อคอิน",
        }, 
        {
            link: "",
            icon: "notifications_none",
            label: "การแจ้งเตือน",
        }, 
        {
            link: "",
            icon: "public",
            label: "โพสต์",
        }, 
    ];

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.assetFacade = assetFacade; 
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

    public selecedInformation(link: any) {
        this.selected = link.label; 
    }
}
