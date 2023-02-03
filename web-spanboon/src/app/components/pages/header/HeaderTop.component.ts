/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ViewChild, OnInit, NgZone, EventEmitter, Input, Renderer2 } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AuthenManager, ObservableManager, EditProfileUserPageFacade, NotificationFacade } from '../../../services/services';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { MESSAGE } from '../../../../app/AlertMessage';
import { environment } from 'src/environments/environment';
import { DialogAlert } from '../../components';
import { DialogListFacebook } from '../../components';
import { PageSoialFB } from 'src/app/models/PageSocialFB';
import { TwitterService } from '../../../services/services';
import { PageSocialTW } from 'src/app/models/PageSocialTW';

const DEFAULT_USER_ICON: string = '../../../assets/components/pages/icons8-female-profile-128.png';
const REDIRECT_PATH: string = '/main';
const PAGE_NAME: string = 'header';
declare const window: any;
@Component({
  selector: 'header-top',
  templateUrl: './HeaderTop.component.html',

})
export class HeaderTop extends AbstractPage implements OnInit {
  //--------------ห้ามแยก start--------------//
  @ViewChild(MatMenuTrigger, { static: false })
  public trigger: MatMenuTrigger;
  //--------------ห้ามแยก End--------------//
  @Input()
  public connect: boolean = false;
  @Input()
  protected menutopprofile: boolean;
  // @Output()
  // public logout: EventEmitter<any> = new EventEmitter();

  private observManager: ObservableManager;
  private editProfileFacade: EditProfileUserPageFacade;
  private userImage: any;

  // Notification
  public notificationList: any = {
    read: [],
    unread: [],
    all: [],
    countRead: 0,
    countUnread: 0,
    countAll: 0
  };
  public isLoadNotification: boolean = false;
  public limitNotification = 30;
  public sumNotification = 30;

  public apiBaseURL = environment.apiBaseURL;
  public isPreLoadIng: boolean;
  public isLoadingTwitter: boolean;
  public isLoading: boolean;
  public user: any;
  private accessToken: any;
  private _ngZone: NgZone;
  public responseFacabook: any;
  public connectTwitter: boolean = false;
  private twitterService: TwitterService;
  public notificationFacade: NotificationFacade;

  public partners: any[] = [];
  public countPageuser: any;
  public isclickmenu: boolean;
  public isFrist: boolean;
  public isCheck: boolean = undefined;
  private activatedRoute: ActivatedRoute;
  public redirection: string;
  public accessTokenLink = '';
  //twitter
  public authorizeLink = 'https://api.twitter.com/oauth/authorize';
  public authenticateLink = 'https://api.twitter.com/oauth/authenticate';
  public accountTwitter = 'https://api.twitter.com/1.1/account/verify_credentials.json';
  // @ViewChild('menuRight', { static: false }) set positionCenter(element) {
  //    // initially setter gets called with undefined
  //   this.resSize(); 
  // }  

  private loginText: string = 'loginSuccess';

  constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager,
    editProfileFacade: EditProfileUserPageFacade, dialog: MatDialog, private renderer: Renderer2, _ngZone: NgZone,
    activatedRoute: ActivatedRoute,
    twitterService: TwitterService, notificationFacade: NotificationFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.router = router;
    this._ngZone = _ngZone;
    this.authenManager = authenManager;
    this.editProfileFacade = editProfileFacade;
    this.observManager = observManager;
    this.dialog = dialog;
    this.isLoading = true;
    this.isFrist = true;
    this.activatedRoute = activatedRoute;
    this.twitterService = twitterService;
    this.notificationFacade = notificationFacade;

    this.activatedRoute.params.subscribe((param) => {
      this.redirection = param['redirection'];
    });
    this.observManager.subscribe('authen.check', (data: any) => {
      this.reloadUserImage();
    });

    this.observManager.subscribe('authen.logout', (data: any) => {
      this.checkSessionTimeOut();
    });

    this.observManager.subscribe('authen.registered', (data: any) => {
      this.reloadUserImage();
    });

    // this.observManager.subscribe('authen.image', (image: any) => {
    //   this.userImage = image;
    // });
    // this.observManager.subscribe('authen.pageUser', (pageUser: any) => {
    //   this.profileUser = pageUser;
    // });
    this.observManager.subscribe('menu.click', (clickmenu) => {
      this.isclickmenu = clickmenu.click;

      if (window.innerWidth >= 1074) {

      } else {
        if (clickmenu.click === true) {
          var element = document.getElementById("profile");
          element.classList.remove("scroll-profile");

        } else {
          // var element = document.getElementById("profile");
          // element.classList.add("scroll-profile");
        }
      }
    });
  }

  ngOnInit() {
    this.observManager.subscribe(this.loginText, (res) => {
      if (res) {
        this._getNotification(this.limitNotification, res.data.offset, '', '', {}, { 'createdDate': -1 }, false, 'push');
        this._getNotification(this.limitNotification, res.data.offset, '', '', { isRead: false }, { 'createdDate': -1 }, false, 'push');
      }
    });
    this.checkLoginAndRedirection();
    this.reloadUserImage();
    let doRunAccessToken = false;
    const fullURL = window.location.href;
    if (fullURL !== undefined && fullURL !== '') {
      let split = fullURL.split('?');
      if (split.length >= 2) {
        const queryParam = split[1];
        this.accessTokenLink += '?' + queryParam;
        doRunAccessToken = true;
      }
    }
    if (this.isLogin()) {
      this._getNotification(this.limitNotification, 0, '', '', {}, { 'createdDate': -1 }, false, 'push');
      this._getNotification(this.limitNotification, 0, '', '', { isRead: false }, { 'createdDate': -1 }, false, 'push');
      this.observManager.subscribe('scrollLoadNotification', (res) => {
        if (res) {
          if (res.data.isReadAll) {
            this._getNotification(this.limitNotification, res.data.offset, '', '', {}, { 'createdDate': -1 }, false, 'push');
          } else {
            this._getNotification(this.limitNotification, res.data.offset, '', '', { isRead: false }, { 'createdDate': -1 }, false, 'push');
          }
        }
      });
    }
  }

  ngAfterViewInit(): void {
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.observManager.complete('authen.check');
    this.observManager.complete('authen.logout');
    this.observManager.complete('authen.registered');
    this.observManager.complete('menu.click');
    this.observManager.complete('scrollLoadNotification');
    this.observManager.complete(this.loginText);
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
    if (!this.isLogin()) {
      this.fbLibrary();
    } else {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        // this.router.navigateByUrl("/home");
      }
    }
  }
  public clickSyncTw(text: string, bind?: boolean) {
    this.isPreLoadIng = true;
    this.isLoadingTwitter = true;
    let callback = environment.webBaseURL + "/callback";
    this.twitterService.requestToken(callback).then((result: any) => {
      this.authorizeLink += '?' + result;
      window.open(this.authorizeLink, '_blank');
      // this.popup(this.authorizeLink, '', 600, 200, 'yes');
      this.isPreLoadIng = false;

      window.bindTwitter = (resultTwitter) => {
        if (resultTwitter !== undefined && resultTwitter !== null) {
          const twitter = new PageSocialTW();
          twitter.twitterOauthToken = resultTwitter.token;
          twitter.twitterTokenSecret = resultTwitter.token_secret;
          twitter.twitterUserId = resultTwitter.userId;
          twitter.twitterPageName = resultTwitter.name;

          this.authenManager.syncWithTwitter(twitter).then((res: any) => {
            if (res.data) {
              this.connectTwitter = res.data;
              this.isLoadingTwitter = false;
              let check = {
                checked: true
              }
            }
          }).catch((err: any) => {
            if (err.error.message === 'This page was binding with Twitter Account.') {
              this.showAlertDialog('บัญชีนี้ได้ทำการเชื่อมต่อ Twitter แล้ว');
            } else {
              this.showAlertDialog('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง');
            }
            this.connectTwitter = false;
          });
        }
      }
    }).catch((error: any) => {
      this.showAlertDialog('เกิดข้อมูลผิดพลาด กรุณาลองใหม่อีกครั้ง');
      this.isPreLoadIng = false;
      this.isLoadingTwitter = false;
    });
  }
  public fbLibrary() {
    (window as any).fbAsyncInit = function () {
      window['FB'].init({
        appId: environment.facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v14.0'
      });
      window['FB'].AppEvents.logPageView();
    };
  }
  public clickLoginFB() {
    window['FB'].login((response) => {
      if (response.authResponse) {
        let accessToken = {
          fbid: response.authResponse.userID,
          fbtoken: response.authResponse.accessToken,
          fbexptime: response.authResponse.data_access_expiration_time,
          fbsignedRequest: response.authResponse.signedRequest
        }
        this.accessToken = accessToken;
        this._ngZone.run(() => this.listPageFacebook());

      } else {
        this.isLoading = false;
      }
    }, { scope: 'public_profile, email, pages_manage_metadata ,pages_manage_posts, pages_show_list, pages_read_engagement' });
  }
  public listPageFacebook() {
    this.isLoading = false;
    window['FB'].api("/me/accounts?access_token=" + this.accessToken.fbtoken, (response) => {
      if (response && !response.error) {
        /* handle the result */
        this.responseFacabook = response;
        if (this.responseFacabook && this.responseFacabook.data.length > 0 && this.responseFacabook !== undefined) {
          Object.assign(this.responseFacabook.data[0], { selected: true });
          this.getListFacebook(this.responseFacabook);
        } else {
          this.connect = false;
          this.showAlertDialog('ไม่พบเพจ');
        }
      }
    });
  }
  public getListFacebook(data) {
    let dialog = this.dialog.open(DialogListFacebook, {
      disableClose: true,
      panelClass: 'customize-dialog',
      data: data
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.checkBoxBindingPageFacebook(res);
      }
    });
  }
  private checkBoxBindingPageFacebook(access: any) {
    const facebook = new PageSoialFB();
    facebook.facebookPageId = access.id;
    facebook.pageAccessToken = access.access_token;
    facebook.facebookPageName = access.name;
    let mode = 'FACEBOOK'

    this.authenManager.syncWithFacebook(facebook, mode).then((data: any) => {
      // login success redirect to main page
      if (data) {
        this.observManager.publish('authen.check', null);
        this.showAlertDialog('บัญชีนี้ได้ทำการเชื่อมต่อ Facebook สำเร็จ');
        if (this.redirection) {
          this.router.navigateByUrl(this.redirection);
        } else {
          this.router.navigate(['home']);
        }
      }
    }).catch((err) => {
      const statusMsg = err.error.message;
      if (statusMsg === "User was not found.") {
        let navigationExtras: NavigationExtras = {
          state: {
            accessToken: this.accessToken,
            redirection: this.redirection
          },
          queryParams: { mode: 'facebook' }
        }
        this.router.navigate(['/register'], navigationExtras);
      } else if (err.error.message === 'Baned PageUser.') {
        this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: MESSAGE.TEXT_LOGIN_BANED,
            bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
            bottomColorText2: "black",
            btDisplay1: "none"
          }
        });
      }
    });
  }
  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }

  public checkUniqueId() {
    if (this.user.providerName === 'FACEBOOK') {
      return '/profile/' + this.user.user;
    } else {
      if (this.user && this.user.id !== '' && this.user.uniqueId && this.user.uniqueId !== "") {
        return '/profile/' + this.user.uniqueId;
      } else {
        return '/profile/' + this.user.id
      }
    }
  }

  public closeMenu() {
    this.trigger.closeMenu();
  }

  private stopIsloading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 250);
  }

  public reloadUserImage(): void {
    this.userImage = undefined;
    let user = this.authenManager.getCurrentUser();
    // if (user !== undefined && user !== null) {
    //   this.profileUser = {
    //     displayName: user.displayName,
    //     email: user.email
    //   };
    //   this.imageAvatarFacade.avatarProfile(user.avatar, user.avatarPath).then((result: any) => {
    //     let blob = result;
    //     this.getBase64ImageFromBlob(blob);
    //   }).catch((error: any) => {
    //     // console.log('error: ' + JSON.stringify(error));
    //     this.userImage = undefined;
    //   });
    // }
  }

  public getBase64ImageFromBlob(imageUrl) {
    var reader = new FileReader();
    reader.readAsDataURL(imageUrl);
    reader.onloadend = () => {
      var base64data = reader.result;
      this.userImage = base64data;
    }
  }

  public getCurrentUserImage(): string {
    sessionStorage.setItem("userimg", this.userImage);
    return (this.userImage) ? this.userImage : DEFAULT_USER_ICON;
  }

  public checkSessionTimeOut() {
    this.authenManager.clearStorage();
    let body = {
      user: this.getCurrentUserId()
    }
    this.authenManager.logout(body).then(() => {
      this.router.navigateByUrl(REDIRECT_PATH);
    }).catch((err) => {
      alert(err.error.message);
    });
  }

  public isProfileActive(test: string): boolean {
    if (this.trigger) {
      return this.trigger.menuOpen;
    } else {
      return false;
    }
  }

  private _getNotification(limit: number, offset: number, select: any, relation: any, whereConditions: any, orderBy: any, count: boolean, arrange?: 'unshift' | 'push') {
    let val = {
      limit: limit,
      offset: offset,
      select: select,
      relation: relation,
      whereConditions: whereConditions,
      orderBy: orderBy,
      count: count
    };

    this.notificationFacade.search(val).then(async (res) => {
      if (res) {
        for await (let data of res.data) {
          if (arrange === 'unshift') {
            if ((whereConditions['isRead'] === true)) this.notificationList['read'].unshift(this._setValueNotification(data, (whereConditions['isRead'] === true))), (this.notificationList.countRead = res.count);
            if ((whereConditions['isRead'] === false)) this.notificationList['unread'].unshift(this._setValueNotification(data, (whereConditions['isRead'] === false))), (this.notificationList.countUnread = res.count);
            if ((!whereConditions['isRead'])) this.notificationList['all'].unshift(this._setValueNotification(data, (!whereConditions['isRead']))), (this.notificationList.countAll = res.count);
          } else if (arrange === 'push') {
            if ((whereConditions['isRead'] === true)) this.notificationList['read'].push(this._setValueNotification(data, (whereConditions['isRead'] === true))), (this.notificationList.countRead = res.count);
            if ((whereConditions['isRead'] === false)) this.notificationList['unread'].push(this._setValueNotification(data, (whereConditions['isRead'] === false))), (this.notificationList.countUnread = res.count);
            if ((!whereConditions['isRead'])) this.notificationList['all'].push(this._setValueNotification(data, (!whereConditions['isRead']))), (this.notificationList.countAll = res.count);
          }
        }

        this.observManager.createSubject('notification');
        this.observManager.publish('notification', {
          data: true
        });
      }
    }).catch((error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  private _setValueNotification(data: any, isRead: boolean) {
    const title = "การแจ้งเตือนใหม่";
    if (isRead) {
      return {
        title: title,
        body: data.notification.title,
        image: !!data!.sender && data.sender.imageURL ? this.apiBaseURL + data.sender.imageURL + '/image' : '',
        status: data.notification.type,
        isRead: data.notification.isRead,
        id: data.notification.id,
        link: data.notification.link,
        createdDate: data.notification.createdDate
      }
    } else {
      return {
        title: title,
        body: data.notification.title,
        image: !!data!.sender && data.sender.imageURL ? this.apiBaseURL + data.sender.imageURL + '/image' : '',
        status: data.notification.type,
        isRead: data.notification.isRead,
        id: data.notification.id,
        link: data.notification.link,
        createdDate: data.notification.createdDate
      }
    }
  }

  // public notija() {
  //   this.notificationFacade.findNotification('63b693401a69db32be899d25').then((res) => {
  //     if (res) {
  //       console.log("res findNotification", res);
  //     }
  //   }).catch((error) => {
  //     if (error) {
  //       console.log("error", error);
  //     }
  //   });
  // }
}
