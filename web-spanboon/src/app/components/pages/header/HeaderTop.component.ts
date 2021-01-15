/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, ViewChild, OnInit, EventEmitter, Input, Output, ElementRef, Renderer2, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenManager, ObservableManager, EditProfileUserPageFacade } from '../../../services/services';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material';
import { AbstractPage } from '../AbstractPage';
import { MESSAGE } from '../../../../app/AlertMessage';
import * as $ from 'jquery';

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
  protected menutopprofile: boolean;
  // @Output()
  // public logout: EventEmitter<any> = new EventEmitter();

  private observManager: ObservableManager;
  private editProfileFacade: EditProfileUserPageFacade;
  private userImage: any;
  public noti: any = [];

  public user: any;
  public partners: any[] = [];
  public countPageuser: any;
  public isclickmenu: boolean;
  public isLoading: boolean;
  public isFrist: boolean;
  public isCheck: boolean = undefined;

  // @ViewChild('menuRight', { static: false }) set positionCenter(element) {
  //    // initially setter gets called with undefined
  //   this.resSize(); 
  // }  

  constructor(router: Router, authenManager: AuthenManager, observManager: ObservableManager,
    editProfileFacade: EditProfileUserPageFacade, dialog: MatDialog, private renderer: Renderer2) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.router = router;
    this.authenManager = authenManager;
    this.editProfileFacade = editProfileFacade;
    this.observManager = observManager;
    this.dialog = dialog;
    this.isLoading = true;
    this.isFrist = true;

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
    this.reloadUserImage();
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

  // public clickLogout(event) { 
  //   if(event){   
  //     setTimeout(() => {
  //       this.resSize();  
  //     }, 0);
  //   }
  // }

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
    this.noti = noti
  }

}
