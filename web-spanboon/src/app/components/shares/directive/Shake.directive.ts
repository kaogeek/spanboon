/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Directive, Input, OnInit, OnChanges, ElementRef, OnDestroy, SimpleChange, HostListener, SimpleChanges } from '@angular/core';

declare var $: any;

@Directive({
    selector: '[shake]'
})
export class Shake implements OnInit, OnChanges {
    @Input() shake: any;
    private round: boolean

    constructor(private _elemRef: ElementRef) { 
    }

    ngOnChanges(changes: SimpleChanges): void { 
        if (changes && changes.shake && changes.shake.currentValue) { 
            this._elemRef.nativeElement.classList.add('input-shake'); 
            this.round = changes.shake.currentValue
            setTimeout(function () { 
            }, 1000);
        } else { 
        }
    }
    public ngOnInit() {

    } 

}
