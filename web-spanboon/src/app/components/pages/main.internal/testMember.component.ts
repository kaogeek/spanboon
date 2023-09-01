/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th > , Panupap-somprasong <panupap.s@absolute.co.th>
 */

import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const PAGE_NAME: string = 'testMember';

@Component({
  selector: 'testMember',
  templateUrl: './testMember.component.html',
})
export class testMember extends AbstractPageImageLoader implements OnInit {
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public params: any;
  public route: ActivatedRoute;
  public url: any;

  public data: any;
  public dataId: any;
  public isNotAccess: any;
  public linkPost: any;
  public mainPostLink: string;

  constructor(
    router: Router,
    dialog: MatDialog,
    authenManager: AuthenManager,
    private http: HttpClient) {
    super(PAGE_NAME, authenManager, dialog, router);
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {

  }

  public testButton() {
    this.authenManager.loginMember('MFP').then((res) => {
      if (res) console.log("res", res)
    }).catch((err) => {
      if (err) console.log(err)
    })
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