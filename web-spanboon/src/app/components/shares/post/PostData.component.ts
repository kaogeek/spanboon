/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { PostCommentFacade, AuthenManager, ObservableManager, Engagement } from '../../../services/services';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { NeedsFacade } from '../../../services/facade/NeedsFacade.service';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';
import { PageFacade } from '../../../services/facade/PageFacade.service';
import { SearchFilter } from '../../../models/SearchFilter';
import { MatDialog } from '@angular/material';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { DialogAlert } from '../dialog/DialogAlert.component';
import { environment } from '../../../../environments/environment';
import { PLATFORM_FULFILL_TEXT, PLATFORM_NEEDS_TEXT, PLATFORM_GENERAL_TEXT, PLATFORM_STORY, PLATFORM_STORY_TALE } from '../../../../custom/variable';
import { MESSAGE } from '../../../../custom/variable';
import { Router } from '@angular/router';
import Glightbox from 'glightbox';
import { DialogShare } from '../dialog/DialogShare.component';
import { DialogCheckBox } from '../dialog/DialogCheckBox.component';

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
  public engagementService: Engagement;

  public commentpost: any[] = []
  public isComment: boolean
  public referencePost: any
  public reboonData: any
  public usercurrent: any

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
  public isShowComment: boolean = true;
  @Input()
  public isShare: boolean = true;
  @Input()
  public isLike: boolean = true;
  @Input()
  public isReboon: boolean = true;
  @Input()
  public isUserPage: boolean;
  @Input()
  public isShowUser: boolean;
  @Input()
  public isShowProfile: boolean = false;
  @Input()
  public pageUser: any;
  @Input()
  public mainPostLink: string;
  @Input()
  public itemPost: any;
  @Input()
  public ownerPost: any;
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
  @Output()
  public engagement: EventEmitter<any> = new EventEmitter();
  @Output()
  public hide: EventEmitter<any> = new EventEmitter();
  @Output()
  public report: EventEmitter<any> = new EventEmitter();

  public value: any
  public isLoading: Boolean;
  public linkPost: string;
  public isFulfill: boolean = false;
  public isPendingFulfill: boolean = false;
  public isHide: boolean = true;

  // private mainPostLink: string = window.location.origin + '/profile/aaa/post/'
  // private mainPostLink: string = window.location.origin + '/post/'
  private mainPageLink: string = window.location.origin + '/page/';

  public PLATFORM_FULFILL_TEXT: string = PLATFORM_FULFILL_TEXT;
  public PLATFORM_NEEDS_TEXT: string = PLATFORM_NEEDS_TEXT;
  public PLATFORM_GENERAL_TEXT: string = PLATFORM_GENERAL_TEXT;
  public PLATFORM_STORY: string = PLATFORM_STORY;
  public PLATFORM_STORY_TALE: string = PLATFORM_STORY_TALE;

  public apiBaseURL = environment.apiBaseURL;
  public webBaseURL = environment.webBaseURL;
  public marginPerAction: any;
  public menuProfile: any;

  constructor(postCommentFacade: PostCommentFacade, pageFacade: PageFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade, postFacade: PostFacade, dialog: MatDialog, authenManager: AuthenManager,
    observManager: ObservableManager, router: Router, engagementService: Engagement) {
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.postCommentFacade = postCommentFacade
    this.observManager = observManager;
    this.postFacade = postFacade;
    this.assetFacade = assetFacade;
    this.needsFacade = needsFacade;
    this.pageFacade = pageFacade;
    this.engagementService = engagementService;
    this.router = router;
    this.isComment = false
    this.isRepost = true;
    this.isLoading = true;
    this.mainPostLink = window.location.origin + '/post/';

    this.user = this.authenManager.getCurrentUser();
    this.usercurrent = this.authenManager.getCurrentUser();
    setTimeout(() => {
    }, 500);

    setTimeout(async () => {
      if (this.itemPost && this.itemPost.referencePostObject && this.itemPost.referencePostObject !== null && this.itemPost.referencePostObject !== undefined && this.itemPost.referencePostObject !== '') {
        if (typeof this.itemPost.referencePostObject.gallery !== 'undefined' && this.itemPost.referencePostObject.gallery.length > 0) {
          this.itemPost.referencePostObject.gallery = this.itemPost.referencePostObject.gallery.sort((a, b) => a.ordering - b.ordering)
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
        this.isFulfill = false;
        this.isPendingFulfill = true;
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
      this.linkPost = (this.mainPostLink + this.itemPost._id);
      this.isLoading = false;
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
      // ordering image
      if (this.itemPost && this.itemPost.gallery && this.itemPost.gallery.length > 0) {
        this.itemPost.gallery = this.itemPost.gallery.sort((a, b) => a.ordering - b.ordering)
      }
    }, 1000);
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
    if (!this.isLogin()) {
      this.showAlertDialog();
    }
    this.comment.emit({ value: this.value, pageId: this.itemPost._id, userAsPage: this.user });
    setTimeout(() => {
      this.isComment = true
      this.value = ''
      this.getComment();
    }, 500);
  }

  public isLogin(): boolean {
    return this.authenManager.getCurrentUser() !== undefined && this.authenManager.getCurrentUser() !== null ? true : false;
  }

  public postAction(action: any) {
    if (!this.isLogin()) {
      // this.showAlertDialog();
    }
    if (action.mod === 'COMMENT') {
      this.getComment();
      this.isComment = !this.isComment
      this.action.emit({ mod: action.mod, pageId: this.itemPost._id, userAsPage: this.user });
    } else if (action.mod === 'LIKE') {
      this.action.emit({ mod: action.mod, postData: this.itemPost, userAsPage: this.user });
    } else if (action.mod === 'REBOON') {
      this.action.emit({ mod: action.mod, postData: this.itemPost._id, type: action.type, post: this.itemPost, userAsPage: this.user });
    } else if (action.mod === 'SHARE') {
      // this.showAlertDialog();
      // this.dialogShare();
      this.action.emit({ mod: action.mod, linkPost: this.linkPost });
    }
  }

  public dialogShare() {
    let dialog = this.dialog.open(DialogShare, {
      disableClose: true,
      autoFocus: false,
      data: {
        title: "แชร์",
        text: this.linkPost
      }
    });
  }

  public pageAction(action: any) {
    let comments: any[] = []
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

  public clickDevelop(data, text) {
    if (data.index === 1) {
      this.router.navigate([]).then(() => {
        window.open('/emergencyevent/' + text.emergencyEvent._id);
      });
    } else if (data.index === 2) {
      this.router.navigate([]).then(() => {
        window.open('/objective/' + text.objective._id);
      });
    }
    let url = '';
    let type = '';
    let eventId = '';
    if (data.index === 1) {
      url += "emergency=#" + text.emergencyEventTag
      type = "emergency";
      eventId = text.emergencyEvent.hashTag;
    } else if (data.index === 2) {
      url += "objective=" + text.objectiveTag;
      type = "objective";
      eventId = text.objective.hashTag;
    }
    let click = this.engagementService.getEngagement(data.event, eventId, type);
    this.engagement.emit(click)
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
    this.router.navigate([]).then(() => {
      let win = window.open('/story/' + post._id, '_blank');
      win.focus();
    });
  }

  public postTeb(post) {
    this.action.emit({ mod: 'POST', pageId: post._id });
  }

  public commentAction(data: any) {
    if (!this.isLogin()) {
      this.showAlertDialog();
    }
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
          text: MESSAGE.TEXT_TITLE_DELETE_COMMENT_CONFIRM,
          bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
          bottomColorText2: "black",
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.commentpost.splice(data.index, 1);
          let index = this.commentpost.map(function (e) { return e.user.id; }).indexOf(this.usercurrent.id);
          this.itemPost.commentCount = this.itemPost.commentCount - 1;
          if (index > 0) {
            this.itemPost.isComment = false;
          }
          this.postCommentFacade.delete(this.itemPost._id, data.commentdata).then((res: any) => {
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
    } else if (data.action === 'CANCEL') {
      this.commentpost[data.index].isEdit = false;
    }
  }

  public substringData(settingname: string) {
    if (settingname && settingname.length > 0) {
      if (settingname.match(/[^_]*$/)) {
        return settingname.split('_');
      }
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

  public async showDialogGallery(imageGallery) {
    let lightbox = Glightbox();
    let arrayImage = [];
    for await (let galleryImage of imageGallery.gallerys) {
      arrayImage.push({
        href: this.apiBaseURL + galleryImage.imageURL + '/image',
        type: 'image' // Type is only required if GlIghtbox fails to know what kind of content should display
      })
    }
    lightbox.setElements(arrayImage);
    lightbox.openAt(imageGallery.index);
    lightbox.on('open', (target) => {
    });
    lightbox.on('close', (target) => {
      lightbox.destroy();
    });
  }

  private stopLoading(): void {
    setTimeout(() => {
    }, 1000);
  }

  public showAlertDialog(): void {
    // let dialog = this.dialog.open(DialogAlert, {
    //   disableClose: true,
    //   data: {
    //     text: MESSAGE.TEXT_TITLE_DEVERLOP,
    //     bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
    //     bottomColorText2: "black",
    //     btDisplay1: "none"
    //   }
    // });
    // dialog.afterClosed().subscribe((res) => {
    // });
  }

  public editPost(itemPost) {
    this.update.emit(itemPost)
  }

  public onClickEngagement(event, id: any, contentType: string) {
    let data = this.engagementService.getEngagement(event, id, contentType);
    this.engagement.emit(data);
  }

  public fulfillEngagement(event, postId: string) {
    let data = this.engagementService.getEngagement(event, postId, "fulfillment");
    this.engagement.emit(data);
  }

  public hidePost(post) {
    // const url: string = decodeURI(this.router.url);
    // const path = url.split('/')[1];
    // if (path === 'post') {

    // } else {
    this.hide.emit(post);
    // }
  }

  public reportPost(post) {
    const url: string = decodeURI(this.router.url);
    const path = url.split('/')[1];
    if (path === 'post') {
      let typeReport = 'post';
      let detail = [];
      this.pageFacade.getManipulate(typeReport).then((res) => {
        if (res) {
          for (let data of res.data) {
            detail.push(data.detail);
          }
        }
      })
      let dialog = this.dialog.open(DialogCheckBox, {
        disableClose: false,
        data: {
          title: 'รายงาน',
          subject: detail,
          bottomText2: 'ตกลง',
          bottomColorText2: "black",
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          let data = {
            typeId: post._id,
            type: typeReport.toUpperCase(),
            topic: res.topic,
            message: res.detail ? res.detail : '',
          }
          this.pageFacade.reportPage(data).then((res) => {
            if (res) {
            }
          }).catch((err) => {
            if (err) { }
          })
        }
      });
    } else {
      this.report.emit(post);
    }
  }

  public blockUser(post) {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: 'คุณต้องการบล็อกผู้ใช้นี้ใช่หรือไม่',
      },
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        let data = {
          subjectId: post.ownerUser,
          subjectType: 'USER',
        }
        this.pageFacade.blockPage(data).then((res) => {
          if (res) {
          }
        }).catch((err) => {
          if (err) { }
        })
      }
    });
  }

  public blockPage(post) {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: 'คุณต้องการบล็อกเพจนี้ใช่หรือไม่',
      },
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        let data = {
          subjectId: post.pageId,
          subjectType: 'PAGE',
        }
        this.pageFacade.blockPage(data).then((res) => {
          if (res) {
          }
        }).catch((err) => {
          if (err) { }
        })
      }
    });
  }

}
