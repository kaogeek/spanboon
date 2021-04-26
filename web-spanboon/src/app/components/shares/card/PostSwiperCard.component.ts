/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { ElementRef } from '@angular/core';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NavigationExtras, Router } from '@angular/router';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { AuthenManager, ObservableManager } from '../../../services/services';
import { environment } from '../../../../environments/environment';
import { AbstractPage } from '../../pages/AbstractPage';
import { DialogFulfill } from '../dialog/dialog';

const PAGE_NAME: string = 'postswiperCard';

@Component({
  selector: 'post-swiper-card',
  templateUrl: './PostSwiperCard.component.html'
})
export class PostSwiperCard extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild(SwiperComponent, { static: false }) componentRef: SwiperComponent;
  @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;
  @ViewChild('listNeeds', { static: false }) listNeeds: ElementRef;

  @Input()
  public allPost: string = "ดูโพสต์";
  @Input()
  public keyItem: string;
  @Input()
  public itemNeeds: any[];
  @Input()
  public isClose: boolean = false;
  @Input()
  public isFulfillQuantity: boolean = false;
  @Input()
  public isFulfill: boolean = false;
  @Input()
  public isPendingFulfill: boolean = false;
  @Input()
  public isImage: boolean = false;
  @Input()
  public isButtonFulfill: boolean = true;

  @Output()
  public clickEventA: EventEmitter<any> = new EventEmitter();

  public index: any;
  public needs: any[] = [];
  private originalNeeds: any[] = [];
  public indexNeed: number = 0;
  private needsResult: any[] = [];
  private observManager: ObservableManager;

  public apiBaseURL = environment.apiBaseURL;

  constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router, observManager: ObservableManager) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.dialog = dialog;
    this.router = router;
    this.observManager = observManager;
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.getNeeds();
    }, 650);
  }
  ngAfterViewInit(): void {
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

  public getNeeds(close?: boolean) {
    let Data: any[] = []
    this.originalNeeds = []
    if (this.itemNeeds !== null && this.itemNeeds !== undefined && this.itemNeeds.length > 0) {
      for (let needs of this.itemNeeds) {
        Data.push(needs)
      }
      if (Data.length > 0) {
        this.originalNeeds.push({ needs: Data });
      }
      if (this.originalNeeds.length > 0) {
        if (this.originalNeeds[this.indexNeed] === undefined) {
          this.indexNeed--
        }
        this.needs = this.originalNeeds[this.indexNeed].needs
      }
      this.getOffsetHeight();
    }

    if (this.directiveRef !== undefined && this.directiveRef !== null) {
      this.directiveRef.update();
    }
  }

  public getOffsetHeight() {
    return this.listNeeds && this.listNeeds.nativeElement.offsetHeight;
  }

  public clickEvent(event) {
    this.clickEventA.emit(event);
  }

  public next(type: string, index: number) {
    if (type === "NEXT") {
      this.needs = this.originalNeeds[index].needs
      this.indexNeed = index
    } else if (type === "BACK") {
      this.needs = this.originalNeeds[index].needs
      this.indexNeed = index
    }
  }

  public chekNext(): boolean {
    if (this.originalNeeds.length === this.indexNeed + 1) {
      return false
    } else {
      return true
    }
  }

  public chekBack(): boolean {
    if (this.indexNeed !== 0) {
      return true
    } else {
      return false
    }
  }

  public configSlider1: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 7,
    spaceBetween: 0,
    keyboard: false,
    mousewheel: false,
    scrollbar: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      991: {
        slidesPerView: 4.6,
      },
      899: {
        slidesPerView: 3.3,
      },
      676: {
        slidesPerView: 2.6,
      },
      655: {
        slidesPerView: 2.7,
      },
      566: {
        slidesPerView: 2.6,
      },
      479: {
        slidesPerView: 1.4,
      },
    },
  }
}
