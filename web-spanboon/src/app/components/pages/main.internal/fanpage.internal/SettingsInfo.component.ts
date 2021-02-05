/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { EventEmitter, Input, OnInit } from '@angular/core';
import { Component, ElementRef, ViewChild } from "@angular/core";
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { AuthenManager, UserAccessFacade, AssetFacade, ObservableManager, PageFacade } from 'src/app/services/services';
import { AbstractPage } from '../../AbstractPage';
import { AboutPage } from './AboutPage.component';
import { SettingsAdminRoles } from './SettingsAdminRoles.component';

const PAGE_NAME: string = 'info';

declare var $: any;
@Component({
    selector: 'settings-info',
    templateUrl: './SettingsInfo.component.html',
})
export class SettingsInfo extends AbstractPage implements OnInit {
    public static readonly PAGE_NAME: string = PAGE_NAME;

    @ViewChild('aboutPage', { static : false}) aboutPage : AboutPage;
    @ViewChild('adminRole', { static : false}) adminRole : SettingsAdminRoles;

    @Input()
    public selectedTab: any; 
    @Input()
    public data: any;  
    @Input()
    public bindingSocialTwitter: any; 
    @Input()
    public dirtyCancelEvent: EventEmitter<any>;
    @Input()
    public dirtyConfirmEvent: EventEmitter<any>;
 
    protected observManager: ObservableManager;
    private routeActivated: ActivatedRoute; 

    public pageId: string;
    public phone: any;
    public resDataPage: any;
    public cloneData: any;
    public uuid: boolean;
    public selected: any;

    public links = [
        {
            link: "",
            icon: "edit",
            label: "ข้อมูลเพจ",
        },
        {
            link: "",
            icon: "person",
            label: "บทบาทในเพจ",
        }, 
    ]; 

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router,  
        observManager: ObservableManager, routeActivated: ActivatedRoute, ) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.dialog = dialog 
        this.observManager = observManager;
        this.routeActivated = routeActivated;
        this.dirtyCancelEvent = new EventEmitter();  

        this.routeActivated.params.subscribe(async (params) => {
            this.pageId = params['id']; 
        });
        this.selected = this.links[0].label; 
    }

    public ngOnInit(): void {   
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    isPageDirty(): boolean {
        // throw new Error('Method not implemented.');
        return (this.aboutPage && this.aboutPage.isPageDirty() || this.adminRole && this.adminRole.isPageDirty());
    }
    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return this.dirtyConfirmEvent;
    }
    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        // throw new Error('Method not implemented.');
        return this.dirtyCancelEvent;
    }  

}
