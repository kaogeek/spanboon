/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, EventEmitter, ElementRef, Output } from '@angular/core';
import { AuthenManager, ProfileFacade, AssetFacade, ObservableManager, PageFacade, PostFacade, PostCommentFacade, RecommendFacade, Engagement, UserEngagementFacade, PostActionService, SeoService } from '../../../services/services';
import { MatDialog } from '@angular/material';
import * as $ from 'jquery';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { FileHandle } from '../../shares/directive/directives';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { Asset } from '../../../models/Asset';
import { MESSAGE } from '../../../../custom/variable';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import * as moment from 'moment';
import { CommentPosts } from '../../../models/CommentPosts';
import { SearchFilter, UserEngagement } from '../../../models/models';
import { DialogEditProfile } from '../../shares/dialog/DialogEditProfile.component';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { DialogImage } from '../../shares/dialog/DialogImage.component';
import { DialogDoIng } from '../../shares/dialog/DialogDoIng.component';
import { BoxPost } from '../../shares/BoxPost.component';
import { DialogPost } from '../../shares/dialog/DialogPost.component';
import { filter } from 'rxjs/internal/operators/filter';
import { DialogShare } from '../../shares/dialog/DialogShare.component';
import { DialogCheckBox } from '../../shares/dialog/DialogCheckBox.component';

const PAGE_NAME: string = 'profile';
const URL_PATH: string = '/profile/';
const REDIRECT_PATH: string = '/home';
const IMAGE_SUBJECT: string = 'authen.image';
const REFRESH_DATA: string = 'refresh_page';

declare var $: any;
@Component({
  selector: 'spanboon-profile-page',
  templateUrl: './ProfilePage.component.html',
})
export class ProfilePage extends AbstractPageImageLoader implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Output()
  public submitDialog: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitCanCelDialog: EventEmitter<any> = new EventEmitter();

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild('sidefeedHeight', { static: false }) sidefeedHeight: ElementRef;
  protected sanitizer: DomSanitizer
  private profileFacade: ProfileFacade;
  private assetFacade: AssetFacade;
  private observManager: ObservableManager;
  private routeActivated: ActivatedRoute;
  private pageFacade: PageFacade;
  private postCommentFacade: PostCommentFacade;
  private postFacade: PostFacade;
  private recommendFacade: RecommendFacade;
  private engagementService: Engagement;
  private userEngagementFacade: UserEngagementFacade;
  private postActionService: PostActionService;
  private seoService: SeoService;
  private meta: Meta;
  public dialog: MatDialog;

  public isLoading: boolean;
  public isEditCover: boolean;
  public pageUser: any[];
  public isFiles: boolean;
  public msgUserNotFound: boolean;
  public isNotAccess: boolean;
  public showLoading: boolean;
  public isMaxLoadingPost: boolean;
  public isLoadingPost: boolean;
  public isLoadingClickTab: boolean;
  public isClickPostPreLoad: boolean;
  public mainPostLink: string;

  public curPos: number;
  public position: number;
  public imageCoverSize: number;
  public resProfile: any;
  public resPost: any = {};
  public resEditProfile: any;
  public user: any;
  public url: any;
  public subPage: string;
  public redirection: string;
  public userImage: any;
  public name: any;
  public splitTpyeClone: any;
  public dataRecommend: any;
  public selectedIndex: number;
  public pathPostId: string;
  public linkPost: string;

  public postId: any
  public userCloneDatas: any
  public Tab: boolean = true;
  public CheckPost: boolean = true;
  public isPostLoading: boolean = false;

  private coverImageoldValue = 50;

  mySubscription: any;
  files: FileHandle[] = [];

  public links = [
    {
      label: 'ไทมไลน์',
      keyword: 'timeline'
    },
    {
      label: this.PLATFORM_GENERAL_TEXT,
      keyword: 'general'
    },
    // { 
    //   label: this.PLATFORM_FULFILL_TEXT, 
    //   keyword: 'fulfillment' 
    // }
  ];
  public activeLink = this.links[0].label;

  constructor(router: Router, authenManager: AuthenManager, profileFacade: ProfileFacade, dialog: MatDialog, pageFacade: PageFacade, postCommentFacade: PostCommentFacade,
    sanitizer: DomSanitizer, assetFacade: AssetFacade, observManager: ObservableManager, routeActivated: ActivatedRoute, postFacade: PostFacade, recommendFacade: RecommendFacade,
    engagementService: Engagement, userEngagementFacade: UserEngagementFacade, postActionService: PostActionService, seoService: SeoService, meta: Meta) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.sanitizer = sanitizer;
    this.profileFacade = profileFacade;
    this.assetFacade = assetFacade
    this.observManager = observManager;
    this.authenManager = authenManager;
    this.routeActivated = routeActivated;
    this.postFacade = postFacade;
    this.pageFacade = pageFacade;
    this.postCommentFacade = postCommentFacade;
    this.recommendFacade = recommendFacade;
    this.engagementService = engagementService;
    this.userEngagementFacade = userEngagementFacade;
    this.postActionService = postActionService;
    this.seoService = seoService;
    this.meta = meta;
    this.msgUserNotFound = false;
    this.isFiles = false;
    this.showLoading = true;
    this.userImage = {};
    this.resPost.posts = [];

    // create obsvr subject
    this.observManager.createSubject(IMAGE_SUBJECT);

    this.observManager.subscribe('scroll.fix', (scrollTop) => {
      this.heightWindow();
    });

    this.observManager.subscribe('scroll.buttom', (buttom) => {
      if (!this.isMaxLoadingPost) {
        this.isLoadingPost = true;
        let data;
        setTimeout(() => {
          if (this.subPage === 'general') {
            data = {
              type: 'GENERAL',
            }
            this.activeLink = this.PLATFORM_GENERAL_TEXT;
            this.searchTimeLinePost(data);
          } else if (this.subPage === 'fulfillment') {
            data = {
              type: 'FULFILLMENT',
            }
            this.activeLink = this.PLATFORM_FULFILL_TEXT;
            this.searchTimeLinePost(data);
          } else if (this.subPage === 'timeline') {
            this.activeLink = 'ไทมไลน์';
            data = {
              type: '',
            }
            this.searchTimeLinePost(data);
          } else {
            data = {
              type: '',
            }
            this.searchTimeLinePost(data);
          }

        }, 1000);
      }
    });

    this.mySubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (event instanceof NavigationEnd) {
        const url: string = decodeURI(this.router.url);
        if (url.indexOf(URL_PATH) >= 0) {
          const substringPath: string = url.substring(url.indexOf(URL_PATH), url.length);
          let substringPage = substringPath.replace(URL_PATH, '');
          const replaceCommentURL: string = substringPage.replace('/profile/', '');
          const splitTextId = replaceCommentURL.split('/')[0];
          this.subPage = replaceCommentURL.split('/')[1];
          if (splitTextId !== undefined && splitTextId !== null) {
            this.url = splitTextId;
            if (!this.resProfile) {
              this.showProfile(this.url);
            } else {
              if (this.resProfile && this.resProfile.uniqueId !== splitTextId && this.resProfile.id !== splitTextId) {
                this.showProfile(this.url);
              }
            }
          }
          if (!this.msgUserNotFound) {
            // split type page 
            if (this.subPage !== undefined && this.subPage !== null && this.subPage !== '') {
              this.initPage(this.subPage);
            } else {
              this.initPage('timeline');
            }
          }
          this.checkAuthenUser(splitTextId);

          const pathPost = url && url.split('/')[3];
          this.pathPostId = url && url.split('/')[4];
          if (pathPost !== undefined && pathPost !== null) {
            this.initPage(pathPost)
          }
        }
      }
    });
  }

  public ngOnDestroy() {
    this.mySubscription.unsubscribe();
    super.ngOnDestroy();
    this.observManager.complete(REFRESH_DATA);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.setTab();
    this.checkLoginAndRedirection();
    this.getRecommend();
    // this.openLoading();
    if (this.isLogin()) {
      this.getProfileImage();
    }
    // this.searchPostById('6051c688fb3585b175ab4765')
    $(window).resize(() => {
      this.setTab();
    });

    this.observManager.subscribe(REFRESH_DATA, (result: any) => {
      if (result) {
        // this.resPost.posts.unshift(result);
        this.resProfile.displayName = result.displayName;
      }
    });
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

  private checkLoginAndRedirection(): void {
    if (this.isLogin()) {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        //this.router.navigateByUrl("/home");
      }
    }
  }

  private checkAuthenUser(pageName: string): void {
    if (this.isLogin()) {
      let userId = this.getCurrentUserId();
      if (userId === pageName || this.user.uniqueId === pageName) {
        this.isNotAccess = true;
      } else {
        this.isNotAccess = false;
      }
    }
  }

  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }

  public checkUniqueId() {
    if (this.user && this.user.id !== '' && this.user.uniqueId && this.user.uniqueId !== "") {
      return '/profile/' + this.user.uniqueId;
    } else {
      return '/profile/' + this.user.id
    }
  }

  public getRecommend() {
    let limit: number = 3;
    let offset: number = 0;
    this.recommendFacade.getRecommend(limit, offset).then((res) => {
      this.dataRecommend = res.data;
    }).catch((err: any) => {
      console.log('err ', err)
    });
  }

  public getProfileImage() {
    let user = this.authenManager.getCurrentUser()
    this.searchPageInUser(user.id)
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    if (this.userCloneDatas.imageURL && this.userCloneDatas.imageURL && this.userCloneDatas.imageURL !== '') {
      this.userImage.imageURL = this.userCloneDatas.imageURL
    } else {
      this.userImage = this.userCloneDatas
    }
  }

  private initPage(subPage: string) {
    let data;
    if (subPage === 'general') {
      data = {
        type: 'GENERAL'
      }
      this.activeLink = this.PLATFORM_GENERAL_TEXT;
      this.searchTimeLinePost(data, true);
    } else if (subPage === 'fulfillment') {
      data = {
        type: 'FULFILLMENT'
      }
      this.activeLink = this.PLATFORM_FULFILL_TEXT;
      this.searchTimeLinePost(data, true);
    } else if (subPage === 'timeline') {
      this.activeLink = 'ไทมไลน์';
      data = {
        type: ''
      }
      this.searchTimeLinePost(data, true);
    } else if (subPage === 'post') {
      if (this.pathPostId !== undefined && this.pathPostId !== null) {
        this.CheckPost = false;
        this.searchPostById(this.pathPostId);
      }
    } else {
      return this.router.navigateByUrl('/profile/' + this.url);
    }
  }

  public linkDataType(link: any) {
    this.isLoadingClickTab = true;
    this.router.navigateByUrl('/profile/' + this.url + "/" + link.keyword)
  }

  filesDropped(files: FileHandle[]): void {
    this.files = files;
    for (let data of this.files) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageCoverSize = data.file.size;
        this.rePositionImage(event.target.result);
      }
      reader.readAsDataURL(data.file);
    }
  }

  public createPost(value) {
    if (value.title) {
      this.isPostLoading = true;
      this.pageFacade.createPost(null, value).then((res) => {
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
            let data;
            if (res.data.posts.type === "GENERAL") {
              data = {
                type: 'GENERAL'
              }
              this.searchTimeLinePost(data, true);
            } else if (res.data.posts.type === "NEEDS") {
              data = {
                type: 'NEEDS'
              }
              this.searchTimeLinePost(data, true);
            } else if (res.data.posts.type === "FULFILLMENT") {
              data = {
                type: 'FULFILLMENT'
              }
              this.searchTimeLinePost(data, true);
            } else {
              data = {
                type: ''
              }
              this.searchTimeLinePost(data, true);
            }
            this.boxPost.clearDataAll();
            this.isClickPostPreLoad = false;
            this.isPostLoading = false;
          }
        }
      }).catch((err: any) => {
        console.log(err);
      })
    }
  }

  public postLike(post, index: number) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/profile/" + this.resProfile.id);
    } else {
      this.resPost.posts[index].isLike = true;
      this.postFacade.like(post.postData._id, post.userAsPage.id).then((res: any) => {
        this.resPost.posts[index].isLike = res.isLike
        this.resPost.posts[index].likeCount = res.likeCount
      }).catch((err: any) => {
        console.log(err)
      });
    }
  }

  public logout() {
    let body = {
      user: this.getCurrentUserId()
    }
    const confirmEventEmitter = new EventEmitter<any>();
    confirmEventEmitter.subscribe(() => {
      this.authenManager.logout(body).then(() => {
        this.authenManager.clearStorage();
        this.router.navigateByUrl(REDIRECT_PATH);
      }).catch((err: any) => {
        alert(err.error.message);
      })
    });
    this.showDialogWithOptions({
      text: "คุณต้องการออกจากระบบ",
      bottomText1: MESSAGE.TEXT_BUTTON_CANCEL,
      bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
      bottomColorText2: "black",
      confirmClickedEvent: confirmEventEmitter,
    });
  }

  public showProfile(url: string): void {
    this.isLoading = true;
    this.profileFacade.getProfile(url).then((res) => {
      if (res) {
        this.seoService.updateTitle(res.data.name ? res.data.name : res.data.displayName);
        if (this.resPost.length > 0) {
          if (this.resPost.posts.length === 1) {
            this.meta.updateTag({ name: 'title', content: this.resPost.posts[0].title });
            this.meta.updateTag({ name: 'description', content: this.resPost.posts[0].detail });
          }
        }
        if (!!res.data) {
          this.position = res.data.coverPosition;
          this.resProfile = res.data;
          let user = {
            displayName: res.data.displayName,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            birthdate: res.data.birthdate,
            gender: res.data.gender,
            customGender: res.data.customGender,
            username: res.data.username
          }
          this.resEditProfile = user;
          if (this.resProfile && this.resProfile.name) {
            this.name = this.resProfile.name
          } else if (this.resProfile && this.resProfile.uniqueId) {
            this.name = this.resProfile.uniqueId
          } else if (this.resProfile.displayName) {
            this.name = this.resProfile.displayName
          }
          // this.seoService.updateTitle(this.resProfile.displayName);
          if (!!this.resProfile.imageURL) {
            this.resProfile.isLoadingImage = true;
            this.getDataIcon(this.resProfile.imageURL, "image");
          }

          if (!this.resProfile!.coverSignURL) {
            this.getDataIcon(this.resProfile.coverURL, "cover");
          }

          if (!this.resProfile!.coverSignURL && !this.resProfile!.coverURL) {
            this.resProfile.isLoadingCover = false;
          }

        }
        setTimeout(() => {
          this.isLoading = false;
        }, 2000);
      }

    }).catch((err) => {
      if (err) {
        console.log("err", err)
        this.isLoading = false;
        if (err.error.status === 0) {
          if (err.error.message === 'Unable to Get UserProfile') {
            this.msgUserNotFound = true;
          }
        }
      }
    })
  }

  public searchTimeLinePost(data, offset?: boolean) {
    if (offset) {
      data.offset = 0;
      this.resPost.posts = [];
      this.isLoadingPost = true;
    } else {
      data.offset = this.resPost && this.resPost.posts.length > 0 ? this.resPost.posts.length : 0;
    }

    data.limit = 5;
    let originalpost: any[] = this.resPost.posts;
    this.profileFacade.searchType(data, this.url).then(async (res: any) => {
      if (!Array.isArray(res) && res.posts.length > 0) {
        if (res.posts.length !== 5) {
          this.isMaxLoadingPost = true;
          this.isLoadingPost = false;
        }

        for (let post of res.posts) {
          originalpost.push(post);
        }

        if (this.resPost && this.resPost.pageObjectives && this.resPost.pageObjectives.length > 0) {
          let index = 0;
          for (let result of this.resPost.pageObjectives) {
            if (result.iconURL !== '') {
              this.getDataIcon(result.iconURL, "icon", index)
              index++
            }
          }
        }

        this.resPost.posts = originalpost;
        for (let post of this.resPost.posts) {
          if (post.referencePost !== null && post.referencePost !== undefined && post.referencePost !== '') {
            let search: SearchFilter = new SearchFilter();
            search.limit = 5;
            search.count = false;
            search.whereConditions = { _id: post.referencePost };
            this.postFacade.search(search).then((res: any) => {
              if (res.length !== 0) {
                post.referencePostObject = res[0];
              } else {
                post.referencePostObject = 'UNDEFINED PAGE';
              }
            }).catch((err: any) => {
              this.isMaxLoadingPost = true;
            });
          } else if (typeof post.rootReferencePost === 'object' && (post && post.rootReferencePost !== null && Object.keys(post.rootReferencePost).length > 0)) {
            post.referencePostObject = post.rootReferencePost
          }
        }

        setTimeout(() => {
          if (this.resPost.posts && this.resPost.posts.length > 0) {
            let postIndex = 0;
            for (let post of this.resPost.posts) {
              let galleryIndex = 0;
              if (post.gallery && post.gallery.length > 0) {
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
        }, 1500);
        this.isPostLoading = false;
      } else {
        this.isMaxLoadingPost = true;
        this.isLoadingPost = false;
        this.isLoadingClickTab = false;
        this.isPostLoading = false;
        if (offset) {
          this.resPost = [];
        }
      }
    }).catch((err: any) => {
      console.log(err)
      this.isMaxLoadingPost = true;
    });
  }

  private getDataIcon(imageURL: any, myType?: string, index?: number): void {
    if (myType === "cover") {
      Object.assign(this.resProfile, { isLoadingCover: true });
    } else if (myType === "image") {
      Object.assign(this.resProfile, { isLoadingImage: true });
    }

    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (myType === "image") {
          this.resProfile.isLoadingImage = false;
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            Object.assign(this.resProfile, { imageBase64: res.data });
          } else {
            Object.assign(this.resProfile, { imageBase64: null });
          }
        } else if (myType === "cover") {
          this.resProfile.isLoadingCover = false;
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            Object.assign(this.resProfile, { coverURL: res.data });
          } else {
            Object.assign(this.resProfile, { coverURL: '' });
          }
        }
      }
    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Asset') {
          if (myType === "image") {
            this.resProfile.isLoadingImage = false;
            Object.assign(this.resProfile, { imageBase64: '' });
          } else {
            this.resProfile.isLoadingCover = false;
            Object.assign(this.resProfile, { coverURL: '', isLoaded: true });
          }
        }
      }
    });
  }

  private getDataGallery(imageURL: any, postIndex: number, galleryIndex: number): void {
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        Object.assign(this.resPost.posts[postIndex].gallery[galleryIndex], { galleryBase64: res.data, isLoaded: true });
      }
    }).catch((err: any) => {
      console.log('err ', err)
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Asset') {
          Object.assign(this.resPost.posts[postIndex].gallery[galleryIndex], { galleryBase64: null, isLoaded: true });
        }
      }
    });
  }

  public editProfile() {
    const dialogRef = this.dialog.open(DialogEditProfile, {
      data: this.resEditProfile
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res !== undefined) {
        let userId = this.getCurrentUserId();
        res.birthdate = moment(res.birthdate).format('YYYY-MM-DD')
        this.profileFacade.edit(userId, res).then((res: any) => {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: MESSAGE.TEXT_EDIT_SUCCESS,
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none"
            }
          });
          dialog.afterClosed().subscribe((result) => {
            if (result) {
              this.resProfile.displayName = res.displayName;
            }
          });
        }).catch((err: any) => {
          console.log(err)
        });
      }
    });
  }

  public saveCoverImage(): void {
    this.isEditCover = true;
    let userId = this.getCurrentUserId();
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
    let dataImages = {
      coverPosition: Number(position),
      asset
    }

    this.profileFacade.saveCoverImageProfile(userId, dataImages).then((res: any) => {
      if (res.status === 1) {
        this.isEditCover = false;
        this.isFiles = false;
        if (!!res!.data!.coverSignURL) {
          this.resProfile.coverSignURL = res.data.coverSignURL;
        } else {
          this.getDataIcon(res.data.coverURL, "cover");
          this.resProfile.coverSignURL = '';
        }
        this.resProfile.coverPosition = res.data.coverPosition;
      }
    }).catch((err: any) => {
      console.log(err);
      this.isEditCover = false;
      this.isFiles = false;
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
        this.rePositionImage(event.target.result);
        this.isEditCover = true;
        this.isFiles = true;
      }
      reader.readAsDataURL(files);
    }
  }

  public rePositionImage(image: any) {
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
      $('.image').css('background-position-y', curPos)
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
          this.position = curPos;
        }
        if (curPos < 0) {
          curPos = 0;
          $('#images').css('background-position-y', curPos + '%');
          this.position = curPos;
        }
      }
    });
  }

  public editImageProfile(images: any) {
    let userId = this.getCurrentUserId();

    this.resProfile.imageBase64 = images.image;
    const asset = new Asset();
    let data = images.image.split(',')[0];
    let typeImage = data.split(':')[1];
    asset.mimeType = typeImage.split(';')[0];
    asset.data = images.image.split(',')[1];
    asset.fileName = images.name;
    asset.size = images.size;

    let editImage = {
      asset
    }
    this.profileFacade.saveImageProfile(userId, editImage).then((res: any) => {
      if (res.status === 1) {
        this.getDataIcon((res.data.coverURL ? res.data.coverURL : res.data.imageURL
        ), (res.data.coverURL ? "cover" : "image"));
        this.isFiles = false;
        this.observManager.publish('authen.image', res);
      }
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public sildeWindowToBoxPost() {
    document.getElementById("feed-to").scrollIntoView();
  }

  public async clickFollowUser() {
    let userId = this.resProfile.id;
    const follow = await this.followUser(userId);
    if (follow) {
      if (follow.message === "Unfollow User Success") {
        this.resProfile.isFollow = follow.data.isFollow
        this.resProfile.followers = follow.data.followers;
      } else {
        this.resProfile.isFollow = follow.data.isFollow;
        this.resProfile.followers = follow.data.followers;
      }
    }
  }

  public async clickFollow(data: any) {
    if (data.recommed.type === 'USER') {
      const followUser = await this.followUser(data.recommed._id);
      if (followUser) {
        for (let [index, recommend] of this.dataRecommend.entries()) {
          if (recommend._id === data.recommed._id) {
            if (followUser.message === "Unfollow User Success") {
              let dialog = this.showAlertDialogWarming("คุณต้องการเลิกติดตาม " + data.recommed.displayName, "none");
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  Object.assign(this.dataRecommend[index], { isFollowed: followUser.data.isFollow });
                } else {
                  Object.assign(this.dataRecommend[index], { isFollowed: true });
                }
                this.dialog.closeAll();
              });
            } else {
              Object.assign(this.dataRecommend[index], { isFollowed: followUser.data.isFollow });
            }
          }
        }
        this.selectedIndex = data.index;
      }
    } else {
      const followPage = await this.followPage(data.recommed._id);
      if (followPage) {
        for (let [index, recommend] of this.dataRecommend.entries()) {
          if (recommend._id === data.recommed._id) {
            if (followPage.message === "Unfollow Page Success") {
              let dialog = this.showAlertDialogWarming("คุณต้องการเลิกติดตาม " + data.recommed.name, "none");
              dialog.afterClosed().subscribe((res) => {
                if (res) {
                  Object.assign(this.dataRecommend[index], { isFollowed: followPage.data.isFollow });
                } else {
                  Object.assign(this.dataRecommend[index], { isFollowed: true });
                }
                this.dialog.closeAll();
              });
            } else {
              Object.assign(this.dataRecommend[index], { isFollowed: followPage.data.isFollow });
            }
          }
        }
        this.selectedIndex = data.index;
      }
    }
  }

  public async followPage(pageId: string) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/profile/" + this.resProfile.id);
    } else {
      return this.pageFacade.follow(pageId);
    }
  }

  public async followUser(userId: string) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/profile/" + this.resProfile.id);
    } else {
      return this.profileFacade.follow(userId);
    }
  }

  public showDialogImage(): void {
    const dialogRef = this.dialog.open(DialogImage, {
      width: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.editImageProfile(result)
      }
      this.stopLoading();
    });
  }

  public showDilogProvideItem() {
    let arrProVideItem = {
      isProvideItem: true
    }
    const dialogRef = this.dialog.open(DialogDoIng, {
      width: 'auto',
      data: arrProVideItem,
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
      this.showAlertLoginDialog("/page/" + this.resProfile.id);
      return
    }
  }

  public async actionComment(action: any, index: number) {
    this.isLoginCh();
    await this.postActionService.actionPost(action, index, this.resPost).then((res: any) => {
      //repost
      if (res && res.type === "NOTOPIC") {
        this.resPost.posts = res.posts;
      } else if (res.type === "TOPIC") {
        this.resPost.posts = res.posts;
      } else if (res.type === "UNDOTOPIC") {
        for (let [i, data] of this.resPost.posts.entries()) {
          if (data.referencePostObject !== null && data.referencePostObject !== undefined && data.referencePostObject !== '') {
            if (data.referencePostObject._id === action.post._id) {
              this.resPost.posts.splice(i, 1);
              break;
            }
          }
        }
      } else if (res.type === "POST") {
        this.router.navigateByUrl('/post/' + action.pageId);
      } else if (action.mod === 'LIKE') {
        this.isLoginCh();
        this.postLike(action, index);
      } else if (action.mod === 'SHARE') {
        this.mainPostLink = window.location.origin + '/profile/' + this.user.uniqueId + '/post/';
        this.linkPost = (this.mainPostLink + this.resPost.posts[index]._id);
        this.dialogShare();
      }
    }).catch((err: any) => {
      console.log('err ', err)
    });
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
        this.pageFacade.deletePost(null, post._id).then((res) => {
          this.resPost.posts.splice(index, 1);
          this.initPage(this.subPage);
        }).catch((err: any) => {
        })
      }
    });
  }

  public editPost(data: any, index: number) {
    data.isFulfill = false;
    data.isListPage = true;
    data.isEdit = true;
    const dialogRef = this.dialog.open(DialogPost, {
      width: 'auto',
      data: data,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.resPost.posts[index] = result;
      }
      this.stopLoading();
    });
  }

  public heightWindow() {
    var resizeWinH = window.innerHeight;
    var resizeWinW = window.innerWidth;
    var recommended2 = this.sidefeedHeight && this.sidefeedHeight.nativeElement.offsetHeight;
    var maxrecommended2 = recommended2 + 100;
    var count2 = recommended2 - resizeWinH;
    var maxcount2 = count2 + 60;

    if (resizeWinW <= 899) {
      this.sidefeedHeight.nativeElement.style.top = '';
    } else {
      if (maxrecommended2 > resizeWinH) {
        this.sidefeedHeight.nativeElement.style.top = '-' + Math.abs(maxcount2) + 'px';
      } else {
        this.sidefeedHeight.nativeElement.style.top = '60pt';
      }
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
      console.log("err", err);
    });
    if (this.pageUser.length > 0) {
      for (let p of this.pageUser) {
        if (!p.signURL) {
          await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
            p.img64 = res.data
          }).catch((err: any) => {
            console.log("err", err);
          });
        }
      }
    }
  }

  public getImageSelector(): string[] {
    return [".checkload"];
  }

  public onSelectorImageElementLoaded(imageElement: any[]): void {

  }

  public onImageElementLoadOK(imageElement: any): void {

  }

  public onImageElementLoadError(imageElement: any): void {

  }

  public onImageLoaded(imageElement: any[]): void {
    setTimeout(() => {
      this.showLoading = false;
    }, 3000);
  }

  public setTab() {
    if (window.innerWidth <= 1024) {
      this.Tab = true;
    } else {
      this.Tab = false;
    }
  }

  public searchPostById(postId: string) {
    this.resPost.posts = [];
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { _id: postId };
    this.postFacade.search(search).then((res: any) => {
      this.resPost.posts = res;
      if (this.resProfile.length === 0) {
        this.msgUserNotFound = true;
        // this.labelStatus = 'ไม่พบโพสต์';
      } else {
        this.showProfile(res[0].ownerUser._id);
        this.isMaxLoadingPost = true;
        let postIndex: number = 0
        let galleryIndex = 0;
        for (let post of this.resPost.posts) {
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

  public engagement(event) {
    const dataEngagement: UserEngagement = this.engagementService.engagementPost(event.contentType, event.contentId, event.dom);
    this.userEngagementFacade.create(dataEngagement).then((res: any) => {
    }).catch((err: any) => {
      console.log('err ', err)
    })
  }

  public blockUser(profile) {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: 'คุณต้องการบล็อกเพจนี้ใช่หรือไม่',
      },
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        let data = {
          subjectId: profile.id,
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

  public reportUser(profile) {
    let typeReport = 'user';
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
          typeId: profile.id,
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
  }

  public hidePost(post: any, index: number) {
    const confirmEventEmitter = new EventEmitter<any>();
    confirmEventEmitter.subscribe(() => {
      this.submitDialog.emit();
    });
    const canCelEventEmitter = new EventEmitter<any>();
    canCelEventEmitter.subscribe(() => {
      this.submitCanCelDialog.emit();
    });

    let dialog = this.showDialogWarming("คุณต้องการซ่อนโพสต์นี้ใช่หรือไม่ ", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        let data = {
          postId: post._id,
          userIdOwner: post.ownerUser,
          type: 'hide_post'
        }
        this.pageFacade.manipulatePost(data).then((res) => {
          if (res) {
            this.resPost.posts.splice(index, 1);
          }
        }).catch((err) => {
          if (err) { }
        })
      }
    });
  }

  public reportPost(post: any, index: number) {
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
  }
}
