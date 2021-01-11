/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'spanboon-button-save',
  templateUrl: './NewConButtonSave.component.html'
})
export class NewConButtonSave {

    @Input()
    public text: string = "ข้อความ";
    @Input()
    public color: string = "#ffffff";
    @Input()
    public bgColor: string = "#279d90";
    @Input()
    public isRadius: boolean = true;
    @Input()
    public isLoading: boolean = false;
    @Input()
    public class: string | [string];

  constructor() {    

  }
  
}
