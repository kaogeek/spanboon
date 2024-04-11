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
import { AuthenManager, ObservableManager, AssetFacade, ProfileFacade, SeoService, PointEventFacade } from '../../../../services/services';
import { AbstractPage } from '../../AbstractPage';
import { environment } from '../../../../../environments/environment';

const PAGE_NAME: string = 'account';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'setting-account',
    templateUrl: './SettingAccount.component.html'
})
export class SettingAccount extends AbstractPage implements OnInit {

    @ViewChild('displayName', { static: false }) private displayName: ElementRef;

    public static readonly PAGE_NAME: string = PAGE_NAME;

    public apiBaseURL = environment.apiBaseURL;
    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    private profileFacade: ProfileFacade;
    private pointFacade: PointEventFacade;
    private seoService: SeoService;
    public selected: any = 'ทั่วไป';
    public isSend: boolean;
    public isCheck: boolean;
    public dataUser: any;
    public user: any;
    public pointEvent: any;
    public accumulate: any = undefined;
    public coupon: any = undefined;
    public ranking: any = undefined;
    public bindingMember: boolean;
    public isMember: boolean = false;
    public isMemberShip: boolean = false;
    public pointLogo: string = '../../../../../assets/img/icons/pointpage/Point_mini_logo.svg';

    minDate = new Date(1800, 0, 1);
    maxDate = new Date();
    startDate: Date;

    public links = [
        {
            link: "",
            icon: "settings",
            label: "ทั่วไป",
            id: "settings"
        },
        {
            link: "",
            icon: "security",
            label: "การเชื่อมต่อ",
            id: "connect"
        },
        {
            link: "",
            icon: "",
            image: "../../../../../assets/img/icons/pointpage/Point_mini_logo.svg",
            label: "คะแนนของฉัน",
            id: "myPoint"
        },
        {
            link: "",
            icon: "",
            image: "../../../../../assets/img/icons/pointpage/ticket.svg",
            label: "โค้ดของฉัน",
            id: "coupon"
        },
        {
            link: "",
            icon: "",
            image: "../../../../../assets/img/icons/pointpage/statistic-mfp.svg",
            label: "อันดับของฉัน",
            id: "ranking"
        },
    ];

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade,
        dialog: MatDialog, profileFacade: ProfileFacade, @Inject(MAT_DIALOG_DATA) public data: any, dateAdapter: DateAdapter<Date>,
        seoService: SeoService, pointFacade: PointEventFacade, private dialogRef: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.profileFacade = profileFacade;
        this.router = router;
        this.authenManager = authenManager;
        this.pointFacade = pointFacade;
        this.assetFacade = assetFacade;
        this.seoService = seoService;

        this.isMemberShip = this.isLogin() ? this.authenManager.getUserMember() : false;

        const navigation = this.router.getCurrentNavigation();
        const state = navigation.extras.state;

        if (state) {
            this.selected = state.focus;
            this.isMember = true;
        } else {
            this.isMember = this.authenManager.getUserMember();
        }

        this._checkParam();
    }

    public ngOnInit(): void {
        this.seoService.updateTitle("จัดการบัญชี - " + this.getUser());
        this.dataUser = localStorage.getItem('pageUser');
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    private _checkParam() {
        let url = this.router.url.split('/');
        let param = url[url.length - 1].split('=')[1];
        if (!!param) {
            let label;
            if (param === 'ranking') label = 'อันดับของฉัน';
            if (param === 'coupon') label = 'โค้ดของฉัน';
            if (param === 'myPoint') label = 'คะแนนของฉัน';
            if (param === 'settings') label = 'ทั่วไป';
            if (param === 'connect') label = 'การเชื่อมต่อ';
            this.selecedInformation(param, label);
            this.dialogRef.closeAll();
        }
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

    public selecedInformation(link: any, label?: string) {
        if (!!label) {
            if (!this.isMemberShip) {
                this.selected = "ทั่วไป";
                this.router.navigate(['', 'account', 'settings'], { queryParams: { menu: 'settings' } });
            } else {
                this.selected = label;
            }
        } else {
            this.selected = link.label;
            this.router.navigate(['', 'account', 'settings'], { queryParams: { menu: link['id'] } });
        }
        if (link === "myPoint" || link.id === "myPoint") this._getAccumulate();
        if (link === "coupon" || link.id === "coupon") this._getCoupon();
        if (link === "ranking" || link.id === "ranking") this._getRanking();
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

    private _getCoupon() {
        if (this.coupon === undefined && this.isMemberShip) {
            this.pointFacade.coupon(SEARCH_LIMIT, SEARCH_OFFSET).then((res) => {
                if (res) {
                    this.coupon = res.userCoupon;
                }
            });
        }
    }

    private _getAccumulate() {
        if (this.accumulate === undefined && this.isMemberShip) {
            this.pointFacade.accumulate(SEARCH_LIMIT, SEARCH_OFFSET).then((res) => {
                if (res) {
                    this.accumulate = res;
                }
            });
        }
    }

    private _getRanking() {
        if (this.ranking === undefined && this.isMemberShip) {
            this.pointFacade.sortAccumulate(SEARCH_LIMIT, SEARCH_OFFSET).then((res) => {
                if (res) {
                    this.ranking = res.sortAccumulatePoint;
                }
            });
        }
    }

    public clickDialog() {
        this.showAlertDialog('ท่านสามารถใช้งานคูปองบนแอปพลิเคชั่นทูเดย์เท่านั้น');
    }

    public checkActiveCoupon(date: string): boolean {
        if (!date) {
            return true;
        }
        const todayDate = new Date();
        const activeDate = new Date(date);
        return todayDate <= activeDate ? true : false;
    }
}
