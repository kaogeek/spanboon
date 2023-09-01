/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output, Inject } from '@angular/core';
import { MatAutocompleteTrigger, MatInput, MatDialog, DateAdapter, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager, AssetFacade, ProfileFacade, SeoService } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';

const DEFAULT_USER_ICON: string = '../../../../assets/img/profile.svg';
const REDIRECT_PATH: string = '/home';
const PAGE_NAME: string = 'account';

@Component({
    selector: 'setting-account',
    templateUrl: './SettingAccount.component.html'
})
export class SettingAccount extends AbstractPage implements OnInit {

    @ViewChild('displayName', { static: false }) private displayName: ElementRef;

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    private profileFacade: ProfileFacade;
    private seoService: SeoService;
    public selected: any = 'ทั่วไป';
    public isSend: boolean;
    public isCheck: boolean;
    public dataUser: any;
    public user: any;
    public bindingMember: boolean;

    minDate = new Date(1800, 0, 1);
    maxDate = new Date();
    startDate: Date;

    public links = [
        {
            link: "",
            icon: "settings",
            label: "ทั่วไป",
        },
        {
            link: "",
            icon: "security",
            label: "ผูกสมาชิกพรรค",
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
        dialog: MatDialog, profileFacade: ProfileFacade, @Inject(MAT_DIALOG_DATA) public data: any, dateAdapter: DateAdapter<Date>,
        seoService: SeoService) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.profileFacade = profileFacade;
        this.router = router;
        this.authenManager = authenManager;
        this.assetFacade = assetFacade;
        this.seoService = seoService;
    }

    public ngOnInit(): void {
        this.seoService.updateTitle("จัดการบัญชี - " + this.getUser());
    }
    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getUser() {
        let user = JSON.parse(localStorage.getItem('pageUser'));
        return user.displayName;
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

    public binding() {
        console.log("555555")
        this.profileFacade.updateMember(this.data.id).then((res) => {
            if (res) {
                console.log("res", res)
                let token = res;
                let url: string = 'https://auth.moveforwardparty.org/sso?';
                if (token !== undefined) {
                    url += `client_id=5&process_type=binding&token=${token}`;
                }
                console.log("url", url)
                window.open(url, '_blank');
            }
        }).catch((err) => {
            if (err) console.log("err", err);
        });
    }
}
