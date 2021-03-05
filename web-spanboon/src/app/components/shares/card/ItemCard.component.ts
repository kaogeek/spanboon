/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, OnInit } from '@angular/core';
import { PLATFORM_NAME_TH, PLATFORM_NAME_ENG, PLATFORM_SOPPORT_EMAIL, PLATFORM_URL, PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT } from '../../../../custom/variable';

@Component({
  selector: 'item-card',
  templateUrl: './ItemCard.component.html'
})
export class ItemCard implements OnInit {

  @Input()
  public allPost: string = "ดูโพสต์";
  @Input()
  public status: string = "กำลัง" + PLATFORM_NEEDS_TEXT;
  @Input()
  public itemName: string = "ข้าวสาร";
  @Input()
  public amount: number = 30;
  @Input()
  public unit: string = "กระสอบ";
  @Input()
  public pageName: string = "บ้านนี้มีรัก";
  @Input()
  public countUser: string = "30,000";
  public PLATFORM_NEEDS_TEXT: string = PLATFORM_NEEDS_TEXT

  constructor() {
  }

  ngOnInit(): void {

  }

}
