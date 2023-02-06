/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { PLATFORM_NAME_TH, PLATFORM_NAME_ENG, PLATFORM_SOPPORT_EMAIL, PLATFORM_URL, PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT } from '../../../custom/variable';

@Component({
  selector: 'status-bar-looking',
  templateUrl: './StatusBarLooking.component.html'
})
export class StatusBarLooking implements OnInit {

  @Input()
  public topic: string = "เกาะทุกก้าว !";
  @Input()
  public status: string = "กำลัง" + PLATFORM_NEEDS_TEXT;
  @Input()
  public createDate: string = "3 วันที่แล้ว";
  @Input()
  public action: string = "เหตุการณ์";
  @Input()
  public seeAll: string = "ดูทั้งหมด";
  @Input()
  public count: string = "460";
  @Input()
  public isStausDate: boolean = false;
  @Input()
  public isStatusIcon: boolean = false;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();

  private mainSeeAll: string = window.location.origin + '/search?'
  public link: string

  constructor() {
  }

  ngOnInit(): void {

  }

  public actions() {
    this.link = this.mainSeeAll + 'lastest=true'
    // this.submit.emit();
  }

}
