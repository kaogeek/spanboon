import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'dialog-image-preview',
    templateUrl: './DialogImagePreview.component.html'
})
export class DialogImagePreview {
    public baseURL: string;

    constructor(public dialogRef: MatDialogRef<DialogImagePreview>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.baseURL = environment.apiBaseURL;
    }
}