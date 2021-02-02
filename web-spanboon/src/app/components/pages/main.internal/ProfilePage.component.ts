/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, EventEmitter, ElementRef, Output } from '@angular/core';
import { AuthenManager, ProfileFacade, AssetFacade, ObservableManager, PageFacade, PostFacade, PostCommentFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import * as $ from 'jquery';
import { DomSanitizer } from '@angular/platform-browser';
import { FileHandle } from '../../shares/directive/directives';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { Asset } from '../../../models/Asset';
import { RePost } from '../../../models/RePost';
import { MESSAGE } from '../../../AlertMessage';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import * as moment from 'moment';
import { CommentPosts } from '../../../models/CommentPosts';
import { SearchFilter } from '../../../models/models';
import { DialogEditProfile } from '../../shares/dialog/DialogEditProfile.component';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import { DialogImage } from '../../shares/dialog/DialogImage.component';
import { DialogDoIng } from '../../shares/dialog/DialogDoIng.component';
import { DialogReboonTopic } from '../../shares/dialog/DialogReboonTopic.component';
import { BoxPost } from '../../shares/BoxPost.component';

const PAGE_NAME: string = 'profile';
const URL_PATH: string = '/profile/';
const REDIRECT_PATH: string = '/home';
const IMAGE_SUBJECT: string = 'authen.image';

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

  public postId: any
  public userCloneDatas: any
  public Tab: boolean = true;

  private coverImageoldValue = 50;

  mySubscription: any;
  files: FileHandle[] = [];

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: 'ทั่วไป', keyword: 'general' }, { label: 'เติมเต็ม', keyword: 'fulfillment' }];
  public activeLink = this.links[0].label;

  constructor(router: Router, authenManager: AuthenManager, profileFacade: ProfileFacade, dialog: MatDialog, pageFacade: PageFacade, postCommentFacade: PostCommentFacade,
    sanitizer: DomSanitizer, assetFacade: AssetFacade, observManager: ObservableManager, routeActivated: ActivatedRoute, postFacade: PostFacade) {
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
    this.postCommentFacade = postCommentFacade
    this.msgUserNotFound = false;
    this.isFiles = false;
    this.showLoading = true
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
            this.activeLink = 'ทั่วไป';
            this.searchTimeLinePost(data);
          } else if (this.subPage === 'fulfillment') {
            data = {
              type: 'FULFILLMENT',
            }
            this.activeLink = 'เติมเต็ม';
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

    this.mySubscription = this.router.events.subscribe((event) => {
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
        }
      }
    });

  }

  public ngOnDestroy() {
    this.mySubscription.unsubscribe();
    super.ngOnDestroy();
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.setTab();
    this.checkLoginAndRedirection();
    if (this.isLogin()) {
      this.getProfileImage();
    }

    $(window).resize(() => {
      this.setTab();
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

  public getProfileImage() {
    let userCloneData = JSON.parse(JSON.stringify(this.user));
    this.searchPageInUser(this.user.id)
    this.userCloneDatas = JSON.parse(JSON.stringify(this.user));
    if (userCloneData && userCloneData.imageURL && userCloneData.imageURL !== '' && userCloneData.imageURL !== null && userCloneData.imageURL !== undefined) {
      this.assetFacade.getPathFile(userCloneData.imageURL).then((res: any) => {
        this.userImage = userCloneData;
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
      this.userImage = userCloneData;
    }

  }

  private initPage(subPage: string) {
    let data;
    if (subPage === 'general') {
      data = {
        type: 'GENERAL'
      }
      this.activeLink = 'ทั่วไป';
      this.searchTimeLinePost(data, true);
    } else if (subPage === 'fulfillment') {
      data = {
        type: 'FULFILLMENT'
      }
      this.activeLink = 'เติมเต็ม';
      this.searchTimeLinePost(data, true);
    } else if (subPage === 'timeline') {
      this.activeLink = 'ไทมไลน์';
      data = {
        type: ''
      }
      this.searchTimeLinePost(data, true);
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
            if (res.data.type === "GENERAL") {
              data = {
                type: 'GENERAL'
              }

            } else if (res.data.type === "NEEDS") {
              data = {
                type: 'NEEDS'
              }
            } else if (res.data.type === "FULFILLMENT") {
              data = {
                type: 'FULFILLMENT'
              }
            } else {
              data = {
                type: ''
              }
            }
            this.searchTimeLinePost(data);
            this.boxPost.clearDataAll();
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
      this.resPost.posts[index].likeCount = 1;
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
      if (res.status === 1 && res.data) {
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
        this.position = res.data.coverPosition;
        this.resProfile = res.data;
        if (this.resProfile && this.resProfile.name) {
          this.name = this.resProfile.name
        } else if (this.resProfile && this.resProfile.uniqueId) {
          this.name = this.resProfile.uniqueId
        } else if (this.resProfile.displayName) {
          this.name = this.resProfile.displayName
        }

        if (this.resProfile.imageURL !== '' && this.resProfile.imageURL !== null && this.resProfile.imageURL !== undefined) {
          this.resProfile.isLoadingImage = true;
          this.getDataIcon(this.resProfile.imageURL, "image")
        }
        if (this.resProfile.coverURL !== '' && this.resProfile.coverURL !== null && this.resProfile.coverURL !== undefined) {
          this.getDataIcon(this.resProfile.coverURL, "cover")
        }
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }

    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'Unable to Get UserProfile') {
          this.msgUserNotFound = true;
        }
      }
      this.stopLoading();
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
                post.referencePostObject = res[0]
              } else {
                post.referencePostObject = 'UNDEFINED PAGE'
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
      } else {
        this.isMaxLoadingPost = true;
        this.isLoadingPost = false;
        this.isLoadingClickTab = false;
        if (offset) {
          this.resPost = [];
        }
      }
    }).catch((err: any) => {
      console.log(err)
      this.isMaxLoadingPost = true
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
            Object.assign(this.resProfile, { coverBase64: res.data });
          } else {
            Object.assign(this.resProfile, { coverBase64: '' });
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
            Object.assign(this.resProfile, { coverBase64: '', isLoaded: true });
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
              text: 'แก้ไขข้อมูลสำเร็จ',
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
        })
      }
    });
  }

  public saveCoverImage(): void {
    let userId = this.getCurrentUserId();

    this.isEditCover = false;
    const styleWidth = document.getElementById('image');
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
        this.getDataIcon(res.data.coverURL, "cover");
        this.isFiles = false;
        this.showProfile(this.url);
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
      let imgWidthTrue = $('#image').width();
      let imgHeightTrue = $('#image').height();
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

      $('#image').css('background-image', 'url(' + img.src + ')');
      $('#image').css('display', 'flex');
    });

    var start_y;
    var newPos;
    this.isFiles = true;
    var curPos = $('#image').css('background-position-y');
    var mouseDown = false;
    var move = true;

    $('#image').mousedown(function (e) {
      mouseDown = true;
    });

    $(document).mouseup(function () {
      mouseDown = false;
      $('.image').css('background-position-y', curPos)
    });

    $('#image').mouseenter(function (e) {
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

        $('#image').css('background-position-y', this.coverImageoldValue + '%');
        curPos = parseInt($('#image').css('background-position-y'));

        if (curPos > 100) {
          curPos = 100;
          $('#image').css('background-position-y', curPos + '%');
        }
        if (curPos < 0) {
          curPos = 0;
          $('#image').css('background-position-y', curPos + '%');
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
        this.getDataIcon(res.data.coverURL, "cover")
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

  public clickFollowUser() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/profile/" + this.resProfile.id);
    } else {
      let userId = this.resProfile.id;
      this.profileFacade.follow(userId).then((res) => {
        if (res.message === "Unfollow User Success") {
          this.resProfile.isFollow = res.data.isFollow
          this.resProfile.followers = res.data.followers;
        } else {
          this.resProfile.isFollow = res.data.isFollow;
          this.resProfile.followers = res.data.followers;
        }

      }).catch((err: any) => {
        console.log(err);
      })
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
    this.postId = action.pageId
    let pageInUser: any[]
    let data: RePost = new RePost();
    let dataPost: any
    let userAsPage: any
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { ownerUser: this.userCloneDatas.id };
    if (action.mod === 'REBOON') {
      if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
        userAsPage = action.userAsPage.id
      } else {
        userAsPage = null
      }
      if (action.type === "TOPIC") {
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
          data: { options: { post: action.post, page: pageInUser, userAsPage: userAsPage } }
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
      }

    } else if (action.mod === 'LIKE') {
      this.postLike(action, index);
    } else if (action.mod === 'SHARE') {
      this.isLoginCh();
    } else if (action.mod === 'COMMENT') {
      this.isLoginCh();
    } else if (action.mod === 'POST') {
      this.router.navigateByUrl('/post/' + action.pageId);
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
        this.pageFacade.deletePost(null, post._id).then((res) => {
          this.resPost.posts.splice(index, 1);
          this.initPage(this.subPage);
        }).catch((err: any) => {
        })
      }
    });

  }

  public editPost(post: any, index: number) {

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
    })
    for (let p of this.pageUser) {
      var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
        p.img64 = res.data
      }).catch((err: any) => {
      });
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

}




