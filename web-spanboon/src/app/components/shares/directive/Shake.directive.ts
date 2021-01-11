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
            // console.log('currentValue ', changes.shake.currentValue)
            this._elemRef.nativeElement.classList.add('input-shake');
            // console.log('this._elemRef ',this._elemRef)
            this.round = changes.shake.currentValue
            setTimeout(function () {
                // changes.shake.currentValue = changes.shake.previousValue
                // this._elemRef.nativeElement.classList.remove('msg-error-shake');
            }, 1000);
        } else {
            // console.log('currentValfalseue ', changes.shake.currentValue)
        }
    }
    public ngOnInit() {

    }

    //   @HostListener('keyup') 
    //   onMouseEnter() {
    //     const test = (this._elemRef.nativeElement as HTMLInputElement).value;
    //     if(test && test !== ''){
    //         this._elemRef.nativeElement.style.backgroundColor = 'red';
    //     } else {
    //         this._elemRef.nativeElement.style.backgroundColor = 'white';
    //     }
    //   }

    // @HostListener('click', ['$event'])
    // onChange(event) {
    //      const test = (this._elemRef.nativeElement as HTMLInputElement);
    //     console.log('test ', test)
    //     console.log('data ', this.data)
    //     if (this.data) {
    //         this._elemRef.nativeElement.classList.add('msg-error-shake');
    //         // this._elemRef.nativeElement.style.backgroundColor = 'red';
    //         setTimeout(function () {
    //             this._elemRef.nativeElement.classList.remove('msg-error-shake');
    //         }, 1000);
    //     }
    // } 

}
