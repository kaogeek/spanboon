/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import {
  OnInit,
  Component,
  Input,
  ViewChild,
  EventEmitter,
  NgZone,
  HostListener,
} from "@angular/core";
import { PageUserInfo } from "../../services/PageUserInfo.service";
import { MatDialog, MatDrawer } from "@angular/material";
import {
  PageFacade,
  AssetFacade,
  AuthenManager,
  ObservableManager,
  UserAccessFacade,
} from "../../services/services";
import { AbstractPage } from "../pages/AbstractPage";
import { Router, NavigationExtras } from "@angular/router";
import { DialogCreatePage } from "./dialog/DialogCreatePage.component";
import { MESSAGE } from "../../../custom/variable";
import { DialogAlert } from "./dialog/DialogAlert.component";
import { environment } from "src/environments/environment";
import { TwitterService } from "../../services/services";
import { PageSocialTW, PageSoialFB } from "../../models/models";
import { DialogListFacebook } from "./dialog/DialogListFacebook.component";
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;
declare const window: any;

@Component({
  selector: "btn-list-page",
  templateUrl: "./ManagePage.component.html",
})
export class ManagePage extends AbstractPage implements OnInit {
  @Input()
  protected class: string | string[];
  @Input()
  protected link: string;
  @Input()
  protected pageUser: any;
  @Input()
  public connect: boolean = false;
  @ViewChild("drawer", { static: true }) public drawer: MatDrawer;
  public redirection: string;
  private pageUserInfo: PageUserInfo;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private userAccessFacade: UserAccessFacade;
  protected observManager: ObservableManager;
  public userCloneDatas: any
  public dialog: MatDialog;
  public resListPage: any;
  public apiBaseURL = environment.apiBaseURL;
  public isPreLoadIng: boolean;
  public isLoadingTwitter: boolean;
  public isLoading: boolean;
  public responseFacabook: any;
  private accessToken: any;
  private twitterService: TwitterService;
  public connectTwitter: boolean = false;
  private _ngZone: NgZone;
  public accessTokenLink = "";
  public authorizeLink = "https://api.twitter.com/oauth/authorize";
  public authenticateLink = "https://api.twitter.com/oauth/authenticate";
  public accountTwitter =
    "https://api.twitter.com/1.1/account/verify_credentials.json";
  // public ownerUser: string;

  public isScrollingCreatePage: boolean = false;

  constructor(
    router: Router,
    pageUserInfo: PageUserInfo,
    authenManager: AuthenManager,
    dialog: MatDialog,
    pageFacade: PageFacade,
    assetFacade: AssetFacade,
    observManager: ObservableManager,
    userAccessFacade: UserAccessFacade,
    twitterService: TwitterService,
    _ngZone: NgZone
  ) {
    super(null, authenManager, dialog, router);
    this.pageUserInfo = pageUserInfo;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.userAccessFacade = userAccessFacade;
    this.dialog = dialog;
    this.twitterService = twitterService;
    this._ngZone = _ngZone;

    this.observManager.subscribe("authen.createPage", (data: any) => {
      this.searchAllPage();
    });

    this.observManager.subscribe("authen.check", (data: any) => {
      this.searchAllPage();
    });

    this.observManager.subscribe("page.about", (data: any) => {
      if (data) {
        const countIndexPage = this.resListPage.findIndex(res => (res.page.id === data.data.id));
        if (countIndexPage >= 0) {
          this.resListPage[countIndexPage].page.pageUsername = data.data.pageUsername;
          this.resListPage[countIndexPage].page.name = data.data.name;
        }
      }
    });
  }
  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    /* setTimeout(() =>{
      if(user.isSyncPage !== false && user.isSyncPage !== true){
        let dialog = this.dialog.open(DialogIsSyncPage, {
          disableClose: true,
          data: {
            title:"สร้างเพจของคุณโดยการเชื่อมแพลตฟอร์ม",
            bottomText2: MESSAGE.TEXT_BUTTON_SKIP,
            bottomColorText2: "black",
            btDisplay1: "none",
          },
        }); 
      }
    },5000); */
    return user !== undefined && user !== null;
  }

  public ngOnInit(): void {
    this.isLogin();
    this.searchAllPage();
    this.fbLibrary();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.observManager.complete('page.about');
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

  isActive(): boolean {
    let page = document.getElementsByClassName("list-page");
    return page && page.length > 0;
  }

  public dialogShow() {
    // this.dialog.open(DialogAlert, {
    //   disableClose: true,
    //   data: {
    //     text: "คุณมีเพจอยู่แล้ว",
    //     bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
    //     bottomColorText2: "black",
    //     btDisplay1: "none",
    //   },
    // });

  }

  public async clickSyncTw(text: string, bind?: boolean) {
    let isCheck: boolean = false;
    let callback = environment.webBaseURL + "/callback";
    await this.twitterService.requestToken(callback).then((result: any) => {
      this.authorizeLink += "?" + result;
      window.open(this.authorizeLink, "_blank");
      // this.popup(this.authorizeLink, '', 600, 200, 'yes');

      window.bindTwitter = async (resultTwitter) => {
        if (resultTwitter !== undefined && resultTwitter !== null) {
          const twitter = new PageSocialTW();
          twitter.twitterOauthToken = resultTwitter.token;
          twitter.twitterTokenSecret = resultTwitter.token_secret;
          twitter.twitterUserId = resultTwitter.userId;
          twitter.twitterPageName = resultTwitter.name;
          await this.authenManager.syncWithTwitter(twitter).then((res) => {
            // setTimeout(() => {
            //   this.closeLoading();
            // }, 1000);
            if (res) {
              this.showAlertDialog("บัญชีนี้ได้ทำการเชื่อมต่อ Facebook สำเร็จ");
              this.openLoading();
              this.connectTwitter = res.data;
              this.isLoadingTwitter = false;
              let check = {
                checked: true,
              };
            }
          }).catch((err) => {
            if (err.error.message === "Unable create Page" && err.status === 400) {
              isCheck = true;
            }
          })
        }
      };
    }).catch((err) => {
      if (err) {
        console.log("err", err);
        this.isPreLoadIng = false;
        this.isLoadingTwitter = false;
      }
    });

    this.observManager.publish("authen.check", null);
  }

  public fbLibrary() {
    window["FB"].init({
      appId: environment.facebookAppId,
      cookie: true,
      xfbml: true,
      version: "v14.0",
    });
    window["FB"].AppEvents.logPageView();
  }
  public clickLoginFB() {
    window["FB"].login(
      (response) => {
        if (response.authResponse) {
          let accessToken = {
            fbid: response.authResponse.userID,
            fbtoken: response.authResponse.accessToken,
            fbexptime: response.authResponse.data_access_expiration_time,
            fbsignedRequest: response.authResponse.signedRequest,
          };
          this.accessToken = accessToken;
          this._ngZone.run(() => this.listPageFacebook());
        } else {
          this.isLoading = false;
        }
      },
      {
        scope:
          "public_profile, email, pages_manage_metadata ,pages_manage_posts, pages_show_list, pages_read_engagement",
      }
    );
  }
  public listPageFacebook() {
    this.isLoading = false;
    window["FB"].api(
      "/me/accounts?access_token=" + this.accessToken.fbtoken,
      (response) => {
        if (response && !response.error) {
          /* handle the result */
          this.responseFacabook = response;
          if (
            this.responseFacabook &&
            this.responseFacabook.data.length > 0 &&
            this.responseFacabook !== undefined
          ) {
            Object.assign(this.responseFacabook.data[0], { selected: true });
            this.getListFacebook(this.responseFacabook);
          } else {
            this.connect = false;
            this.showAlertDialog("ไม่พบเพจ");
          }
        }
      }
    );
  }
  public getListFacebook(data) {
    let dialog = this.dialog.open(DialogListFacebook, {
      disableClose: true,
      panelClass: "customize-dialog",
      data: data,
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.checkBoxBindingPageFacebook(res);
        this.openLoading();
      }
    });
  }
  private checkBoxBindingPageFacebook(access: any) {
    const facebook = new PageSoialFB();
    facebook.facebookPageId = access.id;
    facebook.pageAccessToken = access.access_token;
    facebook.facebookPageName = access.name;
    facebook.facebookCategory = access.category;
    let mode = "FACEBOOK";

    this.authenManager
      .syncWithFacebook(facebook, mode)
      .then((data: any) => {
        // login success redirect to main page
        if (data) {
          setTimeout(() => {
            this.closeLoading();
          }, 1000);
          this.observManager.publish("authen.check", null);
          this.showAlertDialog("บัญชีนี้ได้ทำการเชื่อมต่อ Facebook สำเร็จ");
          if (this.redirection) {
            this.router.navigateByUrl(this.redirection);
          } else {
            this.router.navigate(["home"]);
          }
        }
      })
      .catch((err) => {
        if (err.error.message === "Unable create Page" && err.status === 400) {
          this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "คุณมีเพจอยู่แล้ว",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
        }
        if (err.error.message === "Pagename already exists") {
          this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "ชื่อเพจนี้มีอยู่ในระบบแล้ว",
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
        }
        if (err.error.message === "User was not found.") {
          let navigationExtras: NavigationExtras = {
            state: {
              accessToken: this.accessToken,
              redirection: this.redirection,
            },
            queryParams: { mode: "facebook" },
          };
          this.router.navigate(["/register"], navigationExtras);
        } else if (err.error.message === "Baned PageUser.") {
          this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: MESSAGE.TEXT_LOGIN_BANED,
              bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
              bottomColorText2: "black",
              btDisplay1: "none",
            },
          });
        }

        this.closeLoading();
      });
  }
  private openLoading() {
    this.isLoading = true;
  }

  private closeLoading() {
    this.isLoading = false;
  }
  public createPage() {
    this.hideScroll();
    const dialogRef = this.dialog.open(DialogCreatePage, {
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((res) => { });
  }

  public clickSystemDevelopment(): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: MESSAGE.TEXT_DEVERLOP,
        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        btDisplay1: "none",
      },
    });
    dialog.afterClosed().subscribe((res) => { });
  }

  public clickMenu() {
    this.hideScroll();
  }

  public hideScroll() {
    if (this.drawer.opened) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }

  public searchAllPage() {
    this.userAccessFacade
      .getPageAccess()
      .then((res: any) => {
        if (res.length > 0) {
          for (let data of res) {
            if (
              data.page &&
              data.page.imageURL !== "" &&
              data.page.imageURL !== null &&
              data.page.imageURL !== undefined
            ) {
              // this.assetFacade.getPathFile(data.page.imageURL).then((image: any) => {
              //     if (image.status === 1) {
              //         if (!this.validBase64Image(image.data)) {
              //             data.page.imageURL = null
              //         } else {
              //             data.page.imageURL = image.data
              //         }
              //         setTimeout(() => {
              //             this.resListPage = res
              //         }, 1000);
              //     }
              // }).catch((err: any) => {
              //     if (err.error.message === "Unable got Asset") {
              //         data.page.imageURL = ''
              //         this.resListPage = res
              //     }
              // })
              this.resListPage = res;
            } else {
              this.resListPage = res;
            }
          }
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  private validBase64Image(base64Image: string): boolean {
    const regex =
      /^data:image\/(?:gif|png|jpeg)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;
    return base64Image && regex.test(base64Image) ? true : false;
  }

  public nextPage(item: any) {
    document.body.style.overflowY = "auto";
    if (!!item.page!.pageUsername) {
      this.router.navigate(["/page/", item.page.pageUsername]);
    } else {
      this.router.navigate(["/page/", item.page.id]);
    }
  }

  public clickSetting(item: any) {
    document.body.style.overflowY = "auto";
    if (!!item.page!.pageUsername) {
      this.router.navigate(["/page/" + item.page.pageUsername + "/settings"]);
    } else {
      this.router.navigate(["/page/" + item.page.id + "/settings"]);
    }
  }

  // @HostListener('scroll', ['$event']) // for scroll events of the current element
  @HostListener("window:scroll", ["$event"]) // for window scroll events
  public onScrollCreatePage(event) {
    if (event.srcElement.scrollTop > 1) {
      this.isScrollingCreatePage = true;
    } else {
      this.isScrollingCreatePage = false;
    }
  }
}
