/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteTrigger, MatInput, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager, AssetFacade } from '../../../../services/services';
import { MESSAGE } from '../../../../AlertMessage';
import { AbstractPage } from '../../AbstractPage';
import { ValidBase64ImageUtil } from '../../../../utils/ValidBase64ImageUtil';

const DEFAULT_USER_ICON: string = '../../../../assets/img/profile.svg';
const REDIRECT_PATH: string = '/home';
const PAGE_NAME: string = 'menu';

@Component({
    selector: 'btn-menu-profile',
    templateUrl: './MenuProfile.component.html'
})
export class MenuProfile extends AbstractPage implements OnInit {

    public router: Router;
    private observManager: ObservableManager;
    private assetFacade: AssetFacade;
    public isActive: boolean;
    public isSelect: boolean;
    public profileUser: any;

    @Output()
    public logout: EventEmitter<any> = new EventEmitter();

    public userImage: any;

    constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager, assetFacade: AssetFacade,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.observManager = observManager;
        this.assetFacade = assetFacade;
        this.userImage = {}

        this.observManager.subscribe('authen.check', (data: any) => { 
            this.reloadUserImage();
        });
        this.observManager.subscribe('authen.image', (data: any) => {
            this.reloadUserImage();
        });
        this.observManager.subscribe('authen.logout', (data: any) => {
            this.checkSessionTimeOut();
        });
        this.observManager.subscribe('authen.profileUser', (data: any) => {
            // this.getProfileImage(data);
            this.reloadUserImage();
        });
    }

    public ngOnInit(): void {
        this.reloadUserImage();
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

    public getProfileImage(data: any) {
        let userCloneData = JSON.parse(JSON.stringify(data)); 
        if (data !== undefined && data.imageURL && data.imageURL !== '') {
            this.assetFacade.getPathFile(data.imageURL).then((res: any) => {
                if (res.status === 1) {
                    this.userImage = userCloneData;
                    if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                        this.userImage.imageURL = res.data
                    } else {
                        this.userImage.imageURL = null
                    }

                }
            }).catch((err: any) => {
                console.log(err)
                if (err.error.message === "Unable got Asset") {
                    this.userImage.imageURL = '';
                }
            })
        } else {
            this.userImage = data;
        }
    }

    public reloadUserImage() {
        let user = this.getCurrentUser(); 
        if (user !== undefined && user !== null) {
            this.getProfileImage(user);
        }
    }

    public clickLogout() {
        let body = {
            user: this.getCurrentUserId()
        }
        const confirmEventEmitter = new EventEmitter<any>();
        confirmEventEmitter.subscribe(() => {
            this.authenManager.logout(body).then((res: any) => {
                if (res.message === "Successfully Logout") {
                    this.authenManager.clearStorage();
                    this.logout.emit(true);
                    if (REDIRECT_PATH === '/home') {
                        window.location.reload();
                    } else {
                        this.router.navigateByUrl(REDIRECT_PATH);
                    }
                }
            }).catch((err: any) => {
                alert(err.error.message);
            })
        });
        this.showDialogWithOptions({
            text: "คุณต้องการออกจากระบบ",
            bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            confirmClickedEvent: confirmEventEmitter,
        });
    }

    public checkSessionTimeOut() {
        let body = {
            user: this.getCurrentUserId()
        }
        this.authenManager.clearStorage();
        this.authenManager.logout(body).then(() => {
            this.router.navigateByUrl(REDIRECT_PATH);
        }).catch((err) => {
            alert(err.error.message);
        });
    }

    public isLogin(): boolean {
        let user = this.authenManager.getCurrentUser();
        return user !== undefined && user !== null;
    }

    public isRegister(): boolean {
        return this.router.url.includes("register") || this.router.url.includes("login");
    }

    public getLinkProfile() {
        this.isActive = true;
        this.router.navigateByUrl("/profile/" + this.getCurrentUserId());

    }

    public settingProfile() {
        this.showAlertDevelopDialog();
    }

    public notificationProfile() {
        this.showAlertDevelopDialog();
    }

    onMouseEnterItem(e) {
        // do something when input is focused
        this.isSelect = true;
    }

    onMouseLeaveItem(e) {
        // do something when input is focused
        this.isSelect = false;
        event.stopPropagation();
    }

    public focutOut() {
        event.stopPropagation();
        return;
    }
}
