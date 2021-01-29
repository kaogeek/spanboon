/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core'; 
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = 'DialogPreview';

// export interface DialogData {
//   result: boolean;
//   head: string;
//   isButton: boolean;
// }

@Component({
  selector: 'dialog-preview',
  templateUrl: './DialogPreview.component.html',
})
export class DialogPreview {
 
  public static readonly PAGE_NAME: string = PAGE_NAME;
 
  constructor(public dialogRef: MatDialogRef<DialogPreview>, @Inject(MAT_DIALOG_DATA) public data: any) { 
      console.log('data ',data)
  }

  ngOnInit() {  
  }
}
