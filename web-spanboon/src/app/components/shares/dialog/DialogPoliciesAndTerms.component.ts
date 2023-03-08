/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../../../models/models';

@Component({
    selector: 'dialog-policies-and-terms',
    templateUrl: './DialogPoliciesAndTerms.component.html'
})

export class DialogPoliciesAndTerms {
    @ViewChild('content', { read: ElementRef, static: false })
    public content!: ElementRef;
    public isReading: boolean = false;
    public isAccept: boolean = false;

    constructor(public dialogRef: MatDialogRef<DialogPoliciesAndTerms>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    public ngOnInit(): void {
        this.dialogRef.addPanelClass('overlay-dialog-policies-and-terms');
    }

    public ngAfterViewInit(): void {

    }

    public scrollingTo(event: any) {
        if ((this.content.nativeElement.scrollTop + this.content.nativeElement.offsetHeight + 20) >= this.content.nativeElement.scrollHeight) {
            this.isReading = true;
        } else {
            this.isReading = false;
        }
    }

    public clickSubmit() {
        this.dialogRef.close({ mode: this.data && this.data.mode });
        if (this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined) {
            this.data.confirmClickedEvent.emit(true);
        }
    }
}
