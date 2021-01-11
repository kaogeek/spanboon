/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import {
    Directive,
    HostBinding,
    HostListener,
    Output,
    EventEmitter
} from "@angular/core";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface FileHandle {
    file: File,
    url: SafeUrl
}
@Directive({
    selector: '[dragdrop-image]'
})
export class DragAndDrop {

    @Output() files: EventEmitter<FileHandle[]> = new EventEmitter();

    @HostBinding("style.background") public background = "#eee";

    constructor(private sanitizer: DomSanitizer) { }

    @HostListener("dragover", ["$event"]) public onDragOver(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        // this.background = "#999";
    }

    @HostListener("dragleave", ["$event"]) public onDragLeave(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        // this.background = "#eee";
    }

    @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        // this.background = '#eee';

        let files: FileHandle[] = [];
        for (let i = 0; i < evt.dataTransfer.files.length; i++) {
            const file = evt.dataTransfer.files[i];
            const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
            files.push({ file , url });
        }
        if (files.length > 0) {
            this.files.emit(files);
        }
    }
}
