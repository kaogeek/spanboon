/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { PostCommentFacade, AuthenManager, ObservableManager } from '../../../services/services';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { NeedsFacade } from '../../../services/facade/NeedsFacade.service';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';
import { PageFacade } from '../../../services/facade/PageFacade.service';
import { SearchFilter } from '../../../models/SearchFilter';
import { DialogMedia } from '../dialog/DialogMedia.component';
import { MatDialog } from '@angular/material';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { DialogAlert } from '../dialog/DialogAlert.component';
import { environment } from '../../../../environments/environment';
import { BoxPost } from '../shares';
import { Router } from '@angular/router';

@Component({
  selector: 'post-data',
  templateUrl: './PostData.component.html'
})
export class PostData {

  public authenManager: AuthenManager;
  private postCommentFacade: PostCommentFacade;
  protected observManager: ObservableManager;
  private postFacade: PostFacade;
  private needsFacade: NeedsFacade;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private router: Router;
  public dialog: MatDialog;

  public commentpost: any[] = []
  public isComment: boolean
  public referencePost: any
  public reboonData: any

  @Input()
  public isRepost: boolean
  @Input()
  public isNotAccess: boolean
  @Input()
  public isPage: boolean = false;
  @Input()
  public isSearchHashTag: boolean = false;
  @Input()
  public gallery: any;
  @Input()
  public isComments: boolean;
  @Input()
  public isUserPage: boolean;
  @Input()
  public isShowUser: boolean;
  @Input()
  public isShowProfile: boolean = false;
  @Input()
  public pageUser: any;
  @Input()
  public itemPost: any;
  @Input()
  public user: any;
  @Input()
  public userImage: any;
  @Input()
  public commentPost: any;
  @Output()
  public comment: EventEmitter<any> = new EventEmitter();
  @Output()
  public action: EventEmitter<any> = new EventEmitter();
  @Output()
  public delete: EventEmitter<any> = new EventEmitter();
  @Output()
  public update: EventEmitter<any> = new EventEmitter();
  @Output()
  public userpage: EventEmitter<any> = new EventEmitter();

  public value: any
  public isLoading: Boolean;
  public linkPost: string;
  public isFulfill: boolean = false;

  private mainPostLink: string = window.location.origin + '/post/'
  private mainPageLink: string = window.location.origin + '/page/';

  public apiBaseURL = environment.apiBaseURL;
  public marginPerAction: any;
  public menuProfile: any;

  constructor(postCommentFacade: PostCommentFacade, pageFacade: PageFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade, postFacade: PostFacade, dialog: MatDialog, authenManager: AuthenManager,
    observManager: ObservableManager, router: Router,) {
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.postCommentFacade = postCommentFacade
    this.observManager = observManager;
    this.postFacade = postFacade
    this.assetFacade = assetFacade
    this.needsFacade = needsFacade
    this.pageFacade = pageFacade
    this.router = router;
    this.isComment = false
    this.isRepost = true;
    this.isLoading = true;

    setTimeout(() => { 
      if (this.itemPost && this.itemPost.referencePostObject && this.itemPost.referencePostObject !== null && this.itemPost.referencePostObject !== undefined && this.itemPost.referencePostObject !== '') {
        if (typeof this.itemPost.referencePostObject.gallery !== 'undefined' && this.itemPost.referencePostObject.gallery.length > 0) {
          let galleryIndex = 0;
          for (let img of this.itemPost.referencePostObject.gallery) {
            if (img.imageURL !== '') {
              this.getDataGallery(img.imageURL, galleryIndex);
              galleryIndex++
            }
          }
        }
      }
      if (this.itemPost && this.itemPost.needs !== undefined && this.itemPost.needs !== null) {
        // this.isFulfill = false;
        for (let needs of this.itemPost.needs) {
          if (needs.standardItemId !== null && needs.standardItemId !== '' && needs.standardItemId !== undefined) {
            this.needsFacade.getNeeds(needs.standardItemId).then((res: any) => {
              needs.imageURL = res.imageURL
            }).catch((err: any) => {
            });
          }
        }
      }
      if (this.itemPost && this.itemPost.caseFulfillment && this.itemPost.caseFulfillment.length > 0 && this.itemPost.caseFulfillment !== undefined && this.itemPost.caseFulfillment !== null) {
        this.isFulfill = true;
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
      this.linkPost = (this.mainPostLink + this.itemPost._id)
      this.isLoading = false
    }, 1000);
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
    }, 1000);

  }
  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }

  private getDataGallery(imageURL: any, galleryIndex: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (ValidBase64ImageUtil.validBase64Image(res.data)) {
          setTimeout(() => {
            if (this.itemPost && this.itemPost.referencePostObject !== undefined && this.itemPost.referencePostObject.gallery[galleryIndex] !== undefined) {
              Object.assign(this.itemPost.referencePostObject.gallery[galleryIndex], { galleryBase64: res.data, isLoaded: true });
            }
          }, 500);
        } else {
          Object.assign(this.itemPost.referencePostObject.gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
        }
      }
    }).catch((err: any) => {
      // if (err.error.status === 0) {
      //   if (err.error.message === 'Unable got Asset') {
      //     Object.assign(this.resDataPage.posts[postIndex].gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
      //   }
      // }
    });
  }

  public isEmptyObject(obj) {
    if (typeof obj === 'object') {
      return (obj && (Object.keys(obj).length > 0));
    }
  }

  public onClickComment(data: any) {
    this.comment.emit({ value: this.value, pageId: this.itemPost._id, userAsPage: this.user });
    setTimeout(() => {
      this.isComment = true
      this.value = ''
      this.getComment();
    }, 500);
  }

  public postAction(action: any) {
    if (action.mod === 'COMMENT') {
      this.getComment();
      this.isComment = !this.isComment
      this.action.emit({ mod: action.mod, pageId: this.itemPost._id, userAsPage: this.user });
    } else if (action.mod === 'LIKE') {
      this.action.emit({ mod: action.mod, postData: this.itemPost, userAsPage: this.user });
    } else if (action.mod === 'REBOON') {
      this.action.emit({ mod: action.mod, postData: this.itemPost._id, type: action.type, post: this.itemPost, userAsPage: this.user });
    } else if (action.mod === 'SHARE') {
      this.showAlertDialog();
      this.action.emit({ mod: action.mod });
    }
  }

  public pageAction(action: any) {
    let comments: any[] = []
    action.imageURL = action.img64
    this.user = action
    if (this.commentpost.length !== 0) {
      for (let c of this.commentpost) {
        comments.push(c.id)
      }
      this.postCommentFacade.getPostCommentStatus(this.itemPost._id, comments, this.user.id).then((res: any) => {
      }).catch((err: any) => {
      })
    }
    this.userpage.emit({ postData: this.itemPost._id, userPage: this.user });
  }

  public more() {
    this.getComment(true);
  }

  public clickDevelop(index, text) {
    let url = ''
    if (index === 1) {
      url += "emergency=#" + text
    } else if (index === 2) {
      url += "objective=" + text
    }
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: "ระบบอยู่ในระหว่างการพัฒนา",
        bottomText2: "ตกลง",
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
      this.router.navigateByUrl('/search?' + url)
    });
  }

  private getComment(limit?) {
    let search: SearchFilter = new SearchFilter();
    if (limit) {
      search.limit = 0
    } else {
      search.limit = 5
    }
    this.postCommentFacade.search(search, this.itemPost._id).then((res: any) => {
      for (let c of res) {
        c.isEdit = false
      }
      let arr: any[] = []
      if (res != null && res != undefined) {
        arr = res
        for (let comment of arr) {
          if (comment.commentAsPage !== undefined && comment.commentAsPage !== null) {
            search.limit = 0
            this.pageFacade.search(search).then((page: any) => {
              let index = page.map(function (e) { return e.id; }).indexOf(comment.commentAsPage);
              comment.user.displayName = page[index].name
              this.assetFacade.getPathFile(page[index].imageURL).then((res: any) => {
                comment.user.imageURL = res.data
              }).catch((err: any) => {
              });
            }).catch((err: any) => {
              this.assetFacade.getPathFile(comment.user.imageURL).then((res: any) => {
                comment.user.imageURL = res.data
              }).catch((err: any) => {
              });
            });
          } else if (comment.user.imageURL != null && comment.user.imageURL != undefined) {
            this.assetFacade.getPathFile(comment.user.imageURL).then((res: any) => {
              comment.user.imageURL = res.data
            }).catch((err: any) => {
            });
          }
        }
        this.commentpost = arr
      }
    }).catch((err: any) => {
    })
  }

  public storyTeb(post) {
    var dataPage = { id: post._id, pageId: post.pageId, type: post.type };
    sessionStorage.setItem('dataPage', JSON.stringify(dataPage));

    var win = window.open('/story/' + post._id);
    win.focus();
  }

  public postTeb(post) {
    this.action.emit({ mod: 'POST', pageId: post._id });
  }

  public commentAction(data: any) {
    if (data.action === "LIKE") {
      if (this.user.id !== undefined && this.user.id !== null) {
        this.postCommentFacade.like(this.itemPost._id, data.commentdata, this.user.id).then((res: any) => {
          this.commentpost[data.index].likeCount = res.likeCount
          this.commentpost[data.index].isLike = res.isLike
        }).catch((err: any) => {
        })
      } else {
        this.postCommentFacade.like(this.itemPost._id, data.commentdata).then((res: any) => {
          this.commentpost[data.index].likeCount = res.likeCount
          this.commentpost[data.index].isLike = res.isLike
        }).catch((err: any) => {
        })
      }
    } else if (data.action === "DELETE") {
      let dialog = this.dialog.open(DialogAlert, {
        disableClose: true,
        data: {
          text: "ต้องการลบความคิดเห็น ?",
          bottomText2: "ตกลง",
          bottomColorText2: "black",
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.postCommentFacade.delete(this.itemPost._id, data.commentdata).then((res: any) => {
            this.commentpost.splice(data.index, 1);
          }).catch((err: any) => {
          })
        }
      });
    } else if (data.action === "EDIT") {
      let cloneComment = JSON.parse(JSON.stringify(this.commentpost));
      if (data.commentEdit !== cloneComment[data.index].comment) {
        this.postCommentFacade.edit(this.itemPost._id, data.commentdata, data.commentEdit).then((res: any) => {
          this.commentpost[data.index].comment = res.comment
          this.commentpost[data.index].isEdit = false;
        }).catch((err: any) => {
        })
      } else {
        this.commentpost[data.index].isEdit = true;
      }
      // let dialog = this.dialog.open(DialogAlert, {
      //   disableClose: true,
      //   data: {
      //     text: "ระบบอยู่ในระหว่างการพัฒนา",
      //     bottomText2: "ตกลง",
      //     bottomColorText2: "black",
      //     btDisplay1: "none"
      //   }
      // });
      // dialog.afterClosed().subscribe((res) => {
      // });
    } else if (data.action === 'CANCEL') {
      this.commentpost[data.index].isEdit = false;
    }
  }

  public deletePost(post) {
    this.delete.emit(post);
  }

  public checkPost(post): boolean {
    if (post === 'UNDEFINED PAGE') {
      return false
    } else if (post === undefined && post === null && post === '') {
      return false
    } else {
      return true
    }
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
    }, 1000);
  }

  public showAlertDialog(): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: "ระบบอยู่ในระหว่างการพัฒนา",
        bottomText2: "ตกลง",
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
    });
  }

  public editPost(itemPost) {
    this.update.emit(itemPost)
  }

}
