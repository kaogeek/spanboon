/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, PostCommentFacade, PostFacade, UserFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { DialogImage } from '../../shares/dialog/DialogImage.component';
import { DialogReboonTopic } from '../../shares/dialog/DialogReboonTopic.component';
import { FileHandle } from '../../shares/directive/directives';
import * as $ from 'jquery';
import { Asset } from '../../../models/Asset';
import { CommentPosts } from '../../../models/CommentPosts';
import { Router, ActivatedRoute, NavigationEnd, ActivationEnd } from '@angular/router';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { SearchFilter } from '../../../models/SearchFilter';
import { RePost } from '../../../models/RePost';
import { MESSAGE } from '../../../AlertMessage';
import { BoxPost } from '../../shares/BoxPost.component';
import { DialogMedia } from '../../shares/dialog/DialogMedia.component';
import { DialogPost } from '../../shares/shares';

const PAGE_NAME: string = 'page';
const PAGE_SUB_POST: string = 'post' 
const URL_PATH: string = '/page/';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

declare var $: any;
@Component({
  selector: 'spanboon-fan-page',
  templateUrl: './FanPage.component.html',
})
export class FanPage extends AbstractPageImageLoader implements OnInit, OnDestroy {
  private cacheConfigInfo: CacheConfigInfo;

  public static readonly PAGE_NAME: string = PAGE_NAME;
  public static readonly PAGE_SUB_POST: string = PAGE_SUB_POST;

  @Input()
  protected isIconPage: boolean;
  @Input()
  protected text: string = "ข้อความ";
  @Output()
  public submitDialog: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitCanCelDialog: EventEmitter<any> = new EventEmitter();

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: 'ทั่วไป', keyword: 'general' }, { label: 'มองหา', keyword: 'needs' }, { label: 'เติมเต็ม', keyword: 'fulfillment' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild('pagefixHeight', { static: false }) pagefixHeight: ElementRef;
  @ViewChild('sidefeedHeight', { static: false }) sidefeedHeight: ElementRef;
  @ViewChild('imgprofile', { static: false }) imgprofile: ElementRef;
  @ViewChild('fanpagebackground', { static: false }) fanpagebackground: ElementRef;

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
  public resPost: any = {};
  public resObjective: any;
  public url: string;
  public subPage: string;
  public redirection: string;
  public resNeeds: any;
  public isLoading: boolean; 
  public isFiles: boolean;
  public isNotAccess: boolean;
  public isEditCover: boolean;
  public showLoading: boolean;
  public isPost: boolean;
  public msgPageNotFound: boolean;
  public isLoadingPost: boolean;
  public isMaxLoadingPost: boolean;
  public isLoadingClickTab: boolean;
  public isLoadDataPost: boolean;
  public imageCoverSize: number;
  public position: number;
  public innerWidth: any;
  public pageUser: any[]; 
  public userImage: any;
  public commentData: any;
  public postList: any[] = [];
  public Tab: boolean = true;
  public reboonData: any
  public splitTpyeClone: any
  public userCloneDatas: any
  public resDataPost: any
  public postId: any
  public name: any
  public resContact: any[] = [];
  public linkmain: any = '';
  public labelStatus: string;
  public isCheck: boolean = true;
  public countScroll: number;

  public CheckPost: boolean = true;

  private coverImageoldValue = 50;
  public index: number;

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
    this.isPost = false;
    this.isLoadingPost = false;
    this.isMaxLoadingPost = false;
    this.showLoading = true;
    this.cacheConfigInfo = cacheConfigInfo;
    this.userImage = {};
    this.labelStatus = 'ไม่พบเพจ'; 
    this.resPost.posts = [];

    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url: string = decodeURI(this.router.url);
        const pathPost = url.split('/')[1];
        const pathPostId = url.split('/')[2];

        if (url.indexOf(URL_PATH) >= 0) {
          const substringPath: string = url.substring(url.indexOf(URL_PATH), url.length);
          this.subPage = substringPath.replace(URL_PATH, '');
          const replaceCommentURL: string = this.subPage.replace('/page/', '');
          const splitTextId = replaceCommentURL.split('/')[0];
          const splitTpye = replaceCommentURL.split('/')[1];
          this.splitTpyeClone = splitTpye;

          if (splitTextId !== undefined && splitTextId !== null) {
            this.url = splitTextId;
            if (!this.resDataPage) {
              this.showProfilePage(this.url);
            } else {
              if (this.resDataPage && this.resDataPage.pageUsername !== splitTextId && this.resDataPage.id !== splitTextId) {
                this.showProfilePage(this.url);
              }
            }
          }

          if (!this.msgPageNotFound) {
            if (splitTpye !== undefined && splitTpye !== null) {
              this.splitTpyeClone = splitTpye
              this.initPage(splitTpye);
            } else {
              this.splitTpyeClone = 'timeline'
              this.initPage('timeline');
            }
          }

        } else if (pathPost.includes('post')) {
          this.CheckPost = false;
          this.searchPostById(pathPostId);
        }
      }
    });

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.heightWindow();
      this.countScroll = scrollTop.fix;
      this.setProfile(); 
    });

    this.observManager.subscribe('refresh_page', (type) => {
      let data = {
        type: type,
        offset: 0
      }
      this.searchPostPageType(data, true);
    });

    this.observManager.subscribe('scroll.buttom', (buttom) => {
      if (!this.isMaxLoadingPost) {
        let data;
        this.isLoadingPost = true
        setTimeout(() => {
          if (this.splitTpyeClone === 'general') {
            data = {
              type: 'GENERAL',
            }
            this.activeLink = 'ทั่วไป';
            this.searchPostPageType(data);
          } else if (this.splitTpyeClone === 'needs') {
            data = {
              type: 'NEEDS',
            }
            this.activeLink = 'มองหา';
            this.searchPostPageType(data);
          } else if (this.splitTpyeClone === 'timeline') {
            this.activeLink = 'ไทมไลน์';
            data = {
              type: '',
            }
            this.searchPostPageType(data);
          } else if (this.splitTpyeClone === 'fulfillment') {
            data = {
              type: 'FULFILLMENT',
            }
            this.activeLink = 'เติมเต็ม';
            this.searchPostPageType(data);
          }
        }, 1000);
      }
    });
  }

  public ngOnDestroy() {
    this.mySubscription.unsubscribe();
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

  public ngOnInit(): void {
    super.ngOnInit();
    this.checkLoginAndRedirection();
    this.setTab();
    this.setCop();

    $(window).resize(() => {
      this.setTab();
    });

    if (this.isLogin()) {
      this.getProfileImage();
    }
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
    let data;
    if (subPage === 'general') {
      data = {
        type: 'GENERAL',
        offset: 0
      }
      this.activeLink = 'ทั่วไป';
      this.searchPostPageType(data, true);
    } else if (subPage === 'needs') {
      data = {
        type: 'NEEDS',
        offset: 0
      }
      this.activeLink = 'มองหา';
      this.searchPostPageType(data, true);
    } else if (subPage === 'timeline') {
      this.activeLink = 'ไทมไลน์';
      data = {
        type: '',
        offset: 0
      }
      this.searchPostPageType(data, true);
    } else if (this.splitTpyeClone === 'fulfillment') {
      this.activeLink = 'เติมเต็ม';
      data = {
        type: 'FULFILLMENT',
        offset: 0
      }
      this.searchPostPageType(data, true);
    } else if (subPage === 'settings') {
      return this.router.navigateByUrl('/page/' + this.url + '/' + subPage);
    } else {
      return this.router.navigateByUrl('/page/' + this.url);
    }
  }

  public searchPostPageType(data, offset?: boolean) {
    if (this.isLoadDataPost) {
      return;
    }
    if (offset) {
      data.offset = 0;
      this.resPost.posts = [];
      this.isLoadingPost = true;
    } else {
      data.offset = this.resPost && this.resPost.posts.length > 0 ? this.resPost.posts.length : 0;
    }
    data.limit = 5
    let originalpost: any[] = this.resPost.posts;
    this.pageFacade.searchPostType(data, this.url).then(async (res: any) => {
      if (!Array.isArray(res) && res.posts.length > 0) {
        if (res.posts.length !== 5) {
          this.isMaxLoadingPost = true
          this.isLoadingPost = false
        }
        for (let post of res.posts) {
          originalpost.push(post);
        }
        if (this.resDataPage && this.resDataPage.pageObjectives && this.resDataPage.pageObjectives.length > 0) {
          let index = 0;
          for (let result of this.resDataPage.pageObjectives) {
            if (result.iconURL !== '') {
              this.getDataIcon(result.iconURL, "icon", index)
              index++
            }
          }
        }
        this.resPost.posts = originalpost
        for (let post of this.resPost.posts) {
          if (post.referencePost !== null && post.referencePost !== undefined && post.referencePost !== '') {
            let search: SearchFilter = new SearchFilter();
            search.limit = 5;
            search.count = false;
            search.whereConditions = { _id: post.referencePost };
            this.postFacade.search(search).then((res: any) => {
              if (res.length !== 0) {
                post.referencePostObject = res[0]
              } else {
                post.referencePostObject = 'UNDEFINED PAGE'
              }
            }).catch((err: any) => {
            });
          }
        }
        setTimeout(() => {
          if (this.resPost.posts && this.resPost.posts.length > 0) {
            let postIndex = 0;
            for (let post of this.resPost.posts) {
              let galleryIndex = 0;
              if (post.gallery.length > 0) {
                for (let img of post.gallery) {
                  if (img.imageURL !== '') {
                    this.getDataGallery(img.imageURL, postIndex, galleryIndex);
                    galleryIndex++
                  }
                }
              }
              postIndex++;
            }
          }
          this.isLoadingPost = false;
          this.isLoadingClickTab = false;
          this.isLoadDataPost = false;
        }, 1500);
      } else {
        this.isMaxLoadingPost = true;
        this.isLoadingPost = false;
        this.isLoadingClickTab = false;
        this.isLoadDataPost = false;
        if (offset) {
          this.resPost = [];
        }
      }
    }).catch((err: any) => {
      console.log(err)
    });
  }

  public searchPostById(postId: string) {
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { _id: postId };
    this.postFacade.search(search).then((res: any) => {
      this.resDataPost = res;
      if (this.resDataPost.length === 0) {
        this.msgPageNotFound = true;
        this.labelStatus = 'ไม่พบโพสต์';
      } else {
        this.showProfilePage(res[0].pageId);
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
                post.referencePostObject = res[0]
              } else {
                post.referencePostObject = 'UNDEFINED PAGE'
              }
            }).catch((err: any) => {
            });
          }
        }
      }
    }).catch((err: any) => {
    });
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public getProfileImage() {
    let user = this.authenManager.getCurrentUser()
    this.searchPageInUser(user.id)
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
      $('.images').css('background-position-y', curPos);
    });

    $('#images').mouseenter(function (e) {
      start_y = e.clientY;
    });

    $(document).mousemove(function (e) {
      newPos = e.clientY - start_y;
      start_y = e.clientY;

      if (mouseDown) {
        let newPercent = (100 / imgHeight) * newPos;
        newPercent = newPercent * 5;

        if (this.coverImageoldValue !== undefined) {
          if (this.coverImageoldValue >= 100) {
            this.coverImageoldValue = 100;
          } else {
            this.coverImageoldValue += newPercent;
          }

          if (this.coverImageoldValue <= 0) {
            this.coverImageoldValue = 0;
          } else {
            this.coverImageoldValue += newPercent;
          }
        } else {
          if (this.coverImageoldValue >= 100) {
            this.coverImageoldValue = 100;
          } else {
            this.coverImageoldValue = newPercent;
          }

          if (this.coverImageoldValue <= 0) {
            this.coverImageoldValue = 0;
          } else {
            this.coverImageoldValue = newPercent;
          }
        }

        $('#images').css('background-position-y', this.coverImageoldValue + '%');
        curPos = parseInt($('#images').css('background-position-y'));

        if (curPos > 100) {
          curPos = 100;
          $('#images').css('background-position-y', curPos + '%');
        }
        if (curPos < 0) {
          curPos = 0;
          $('#images').css('background-position-y', curPos + '%');
        }
      }
    });
  }

  public createPost(value): void {
    if (value.title) {
      let pageId;
      if (value.id !== '' && value.id !== undefined && value.id !== null) {
        pageId = value.id;
      } else {
        pageId = this.resDataPage.id;
      }
      this.pageFacade.createPost(pageId, value).then((res) => {
        let alertMessages: string;
        if (res.status === 1) {
          if (res.message === 'Create PagePost Success') {
            if (value.isDraft || value.settingsPost) {
              if (value.isDraft) {
                alertMessages = 'สร้างโพสต์ฉบับร่างสำเร็จ'
              } else {
                alertMessages = 'โพสต์ของคุณจะแสดงเมื่อถึงเวลาที่คุณตั้งไว้'
              }
              this.showAlertDialogWarming(alertMessages, "none");
            }
            if (this.splitTpyeClone !== undefined && this.splitTpyeClone !== null) {
              this.initPage(this.splitTpyeClone);
            } else {
              this.initPage('timeline');
            }
            this.boxPost.clearDataAll();
            this.stopLoading();

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
    if (link === 'BACK') {
      this.resDataPost = null
      this.isPost = false
      this.router.navigateByUrl('/page/' + this.url + "/" + 'timeline');
    } else {
      this.isLoadingClickTab = true;
      // if (link.keyword !== this.activeLink) {
      //   this.isLoadDataPost = true;
      // } else {
      //   this.isLoadDataPost = false;
      // }
      this.router.navigateByUrl('/page/' + this.url + "/" + link.keyword);
    }
  }

  public showProfilePage(url): void {
    this.pageFacade.getProfilePage(url).then((res) => {
      this.checkAccessPage(res.data.id);
      if (res.pageUsername !== null && res.pageUsername !== undefined) {
        this.url = res.pageUsername
      }
      if (res.data) {
        this.position = res.data.coverPosition;
        this.isLoading = true;
        if (res.data && res.data.imageURL && res.data.imageURL !== '') {
          this.getDataIcon(res.data.imageURL, "image")
        }
        if (res.data && res.data.coverURL && res.data.coverURL !== '') {
          this.getDataIcon(res.data.coverURL, "cover")
        }
        if (res.data && res.data.pageObjectives && res.data.pageObjectives.length > 0) {
          let index = 0;
          for (let result of res.data.pageObjectives) {
            if (result.iconURL !== '') {
              this.getDataIcon(result.iconURL, "icon", index)
              index++
            }
          }
        }
        this.resDataPage = res.data;
        if (this.resDataPage && this.resDataPage.name) {
          this.name = this.resDataPage.name
        } else if (this.resDataPage && this.resDataPage.uniqueId) {
          this.name = this.resDataPage.uniqueId
        } else if (this.resDataPage.displayName) {
          this.name = this.resDataPage.displayName
        }

        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }
      if (this.boxPost !== undefined) {
        this.boxPost.clearDataAll();
      }
      if (res.data && res.data.needs && res.data.needs.length > 0) {
        for (let n of res.data.needs) {
          if (n.standardItemId) {
            this.needsFacade.getNeeds(n.standardItemId).then((needs) => {
              n.imageURL = needs.imageURL
            }).catch((err: any) => {
            })
          }
        }
      }

    }).catch((err: any) => {
      console.log('err ', err)
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Page') {
          this.msgPageNotFound = true;
          this.labelStatus = 'ไม่พบเพจ';
        } 
        this.stopLoading();
      }
    })
  }

  private getDataIcon(imageURL: any, myType?: string, index?: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (myType === "image") {
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            Object.assign(this.resDataPage, { imageBase64: res.data });
          } else {
            Object.assign(this.resDataPage, { imageBase64: null });
          }
        } else if (myType === "cover") {
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            Object.assign(this.resDataPage, { coverBase64: res.data });
          } else {
            Object.assign(this.resDataPage, { coverBase64: '' });
          }
        } else if (myType === "icon") {
          if (this.resDataPage && this.resDataPage.pageObjectives !== undefined) {
            if (ValidBase64ImageUtil.validBase64Image(res.data)) {
              Object.assign(this.resDataPage.pageObjectives[index], { iconBase64: res.data, isLoaded: true });
            } else {
              Object.assign(this.resDataPage.pageObjectives[index], { iconBase64: '', isLoaded: true });
            }
          }
        }
        this.isLoading = false
      }
    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Asset') {
          if (myType === "image") {
            Object.assign(this.resDataPage, { imageBase64: '' });
          } else if (myType === "cover") {
            Object.assign(this.resDataPage, { coverBase64: '' });
          } else {
            Object.assign(this.resDataPage.pageObjectives[index], { iconBase64: '', isLoaded: true });
          }
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
        this.resPost.posts = postArr;
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }

  private getDataGallery(imageURL: any, postIndex: number, galleryIndex: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (ValidBase64ImageUtil.validBase64Image(res.data)) {
          if (this.resPost && this.resPost.posts && this.resPost.posts[postIndex] !== undefined && this.resPost.posts[postIndex].gallery[galleryIndex] !== undefined) {
            Object.assign(this.resPost.posts[postIndex].gallery[galleryIndex], { galleryBase64: res.data, isLoaded: true });
          }
        } else {
          Object.assign(this.resPost.posts[postIndex].gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
        }
        this.isLoading = false
      }
    }).catch((err: any) => {
      // if (err.error.status === 0) {
      //   if (err.error.message === 'Unable got Asset') {
      //     Object.assign(this.resDataPage.posts[postIndex].gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
      //   }
      // }
    });
  }

  public postLike(data: any, index: number) {
    this.postFacade.like(data.postData._id, data.userAsPage.id).then((res: any) => {
      if (res.isLike) {
        if (data.postData._id === res.posts.id) {
          this.resPost.posts[index].likeCount = res.likeCount;
          this.resPost.posts[index].isLike = res.isLike;
        }
      } else {
        // unLike 
        if (data.postData._id === res.posts.id) {
          this.resPost.posts[index].likeCount = res.likeCount;
          this.resPost.posts[index].isLike = res.isLike;
        }
      }
    }).catch((err: any) => {
      console.log(err)
    });
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
          this.resPost.posts.splice(index, 1);
          this.initPage(this.subPage);
        }).catch((err: any) => {
        })
      }
    });
  }

  public editPost(data, index?: number) {
    data.isFulfill = false;
    data.isListPage = true;
    data.isEdit = true;
    const dialogRef = this.dialog.open(DialogPost, {
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
        this.getDataIcon(res.data.imageURL, "image");
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
    let position = value.substring(0, value.lastIndexOf("%"));
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

  public cancelCoverImage() {
    this.isEditCover = false;
    this.isFiles = false;
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
    var recommended1 = this.pagefixHeight && this.pagefixHeight.nativeElement.offsetHeight;
    var recommended2 = this.sidefeedHeight && this.sidefeedHeight.nativeElement.offsetHeight;
    var maxrecommended1 = recommended1 + 100;
    var maxrecommended2 = recommended2 + 100;
    var count1 = recommended1 - resizeWinH;
    var count2 = recommended2 - resizeWinH;
    var maxcount1 = count1 + 60;
    var maxcount2 = count2 + 60;

    // if (this.sidefeedHeight && this.pagefixHeight) {
    if (resizeWinW <= 899) {
      if (this.pagefixHeight || this.sidefeedHeight) {
        this.pagefixHeight.nativeElement.style.top = '';
        this.sidefeedHeight.nativeElement.style.top = '';
      }
    } else {
      if (maxrecommended1 > resizeWinH) {
        if (this.pagefixHeight) {
          this.pagefixHeight.nativeElement.style.top = '-' + Math.abs(maxcount1) + 'px';
        }
      } else {
        if (this.pagefixHeight) {
          this.pagefixHeight.nativeElement.style.top = '55pt';
        }
      }

      // --------------

      if (maxrecommended2 > resizeWinH) {
        if (this.sidefeedHeight) {
          this.sidefeedHeight.nativeElement.style.top = '-' + Math.abs(maxcount2) + 'px';
        }
      } else {
        if (this.sidefeedHeight) {
          this.sidefeedHeight.nativeElement.style.top = '55pt';
        }
      }
    }
    // }
  }

  public setTab() {
    if (window.innerWidth <= 899) {
      this.Tab = true;
    } else {
      this.Tab = false;
    }
  }

  public createComment(comment: any, index?: number) {
    let commentPosts = new CommentPosts
    if (comment.userAsPage.id !== undefined && comment.userAsPage.id !== null) {
      commentPosts.commentAsPage = comment.userAsPage.id
    }
    commentPosts.comment = comment.value
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
      this.resPost.posts[index].commentCount++
      this.resPost.posts[index].isComment = true
      this.resPost.posts[index]
    }).catch((err: any) => {
    })
  }

  private isLoginCh() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
      return
    }
  }

  public async actionComment(action: any, index: number) {
    this.postId = action.pageId
    let pageInUser: any[]
    let data: RePost = new RePost();
    let dataPost: any
    let userAsPage: any
    if (action.mod === 'REBOON') {
      this.isLoginCh();
      if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
        userAsPage = action.userAsPage.id
      } else {
        userAsPage = null
      }
      if (action.type === "TOPIC") {
        let search: SearchFilter = new SearchFilter();
        search.limit = 10;
        search.count = false;
        search.whereConditions = { ownerUser: this.userCloneDatas.id };
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
          width: '550pt',
          data: { options: { post: action.post, page: pageInUser, userAsPage: userAsPage, pageUserAsPage: action.userAsPage } }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) {
            return
          }
          if (result.isConfirm) {
            if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
              data.pageId = null
              if (result.text === "") {
                if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                  dataPost = action.post.referencePost._id
                } else {
                  dataPost = action.post._id
                }
              } else {
                dataPost = action.post._id
              }
            } else {
              data.pageId = result.pageId
              if (result.text === "") {
                if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
                  dataPost = action.post.referencePost._id
                } else {
                  dataPost = action.post._id
                }
              } else {
                dataPost = action.post._id
              }
            }
            data.detail = result.text
            if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
              data.postAsPage = action.userAsPage.id
            }
            if (result.hashTag !== undefined && result.hashTag !== null) {
              data.hashTag = result.hashTag
            }
            this.postFacade.rePost(dataPost, data).then((res: any) => {
              this.resPost.posts[index].repostCount++
            }).catch((err: any) => {
              console.log(err)
            })
          }
        });
      } else if (action.type === "NOTOPIC") {
        data.pageId = null
        dataPost = action.post._id
        this.postFacade.rePost(dataPost, data).then((res: any) => {
          this.resPost.posts[index].repostCount++
          this.resPost.posts[index].isRepost = true
        }).catch((err: any) => {
          console.log(err)
        })
      } else if (action.type === "UNDOTOPIC") {
        this.postFacade.undoPost(action.post._id).then((res: any) => {
        }).catch((err: any) => {
        })
      }

    } else if (action.mod === 'LIKE') {
      this.isLoginCh();
      this.postLike(action, index);
    } else if (action.mod === 'SHARE') {
    } else if (action.mod === 'COMMENT') {
      this.isLoginCh();
    } else if (action.mod === 'POST') {
      this.router.navigateByUrl('/post/' + action.pageId);
    }
  }

  public getAaaPost(action: any, index: number) {
    let user = this.authenManager.getCurrentUser()
    if (action.userPage.id === user.id) {
      action.userPage.id = null
    }
    this.postFacade.getAaaPost(action.postData, action.userPage.id).then((pages: any) => {
      this.resPost.posts[index].isComment = pages.isComment
      this.resPost.posts[index].isLike = pages.isLike
      this.resPost.posts[index].isRepost = pages.isRepost
      this.resPost.posts[index].isShare = pages.isShare
    }).catch((err: any) => {
    })
  }

  public async searchPageInUser(userId) {
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { ownerUser: userId };
    var aw = await this.pageFacade.search(search).then((pages: any) => {
      this.pageUser = pages
      this.pageUser.push(this.userCloneDatas)
      this.pageUser.reverse();
    }).catch((err: any) => {
    });
    if (this.pageUser.length > 0) {
      for (let p of this.pageUser) {
        var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
          p.img64 = res.data
        }).catch((err: any) => {
        });
      }
    }
  }

  public getImageSelector(): string[] {
    return [".checkload"];
    // return [".gallery"];
  }

  public onSelectorImageElementLoaded(imageElement: any[]): void {

  }

  public onImageElementLoadOK(imageElement: any): void {
  }

  public onImageElementLoadError(imageElement: any): void {
    console.log('error')
  }

  public onImageLoaded(imageElement: any[]): void {
    setTimeout(() => {
      this.showLoading = false;
    }, 2000);
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
    this.setProfile();
  }

  public setProfile() {
    if (window.innerWidth > 899) {
      if (this.isLoading !== true) {
        if (this.fanpagebackground && this.fanpagebackground.nativeElement !== undefined) {
          var x = this.fanpagebackground.nativeElement.offsetHeight - this.countScroll;
        }
        if (this.fanpagebackground && this.fanpagebackground.nativeElement !== undefined) {
          if (this.countScroll <= this.fanpagebackground.nativeElement.offsetHeight - this.countScroll + 150) {
            this.imgprofile.nativeElement.style.marginTop = '-50pt';
          } else {
            this.imgprofile.nativeElement.style.marginTop = '10pt';
          }
        }
      }
    } else {
      if(this.imgprofile && this.imgprofile.nativeElement !== undefined){
        this.imgprofile.nativeElement.style.marginTop = '-55pt';
      }
    }
  }
}






