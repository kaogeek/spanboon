/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { EventEmitter } from '@angular/core';
import { BaseModel } from './BaseModel';

export class DialogData extends BaseModel {
  mode?: string;
  width: string;
  height: string;
  title: string;
  text: string;
  text2: string;
  group: any;
  pageId: string;
  page?: any;
  bgColor: string;
  textColor: string;
  item: string;
  allo: boolean;
  placeholder: string;
  subject: string;
  type: string;
  isProvince: boolean;
  isGroup: boolean;
  userId: string;

  //bottom
  bottomText1: string;
  bottomText2: string;
  bottomText3: string;
  bottomColorText1: string;
  bottomColorText2: string;
  bottomColor1: string;
  bottomColor2: string;
  bottomBgColor1: string;
  bottomBgColor2: string;

  //set display bottom
  btDisplay1: string;
  btDisplay2: string;
  btDisplay3: string;

  // btn action emitter
  confirmClickedEvent: EventEmitter<any>;
  cancelClickedEvent: EventEmitter<any>;

  // options
  options: any;
  data: any[];
}
