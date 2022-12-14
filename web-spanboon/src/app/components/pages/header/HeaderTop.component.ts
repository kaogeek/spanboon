/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ViewChild, OnInit,NgZone, EventEmitter, Input, Output, ElementRef, Renderer2, QueryList } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute  } from '@angular/router';
import { AuthenManager, ObservableManager, EditProfileUserPageFacade } from '../../../services/services';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { MESSAGE } from '../../../../app/AlertMessage';
import * as $ from 'jquery';
import { environment } from 'src/environments/environment';
import { DialogAlert } from '../../components';
import { DialogListFacebook } from '../../components';
import { PageSoialFB } from 'src/app/models/PageSocialFB'; 


const DEFAULT_USER_ICON: string = '../../../assets/components/pages/icons8-female-profile-128.png';
const REDIRECT_PATH: string = '/main';
const PAGE_NAME: string = 'header';

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
  public noti: any = [];

  public user: any;
  private accessToken: any;
  private _ngZone: NgZone;
  public responseFacabook: any;

  public partners: any[] = [];
  public countPageuser: any;
  public isclickmenu: boolean;
  public isLoading: boolean;
  public isFrist: boolean;
  public isCheck: boolean = undefined;
  private activatedRoute: ActivatedRoute;
  public redirection: string;
  public accessTokenLink = '';

  // @ViewChild('menuRight', { static: false }) set positionCenter(element) {
  //    // initially setter gets called with undefined
  //   this.resSize(); 
  // }  

  constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager,
    editProfileFacade: EditProfileUserPageFacade, dialog: MatDialog, private renderer: Renderer2,_ngZone: NgZone,
    activatedRoute: ActivatedRoute) {
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
  }

  ngAfterViewInit(): void {
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

  private checkLoginAndRedirection(): void {
    if (!this.isLogin()) {
      this.fbLibrary();
    } else {
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigateByUrl("/home");
      }
    }
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
    
    this.authenManager.syncWithFacebook(facebook,mode).then((data: any) => {
      // login success redirect to main page
      this.observManager.publish('authen.check', null);
      if (this.redirection) {
        this.router.navigateByUrl(this.redirection);
      } else {
        this.router.navigate(['home']);
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

  public Notification(noti) {
    this.noti = [];
    this.noti = noti;
  }

}
