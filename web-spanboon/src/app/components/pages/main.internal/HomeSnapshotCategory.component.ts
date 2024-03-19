/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { MainPageSlideFacade } from 'src/app/services/services';
import { environment } from "../../../../environments/environment";
const PAGE_NAME: string = 'category';

@Component({
  selector: 'home-page-category',
  templateUrl: './HomeSnapshotCategory.component.html',
})
export class HomeSnapshotCategory extends AbstractPage implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;

  public data: any;
  public apiBaseURL = environment.apiBaseURL;
  public isLoading: boolean = true;

  constructor(
    router: Router,
    authenManager: AuthenManager,
    dialog: MatDialog,
    private mainPageFacade: MainPageSlideFacade
  ) {

    super(null, authenManager, dialog, router);
  }

  public ngOnInit(): void {
    this._getCategorySnapshot();
    super.ngOnInit();
  }

  public ngOnDestroy(): void {
  }

  public clickToSnapshot(data) {
    const date = new Date(data);
    const day = ("0" + date.getUTCDate()).slice(-2);
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2);
    const year = date.getUTCFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    this.router.navigate(['/home'], { queryParams: { date: formattedDate, hidebar: true } });
  }

  private _getCategorySnapshot() {
    this.mainPageFacade.getContentCategory().then((res) => {
      if (res) {
        this.data = res;
        this.isLoading = false;
      }
    }).catch((err) => {
      if (err) { }
    });
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
}
