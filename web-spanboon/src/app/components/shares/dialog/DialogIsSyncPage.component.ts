/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, ElementRef, EventEmitter, NgZone,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchFilter, Asset } from '../../../models/models';
import { PageCategoryFacade, PageFacade, AuthenManager, AssetFacade, ObservableManager, UserFacade } from '../../../services/services';
import { DialogImage } from './DialogImage.component';
import { AbstractPage } from '../../pages/AbstractPage';
import * as $ from 'jquery';
import { Router, NavigationExtras } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { DialogData } from '../../../models/models';
import { TwitterService } from '../../../services/services';
import { DialogListFacebook } from './DialogListFacebook.component';
import { PageSoialFB } from '../../../models/models';
import { DialogAlert } from './DialogAlert.component';
import { MESSAGE } from 'src/app/AlertMessage';
import { PageSocialTW } from '../../../models/models';

const PAGE_NAME: string = 'editcomment';
const SEARCH_LIMIT: number = 100;
const SEARCH_OFFSET: number = 0;
var currentTab = 0;
declare const window: any;

declare var $: any;
@Component({
  selector: 'dialog-alert',
  templateUrl: './DialogIsSyncPage.component.html',
})
export class DialogIsSyncPage extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;
  @Input()
  public connect: boolean = false;
  @ViewChild('pageName', { static: false }) pageName: ElementRef;
  @ViewChild('urlPage', { static: false }) urlPage: ElementRef;
  public redirection: string;
  private pageCategoryFacade: PageCategoryFacade;
  private observManager: ObservableManager;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private userFacade: UserFacade;
  public dialog: MatDialog;
  public apiBaseURL = environment.apiBaseURL;
  private isbottom: boolean;
  public isLoadingTwitter: boolean;
  private accessToken: any;
  private twitterService: TwitterService;
  public connectTwitter: boolean = false;
  private _ngZone: NgZone;
  public isPreLoadIng: boolean;
  public isLoading: boolean;
  public responseFacabook: any;
  public accessTokenLink = "";
  public authorizeLink = "https://api.twitter.com/oauth/authorize";
  public authenticateLink = "https://api.twitter.com/oauth/authenticate";
  public accountTwitter =
    "https://api.twitter.com/1.1/account/verify_credentials.json";

  constructor(public dialogRef: MatDialogRef<DialogIsSyncPage>, pageCategoryFacade: PageCategoryFacade, pageFacade: PageFacade,
    dialog: MatDialog, authenManager: AuthenManager, router: Router, assetFacade: AssetFacade, observManager: ObservableManager, userFacade: UserFacade,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    twitterService: TwitterService,
    _ngZone: NgZone) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.pageCategoryFacade = pageCategoryFacade;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.userFacade = userFacade;
    this.twitterService = twitterService;
    this._ngZone = _ngZone;

  }

  public ngOnInit(): void {
    }

  public ngAfterViewInit(): void {
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  public openTabFb(){
    this.clickSycnFb();
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
  public clickSycnFb(){
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
    facebook.facebookCategory = access.category;
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
        if (statusMsg === "Unable create Page") {
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
  public clickSyncTw(){
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
                if (statusMsg === "Unable create Page") {
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
  onConfirm(): void {
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
    this.authenManager.userIsSyncPage(this.isbottom);
    if(this.data !== undefined && this.data !== null && this.data.confirmClickedEvent !== undefined){
      this.data.confirmClickedEvent.emit(true);
    }
  }

  onClose(): void {
    this.isbottom = false
    this.dialogRef.close(this.isbottom);
    this.authenManager.userIsSyncPage(this.isbottom);
    if(this.data !== undefined && this.data !== null && this.data.cancelClickedEvent !== undefined){
      this.data.cancelClickedEvent.emit(false);
    }
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

}
