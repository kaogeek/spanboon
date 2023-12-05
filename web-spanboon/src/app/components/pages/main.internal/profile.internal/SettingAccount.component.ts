/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MatDialog, DateAdapter, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { DialogProfile } from 'src/app/components/shares/dialog/DialogProfile.component';
import { AuthenManager, ObservableManager, AssetFacade, ProfileFacade, SeoService } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { environment } from '../../../../../environments/environment';
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
    public isMember: boolean = false;

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
            label: "การเชื่อมต่อ",
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

        const navigation = this.router.getCurrentNavigation();
        const state = navigation.extras.state;
        if (state) {
            this.selected = state.focus;
            this.isMember = true;
        } else {
            this.isMember = this.authenManager.getUserMember();
        }
    }

    public ngOnInit(): void {
        this.seoService.updateTitle("จัดการบัญชี - " + this.getUser());
        this.dataUser = localStorage.getItem('pageUser');
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
        let user: any = JSON.parse(localStorage.getItem('pageUser'));
        this.profileFacade.updateMember(this.data.id !== undefined ? this.data.id : user.id, true).then((res) => {
            let token = res;
            let url: string = `${environment.memberShip.bindingBaseURL}sso?`;
            if (token !== undefined) {
                url += `client_id=${environment.memberShip.clientId}`;
                url += `&process_type=${environment.memberShip.grantType}`;
                url += `&token=${token}`;
            }
            localStorage.setItem('methodMFP', 'binding');
            window.open(url, '_self').focus();
            window.close();
        }).catch((err) => {
            if (err) console.log("err", err);
        });
    }

    public unbind() {
        let user: any = JSON.parse(localStorage.getItem('pageUser'));
        let dialog = this.dialog.open(DialogProfile, {
            disableClose: false,
            data: {
                userId: this.data.id,
                user: user,
            }
        });
        dialog.afterClosed().subscribe((res) => {
            if (res === false) {
                this.isMember = false;
            }
        });
    }

    public test() {
        this.router.navigateByUrl('/.well-known/apple-app-site-association');
    }
}
