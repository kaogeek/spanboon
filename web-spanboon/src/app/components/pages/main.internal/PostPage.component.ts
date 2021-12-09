/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, PostCommentFacade, PostFacade, UserFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { DialogImage } from '../../shares/dialog/DialogImage.component';
import { DialogReboonTopic } from '../../shares/dialog/DialogReboonTopic.component';
import { FileHandle } from '../../shares/directive/directives';
import * as $ from 'jquery';
import { Asset } from '../../../models/Asset';
import { CommentPosts } from '../../../models/CommentPosts';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { BoxPost, DialogMedia } from '../../shares/shares';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { SearchFilter } from '../../../models/SearchFilter';
import { RePost } from '../../../models/RePost';
import { MESSAGE } from '../../../AlertMessage';

const PAGE_NAME: string = 'post';
// const URL_PATH_ID: string = '/page/futureforwardparty/';
const URL_PATH: string = '/page/';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;
const SEARCH_COUNT: boolean = false;

declare var $: any;
@Component({
  selector: 'post-page',
  templateUrl: './PostPage.component.html',
})
export class PostPage extends AbstractPage implements OnInit {
  private cacheConfigInfo: CacheConfigInfo;

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  protected isIconPage: boolean;
  @Input()
  protected text: string = "ข้อความ";
  @Output()
  public submitDialog: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitCanCelDialog: EventEmitter<any> = new EventEmitter();

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: this.PLATFORM_GENERAL_TEXT, keyword: 'general' }, { label: 'กำลัง' + this.PLATFORM_NEEDS_TEXT, keyword: 'needs' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild('pagefixHeight', { static: false }) pagefixHeight: ElementRef;
  @ViewChild('sidefeedHeight', { static: false }) sidefeedHeight: ElementRef;

  private objectiveFacade: ObjectiveFacade;
  private pageFacade: PageFacade;
  private userFacade: UserFacade;
  private postCommentFacade: PostCommentFacade;
  private postFacade: PostFacade;
  private needsFacade: NeedsFacade;
  private assetFacade: AssetFacade;
  private routeActivated: ActivatedRoute;
  protected observManager: ObservableManager;

  public resDataPage: any;
  public resObjective: any;
  public url: string;
  public subPage: string;
  public redirection: string;
  public resNeeds: any;
  public isLoading: boolean;
  public isSpiner: boolean;
  public isFiles: boolean;
  public isNotAccess: boolean;
  public isEditCover: boolean;
  public isPost: boolean;
  public msgPageNotFound: boolean;
  public isPload: boolean;
  public imageCoverSize: number;
  public position: number;
  public innerWidth: any;
  public type: any;
  public userImage: any;
  public commentData: any;
  public postList: any[] = [];
  public resContact: any[] = [];
  public Tab: boolean = true;
  public reboonData: any
  public splitTpyeClone: any
  public userCloneDatas: any
  public resDataPost: any
  public postId: any
  public expression: boolean;
  public linkmain: string;

  public isCheck: boolean = true;

  mySubscription: any;
  files: FileHandle[] = [];

  constructor(router: Router, userFacade: UserFacade, dialog: MatDialog, authenManager: AuthenManager, postFacade: PostFacade, pageFacade: PageFacade, postCommentFacade: PostCommentFacade, cacheConfigInfo: CacheConfigInfo, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog
    this.pageFacade = pageFacade;
    this.userFacade = userFacade;
    this.postCommentFacade = postCommentFacade;
    this.postFacade = postFacade;
    this.objectiveFacade = objectiveFacade;
    this.needsFacade = needsFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.routeActivated = routeActivated;
    this.isFiles = false;
    this.isPost = false
    this.cacheConfigInfo = cacheConfigInfo;
    this.userImage = {};
    this.isPload = true
    setTimeout(() => {
      this.linkmain = (window.location.origin + '/page/' + this.resDataPage.id)
    }, 500);

    setTimeout(() => {
      this.isPload = false
    }, 2000);

    this.routeActivated.params.subscribe((params) => {
      this.url = params['postId']
      this.isSpiner = true

      let search: SearchFilter = new SearchFilter();
      search.limit = SEARCH_LIMIT;
      search.count = SEARCH_COUNT;
      search.whereConditions = { _id: this.url };
      this.postFacade.search(search).then((res: any) => {
        this.showProfilePage(res[0].pageId)
        this.resDataPost = res
        let postIndex: number = 0
        let galleryIndex = 0;
        for (let post of this.resDataPost) {
          if (post.gallery.length > 0) {
            for (let img of post.gallery) {
              if (img.imageURL !== '') {
                this.getDataGallery(img.imageURL, postIndex, galleryIndex);
                galleryIndex++
              }
            }
            postIndex++;
          }

          if (post.referencePost !== null && post.referencePost !== undefined && post.referencePost !== '') {
            let search: SearchFilter = new SearchFilter();
            search.limit = 30;
            search.count = false;
            search.whereConditions = { _id: post.referencePost };
            this.postFacade.search(search).then((res: any) => {
              if (res.length !== 0) {
                post.referencePost = res[0]
              } else {
                post.referencePost = 'UNDEFINED PAGE'
              }
            }).catch((err: any) => {
            });
          }
        }

      }).catch((err: any) => {
      });
      setTimeout(() => {
        this.isSpiner = false
      }, 1500);
    })

    setTimeout(() => {
      this.isSpiner = false
    }, 1500);

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.heightWindow();
    });

  }

  public ngOnInit(): void {
    this.checkLoginAndRedirection();
    this.setTab();

    this.setCop();

    $(window).resize(() => {
      this.setTab();
    });

    // let user = this.authenManager.getCurrentUser();
    if (this.isLogin()) {
      this.getProfileImage();
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  isPageDirty(): boolean {
    // throw new Error('Method not implemented.');
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  private checkLoginAndRedirection(): void {
    if (this.isLogin()) {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        // this.router.navigateByUrl("/home");
      }
    }
  }

  private initPage(subPage: string) {
  }


  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public getProfileImage() {
    let user = this.authenManager.getCurrentUser()
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas.imageURL && this.userCloneDatas.imageURL && this.userCloneDatas.imageURL !== '') {
      this.assetFacade.getPathFile(this.userCloneDatas.imageURL).then((res: any) => {
        if (res.status === 1) {
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            this.userImage.imageURL = res.data;
          } else {
            this.userImage.imageURL = null
          }
        }
      }).catch((err: any) => {
        console.log(err)
        if (err.error.message === "Unable got Asset") {
          this.userImage.imageURL = '';
        }
      });
    } else {
      this.userImage = this.userCloneDatas
    }
  }

  public checkAccessPage(pageId: string) {
    this.pageFacade.getAccess(pageId).then((res: any) => {
      for (let dataPage of res.data) {
        if (dataPage.level === 'OWNER') {
          this.isNotAccess = true;
        }
      }

    }).catch((err: any) => {
      if (err.error.message === 'Unable to get User Page Access List') {
        this.isNotAccess = false;
      }
    })
  }

  filesDropped(files: FileHandle[]): void {
    this.files = files;
    for (let data of this.files) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageCoverSize = data.file.size;
        this.rePositionIamge(event.target.result);
      }
      reader.readAsDataURL(data.file);
    }
  }

  public rePositionIamge(image: any) {
    var imgWidth;
    var imgHeight;
    var imgHeightTotal;
    var img = new Image();
    img.src = image;

    $(img).on('load', function () {
      imgWidth = img.width;
      imgHeight = img.height;
      let imgWidthTrue = $('#images').width();
      let imgHeightTrue = $('#images').height();
      let varImg;
      if (imgHeight > imgWidth) {
        varImg = imgHeight / imgWidth;
        varImg = parseFloat(varImg).toFixed(2);
        imgHeightTotal = (imgWidthTrue * varImg) - imgHeightTrue;
      } else if (imgWidth > imgHeight) {
        varImg = imgWidth / imgHeight;
        varImg = parseFloat(varImg).toFixed(2);
        imgHeightTotal = (imgWidthTrue / varImg) - imgHeightTrue;
      } else {
        imgHeightTotal = imgWidthTrue - imgHeightTrue;
      }

      $('#images').css('background-image', 'url(' + img.src + ')');
      $('#images').css('display', 'flex');
    });

    var start_y;
    var newPos;
    this.isFiles = true;
    var curPos = $('#images').css('background-position-y');
    var mouseDown = false;
    var move = true;
    $('#images').mousedown(function (e) {
      mouseDown = true;
    });

    $(document).mouseup(function () {
      mouseDown = false;
      $('.images').css('background-position-y', curPos)
    });

    $('#images').mouseenter(function (e) {
      start_y = e.clientY;
    });

    $(document).mousemove(function (e) {
      newPos = e.clientY - start_y;
      start_y = e.clientY;
      if (mouseDown) {
        $('#images').css('background-position-y', '+=' + newPos);
        curPos = parseInt($('#images').css('background-position-y'));
        if (curPos > 0) curPos = 0;
        if (curPos < -imgHeightTotal) curPos = -imgHeightTotal;
        $('#images').css('background-position-y', curPos);
      }
    });
  }

  public createPost(value): void {
    if (value.title) {
      let pageId = this.resDataPage.id;
      this.pageFacade.createPost(pageId, value).then((res) => {
        let alertMessages: string;
        if (res.status === 1) {
          if (res.message === 'Create PagePost Success') {
            alertMessages = 'สร้างโพสต์สำเร็จ'
            let dialog = this.showAlertDialogWarming(alertMessages, "none");
            dialog.afterClosed().subscribe(result => {
              if (result) {
                let itemPosts: any[] = []
                itemPosts = this.resDataPage.posts
                itemPosts.splice(0, 0, res.data)
                this.resDataPage.posts = itemPosts
                this.boxPost.clearDataAll();
              }
              this.stopLoading();
            });
          }
        }
      }).catch((err: any) => {
        console.log(err);
      })
    }
  }

  public clickFollow(): void {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
    } else {
      let pageId = this.resDataPage.id;
      this.pageFacade.follow(pageId).then((res) => {
        if (res.message === "Unfollow Page Success") {
          this.resDataPage.isFollow = res.data.isFollow;
          this.resDataPage.followers = res.data.followers;
        } else {
          this.resDataPage.isFollow = res.data.isFollow;
          this.resDataPage.followers = res.data.followers;
        }

      }).catch((err: any) => {
        console.log(err);
      })
    }
  }

  public linkDataType(link: any) {
    window.history.back();
  }

  public showProfilePage(url): void {

    this.pageFacade.getProfilePage(url).then((res) => {
      this.checkAccessPage(res.data.id);
      if (res.pageUsername !== null && res.pageUsername !== undefined) {
        this.url = res.pageUsername
      }
      if (res.data) {
        // this.observManager.publish("authen.page", res.data);
        this.position = res.data.coverPosition;
        this.isLoading = true;
        if (res.data.imageURL && res.data.imageURL !== '') {
          this.getDataIcon(res.data.imageURL, "image")
        }
        if (res.data.coverURL && res.data.coverURL !== '') {
          this.getDataIcon(res.data.coverURL, "cover")
        }
        if (res.data.pageObjectives && res.data.pageObjectives.length > 0) {
          let index = 0;
          for (let result of res.data.pageObjectives) {
            if (result.iconURL !== '') {
              this.getDataIcon(result.iconURL, "icon", index)
              index++
            }
          }
        }
        this.resDataPage = res.data;
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }
      if (this.boxPost !== undefined) {
        this.boxPost.clearDataAll();
      }

    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Page') {
          this.msgPageNotFound = true;
        }
        // else if(err.error.message === 'Unable got Asset'){
        // }
        this.stopLoading();
      }
    })
  }

  private getDataIcon(imageURL: any, myType?: string, index?: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (myType === "image") {
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            setTimeout(() => {
              Object.assign(this.resDataPage, { imageBase64: res.data });
            }, 1000);
          } else {
            setTimeout(() => {
              Object.assign(this.resDataPage, { imageBase64: null });
            }, 1000);
          }
        } else if (myType === "cover") {
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            setTimeout(() => {
              Object.assign(this.resDataPage, { coverBase64: res.data });
            }, 1000);
          } else {
            setTimeout(() => {
              Object.assign(this.resDataPage, { coverBase64: '' });
            }, 1000);
          }
        } else if (myType === "icon") {
          setTimeout(() => {
            if (this.resDataPage && this.resDataPage.pageObjectives !== undefined) {
              if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                Object.assign(this.resDataPage.pageObjectives[index], { iconBase64: res.data, isLoaded: true });
              } else {
                Object.assign(this.resDataPage.pageObjectives[index], { iconBase64: '', isLoaded: true });
              }
            }
          }, 1000);
        }
        this.isLoading = false
      }
    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Asset') {
          setTimeout(() => {
            if (myType === "image") {
              Object.assign(this.resDataPage, { imageBase64: '' });
            } else if (myType === "cover") {
              Object.assign(this.resDataPage, { coverBase64: '' });
            } else {
              Object.assign(this.resDataPage.pageObjectives[index], { iconBase64: '', isLoaded: true });
            }
          }, 1000);
        }
      }
    });
  }

  public searchTypePost(data: string) {
    this.pageFacade.searchPostType(data, this.url).then((posts: any) => {
      let postArr: any[] = []
      if (posts.posts != null && posts.posts != undefined) {
        if (posts && posts.posts.length > 0) {
          let postIndex = 0;
          for (let post of posts.posts) {
            let galleryIndex = 0;
            if (post.gallery.length > 0) {
              for (let img of post.gallery) {
                if (img.imageURL !== '') {
                  this.getDataGallery(img.imageURL, postIndex, galleryIndex);
                  galleryIndex++
                }
              }
            }
            postArr.push(post)
            postIndex++;
          }
        }
      }
      if (postArr.length > 0) {
        this.resDataPage.posts = postArr;
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }

  private getDataGallery(imageURL: any, postIndex: number, galleryIndex: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (ValidBase64ImageUtil.validBase64Image(res.data)) {
          setTimeout(() => {
            if (this.resDataPost && this.resDataPost[postIndex] !== undefined && this.resDataPost[postIndex].gallery[galleryIndex] !== undefined) {
              Object.assign(this.resDataPost[postIndex].gallery[galleryIndex], { galleryBase64: res.data, isLoaded: true });
            }
          }, 500);
        } else {
          Object.assign(this.resDataPost[postIndex].gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
        }
        this.isLoading = false
      }
    }).catch((err: any) => {
    });
  }

  public postLike(data) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
    } else {
      this.postFacade.like(data._id).then((res: any) => {
        if (res.isLike) {
          if (data._id === res.posts.id) {
            this.resDataPost[0].likeCount = res.likeCount;
            this.resDataPost[0].isLike = res.isLike;
          }
        } else {
          // unLike 
          if (data._id === res.posts.id) {
            this.resDataPost[0].likeCount = res.likeCount;
            this.resDataPost[0].isLike = res.isLike;
          }
        }
      }).catch((err: any) => {
        console.log(err)
      });
    }
  }

  public deletePost(post: any, index: number) {
    const confirmEventEmitter = new EventEmitter<any>();
    confirmEventEmitter.subscribe(() => {
      this.submitDialog.emit();
    });
    const canCelEventEmitter = new EventEmitter<any>();
    canCelEventEmitter.subscribe(() => {
      this.submitCanCelDialog.emit();
    });

    let dialog = this.showDialogWarming("คุณต้องการลบโพสต์นี้ ", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.pageFacade.deletePost(post.pageId, post._id).then((res) => {
          this.resDataPage.posts.splice(index, 1);

          this.initPage(this.subPage);
        }).catch((err: any) => {
        })
      }
    });
  }

  public showDialogGallery(data) {
    const dialogRef = this.dialog.open(DialogMedia, {
      width: 'auto',
      data: data,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
      }
      this.stopLoading();
    });
  }

  public editImagePage(images: any) {
    this.resDataPage.imageBase64 = images.image;
    const asset = new Asset();
    let data = images.image.split(',')[0];
    let typeImage = data.split(':')[1];
    asset.mimeType = typeImage.split(';')[0];
    asset.data = images.image.split(',')[1];
    asset.fileName = images.name;
    asset.size = images.size;

    let dataImage = {
      asset
    }
    let pageId = this.resDataPage.id;
    this.pageFacade.saveImagePage(pageId, dataImage).then((res: any) => {
      if (res.status === 1) {
        this.getDataIcon(res.data.coverURL, "cover")
        this.isFiles = false;
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public saveCoverImage(): void {
    this.isEditCover = false;
    const styleWidth = document.getElementById('images');
    let value = window.getComputedStyle(styleWidth).getPropertyValue("background-position-y");
    let position = value.substring(0, value.lastIndexOf("px"));
    let image = window.getComputedStyle(styleWidth).getPropertyValue("background-image");
    let dataImage = image.substring(5).split(',')[0];
    const asset = new Asset();
    const typeImage = dataImage.split(':')[1];
    asset.mimeType = typeImage.split(';')[0];
    let index = image.substring(5).split(',')[1];

    asset.data = index.substring(0, index.lastIndexOf(")")).split('"')[0];
    asset.size = this.imageCoverSize;

    let dataList = {
      coverPosition: Number(position),
      asset
    }

    let pageId = this.resDataPage.id
    this.pageFacade.saveCoverImagePage(pageId, dataList).then((res: any) => {
      if (res.status === 1) {
        this.getDataIcon(res.data.coverURL, "cover");
        this.isFiles = false;
        this.showProfilePage(this.url);
      }

    }).catch((err: any) => {
      console.log(err)
    })
  }

  public onFileSelect(event) {
    let files = event.target.files[0];
    if (files.length === 0) {
      return;
    }
    if (files) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageCoverSize = files.size;
        this.rePositionIamge(event.target.result);
        this.isEditCover = true
        this.isFiles = true;
      }
      reader.readAsDataURL(files);
    }
  }

  public showDialogImage(): void {
    const dialogRef = this.dialog.open(DialogImage, {
      width: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.editImagePage(result)
      }
      this.stopLoading();
    });
  }

  public heightWindow() {
    var resizeWinH = window.innerHeight;
    var resizeWinW = window.innerWidth;
    var recommended1 = this.pagefixHeight.nativeElement.offsetHeight;
    var recommended2 = this.sidefeedHeight.nativeElement.offsetHeight;
    var maxrecommended1 = recommended1 + 100;
    var maxrecommended2 = recommended2 + 100;
    var count1 = recommended1 - resizeWinH;
    var count2 = recommended2 - resizeWinH;
    var maxcount1 = count1 + 60;
    var maxcount2 = count2 + 60;

    if (resizeWinW <= 1200) {
      this.pagefixHeight.nativeElement.style.top = '';
      this.sidefeedHeight.nativeElement.style.top = '';
    } else {
      if (maxrecommended1 > resizeWinH) {
        this.pagefixHeight.nativeElement.style.top = '-' + maxcount1 + 'px';
      } else {
        this.pagefixHeight.nativeElement.style.top = '100pt';
      }

      // --------------

      if (maxrecommended2 > resizeWinH) {
        this.sidefeedHeight.nativeElement.style.top = '-' + maxcount2 + 'px';
      } else {
        this.sidefeedHeight.nativeElement.style.top = '55pt';
      }
    }
  }

  public setTab() {
    if (window.innerWidth <= 1200) {
      this.Tab = true;
    } else if (window.innerWidth > 1200) {
      this.Tab = false;
    }
  }

  public createComment(comment: any) {
    let commentPosts = new CommentPosts
    commentPosts.comment = comment.value
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
    }).catch((err: any) => {
    })
  }

  public async actionComment(action: any, index?) {
    this.postId = action.pageId
    let pageInUser: any[]
    let data: RePost = new RePost();
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { ownerUser: this.userCloneDatas.id };

    if (action.mod === 'REBOON') {
      if (action.type === 'TOPIC') {
        var aw = await this.pageFacade.search(search).then((pages: any) => {
          pageInUser = pages
        }).catch((err: any) => {
        })
        for (let p of pageInUser) {
          var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
            p.img64 = res.data
          }).catch((err: any) => {
          });
        }
        const dialogRef = this.dialog.open(DialogReboonTopic, {
          width: '650pt',
          data: { options: { post: action.post, page: pageInUser } }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
            data.pageId = null
          } else {
            data.pageId = result.pageId
          }
          data.detail = result.text
          data.hashTag = result.hashTag
          this.postFacade.rePost(action.postData, data).then((res: any) => {
          }).catch((err: any) => {
            console.log(err)
          })
        });
      } else if (action.type === 'NOTOPIC') {
        data.pageId = null
        this.postFacade.rePost(action.postData, data).then((res: any) => {
        }).catch((err: any) => {
          console.log(err)
        })

      }
    } else if (action.mod === 'LIKE') {
      this.postLike(action.postData);
    } else if (action.mod === 'SHARE') {
    } else if (action.mod === 'COMMENT') {
    } else if (action.mod === 'POST') {
      this.router.navigateByUrl('/page/' + this.url + "/post/" + action.pageId);
    }
  }

  public setCop() {
    if (window.innerWidth > 899) {
      this.isCheck = true;
    } else {
      this.isCheck = false;
    }
  }

  public onResize($event) {
    this.setCop();
  }
}






