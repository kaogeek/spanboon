/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { OnInit, Component, Input, ViewChild, EventEmitter } from '@angular/core';
import { PageUserInfo } from '../../services/PageUserInfo.service';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDrawer, MatDrawerContainer } from '@angular/material';
import { PageFacade, AssetFacade, AuthenManager, ObservableManager, UserAccessFacade } from '../../services/services';
import { SearchFilter } from '../../models/models';
import { AbstractPage } from '../pages/AbstractPage';
import { Router } from '@angular/router';
import { DialogCreatePage } from './dialog/DialogCreatePage.component';
import { DialogAlert } from './dialog/DialogAlert.component';

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
    selector: 'btn-list-page',
    templateUrl: './ManagePage.component.html',
})

export class ManagePage extends AbstractPage implements OnInit {

    @Input()
    protected class: string | string[];
    @Input()
    protected link: string;
    @Input()
    protected pageUser: any;

    @ViewChild("drawer", { static: true }) public drawer: MatDrawer;

    private pageUserInfo: PageUserInfo;
    private pageFacade: PageFacade;
    private assetFacade: AssetFacade;
    private userAccessFacade: UserAccessFacade;
    protected observManager: ObservableManager;
    public dialog: MatDialog;
    public resListPage: any;
    // public ownerUser: string;

    constructor(router: Router, pageUserInfo: PageUserInfo, authenManager: AuthenManager, dialog: MatDialog, pageFacade: PageFacade, assetFacade: AssetFacade,
        observManager: ObservableManager, userAccessFacade: UserAccessFacade) {
        super(null, authenManager, dialog, router);
        this.pageUserInfo = pageUserInfo;
        this.pageFacade = pageFacade;
        this.assetFacade = assetFacade
        this.observManager = observManager;
        this.userAccessFacade = userAccessFacade;
        this.dialog = dialog;
        this.observManager.subscribe('authen.createPage', (data: any) => {
            this.searchAllPage();
        });
        this.observManager.subscribe('authen.check', (data: any) => {
            this.searchAllPage();
        });
    }
    public isLogin(): boolean {
        let user = this.authenManager.getCurrentUser();
        return user !== undefined && user !== null;
    }

    public ngOnInit(): void {
        this.searchAllPage();
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

    isActive(): boolean {
        let page = document.getElementsByClassName("list-page");
        return page && page.length > 0;
    }

    public createPage() {
        this.drawer.toggle();
        // const dialogRef = this.dialog.open(DialogCreatePage, {
        //     autoFocus: false
        // });
        // dialogRef.afterClosed().subscribe(res => {
        //     console.log(res)
        // });
        this.clickSystemDevelopment();
    }

    public clickSystemDevelopment(): void {
        let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
                text: "ระบบอยู่ในระหว่างการพัฒนา",
                bottomText2: "ตกลง",
                bottomColorText2: "black",
                btDisplay1: "none"
            }
        });
        dialog.afterClosed().subscribe((res) => {
        });
    }

    public searchAllPage() {
        this.userAccessFacade.getPageAccess().then((res: any) => {
            if (res.length > 0) {
                for (let data of res) {
                    if (data.page && data.page.imageURL !== '' && data.page.imageURL !== null && data.page.imageURL !== undefined) {
                        this.assetFacade.getPathFile(data.page.imageURL).then((image: any) => {
                            if (image.status === 1) {
                                if (!this.validBase64Image(image.data)) {
                                    data.page.imageURL = null
                                } else {
                                    data.page.imageURL = image.data
                                }
                                setTimeout(() => {
                                    this.resListPage = res
                                }, 1000);
                            }
                        }).catch((err: any) => {
                            if (err.error.message === "Unable got Asset") {
                                data.page.imageURL = ''
                                this.resListPage = res
                            }
                        })
                    } else {
                        this.resListPage = res
                    }
                }
            }
        }).catch((err: any) => {
            console.log(err)
        });
    }

    private validBase64Image(base64Image: string): boolean {
        const regex = /^data:image\/(?:gif|png|jpeg)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;
        return base64Image && regex.test(base64Image) ? true : false;
    }

    public nextPage(item: any) {
        if (item.page.pageUsername && item.page.pageUsername !== '' && item.page.pageUsername !== null && item.page.pageUsername !== undefined) {
            this.router.navigate(['/page/', item.page.pageUsername]);
        } else {
            this.router.navigate(['/page/', item.page.id]);
        }
    }

    public clickSetting(item: any) {
        if (item.page.pageUsername && item.page.pageUsername !== '' && item.page.pageUsername !== null && item.page.pageUsername !== undefined) {
            this.router.navigate(['/page/' + item.page.pageUsername + '/settings']);
        } else {
            this.router.navigate(['/page/' + item.page.id + '/settings']);
        }
    }

}
