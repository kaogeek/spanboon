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

const PAGE_NAME: string = 'needscard';

@Component({
  selector: 'needs-card',
  templateUrl: './NeedsCard.component.html'
})
export class NeedsCard extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild(SwiperComponent, { static: false }) componentRef: SwiperComponent;
  @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;
  @ViewChild('listNeeds', { static: false }) listNeeds: ElementRef;

  @Input()
  public allPost: string = "ดูโพสต์";
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
  @Input()
  public isNeedBoxPost: boolean = true;

  @Output()
  public close: EventEmitter<any> = new EventEmitter();
  @Output()
  public clickFulfill: EventEmitter<any> = new EventEmitter();

  public index: any;
  public needs: any[] = [];
  private originalNeeds: any[] = [];
  public indexNeed: number = 0;
  // public offsetHeightCard: number;
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

  public fulfillNeeds(event, item: any) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog(this.router.url);
    } else {
      let needsList: any[] = [];

      for (let needs of this.itemNeeds) {
        needs.isFrom = 'POST';
        needsList.push(needs);
      }

      let dialog = this.dialog.open(DialogFulfill, {
        width: 'auto',
        data: {
          isFrom: 'POST',
          fulfill: needsList,
          currentPostItem: item
        },
        disableClose: false
      });
      dialog.afterClosed().subscribe((res) => {
        needsList = [];
      });
    }
    this.clickFulfill.emit(event)
  }

  public onClose(item, index: number) {
    this.setNewNeeds(item);
    this.close.emit({ item, index });
  }

  private setNewNeeds(item) {
    let pos = this.itemNeeds.map(function (e) { return e.standardItemId; }).indexOf(item.standardItemId);
    this.itemNeeds.splice(pos, 1)
    this.getNeeds();
    this.getOffsetHeight();
    this.directiveRef.update();
  }

  // public getNeeds(index?: number, next?: boolean) {
  //   let need: any[]
  //   this.needs = []
  //   if (index !== undefined && index !== null) {
  //     if (next === true) {
  //       for (let indexs = index; indexs < this.itemNeeds.needs.length; indexs++) {
  //         this.needs.push(this.itemNeeds.needs[indexs])
  //         this.index++
  //         if (this.needs.length === 3) {
  //           if (((this.index + 1) === this.needs.length)) {
  //             return this.isNext = false, this.isBack = true
  //           } else {
  //             return this.isNext = true, this.isBack = true
  //           }
  //         } else if ((this.index + 1) === this.itemNeeds.needs.length) {
  //           this.needs.push(this.itemNeeds.needs[indexs])
  //           this.index++
  //           return this.isNext = false
  //         }
  //         this.needs
  //       }
  //     } else if (next === false) {
  //       console.log('next', next)
  //       console.log('index', index)
  //       for (let indexs = (index); indexs < this.itemNeeds.needs.length; indexs++) {
  //         this.needs.push(this.itemNeeds.needs[indexs])
  //         this.index--
  //         if (this.needs.length === 3) {
  //           return
  //         }
  //       }
  //     }
  //   } else {
  //     for (let needs of this.itemNeeds.needs) {
  //       this.needs.push(needs)
  //       this.index++
  //       if (this.needs.length === 3) {
  //         if (((this.index + 1) === this.needs.length)) {
  //           return this.isNext = false
  //         } else {
  //           return this.isNext = true
  //         }
  //       }
  //     }
  //   }

  // }

  // public next(type?: boolean) {
  //   this.getNeeds(this.index, type)
  // }

  public configSlider1: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 10,
    keyboard: false,
    mousewheel: false,
    scrollbar: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      991: {
        slidesPerView: 2.5,
      },
      899: {
        slidesPerView: 3,
      },
      676: {
        slidesPerView: 2.5,
      },
      566: {
        slidesPerView: 2.2,
      },
      479: {
        slidesPerView: 1.7,
      },
    },
  }
}
