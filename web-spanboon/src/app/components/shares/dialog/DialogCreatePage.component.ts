/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchFilter, Asset } from '../../../models/models';
import { PageCategoryFacade, PageFacade, AuthenManager, AssetFacade, ObservableManager, UserFacade } from '../../../services/services';
import { DialogImage } from './DialogImage.component';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { environment } from '../../../../environments/environment';

const PAGE_NAME: string = 'editcomment';
const SEARCH_LIMIT: number = 100;
const SEARCH_OFFSET: number = 0;
var currentTab = 0;

declare var $: any;
@Component({
  selector: 'create-page',
  templateUrl: './DialogCreatePage.component.html',
})
export class DialogCreatePage extends AbstractPage {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('pageName', { static: false }) pageName: ElementRef;
  @ViewChild('urlPage', { static: false }) urlPage: ElementRef;

  private pageCategoryFacade: PageCategoryFacade;
  private observManager: ObservableManager;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private userFacade: UserFacade;
  public dialog: MatDialog;
  public apiBaseURL = environment.apiBaseURL;

  public mobile: any = '';
  public email: any = '';
  public line: string = '';
  public twitter: string = '';
  public web: string = '';
  public facebook: string = '';
  public organization: string = '';

  public title: string;
  public content: string;
  public typeId: string;
  public msgError: string;
  public pName: string;
  public resPageType: any;
  public resProfilePage: any;
  public isLoading: Boolean;
  public isType: Boolean;
  public isActive: Boolean;
  public isSkip: boolean = false;
  public isCanCel: boolean = true;
  public uuid: boolean;
  public isNull: boolean;
  public isNext: boolean;
  public isNextEmpty: boolean;
  public isBack: boolean;
  public isEmpty: boolean;
  public isChooseCategory: boolean;
  public isCloseDialog: boolean;
  public checkedCon: boolean = false;

  constructor(public dialogRef: MatDialogRef<DialogCreatePage>, pageCategoryFacade: PageCategoryFacade, pageFacade: PageFacade,
    dialog: MatDialog, authenManager: AuthenManager, router: Router, assetFacade: AssetFacade, observManager: ObservableManager, userFacade: UserFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.pageCategoryFacade = pageCategoryFacade;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.userFacade = userFacade;
    this.isNull = false;
    this.isCloseDialog = false;
    this.isChooseCategory = false;
    this.isNext = false;
    this.isNextEmpty = false;
    this.isBack = true;
    this.observManager.createSubject('authen.createPage');
  }

  ngOnInit() {
    currentTab = 0;
    this.searchPageCategory();
    this.isLoading = true;
  }

  public ngAfterViewInit(): void {
    this.tabWizard(currentTab);
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

  public isEmptyObject(obj) {
    if (typeof obj === 'object') {
      return (obj && (Object.keys(obj).length > 0));
    }
  }

  public selectedListType(item) {
    this.typeId = item.id;
    this.isChooseCategory = true;
    this.isActive = true;
    this.nextPrev(1);
  }

  public searchPageCategory() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {};
    filter.count = false;
    filter.orderBy = {
      createdDate: -1,
    }
    this.isLoading = true;
    this.pageCategoryFacade.search(filter).then((res: any) => {
      this.resPageType = [];
      if (res) {
        this.resPageType = res;
        let index = 0;
        for (let dataImage of res) {
          if(dataImage.iconURL !== undefined && dataImage.iconURL !== '' && dataImage.iconURL !== null){
            this.getDataIcon(dataImage.iconURL, index);
            index++;
          }
        }
        setTimeout(() => {
          this.isLoading = false;
        }, 1500);
      }
    }).catch((err: any) => {
      console.log(err)
    })

  }
  private getDataIcon(iconURL, index): void {
    this.assetFacade.getPathFile(iconURL).then((res: any) => {
      if (res.status === 1) {
        const reg = this.validBase64Image(res.data, iconURL);
        if (reg) {
          setTimeout(() => {
            Object.assign(this.resPageType[index], { iconBase64: res.data });
          }, 1000);
        } else {
          setTimeout(() => {
            Object.assign(this.resPageType[index], { iconBase64: "" });
          }, 1000);
        }
      }
    }).catch((err: any) => {
      console.log(err)
    });
  }

  private validBase64Image(base64Image: string, iconURL): boolean {
    const regex = /^data:image\/(?:gif|png|jpeg)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;
    return base64Image && regex.test(base64Image) ? true : false;
  }

  public onConfirm(): void {
    const pageName = this.pageName.nativeElement.value.trim();
    const urlPage = this.urlPage.nativeElement.value.trim();
    // let asset;
    if (this.typeId === undefined) {
      this.isType = true;
      this.msgError = "กรุณาเลือกประเภทองค์กร"
    } else {
      this.isType = false;
      const asset = new Asset;
      if (this.resProfilePage && this.resProfilePage.image !== undefined) {
        let data = this.resProfilePage.image.split(',')[0];
        let typeImage = data.split(':')[1];
        asset.mimeType = typeImage.split(';')[0];
        asset.data = this.resProfilePage.image.split(',')[1];
        asset.fileName = this.resProfilePage.name;
        asset.size = this.resProfilePage.size;
      } else {
        asset
      }
      let dataPage = {
        name: pageName,
        category: this.typeId,
        pageUsername: urlPage,
        mobileNo: this.mobile,
        websiteURL: this.web,
        email: this.email,
        lineId: this.line,
        facebookURL: this.facebook,
        twitterURL: this.twitter,
        asset,
        label: 'หน่วยงาน',
        value: this.organization,
        ordering: 1
      }
      this.pageFacade.create(dataPage).then((value: any) => {
        if (value.status === 1) {
          this.resProfilePage = value.data;
          this.observManager.publish('authen.createPage', value.data);
          this.isCloseDialog = true;
        }
      }).catch((err: any) => {
        let alertMessages: string;
        if (err.error.message === 'Page is Exists') {
          alertMessages = 'ชื่อเพจนี้สร้างแล้ว'
          let dialog = this.showAlertDialogWarming(alertMessages, "none");
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              // this.observManager.publish('authen.check', null);
              // if (this.redirection) {
              //   this.router.navigateByUrl(this.redirection);
              // } else {
              //   this.router.navigate(['/login']);
              // }
            }
          });
        }
      })
    }
  }

  public checkUUID(text: string) {
    if (text === '') {
      return;
    }
    if (text.length > 0) {
      let pattern = text.match('^[A-Za-z0-9_.]*$');
      if (!pattern) {
        this.uuid = false;
        document.getElementById('urlPage').focus();
      } else {
        let body = {
          pageUsername: text
        }
        this.uuid = true;
        this.pageFacade.checkPageUsername(body).then((res) => {
          if (res && res.data) {
            this.uuid = res.data;
          } else {
            this.uuid = res.error;
          }
          document.getElementById('urlPage').focus();

        }).catch((err) => {
          this.uuid = false;
          document.getElementById('urlPage').focus();
        })
      }
    }
  }

  public checkPatternEmail(mail: string) {
    let pattern = mail.match('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}');
    if (!pattern) {
      this.isNextEmpty = true;
      return $('.checkEmail').addClass('invalid');
    } else {
      this.isNextEmpty = false;
      return $('.checkEmail').addClass('correct');
    }
  }

  public showDialogImage(): void {
    const dialogRef = this.dialog.open(DialogImage, {
      width: 'auto',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.resProfilePage = result
      }
      this.stopLoading();
    });
  }

  public onClose(): void {
    // this.dialogRef.close();
    this.router.navigate(["/home"]);
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  public tabWizard(n) {
    var x = document.getElementsByClassName("box-create");
    x[n].setAttribute("style", "display: flex");

    var r = document.getElementsByClassName("right-body");
    if (n === 3) {
      r[0].classList.add("active");
    } else {
      r[0].classList.remove("active");
    }

    if (n == 0) {
      document.getElementById("prevBtn").style.display = "none";
    } else {
      document.getElementById("prevBtn").style.display = "inline-block";
    }
    if (n == (x.length - 1)) {
      document.getElementById("nextBtn").innerHTML = "เสร็จ";
      if (n === 4) {
        this.onConfirm();
      }
    } else {
      if (this.isNext) {
        setTimeout(() => {
          document.getElementById("nextBtn").innerHTML = "ถัดไป";
        }, 0);
      }
    }


    this.fixStepIndicator(n);
  }

  public nextPrev(n) {
    this.isActive = false;
    this.isSkip = false;
    if (this.isCloseDialog) {
      return this.onClose();
    }
    if (this.isNextEmpty) {
      this.isSkip = true;
      return;
    }

    this.pName = this.pageName.nativeElement.value.trim();
    var x = document.getElementsByClassName("box-create");
    if (this.isChooseCategory) {
      if (n == 1 && !this.validateForm()) return false;
    }
    x[currentTab].setAttribute("style", "display: none");
    currentTab = currentTab + n;

    if (currentTab >= x.length) {
      // document.getElementById("regForm").submit();
      return false;
    }
    if (currentTab === 0) {
      this.isNext = false;
    }
    if (currentTab === 1) {
      this.isNext = true;
      $('.but-conf').removeClass('active');
    }

    if (currentTab === 2) {
      this.isSkip = true;
      $('.but-conf').removeClass('active');
    } else {
      this.isCanCel = false;
    }

    if (currentTab === 3) {
      this.isNext = true;
      if (this.checkedCon === true) {
        $('.but-conf').removeClass('active');
      } else {
        $('.but-conf').addClass('active');
      }
    } else {
      if (currentTab === 4) {
        this.isBack = false;
      }
    }

    this.tabWizard(currentTab);
  }

  public validateForm() {
    var x, y, i, valid = true;
    x = document.getElementsByClassName("box-create");
    y = x[currentTab].getElementsByTagName("input");

    if (currentTab === 2 || currentTab === 3) {
      return true;
    }

    for (i = 0; i < y.length; i++) {
      y = x[currentTab].getElementsByTagName("input");
      if (this.isChooseCategory) {
        if (y[0].value == "") {
          y[0].classList.add("invalid");
          this.isEmpty = true;
          document.getElementById('username').focus();
          valid = false;
        } else {
          y[0].classList.remove("invalid");
          this.isEmpty = false;
          valid = true;
        }
      } else {
        if (y[i].value == "") {
          y[i].classList.add("invalid");
          valid = false;
        } else {
          y[i].classList.remove("invalid");
          valid = true;
        }
      }
    }

    if (valid) {
      document.getElementsByClassName("step")[currentTab].classList.remove("finish");
    }
    return valid;
  }

  public fixStepIndicator(n) {
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
      x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
  }

  public skip(tab) {
    if (tab === 3) {
      // var x = document.getElementsByClassName("box-create"); 
      // x[tab].setAttribute("style", "display: none");

      this.nextPrev(1);
      this.isSkip = false;
    }
  }

  public checkedClick() {
    this.checkedCon = !this.checkedCon;

    if (this.checkedCon === true) {
      $('.but-conf').removeClass('active');
    } else {
      $('.but-conf').addClass('active');
    }
  }
}
