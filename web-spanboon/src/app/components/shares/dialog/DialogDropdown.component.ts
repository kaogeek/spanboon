/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AboutPageFacade, ObservableManager, PageFacade, ProfileFacade } from 'src/app/services/services';
import { DialogData } from '../../../models/models';
import { PROVINCE_LIST } from "../../../constants/Province";

@Component({
    selector: 'dialog-dropdown',
    templateUrl: './DialogDropdown.component.html'

})

export class DialogDropdown {

    protected observManager: ObservableManager;
    private pageFacade: PageFacade;
    private aboutPageFacade: AboutPageFacade;
    private profileFacade: ProfileFacade;
    private isbottom: boolean
    public selectedProvince: string;
    public selectedGroup: string;
    public pageId: string;
    public groups: any = [];
    public provinces;
    public type: any;

    constructor(public dialogRef: MatDialogRef<DialogDropdown>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData, aboutPageFacade: AboutPageFacade,
        pageFacade: PageFacade, profileFacade: ProfileFacade,
        observManager: ObservableManager) {
        this.aboutPageFacade = aboutPageFacade;
        this.pageFacade = pageFacade;
        this.profileFacade = profileFacade;
        this.observManager = observManager;
    }

    onConfirm(): void {
        let body;
        if (!!this.selectedProvince) {
            body = {
                province: this.selectedProvince
            }
        } else if (!!this.selectedGroup) {
            body = {
                group: this.selectedGroup
            }
        }
        if (!!this.selectedGroup || !!this.selectedProvince) {
            if (this.data.type === 'USER') {
                let data = {
                    province: this.selectedProvince ? this.selectedProvince : null
                }
                this.profileFacade.edit(this.pageId, data).then((res: any) => {
                    if (res) {
                        let pageUser = JSON.parse(localStorage.getItem('pageUser'));
                        pageUser.province = res.province;
                        localStorage.setItem('pageUser', JSON.stringify(pageUser));
                        this.isbottom = true
                        this.dialogRef.close(this.isbottom);
                    }
                }).catch((err) => {
                    if (err) {
                        console.log("err", err);
                    }
                });
            } else {
                this.pageFacade.updateProfilePage(this.pageId, body).then((res) => {
                    if (res.data) {
                        this.observManager.publish('page.about', res);
                        this.isbottom = true
                        this.dialogRef.close(this.isbottom);
                    }
                }).catch((err) => {
                    console.log('error ', err)
                });
            }
        }
    }

    onClose(): void {
        this.isbottom = false
        this.dialogRef.close(this.isbottom);

        if (this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined) {
            this.data.cancelClickedEvent.emit(false);
        }
    }

    public ngOnInit(): void {
        this.groups = this.data.group;
        this.pageId = this.data.pageId;
        this.getProvince();
    }

    public selectType($event, text: string) {
        if (text === 'province') {
            this.selectedProvince = $event.value;
        } else if (text === 'group') {
            this.selectedGroup = $event.value;
        }
    }

    public getProvince() {
        this.pageFacade.getProvince().then((res) => {
            if (res) {
                this.provinces = res;
            }
        })
    }
}
