/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PostCommentFacade, PageFacade, NeedsFacade } from '../../../services/services';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';
import { ProfileFacade } from '../../../services/facade/ProfileFacade.service';
import { DialogMedia } from '../dialog/DialogMedia.component';
import { MatDialog } from '@angular/material';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { PLATFORM_NAME_TH, PLATFORM_NAME_ENG, PLATFORM_SOPPORT_EMAIL, PLATFORM_URL, PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT } from '../../../../custom/variable';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'repost-data',
  templateUrl: './RepostData.component.html'
})
export class RepostData {

  private assetFacade: AssetFacade;
  private pageFacade: PageFacade;
  private postFacade: PostFacade;
  private needsFacade: NeedsFacade;
  public dialog: MatDialog;

  public commentpost: any[] = [];
  public isComment: boolean;
  public referencePost: any;
  public reboonData: any;
  public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT;
  public PLATFORM_NEEDS_TEXT: string = PLATFORM_NEEDS_TEXT;

  @Input()
  public isRepost: boolean
  @Input()
  public isFulfill: boolean = false;
  @Input()
  public gallery: any;
  @Input()
  public itemPost: any;
  @Input()
  public user: any;
  @Input()
  public commentPost: any;

  public value: any
  public isLoading: Boolean;
  public menuProfile: any;
  public postTeb: any;
  public deletePost: any;
  public isPage: any;
  public storyTeb: any;
  public isNotAccess: any;
  public isPendingFulfill: boolean = true;

  public apiBaseURL = environment.apiBaseURL;
  public webBaseURL = environment.webBaseURL;
  private mainPostLink: string = window.location.origin + '/post/'

  constructor(postCommentFacade: PostCommentFacade, pageFacade: PageFacade, assetFacade: AssetFacade, postFacade: PostFacade, dialog: MatDialog, profileFacade: ProfileFacade, needsFacade: NeedsFacade) {
    this.dialog = dialog;
    this.assetFacade = assetFacade
    this.pageFacade = pageFacade
    this.postFacade = postFacade
    this.needsFacade = needsFacade
    this.isComment = false
    this.isRepost = false

    setTimeout(() => { 
      if (this.itemPost && this.itemPost.referencePost && this.itemPost.referencePost != null && this.itemPost.referencePost != undefined && this.itemPost.referencePost != '') {
        this.itemPost.likeMainPost = this.mainPostLink + this.itemPost.referencePost
      }
      if (this.itemPost && this.itemPost.referencePost && this.itemPost.referencePost != null && this.itemPost.referencePost != undefined && this.itemPost.referencePost != '') {
        if (typeof this.itemPost.referencePost.gallery !== 'undefined' && this.itemPost.referencePost.gallery.length > 0) {
          let galleryIndex = 0;
          for (let img of this.itemPost.referencePost.gallery) {
            if (img.imageURL !== '') {
              this.getDataGallery(img.imageURL, galleryIndex);
              galleryIndex++
            }
          }
        }
      }
      if (this.itemPost && this.itemPost.pageId !== undefined && this.itemPost.pageId !== null) {
        this.pageFacade.getProfilePage(this.itemPost.pageId).then((page: any) => {
          this.itemPost.pageId = page.data
          if (page.data && page.data.imageURL !== '' && page.data.imageURL !== undefined && page.data.imageURL !== null) {
            this.getImgURL(page.data.imageURL, false);
          }
        }).catch((err: any) => {
        });
      }
      if (this.itemPost && this.itemPost.caseFulfillment && this.itemPost.caseFulfillment.length > 0 && this.itemPost.caseFulfillment !== undefined && this.itemPost.caseFulfillment !== null) {
        this.isFulfill = true;
        this.isPendingFulfill = false;
        for (let fulfill of this.itemPost.caseFulfillment) {
          for (let item of this.itemPost.caseNeeds) {
            if (fulfill.need === item._id) {
              fulfill.fulfillQuantity = fulfill.quantity
              fulfill.standardItemId = item.standardItemId
              fulfill.quantity = item.quantity
              fulfill.unit = item.unit
              if (fulfill.standardItemId !== null && fulfill.standardItemId !== '' && fulfill.standardItemId !== undefined) {
                this.needsFacade.getNeeds(fulfill.standardItemId).then((res: any) => {
                  fulfill.imageURL = res.imageURL
                }).catch((err: any) => {
                });
              }
            }
          }
          this.itemPost.needs.push(fulfill)
        }
      }
    }, 1500);
  }

  ngAfterViewInit(): void { 
    setTimeout(() => { 
      if (this.itemPost && this.itemPost.detail) {
        if (this.itemPost.hashTags !== undefined && this.itemPost.hashTags !== null) {
          if (this.itemPost && this.itemPost.hashTags.length > 0) {
            if (this.itemPost.detail.includes('#')) {
              const hashTag: string[] = this.itemPost.detail.match(/#[\wก-๙]+/g) || [];
              for (let lTag of hashTag) {
                for (let [index, tag] of this.itemPost.hashTags.entries()) {
                  if (lTag.substring(1) === tag.name) {
                    this.itemPost.hashTags.splice(index, 1)
                  }
                }
              }
            }
          }
        }
      }
      if (this.itemPost && this.itemPost.title) {
        if (this.itemPost.hashTags !== undefined && this.itemPost.hashTags !== null) {
          if (this.itemPost && this.itemPost.hashTags.length > 0) {
            if (this.itemPost.title.includes('#')) {
              const hashTag: string[] = this.itemPost.title.match(/#[\wก-๙]+/g) || [];
              for (let lTag of hashTag) {
                for (let [index, tag] of this.itemPost.hashTags.entries()) {
                  if (lTag.substring(1) === tag.name) {
                    this.itemPost.hashTags.splice(index, 1)
                  }
                }
              }
            }
          }
        }
      } 
     
    }, 1000);
  }
  
  public getImgURL(url: any, type: boolean) {
    if (type) {
      this.assetFacade.getPathFile(url).then((cover: any) => {
        this.itemPost.pageCover = cover.data
      }).catch((err: any) => {
      });
    } else {
      this.assetFacade.getPathFile(url).then((img: any) => {
        if (img !== null && img !== undefined && img !== "") {
          this.itemPost.pageId.imageURL = img.data
        }
      }).catch((err: any) => {
      });
    }
  }

  private getDataGallery(imageURL: any, galleryIndex?: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (ValidBase64ImageUtil.validBase64Image(res.data)) {
          setTimeout(() => {
            if (this.itemPost && this.itemPost.referencePost !== undefined && this.itemPost.referencePost.gallery[galleryIndex] !== undefined) {
              Object.assign(this.itemPost.referencePost.gallery[galleryIndex], { galleryBase64: res.data, isLoaded: true });
            }
          }, 500);
        } else {
          Object.assign(this.itemPost.referencePost.gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
        }
        this.isLoading = false
      }
    }).catch((err: any) => {
    });
  }

  public isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length > 0));
  }

  public showDialogGallery(imageGallery) {
    const dialogRef = this.dialog.open(DialogMedia, {
      width: 'auto',
      data: imageGallery,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
      this.stopLoading();
    });
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

}
