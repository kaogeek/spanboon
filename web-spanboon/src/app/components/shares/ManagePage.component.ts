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
import { FormControl } from "@angular/forms";
import { MatDialog, MatDrawer, MatDrawerContainer } from "@angular/material";
import {
  PageFacade,
  AssetFacade,
  AuthenManager,
  ObservableManager,
  UserAccessFacade,
} from "../../services/services";
import { SearchFilter } from "../../models/models";
import { AbstractPage } from "../pages/AbstractPage";
import { Router, NavigationExtras } from "@angular/router";
import { DialogCreatePage } from "./dialog/DialogCreatePage.component";
import { MESSAGE } from "../../../custom/variable";
import { DialogAlert } from "./dialog/DialogAlert.component";
import { environment } from "src/environments/environment";
import { TwitterService } from "../../services/services";
import { PageSocialTW } from "../../models/models";
import { PageSoialFB } from "../../models/models";
import { DialogListFacebook } from "./shares";
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
  }
  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public ngOnInit(): void {
    this.searchAllPage();
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

  isActive(): boolean {
    let page = document.getElementsByClassName("list-page");
    return page && page.length > 0;
  }
  public clickSyncTw(text: string, bind?: boolean) {
    this.isPreLoadIng = true;
    this.isLoadingTwitter = true;
    let callback = environment.webBaseURL + "/callback";
    this.twitterService
      .requestToken(callback)
      .then((result: any) => {
        this.authorizeLink += "?" + result;
        window.open(this.authorizeLink, "_blank");
        // this.popup(this.authorizeLink, '', 600, 200, 'yes');
        this.isPreLoadIng = false;

        window.bindTwitter = (resultTwitter) => {
          if (resultTwitter !== undefined && resultTwitter !== null) {
            const twitter = new PageSocialTW();
            twitter.twitterOauthToken = resultTwitter.token;
            twitter.twitterTokenSecret = resultTwitter.token_secret;
            twitter.twitterUserId = resultTwitter.userId;
            twitter.twitterPageName = resultTwitter.name;

            this.authenManager
              .syncWithTwitter(twitter)
              .then((res: any) => {
                if (res.data) {
                  this.connectTwitter = res.data;
                  this.isLoadingTwitter = false;
                  let check = {
                    checked: true,
                  };
                }
              })
              .catch((err: any) => {
                const statusMsg = err.error.message;
                if (statusMsg === "Unable create Page" && statusMsg === 400) {
                    let dialog = this.dialog.open(DialogAlert, {
                        disableClose: true,
                        data: {
                          text: "คุณมีเพจอยู่แล้ว",
                          bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                          bottomColorText2: "black",
                          btDisplay1: "none",
                        },
                    });
                }
                if (
                  err.error.message ===
                  "This page was binding with Twitter Account."
                ) {
                  this.showAlertDialog(
                    "บัญชีนี้ได้ทำการเชื่อมต่อ Twitter แล้ว"
                  );
                } else {
                  this.showAlertDialog("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้ง");
                }
                this.connectTwitter = false;
              });
          }
        };
      })
      .catch((error: any) => {
        this.showAlertDialog("เกิดข้อมูลผิดพลาด กรุณาลองใหม่อีกครั้ง");
        this.isPreLoadIng = false;
        this.isLoadingTwitter = false;
      });
  }
  public fbLibrary() {
    (window as any).fbAsyncInit = function () {
      window["FB"].init({
        appId: environment.facebookAppId,
        cookie: true,
        xfbml: true,
        version: "v14.0",
      });
      window["FB"].AppEvents.logPageView();
    };
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
      }
    });
  }
  private checkBoxBindingPageFacebook(access: any) {
    const facebook = new PageSoialFB();
    facebook.facebookPageId = access.id;
    facebook.pageAccessToken = access.access_token;
    facebook.facebookPageName = access.name;
    let mode = "FACEBOOK";

    this.authenManager
      .syncWithFacebook(facebook, mode)
      .then((data: any) => {
        // login success redirect to main page
        if (data) {
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
        const statusMsg = err.error.message;
        if (statusMsg === "Unable create Page" && statusMsg === 400) {
            let dialog = this.dialog.open(DialogAlert, {
                disableClose: true,
                data: {
                  text: "คุณมีเพจอยู่แล้ว",
                  bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
                  bottomColorText2: "black",
                  btDisplay1: "none",
                },
            });
        }
        if (statusMsg === "User was not found.") {
          let navigationExtras: NavigationExtras = {
            state: {
              accessToken: this.accessToken,
              redirection: this.redirection,
            },
            queryParams: { mode: "facebook" },
          };
          this.router.navigate(["/register"], navigationExtras);
        } else if (statusMsg === "Baned PageUser.") {
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
      });
  }
  public createPage() {
    this.hideScroll();
    const dialogRef = this.dialog.open(DialogCreatePage, {
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((res) => {});
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
    dialog.afterClosed().subscribe((res) => {});
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
    if (
      item.page.pageUsername &&
      item.page.pageUsername !== "" &&
      item.page.pageUsername !== null &&
      item.page.pageUsername !== undefined
    ) {
      this.router.navigate(["/page/", item.page.pageUsername]);
    } else {
      this.router.navigate(["/page/", item.page.id]);
    }
  }

  public clickSetting(item: any) {
    document.body.style.overflowY = "auto";
    if (
      item.page.pageUsername &&
      item.page.pageUsername !== "" &&
      item.page.pageUsername !== null &&
      item.page.pageUsername !== undefined
    ) {
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
