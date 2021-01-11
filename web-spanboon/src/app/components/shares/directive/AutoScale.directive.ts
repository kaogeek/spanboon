/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Directive, Input, OnInit, Renderer, ElementRef, OnDestroy } from '@angular/core';

declare var $: any;

@Directive({
  selector: '[auto-scale]'
})
export class AutoScale implements OnInit, OnDestroy {
  @Input()
  private widthScale: number = 16;
  @Input()
  private heightScale: number = 9;

  constructor(private _elemRef: ElementRef, private _renderer: Renderer) { }

  public ngOnInit() {

    $(window).ready(() => {
      // setTimeout(() => {        
      //   this.setHeight();
      // }, 1000);
      this.setHeight();
      // console.log('0');
    });

    $(window).on('load', () => {
      this.setHeight();
      // console.log('1');
    });

    // $(window).load(() => {
    //   this.setHeight();
    // });

    $(window).resize(() => {
      this.setHeight();
    });
  }

  public ngOnDestroy() {
  }

  private setHeight(): void {
    let width = this._elemRef.nativeElement.offsetWidth;
    let height = (width / this.widthScale) * this.heightScale;
    this._elemRef.nativeElement.style.height = height + 'px';
  }
}
