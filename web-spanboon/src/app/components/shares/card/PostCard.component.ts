/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, Output, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { AssetFacade, MenuContextualService } from '../../../services/services';
import { TooltipProfile } from '../tooltip/TooltipProfile.component';


@Component({
  selector: 'post-card',
  templateUrl: './PostCard.component.html'
})
export class PostCard {

  private assetFacade: AssetFacade;

  @Input()
  public images: string;
  @Input()
  public cardWidth: string = "";
  @Input()
  public data: any;
  @Input()
  public height: string = "200pt";
  @Input()
  public margin: string = "10px";
  @Input()
  public widthBtnAction: string = "10px";
  @Input()
  public textLink: string = "อ่านสตอรี่";
  @Input()
  public create: string = "30 นาทีที่แล้ว";
  @Input()
  public username: string = "ณัฐพงษ์ เรืองปัญญาวุฒิ";
  @Input()
  public title: string = "ปลายชีวต &ldquo;คนแก่&rdquo; กับการอยู่คนเดียว";
  @Input()
  public content: string = "";
  @Input()
  public pageName: string = "บ้านนี้มีรัก";
  @Input()
  public countUserFollow: string = "3.4K";
  @Input()
  public totalFriend: string = "+300";
  @Input()
  public name: string = "NP";
  @Input()
  public isAction: boolean;
  @Input()
  public isOfficial: boolean = false;
  @Input()
  public comment: string;
  @Input()
  public imageBase64: string
  @Input()
  public reboon: string;
  @Input()
  public like: string;
  @Input()
  public share: string;
  @Input()
  public marginPerAction: string;
  @Input()
  public isWhite: boolean = false;
  @Input()
  public userLike: boolean = false;
  @Input()
  public userComment: boolean = false;
  @Input()
  public userReboon: boolean = false;
  @Input()
  public showLoading: boolean = false;
  @Input()
  public butNeeds: boolean = false;
  
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  public mainPostLink: string = window.location.origin + '/post/'
  public mainPageLink: string = window.location.origin + '/page/'
  public mainProfileLink: string = window.location.origin + '/profile/'

  public ganY: any;
  public ganX: any;
  public linkPost: string;
  public linkPage: string;
  public unset: any;

  protected router: Router;

  constructor(router: Router, assetFacade: AssetFacade, private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef) {
    this.assetFacade = assetFacade
    this.router = router;
  }

  public ngOnInit(): void {
    if (this.data.owner.type === "USER") {
      this.linkPage = (this.mainProfileLink + this.data.owner.id)
    } else if (this.data.owner.type === "PAGE") {
      if (this.data.owner.uniqueId !== undefined && this.data.owner.uniqueId !== null) {
        this.linkPage = (this.mainPageLink + this.data.owner.uniqueId)
      } else if (this.data.owner.id !== undefined && this.data.owner.id !== null) {
        this.linkPage = (this.mainPageLink + this.data.owner.id)
      }
    }
    if (this.data.post._id !== undefined && this.data.post._id !== null) {
      this.linkPost = (this.mainPostLink + this.data.post._id)
    } else if (this.data.post.id !== undefined && this.data.post.id !== null) {
      this.linkPost = (this.mainPostLink + this.data.post.id)
    } else {
      this.linkPost = this.mainPostLink
    }

    setTimeout(() => {
      let index: number = 0
      for (let data of this.data.followUsers) {
        if (data.imageURL !== null && data.imageURL !== undefined) {
          this.assetFacade.getPathFile(data.imageURL).then((res: any) => {
            data.avatar = res.data
          }).catch((err: any) => {
          });
          index++
        }
        if (index === 2) {
          break
        }
      }
    }, 500);

  }

  onMouseEnter(event: MouseEvent, outerDiv: HTMLElement) {
    const bounds = outerDiv.getBoundingClientRect();
    this.ganX = (event.clientX - bounds.left + 'px');
    this.ganY = (event.clientY - bounds.top + 'px');
  }

  public action(even) {
    if (this.data.post._id !== undefined && this.data.post._id !== null) {
      this.submit.emit({ mod: even.mod, postId: this.data.post._id });
    } else if (this.data.post.id !== undefined && this.data.post.id !== null) {
      this.submit.emit({ mod: even.mod, postId: this.data.post.id });
    }
  }

  public Tooltip(origin: any, data) {
    this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
      data: data,
    })
      .subscribe(res => {
    });
  }
}
