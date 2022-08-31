/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Inject, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ImageCropperComponent } from "ngx-img-cropper";
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropListGroup, CdkDropList, CdkDragMove, CdkDrag } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/overlay';
import { Asset } from '../../../models/Asset';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { Platform } from '@angular/cdk/platform';
import { ValidateFileSizeImageUtils } from '../../../utils/ValidateFileSizeImageUtils';
import { AbstractPage } from '../../pages/AbstractPage';
import { AuthenManager } from '../../../services/AuthenManager.service';

@Component({
  selector: 'dialog-manage-image',
  templateUrl: './DialogManageImage.component.html'

})
export class DialogManageImage extends AbstractPage {

  @Input() name: string;
  @ViewChild('cropper', undefined)
  public cropper: ImageCropperComponent;
  @ViewChild('fileimg', undefined)
  public fileimg: ElementRef<HTMLElement>;

  @ViewChild(CdkDropListGroup, { static: false }) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, { static: false }) placeholder: CdkDropList;

  private postFacade: PostFacade;

  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;
  private fileImageOriginal: any[] = [];

  constructor(public dialogRef: MatDialogRef<DialogManageImage>, @Inject(MAT_DIALOG_DATA) public fileImage: any[], private viewportRuler: ViewportRuler,
    postFacade: PostFacade, private _platform: Platform, authenManager: AuthenManager) {
    super(null, authenManager, null, null);
    this.postFacade = postFacade;
    this._platform = _platform
  }
  isPageDirty(): boolean {
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    return;
  }
  public ngOnInit(): void {
    this.fileImageOriginal = JSON.parse(JSON.stringify(this.fileImage));
  }

  public onNoClick(): void {
    this.dialogRef.close(this.fileImageOriginal);
  }

  public onClickImg(): void {
    const inputimage = document.getElementById("inputimage");
    this.dialogRef.close(this.fileImage);
  }

  public deleteImage(index: number) {
    this.fileImage.splice(index, 1);
  }

  public fileChangeListener(event) {
    let files: any[] = event.target.files;
    if (files.length === 0) {
      return;
    }
    if (files) {
      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (event: any) => {
          let data = {
            fileName: file.name,
            size: file.size,
            image: event.target.result
          }
          if (ValidateFileSizeImageUtils.sizeImage(file.size)) {
            this.showAlertDialog('ขนาดไฟล์รูปภาพใหญ่เกินไป กรุณาอัพโหลดใหม่อีกครั้ง')
          } else {
            this.genImages(data);
          }
        }
        reader.readAsDataURL(file);
      }
    }
  }

  public genImages(images: any): void {
    this.fileImage.push(images);

    const asset = new Asset();
    let data = images.image.split(',')[0];
    let typeImage = data.split(':')[1];
    asset.mimeType = typeImage.split(';')[0];
    asset.data = images.image.split(',')[1];
    asset.fileName = images.fileName;
    asset.size = images.size;
    let temp = {
      asset
    }
    this.postFacade.upload(temp).then((res: any) => {
      if (res.status === 1) {
        for (let result of this.fileImage) {
          if (result.fileName === images.fileName) {
            result.fileName = res.data.fileName
            Object.assign(result, { id: res.data.id === null || res.data.id === undefined ? "" : res.data.id });
            Object.assign(result, { isUpload: true });
          }
        }
      }

    }).catch((err: any) => {
      console.log(err)
    })
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentElement.removeChild(phElement);
  }

  add() {
    this.fileImage.push(this.fileImage.length + 1);
  }

  shuffle() {
    this.fileImage.sort(function () {
      return .5 - Math.random();
    });
  }

  dragMoved(e: CdkDragMove) {
    let point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  clickSubmit() { }

  dropListDropped() {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex != this.targetIndex)
      moveItemInArray(this.fileImage, this.sourceIndex, this.targetIndex);
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder)
      return true;

    if (drop != this.activeContainer)
      return false;

    let phElement = this.placeholder.element.nativeElement;
    let sourceElement = drag.dropContainer.element.nativeElement;
    let dropElement = drop.element.nativeElement;

    let dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    let dropIndex = __indexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex
      ? dropElement.nextSibling : dropElement));

    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();
    if (!this._platform.isBrowser) {
      return {
        x: point.pageX - scrollPosition.left,
        y: point.pageY - scrollPosition.top
      };
    } else {
      return {
        x: point.pageX - scrollPosition.left,
        y: point.pageY - 0
      };
    }

  }
}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
};

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const { top, bottom, left, right } = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right;
}


