/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import 'hammerjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = 'DialogMedia';

// export interface DialogData {
//   result: boolean;
//   head: string;
//   isButton: boolean;
// }

@Component({
  selector: 'DialogMedia',
  templateUrl: './DialogMedia.component.html',
})
export class DialogMedia {

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  public loadding: boolean;   

  public static readonly PAGE_NAME: string = PAGE_NAME;

  private apiBaseURL = environment.apiBaseURL;

  constructor(public dialogRef: MatDialogRef<DialogMedia>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.galleryImages = [];  
    for(let image of this.data.gallerys){
      this.galleryImages.push({
        small: image.galleryBase64 || this.apiBaseURL+image.imageURL+'/image',
        medium: image.galleryBase64 || this.apiBaseURL+image.imageURL+'/image', 
        big: image.galleryBase64 || this.apiBaseURL+image.imageURL+'/image'
      })
    } 
  }

  ngOnInit() { 

    this.galleryOptions = [
      {
        'previewCloseOnEsc': true,
        'previewKeyboardNavigation': true,
        // "imageDescription": true,
        imagePercent: 100,
        startIndex: this.data.index,
        width: '1000px',
        height: '700px',
        thumbnailsColumns: 5,
        imageAnimation: NgxGalleryAnimation.Slide,
        // preview: false
        // previewZoom: true,
        // previewRotate: true,
        // previewZoomMax: 3,
        // previewZoomMin: 1,
        arrowPrevIcon: 'fa fa-chevron-left',
        arrowNextIcon: 'fa fa-chevron-right',
        closeIcon: 'fa fa-window-close',
      },
      {
        breakpoint: 1440,
        width: '900px',
        height: '700px',
      },
      {
        breakpoint: 1200,
        width: '800px',
        height: '600px',
        thumbnailsColumns: 4,
      },
      {
        breakpoint: 1024,
        width: '700px',
        height: '500px',
      },
      {
        breakpoint: 767,
        width: '95vw',
        height: '80vh',
        thumbnailsColumns: 3,
      },
      {
        breakpoint: 479,
        height: '70vh',
      }
    ]; 

  }
 
  public close() {
    this.dialogRef.close();
  }
}
