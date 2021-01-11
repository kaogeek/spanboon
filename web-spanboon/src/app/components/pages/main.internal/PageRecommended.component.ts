/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, HashTagFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { DialogImage } from '../../components';
import { FileHandle } from '../../shares/directive/directives';
import * as $ from 'jquery';
import { Asset } from '../../../models/Asset';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { BoxPost } from '../../shares/shares';
import { SearchFilter } from '../../../models/SearchFilter';

const PAGE_NAME: string = 'recommended';
const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0;

declare var $: any;
@Component({
  selector: 'page-recommended',
  templateUrl: './PageRecommended.component.html',
})
export class PageRecommended extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  public isIconPage: boolean;
  @Input()
  public text: string = "ข้อความ";

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: 'ทั่วไป', keyword: 'general' }, { label: 'กำลังมองหา', keyword: 'needs' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild("recommendedRight", { static: true }) recommendedRight: ElementRef;


  private objectiveFacade: ObjectiveFacade;
  private assetFacade: AssetFacade;
  private routeActivated: ActivatedRoute;
  private searchHashTagFacade: HashTagFacade;
  protected observManager: ObservableManager;

  public resDataPage: any;
  public resObjective: any;
  public url: string;
  public subPage: string;
  public isLoading: boolean;
  public msgPageNotFound: boolean;
  public imageCoverSize: number;
  public position: number;
  public dataTrend: any[] = [];
  public whereConditions: string[];

  // public isFollow: boolean = true;
  public isloading: boolean;

  mySubscription: any;

  files: FileHandle[] = [];
  constructor(router: Router, dialog: MatDialog, authenManager: AuthenManager, pageFacade: PageFacade, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute, searchHashTagFacade: HashTagFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog
    this.objectiveFacade = objectiveFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.routeActivated = routeActivated;
    this.searchHashTagFacade = searchHashTagFacade;
    this.whereConditions = ["name"]

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.heightWindow();
  });
  }

  public ngOnInit(): void {
    this.searchTrendTag();
    this.openLoading();
    console.log('ssss ', this.checkPath())
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
  
  public checkPath(): boolean {
    return this.router.url.includes('hashtag');
  }

  // private stopLoading(): void {
  //   setTimeout(() => {
  //     this.isLoading = false;
  //   }, 1000);
  // }
  private openLoading() {
    this.isloading = true;
  }

  private closeLoading() {
    this.isloading = false;
  }

  public clickDataSearch(data) {
    this.router.navigateByUrl('/search?hashtag='+ data.label.substring(1))
    // this.router.navigateByUrl('/search/' + data.label)
  }

  public clickLoadmore() {

  }

public heightWindow() {
    var resizeWin = window.innerHeight;
    var recommended = this.recommendedRight.nativeElement.offsetHeight;
    var maxrecommended = recommended + 100;
    var count = recommended - resizeWin;
    var maxcount = count + 60;

    if (maxrecommended > resizeWin) {
        this.recommendedRight.nativeElement.style.top = '-' + maxcount + 'px';

    } else {
        this.recommendedRight.nativeElement.style.top = '55pt';
    }
}

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public searchTrendTag() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {};
    filter.count = false;
    filter.orderBy = {}
    let data = {
      filter,
      userId: this.getCurrentUserId()
    }
    if (this.getCurrentUserId) {
      delete data.userId
    }
    this.searchHashTagFacade.searchTopTrend(data).then((res: any) => {
      setTimeout(() => {
        this.closeLoading();
      }, 1000);

      this.dataTrend = res
      console.log(this.dataTrend)
    }).catch((err: any) => {
      console.log(err)
    })
  }
}




