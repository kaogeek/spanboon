/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Directive, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { GenerateUUIDUtil } from '../../../utils/GenerateUUIDUtil';

declare var $: any;

const NAME: string = 'preload';
const PREFIX_CLASSNAME: string = 'phx-preload';

@Directive({
    selector: '[phxPreload]'
})
export class Preload implements OnInit {

    public static readonly NAME: string = NAME;
    public static readonly PREFIX_CLASSNAME: string = PREFIX_CLASSNAME;

    @Input('phxPreload')
    private isLoaded: any;
    @Input('preloadClass')
    private preloadClass: any;
    @Input('preloadAutoSize')
    private preloadAutoSize: boolean;
    @Input('preloadOutline')
    private preloadOutline: number;
    @Input('preloadPaddIng')
    private preloadPaddIng: number;
    private elementRef: ElementRef;
    private uuid: string;
    private showing: boolean;

    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
        this.preloadAutoSize = true;
        this.uuid = GenerateUUIDUtil.getUUID();
        this.showing = false;
    }

    public ngOnInit(): void {
        // if (this.isLoaded === undefined || this.isLoaded === null) {
        //   return;
        // }

        let loaded: boolean = this.isLoaded ? true : false;
        // if (typeof this.isLoaded['isLoaded'] === 'function') {
        //   loaded = this.isLoaded.isLoaded() && this.isLoaded.isLoadingEnabled();
        // }

        if (!loaded) {
            this.show();
        }
    }


    public ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if (this.isLoaded) {
            this.remove();
        }
    }
    public isShowing(): boolean {
        return this.showing;
    }

    public show(): void {
        if (this.showing) {
            // To prevent calling twice.
            return;
        }

        this.showing = true;

        let ele = this.elementRef.nativeElement;
        let preLoadDom: HTMLElement = document.createElement("div");
        let className: string = "";

        className += PREFIX_CLASSNAME;

        if (this.preloadClass !== undefined && this.preloadClass !== null) {
            if (typeof this.preloadClass === 'string') {
                className += " " + this.preloadClass;
            } else if (Array.isArray(this.preloadClass)) {
                for (let item of this.preloadClass) {
                    className += " " + item;
                }
            }
        }

        preLoadDom.setAttribute("class", className);
        preLoadDom.setAttribute("id", this.uuid);

        let styleText = "";
        // if (this.preloadClass === 'image-profile-fan-page') {
        // let outlineSize: number = this.preloadOutline === undefined ? 0 : this.preloadOutline;
        // styleText += " left:" + (ele.offsetLeft - outlineSize) + "px; top:" + (ele.offsetTop - outlineSize) + "px;"; 
        styleText += "border-radius: 8pt;"
        if (this.preloadAutoSize) {
            let outlineSize: number = this.preloadOutline === undefined ? 0 : this.preloadOutline;
            styleText += " left:" + (ele.offsetLeft - outlineSize) + "px; top:" + (ele.offsetTop - outlineSize) + "px;";
            if (this.preloadPaddIng !== undefined) {
                styleText += "width: calc(" + (ele.clientWidth + outlineSize * 2) + " - " + this.preloadPaddIng + "); height:" + (ele.clientHeight + outlineSize * 2) + "px;"
            } else {
                styleText += "width:" + (ele.clientWidth + outlineSize * 2) + "px; height:" + (ele.clientHeight + outlineSize * 2) + "px;";
            }
        } else {
            styleText += " left:" + ele.offsetLeft + "px; top:" + ele.offsetTop + "px;";
        }

        preLoadDom.setAttribute("style", styleText);

        // Add preload dom
        // $(ele.parentElement).append(preLoadDom);

        $(preLoadDom).insertBefore(ele);

        // Hide original dom
        $(ele).css("display", 'none');

        // // Add preload dom
        // $(ele.parentElement).append(preLoadDom);

        // // Hide original dom
        // $(ele).css("opacity", 0);
    }

    public remove(): void {
        if (!this.showing) {
            // To prevent calling twice.
            return;
        }

        this.showing = false;

        // Remove preload dom
        $(this.elementRef.nativeElement.parentElement).find("#" + this.uuid).remove();

        // Show original dom
        $(this.elementRef.nativeElement).css("display", "flex");
    }
}
