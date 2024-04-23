import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthenManager, PointEventFacade, SeoService } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { environment } from "../../../../environments/environment";
import { AbstractPage } from '../AbstractPage';
import { Subject } from 'rxjs';
import { DialogPoint } from '../../components';

const PAGE_NAME: string = 'point';
const PAGE_TITLE: string = 'ก้าวไกลพอยท์';

@Component({
    selector: 'point-page',
    templateUrl: './PointPage.component.html',
})
export class PointPage extends AbstractPage implements OnInit {

    private destroy = new Subject<void>()
    public static readonly PAGE_NAME: string = PAGE_NAME;

    public apiBaseURL = environment.apiBaseURL;
    private pointFacade: PointEventFacade;
    public activeMenu: string = '';
    public activeUrl: any;
    public content: any;
    public ranking: any;
    public isCategory: boolean = false;
    public isRank: boolean = false;
    public isMemberShip: boolean = false;
    public product: any;

    constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager,
        private activeRoute: ActivatedRoute,
        private seoService: SeoService,
        pointFacade: PointEventFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.pointFacade = pointFacade;

        this.seoService.updateTitle(PAGE_TITLE);
        this.isMemberShip = this.isLogin() ? this.authenManager.getUserMember() : false;
    }

    public ngOnInit(): void {
        this._getPointEvent();
    }

    public ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
    }

    private _getPointEvent() {
        this.pointFacade.search().then((res) => {
            if (res) {
                this.content = res;
            }
        });
    }

    public clickToSetting(menu) {
        let navigationExtras: NavigationExtras = {
            queryParams: { menu: menu }
        }
        this.router.navigate(['/account/settings'], navigationExtras);
    }

    public calculatePercentage(max: number, value: number): number {
        const remaining = max - value;
        const percentage = (remaining / max) * 100;

        return Math.max(0, Math.min(100, percentage));
    }

    public clickDialogPoint(data, type, isCategory?: boolean) {
        if (!isCategory) {
            let dialog = this.dialog.open(DialogPoint, {
                backdropClass: 'backdrop-overlay-point',
                panelClass: 'panel-backgroud-point',
                hasBackdrop: false,
                disableClose: true,
                autoFocus: false,
                data: {
                    point: data,
                    type: type
                }
            });
            // dialog.afterClosed().subscribe((res) => {
            //     if (res) {
            //     }
            // });
        } else {
            this.pointFacade.getCategoryProduct(data._id).then((res) => {
                if (res) {
                    this.isCategory = true;
                    this.product = {
                        data: res.categoryProducts,
                        category: data
                    };
                }
            }).catch((err) => {
                if (err) { }
            });
        }
    }

    public clickBack() {
        this.isCategory = false;
        this.isRank = false;
    }

    public clickRanking() {
        if (this.ranking === undefined) {
            this.pointFacade.sortAccumulate(50, 0).then((res) => {
                if (res) {
                    this.ranking = res.sortAccumulatePoint;
                    this.isRank = true;
                }
            });
        } else {
            this.isRank = true;
        }
    }

    isPageDirty(): boolean {
        return false;
    }

    onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        return;
    }

    onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        return;
    }
}




