/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';


const PAGE_NAME: string = 'PreloadCard';
declare var $: any;

@Component({
  selector: 'Preload-card',
  templateUrl: './PreloadCard.component.html',
})
export class PreloadCard implements OnInit {
  @Input()
  public class: string | [string];
  @Input()
  public isShowCard1: boolean = false;
  @Input()
  public isShowCard2: boolean = false;
  @Input()
  public isShowCard3: boolean = false;
  @Input()
  public isShowCard4: boolean = false;
  @Input()
  public isShowCard5: boolean = false;
  @Input()
  public isShowCard6: boolean = false;
  @Input()
  public isShow: boolean = false;
  public windowWidth: any;
  public isRes: boolean = false;
  public isRes1: boolean = false;

  constructor() {
  }

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public ngOnInit(): void {

  }
  public ngOnDestroy(): void {
  }

  ngAfterViewInit() {
    // timeout is needed when you are using `thewidth` or `theheight` inside your template
    setTimeout(() => {
      this.getScreenSize();
    });
  }

  @HostListener('window:resize')
  public getScreenSize() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth <= 1280) {
      this.isRes = true;
    } else {
      this.isRes = false;
    }

    if (this.windowWidth <= 1024) {
      this.isRes1 = true;
    } else {
      this.isRes1 = false;
    }
  }
}
