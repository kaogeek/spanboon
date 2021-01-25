/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PostCommentFacade, PageFacade } from '../../../services/services';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';
import { ProfileFacade } from '../../../services/facade/ProfileFacade.service'; 
import { DialogMedia } from '../dialog/DialogMedia.component';
import { MatDialog } from '@angular/material';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';

@Component({
  selector: 'repost-data',
  templateUrl: './RepostData.component.html'
})
export class RepostData {

  private assetFacade: AssetFacade;
  private pageFacade: PageFacade;
  private postFacade: PostFacade;
  public dialog: MatDialog;

  public commentpost: any[] = []
  public isComment: boolean
  public referencePost: any
  public reboonData: any

  @Input()
  public isRepost: boolean
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

  private mainPostLink: string = window.location.origin + '/post/'

  constructor(postCommentFacade: PostCommentFacade, pageFacade: PageFacade, assetFacade: AssetFacade, postFacade: PostFacade, dialog: MatDialog, profileFacade: ProfileFacade) {
    this.dialog = dialog;
    this.assetFacade = assetFacade
    this.pageFacade = pageFacade
    this.postFacade = postFacade
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
          this.getImgURL(page.data.imageURL, false);
        }).catch((err: any) => {
        });
      }
    }, 1500);
  }

  // private searchPost(id): void {
  //   let search: SearchFilter = new SearchFilter();
  //   search.limit = 5;
  //   search.count = false;
  //   search.whereConditions = { _id: id };
  //   this.postFacade.search(search).then((res: any) => {
  //     console.log('res', res)
  //     if (res.referencePost !== null && res.referencePost !== undefined) {
  //       this.itemPost.likeMainPost = this.mainPostLink + res.referencePost
  //     }
  //   }).catch((err: any) => {
  //   });
  // }

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
