/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'item-card',
  templateUrl: './ItemCard.component.html'
})
export class ItemCard implements OnInit{ 

  @Input()
  public allPost: string = "ดูโพสต์";
  @Input()
  public status: string = "กำลังมองหา";
  @Input()
  public itemName: string = "ข้าวสาร";
  @Input()
  public amount: number = 30;
  @Input()
  public unit: string = "กระสอบ";
  @Input()
  public pageName: string = "บ้านนี้มีรัก";
  @Input()
  public countUser: string = "30,000" ;

  constructor() {
  }

  ngOnInit(): void {
   
  }

}
