/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchFilter, Asset } from '../../../models/models';
import { PageCategoryFacade, PageFacade, AuthenManager, AssetFacade, ObservableManager, HashTagFacade } from '../../../services/services';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { FileHandle } from '../directive/DragAndDrop.directive';
import * as moment from 'moment';
import * as $ from 'jquery';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

const PAGE_NAME: string = 'editcomment';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
  selector: 'dialog-contact',
  templateUrl: './DialogContact.component.html',
})
export class DialogContact extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('pageName', { static: false }) pageName: ElementRef;
  @ViewChild('autoCompleteTag', { static: false }) autoCompleteTag: ElementRef;

  private pageCategoryFacade: PageCategoryFacade;
  private observManager: ObservableManager;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private hashTagFacade: HashTagFacade;
  public dialog: MatDialog;

  public isLoading: boolean;
  public isShowCheckboxTag: boolean;
  public imageCover: any;
  public config: any;
  public setTimeoutAutocomp: any;
  public resDataObjective: any[] = [];

  public Editor = ClassicEditor;

  files: FileHandle[] = [];

  constructor(public dialogRef: MatDialogRef<DialogContact>, @Inject(MAT_DIALOG_DATA) public data: any, pageCategoryFacade: PageCategoryFacade, pageFacade: PageFacade,
    dialog: MatDialog, authenManager: AuthenManager, router: Router, assetFacade: AssetFacade, observManager: ObservableManager, hashTagFacade: HashTagFacade,
    private sanitizer: DomSanitizer) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.pageCategoryFacade = pageCategoryFacade;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.hashTagFacade = hashTagFacade;
    this.imageCover = {}

  }

  ngOnInit() {
    console.log(this.data)
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
 
  onClose() {}

  onFileSelect() {}

  onConfirm() {}
}
