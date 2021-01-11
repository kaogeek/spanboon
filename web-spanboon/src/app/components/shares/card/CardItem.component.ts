/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { DialogFulfill } from '../dialog/DialogFulfill.component';

const PAGE_NAME: string = 'carditem';

@Component({
    selector: 'card-item',
    templateUrl: './CardItem.component.html'
})
export class CardItem extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public itemData: any;
    @Input()
    public pageName: any;
    @Input()
    public label: string;
    @Input()
    public statusLable: string;
    @Input()
    public isPageName: boolean = false;
    @Input()
    public isObjectList: boolean = false;
    @Input()
    public isDoIng: boolean = false;
    @Input()
    public isTabletDoIng: boolean = false;
    @Input()
    public isTabletObjectList: boolean = false;
    @Input()
    public isEdit: boolean = true;
    @Input()
    public isButton: boolean = false;
    @Input()
    public isShowWidthButton: number;

    @ViewChild(SwiperComponent, { static: false }) componentRef: SwiperComponent;
    @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;

    @Output()
    public submit: EventEmitter<any> = new EventEmitter();
    public widthBtn: any;
    public heightBtn: any;
    public fontSize: any;
    public index: number;
    public item: any;

    constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.authenManager = authenManager;
        this.dialog = dialog;
        this.router = router;
    }

    ngOnInit(): void {
        this.checkResp();
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
      

    public showDialogEdit() {
        this.submit.emit();
    }
    public fulfillNeeds(item: any, index: number) {
        let dialog = this.dialog.open(DialogFulfill, {
            width: 'auto',
            data: this.itemData,
            disableClose: false,
        });

        dialog.afterClosed().subscribe((res) => {
        });
    }

    public configSlider1: SwiperConfigInterface = {
        direction: 'horizontal',
        slidesPerView: 4,
        spaceBetween: 10,
        keyboard: false,
        mousewheel: false,
        scrollbar: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            1280: {
                slidesPerView: 4,
            },
            768: {
                slidesPerView: 3,
            },
            479: {
                slidesPerView: 2,
            },
        },
    }

    public configSlider2: SwiperConfigInterface = {
        direction: 'horizontal',
        slidesPerView: 5,
        spaceBetween: 10,
        keyboard: false,
        mousewheel: false,
        scrollbar: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            900: {
                slidesPerView: 4,
            },
            769: {
                slidesPerView: 3,
            },
            480: {
                slidesPerView: 1.6,
            },
        },
    }

    public checkResp() {
        if (window.innerWidth <= this.isShowWidthButton) {
            this.isButton = true;
        } else {
            this.isButton = false;
        }
    }

    public onResize($event) {
        this.checkResp();
    }
}
