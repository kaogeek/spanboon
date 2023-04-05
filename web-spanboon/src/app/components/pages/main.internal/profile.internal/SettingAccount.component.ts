/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { MatAutocompleteTrigger, MatInput, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager, AssetFacade, ProfileFacade } from '../../../../services/services';
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
    private profileFacade: ProfileFacade;
    public selected: any;
    public isSend: boolean;
    public user: any;

    public links = [
        {
            link: "",
            icon: "settings",
            label: this.PLATFORM_GENERAL_TEXT,
        },
        // {
        //     link: "",
        //     icon: "security",
        //     label: "ความปลอดภัยและล็อคอิน",
        // },
        // {
        //     link: "",
        //     icon: "notifications_none",
        //     label: "การแจ้งเตือน",
        // },
        // {
        //     link: "",
        //     icon: "public",
        //     label: "โพสต์",
        // },
    ];

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade,
        dialog: MatDialog, profileFacade: ProfileFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.assetFacade = assetFacade;
        this.profileFacade = profileFacade;

        this.observManager.subscribe('setting.account', (res: any) => {
            if (res) {
                this.user = res.data;
                if (!!this.user) {
                    this.checkSendEmail();
                }
            }
        });
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

    public checkSendEmail() {
        if (!!this.user) {
            if (this.user.sendEmail === true) {
                this.isSend = true;
                return true;
            } else {
                this.isSend = false;
                return false;
            }
        }
    }

    public selecedInformation(link: any) {
        this.selected = link.label;
    }

    public emailNoti($event) {
        this.profileFacade.setEmailPushNotification($event.checked).then((res) => {
            if (res) {
            }
        })
    }
}
