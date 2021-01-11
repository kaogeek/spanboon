/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';

 
declare var $: any;

@Component({
  selector: 'preload-data',
  templateUrl: './PreloadData.component.html',
})
export class PreloadData  implements OnInit {
  @Input()
  public class: string | [string];
  @Input()
  public isShowCard1: boolean = false;
  @Input()
  public isShowCard2: boolean = false;
  @Input()
  public isShowCard3: boolean = false;

  constructor() { 
  } 

  public ngOnInit(): void {

  }
  public ngOnDestroy(): void { 
  } 
}
