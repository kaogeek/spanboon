/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { OnInit } from '@angular/core';
import { AbstractPage } from './AbstractPage';
import { AuthenManager } from '../../services/services';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
declare var $: any;

export abstract class AbstractPageImageLoader extends AbstractPage implements OnInit {

  private allImage: any[];
  private imageOK: any[];
  private imageError: any[];
  private allAdding: boolean;
  private castLoadedEvent: boolean;

  constructor(name: string, authenManager: AuthenManager, dialog: MatDialog, router: Router) {
    super(name, authenManager, dialog, router);

    this.allImage = [];
    this.imageOK = [];
    this.imageError = [];
    this.allAdding = false;
    this.castLoadedEvent = false;
  }

  public ngOnInit() {
    this.reloadImage();
  }

  public reCheckImage(): void {
    this.castLoadedEvent = false;
    this.reloadImage();
  }

  public reloadImage(): void {
    this.allAdding = false;
    let imageSelectors = this.getImageSelector();

    if (imageSelectors !== undefined && imageSelectors !== null && imageSelectors.length > 0) {
      for (let selector of imageSelectors) {
        $(selector).each((index, value) => {
          this.allImage.push(value);
        });
      }
    }

    this.allAdding = true;
    this.onSelectorImageElementLoaded(this.allImage);

    if (this.isImageLoaded() && !this.castLoadedEvent) {
      this.onImageLoaded(this.allImage);
      this.castLoadedEvent = true;
    }
  }

  public getImageElement(): any[] {
    return this.allImage;
  }

  public loadImageOK(event: any): void {
    if (event === undefined || event === null) {
      return;
    }

    let element = event.srcElement;

    if (element === undefined || element === null) {
      return;
    }

    if (this.imageOK.indexOf(element) <= -1) {
      this.imageOK.push(element);
      this.onImageElementLoadOK(element);

      if (this.allImage.indexOf(element) <= -1) {
        this.allImage.push(element);
      }

      if (this.isImageLoaded() && !this.castLoadedEvent) {
        this.onImageLoaded(this.allImage);
        this.castLoadedEvent = true;
      }
    }
  }

  public loadImageError(event: any): void {
    if (event === undefined || event === null) {
      return;
    }

    let element = event.srcElement;

    if (element === undefined || element === null) {
      return;
    }

    if (this.imageError.indexOf(element) <= -1) {
      this.imageError.push(element);
      this.onImageElementLoadError(element);

      if (this.allImage.indexOf(element) <= -1) {
        this.allImage.push(element);
      }

      if (this.isImageLoaded() && !this.castLoadedEvent) {
        this.onImageLoaded(this.allImage);
        this.castLoadedEvent = true;
      }
    }
  }

  public isImageLoaded(): boolean {
    if (this.allAdding) {
      let countImg = this.imageOK.length + this.imageError.length;
      if (countImg >= this.allImage.length) {
        return true;
      }
    }
    return false;
  }

  public abstract getImageSelector(): string[];

  public abstract onSelectorImageElementLoaded(imageElement: any[]): void;

  public abstract onImageElementLoadOK(imageElement: any): void;

  public abstract onImageElementLoadError(imageElement: any): void;

  public abstract onImageLoaded(imageElement: any[]): void;
}
