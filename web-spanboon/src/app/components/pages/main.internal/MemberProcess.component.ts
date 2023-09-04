/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager, BindingMemberFacade, CheckMergeUserFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';

const PAGE_NAME: string = 'process';

@Component({
  selector: 'member-process',
  templateUrl: './MemberProcess.component.html',
})
export class MemberProcess extends AbstractPageImageLoader implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public params: any;
  public route: ActivatedRoute;
  public checkMergeUserFacade: CheckMergeUserFacade;
  public bindingMemberFacade: BindingMemberFacade;

  public data: any;
  public dataId: any;
  public isNotAccess: any;
  public linkPost: any;
  public mainPostLink: string;
  public decodedData: any;
  public status: any;
  public param: any;

  public isLoading: boolean = true;
  constructor(
    router: Router,
    dialog: MatDialog,
    authenManager: AuthenManager,
    checkMergeUserFacade: CheckMergeUserFacade,
    bindingMemberFacade: BindingMemberFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.checkMergeUserFacade = checkMergeUserFacade;
    this.bindingMemberFacade = bindingMemberFacade;

    const splitUrl = this.router.url.split('/');
    const url = splitUrl[2].split('?');
    if (url[0] === 'success') {
      this.status = 'success';
    }
    if (url[0] === 'reject') {
      this.status = 'reject';
    }
  }

  public ngOnInit(): void {
    setTimeout(() => {
      this.router.navigateByUrl('/home');
      localStorage.removeItem('methodMFP');
    }, 5000);
  }

  public getIdUser() {
    let user = JSON.parse(localStorage.getItem('pageUser'));
    return user.id;
  }

  public ngOnDestroy(): void {

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