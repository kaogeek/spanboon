/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, ViewContainerRef } from '@angular/core';
import { MenuContextualService } from 'src/app/services/services';
import { TooltipProfile } from '../tooltip/TooltipProfile.component';

@Component({
  selector: 'icon-tag-card',
  templateUrl: './IconTagCard.component.html'
})
export class IconTagCard {

  @Input()
  public marginPerAction: string = "10pt";
  @Input()
  public data: any;
  @Input()
  public marginIcon: string = "3pt";
  @Input()
  public hashTag: string = "# รักษาตาแดง";
  @Input()
  public pageName: string = "# รักษาตาแดง";
  @Input()
  public images: string;
  @Input()
  public countUserFollow: string = "30 K";
  @Input()
  public isOfficial: boolean = false;
  @Input()
  public isAction: boolean;
  @Input()
  public isBlack: boolean = true;
  @Input()
  public comment: string;
  @Input()
  public reboon: string;
  @Input()
  public like: string;
  @Input()
  public share: string;

  private mainPostLink: string = window.location.origin + '/post/'
  private mainHashTagLink: string = window.location.origin + '/search?hashtag='
  private mainPageLink: string = window.location.origin + '/page/'
  private mainProfileLink: string = window.location.origin + '/profile/'

  public linkPost: string
  public linkPage: string
  public linkHashTag: string

  constructor(private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef) {

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
    console.log('this.data ',this.data)
    if (this.data && this.data.title !== undefined && this.data.title !== null) {
      this.linkHashTag = (this.mainHashTagLink + this.data.title) 
      // this.linkHashTag = this.mainHashTagLink
    } else {
      this.linkHashTag = this.mainHashTagLink
    }
  }

  public Tooltip(origin: any, data) {
    this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
      data: data,
    })
      .subscribe(res => {
      console.log(res);
    });
  }
}
