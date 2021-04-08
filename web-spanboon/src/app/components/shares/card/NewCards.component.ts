/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';
import { MenuContextualService } from 'src/app/services/services';
import { TooltipProfile } from '../tooltip/TooltipProfile.component';
import { ScrollStrategy } from '@angular/cdk/overlay';
import { PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT } from '../../../../custom/variable';

declare var $: any;

@Component({
  selector: 'new-cards',
  templateUrl: './NewCards.component.html'
})
export class NewCards {

  @Input()
  public widthBtnAction: string;
  @Input()
  public marginPerAction: string;
  @Input()
  public topic: string = "พม.ลุยช่วยเหลือกลุ่มคนไม่ได้รับเงิน 5,000 เราไม่ทิ้งกัน";
  @Input()
  public content: string = "เมื่อเทคโนโลยีก้าวล้ำนำสมัย การสาธารณะสุข การแพทย์และรักษาโรคเจริญก้าวหน้าตอบโจทย์แทบทุกความต้องการพื้นฐาน ส่งผลให้อายุขัยของโลกยืนยาวกว่าแต่ก่อน";
  @Input()
  public pageName: string = "บ้านนี้มีรัก";
  @Input()
  public createDate: string = "30 นาทีที่แล้ว";
  @Input()
  public images: string = "https://thestandard.co/wp-content/uploads/2020/02/COVER-WEB-53.jpg";
  @Input()
  public countUserFollow: string = "3K";
  @Input()
  public status: string = "กำลัง" + PLATFORM_NEEDS_TEXT;
  @Input()
  public textLink: string = "อ่านสตอรี่";
  @Input()
  public isAction: boolean;
  @Input()
  public data: any;
  @Input()
  public isRed: boolean;
  @Input()
  public isStausIcon: boolean = false;
  @Input()
  public comment: string;
  @Input()
  public reboon: string;
  @Input()
  public like: string;
  @Input()
  public share: string;
  @Input()
  public fontSize: string;
  @Input()
  public widthBtn: string;
  @Input()
  public heightBtn: string;
  @Input()
  public userLike: boolean = false;
  @Input()
  public userComment: boolean = false;
  @Input()
  public userReboon: boolean = false;
  @Input()
  public isWhite: boolean = false;
  @Input()
  public showLoading: boolean = false;
  @Input()
  public isOfficial: boolean = false;
  @Input()
  public butNeeds: boolean = false;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  private mainPostLink: string = window.location.origin + '/post/'
  private mainPageLink: string = window.location.origin + '/page/'

  private assetFacade: AssetFacade;

  public tooltip: boolean
  public ganY: any
  public ganX: any
  public showDelay: number
  public linkPost: string
  public linkPage: string
  public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT
  open: boolean;
  scrollStrategy: ScrollStrategy;

  public router: Router;

  constructor(router: Router, assetFacade: AssetFacade, private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef) {
    this.router = router;
    this.assetFacade = assetFacade

  }

  onMouseEnter(event: MouseEvent, outerDiv: HTMLElement) {
    const bounds = outerDiv.getBoundingClientRect();
    this.ganX = (event.clientX - bounds.left + 'px');
    this.ganY = (event.clientY - bounds.top + 'px');
  }

  public ngOnInit(): void {
    this.linkPost = (this.mainPostLink + this.data.post._id)
    if (this.data.owner.uniqueId !== undefined && this.data.owner.uniqueId !== null) {
      this.linkPage = (this.mainPageLink + this.data.owner.uniqueId)
    } else if (this.data.owner.id !== undefined && this.data.owner.id !== null) {
      this.linkPage = (this.mainPageLink + this.data.owner.id)
    }
    this.getImage();
  }

  public getImage() {
    if (this.data && this.data.owner && this.data.owner.imageURL && this.data.owner.imageURL !== undefined && this.data.owner.imageURL !== null && this.data.owner.imageURL !== '') {
      this.assetFacade.getPathFile(this.data.owner.imageURL).then((image: any) => {
        if (image.status === 1) {
          if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
            this.data.owner.imagebase64 = null
          } else {
            this.data.owner.imagebase64 = image.data
          }
        }
      }).catch((err: any) => {
        if (err.error.message === "Unable got Asset") {
          this.data.owner.imagebase64 = '';
        }
      })
    }
  }

  public action(even) {
    this.submit.emit({ mod: even.mod, postId: this.data.post._id });
  }

  public Tooltip(origin: any, data) {
    this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
      data: data,
    })
      .subscribe(res => {
      });
  }

  public TooltipClose($event) {

    setTimeout(() => {

      if ($event.toElement.className !== "ng-star-inserted") {
        this.popupService.close(null);
      }

    }, 400);
  }

  public navigate() { }
}
