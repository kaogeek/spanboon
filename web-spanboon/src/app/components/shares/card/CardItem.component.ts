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
import { AuthenManager, AssetFacade } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { environment } from 'src/environments/environment';
import { DialogFulfill } from '../dialog/DialogFulfill.component';

const PAGE_NAME: string = 'carditem';

@Component({
    selector: 'card-item',
    templateUrl: './CardItem.component.html'
})
export class CardItem extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    private assetFacade: AssetFacade;

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

    @Input()
    private isDevelop: boolean;

    public apiBaseURL = environment.apiBaseURL;

    @ViewChild(SwiperComponent, { static: false }) componentRef: SwiperComponent;
    @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;

    @Output()
    public submit: EventEmitter<any> = new EventEmitter();
    public widthBtn: any;
    public heightBtn: any;
    public fontSize: any;
    public index: number;
    public item: any;

    constructor(authenManager: AuthenManager, assetFacade: AssetFacade, dialog: MatDialog, router: Router) {
        super(PAGE_NAME, authenManager, dialog, router);

        this.authenManager = authenManager;
        this.dialog = dialog;
        this.router = router;
        this.assetFacade = assetFacade;
    }

    async ngOnInit(): Promise<void> {
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
        if (!this.isLogin()) {
            this.showAlertLoginDialog(this.router.url);
        } else {
            for (let f of item) {
                f.isFrom = "FULFILL"
            }
            let itemArr: any
            itemArr = { fulfill: item, isFrom: 'FULFILL', isPage: true, currentPostItem: [] }
            let dialog = this.dialog.open(DialogFulfill, {
                width: 'auto',
                data: itemArr,
                disableClose: false,
            });

            dialog.afterClosed().subscribe((res) => {
            });
        }
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
            440: {
                slidesPerView: 1.6,
            },
            479: {
                slidesPerView: 1.5,
            }
            ,
            // 360: {
            //     slidesPerView: 1.6,
            // },
            // 320: {
            //     slidesPerView: 1.7,
            // },
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

    public clickObjective(data) {
        this.router.navigate([]).then(() => {
            window.open('/objective/' + data.id);
        });
    }

}
