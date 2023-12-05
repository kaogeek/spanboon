/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager, BindingMemberFacade, CheckMergeUserFacade, ProfileFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { environment } from '../../../../environments/environment';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';

const PAGE_NAME: string = 'mobile';

@Component({
  selector: 'mobile-process',
  templateUrl: './MobileProcessing.component.html',
})
export class MobileProcessing extends AbstractPageImageLoader implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public params: any;
  public route: ActivatedRoute;
  public checkMergeUserFacade: CheckMergeUserFacade;
  public bindingMemberFacade: BindingMemberFacade;
  public profileFacade: ProfileFacade;

  public data: any;
  public dataId: any;
  public isNotAccess: any;
  public linkPost: any;
  public mainPostLink: string;
  public decodedData: any;
  public redirection: string;

  public isLoading: boolean = true;
  constructor(
    router: Router,
    dialog: MatDialog,
    authenManager: AuthenManager,
    checkMergeUserFacade: CheckMergeUserFacade,
    bindingMemberFacade: BindingMemberFacade,
    profileFacade: ProfileFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.checkMergeUserFacade = checkMergeUserFacade;
    this.bindingMemberFacade = bindingMemberFacade;
    this.profileFacade = profileFacade;
  }

  public ngOnInit(): void {
    this._engagementMember();
  }

  public ngOnDestroy(): void {
  }

  public _engagementMember(text?: any): void {
    let user: any = JSON.parse(localStorage.getItem('pageUser'));
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: text ? text : 'กดไลค์สำหรับสมาชิกพรรคเท่านั้น',
        bottomText2: 'ตกลง',
        bottomColorText2: "black",
        btDisplay1: "none",
        options: 'mfp',
        type: 'engage',
        userId: user.id,
      },
    });
    dialog.afterClosed().subscribe((res) => {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigateByUrl("/home");
      }
    });
  }

  public getImageSelector(): string[] {
    throw new Error('Method not implemented.');
  }
  public onSelectorImageElementLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadOK(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadError(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  isPageDirty(): boolean {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
}