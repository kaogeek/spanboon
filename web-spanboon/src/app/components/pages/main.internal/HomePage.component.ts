/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, ViewChild, ElementRef, HostListener, EventEmitter } from '@angular/core';
import { MatPaginator, MatDialog } from '@angular/material';
import { SwiperConfigInterface, SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
import { Gallery, GalleryRef } from '@ngx-gallery/core';
import {
  AuthenManager, MainPageSlideFacade, AssetFacade
} from '../../../services/services';
import { AbstractPage } from '../AbstractPage';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { PostFacade } from '../../../services/facade/PostFacade.service'; 
import { Router } from '@angular/router';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { DialogAlert } from '../../shares/dialog/dialog';
import { environment } from 'src/environments/environment';

declare var $: any;

const PAGE_NAME: string = 'home';
const PAGE_SIZE: number = 6;

@Component({
  selector: 'newcon-home-page',
  templateUrl: './HomePage.component.html',
})
export class HomePage extends AbstractPage implements OnInit {

  private cacheConfigInfo: CacheConfigInfo;
  private postFacade: PostFacade;
  private mainPageModelFacade: MainPageSlideFacade;
  private assetFacade: AssetFacade;

  public static readonly PAGE_NAME: string = PAGE_NAME;
  @ViewChild("paginator", { static: false }) public paginator: MatPaginator;

  public hide = true;
  public email: string = '';
  public password: string = '';
  public resActivity: any = [];
  public resTag: any = [];
  public contentPage = [];
  public tagIdArticles: string;
  public tagName = [];
  public mainVideo = [];
  public result = [];
  public contentArticles = [];
  public test: any;
  public pageSize: number = PAGE_SIZE;
  public displayShow: boolean = false;
  public apiBaseURL = environment.apiBaseURL;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  galleryId = 'mixedExample';
  loadLogin: boolean = false;

  //
  public isTablet: boolean;
  public isMobile: boolean;
  public isLoading: boolean;
  public showLoading: boolean;
  public dataMainPage: any;
  public dataLastest: any;
  public innerWidth: any;
  public ganY: any
  public ganX: any
  public userCloneDatas: any
  public index: number;
  public textLink: string;

  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 3,
    spaceBetween: 15,
    keyboard: false,
    mousewheel: false,
    scrollbar: false,
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      768: {
        spaceBetween: 10,
        slidesPerView: 1,
      },
      1024: {

      },
      1600: {
        slidesPerView: 2,
        spaceBetween: 15,
      },
    },
  }

  public configSlider1: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 4,
    spaceBetween: 10,
    keyboard: false,
    mousewheel: false,
    scrollbar: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      576: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      899: {
        slidesPerView: 2.2,
      },
      1024: {
        slidesPerView: 2.8,
      },
      1440: {
        slidesPerView: 3.2,
      },
    },
  }
  public configSlider2: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 4,
    spaceBetween: 10,
    keyboard: false,
    mousewheel: false,
    scrollbar: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      576: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      899: {
        slidesPerView: 2.2,
      },
      1024: {
        slidesPerView: 2.8,
      },
      1440: {
        slidesPerView: 3.2,
      },
    },
  }

  public configIcon: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 5,
    spaceBetween: 10,
    keyboard: false,
    mousewheel: false,
    scrollbar: false,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      576: {
        slidesPerView: 1.2,
      },
      768: {
        slidesPerView: 2.2,
      },
      // 899: {
      //   slidesPerView: 2,
      // },
      1024: {
        slidesPerView: 3.2,
      },
      // 1280: {
      //   slidesPerView: 3.5,
      // },
      1440: {
        slidesPerView: 4,
      },
    },
  }

  @ViewChild(SwiperComponent, { static: false }) componentRef: SwiperComponent;
  @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;
  @ViewChild("swiperVote", { static: false }) swiperVote: ElementRef;

  constructor(private gallery: Gallery, router: Router, authenManager: AuthenManager, postFacade: PostFacade, dialog: MatDialog, cacheConfigInfo: CacheConfigInfo,
    mainPageModelFacade: MainPageSlideFacade, assetFacade: AssetFacade) {
    super(null, authenManager, dialog, router);

    this.cacheConfigInfo = cacheConfigInfo;
    this.postFacade = postFacade;
    this.mainPageModelFacade = mainPageModelFacade;
    this.assetFacade = assetFacade;
    this.isLoading = false;
    this.showLoading = true

    setTimeout(() => {
      this.showLoading = false
    }, 3000);

  }
  private setCardSilder() {
    this.config = {
      direction: 'horizontal',
      slidesPerView: 3,
      spaceBetween: 15,
      keyboard: false,
      mousewheel: false,
      scrollbar: false,
      loop: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      preloadImages: false,
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 2,
      },
      breakpoints: {
        // 479: {
        //   slidesPerView: 1,
        //   spaceBetween: 0,
        // },
        // 768: {
        // },
        991: {
          slidesPerView: 1,
          spaceBetween: 5,
        },
        1740: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
      },
    }

    // this.configSlider = {
    //   direction: 'horizontal',
    //   slidesPerView: 4,
    //   spaceBetween: 10,
    //   keyboard: false,
    //   mousewheel: false,
    //   scrollbar: false,
    //   navigation: {
    //     nextEl: '.swiper-button-next',
    //     prevEl: '.swiper-button-prev',
    //   },
    //   breakpoints: {
    //     479: {
    //       slidesPerView: 1,
    //     },
    //     576: {
    //       slidesPerView: 1.3,
    //     },
    //     700: {
    //       slidesPerView: 1.8,
    //     },
    //     768: {
    //       slidesPerView: 2,
    //       spaceBetween: 5,
    //     },
    //     899: {
    //       slidesPerView: 2.2,
    //     },
    //     1024: {
    //       slidesPerView: 2.8,
    //     },
    //     1440: {
    //       slidesPerView: 3.2,
    //     },
    //     1600: {
    //       slidesPerView: 4,
    //       spaceBetween: 10,
    //     },
    //   },
    // }

    // this.config3 = {
    //   direction: 'horizontal',
    //   slidesPerView: 6,
    //   spaceBetween: 10,
    //   keyboard: false,
    //   mousewheel: false,
    //   scrollbar: false,
    //   navigation: {
    //     nextEl: '.swiper-button-next',
    //     prevEl: '.swiper-button-prev',
    //   },
    //   breakpoints: {
    //     479: {
    //       slidesPerView: 1,
    //       spaceBetween: 10,
    //     },
    //     768: {
    //       slidesPerView: 3,
    //       spaceBetween: 10,
    //     },
    //     1024: {
    //       slidesPerView: 3,
    //       spaceBetween: 10,
    //     },
    //     1600: {
    //       slidesPerView: 4,
    //       spaceBetween: 10,
    //     },
    //   },
    // }
  }

  public ngOnInit(): void {
    let user = this.authenManager.getCurrentUser()
    this.userCloneDatas = JSON.parse(JSON.stringify(user));
    super.ngOnInit();
    this.getModel();
    // this.checkMobile();

    // if(navigator.userAgent.match(/iPhone/i)){
    //   console.log('iPhone');
    // } else if(navigator.userAgent.match(/iPad/i)){
    //   console.log('iPad');
    // }
    // if(navigator.userAgent.match(/iPhone/i)){
    //   console.log('iPhone');
    // } else if(navigator.userAgent.match(/Android/i)){
    //   console.log('Android');
    // } else if(navigator.userAgent.match(/iPad/i)){
    //   console.log('iPad');
    // } else if(navigator.userAgent.match(/Tablet/i)){
    //   console.log('Tablet');
    // }
    // if(navigator.userAgent.match(/Mac OS X/i)){
    //   console.log('Mac');
    // } else {
    //   console.log('PC');
    // }

    // if (navigator.userAgent.match(/iPhone/i)) {
    //   console.log('iPhone');
    // } else {
    //   console.log('Android');
    // }

    // if (navigator.userAgent.match(/iPad/i)) {
    //   console.log('iPad');
    // } else {
    //   console.log('Tablet');
    // }

    // if (navigator.userAgent.match(/Mac OS X/i)) {
    //   console.log('Mac');
    // } else {
    //   console.log('PC');
    // }

    // var sBrowser, sUsrAg = navigator.userAgent;

    // // The order matters here, and this may report false positives for unlisted browsers.

    // if (sUsrAg.indexOf("Firefox") > -1) {
    //   sBrowser = "Mozilla Firefox";
    //   // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    // } else if (sUsrAg.indexOf("SamsungBrowser") > -1) {
    //   sBrowser = "Samsung Internet";
    //   // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    // } else if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) {
    //   sBrowser = "Opera";
    //   // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    // } else if (sUsrAg.indexOf("Trident") > -1) {
    //   sBrowser = "Microsoft Internet Explorer";
    //   // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    // } else if (sUsrAg.indexOf("Edge") > -1) {
    //   sBrowser = "Microsoft Edge";
    //   // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    // } else if (sUsrAg.indexOf("Chrome") > -1) {
    //   sBrowser = "Google Chrome or Chromium";
    //   // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    // } else if (sUsrAg.indexOf("Safari") > -1) {
    //   sBrowser = "Apple Safari";
    //   // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    // } else {
    //   sBrowser = "unknown";
    // }

    // alert("You are using: " + sBrowser);

    // this.setHeightCard();

    // this.innerWidth = window.innerWidth;

    // $(window).ready(() => {
    //   this.getHeightCard();
    // });

    // $(window).on('load', () => {
    //   this.getHeightCard();
    // });

    // $(window).resize(() => {
    //   this.getHeightCard();
    // });

    // this.checkArrow();
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

  // @HostListener('window:resize', ['$event'])
  public onResize(event) {
    // this.checkMobile();
  }

  // public checkArrow() {
  //   var swiperPrev = document.querySelector('.swiper-button-prev') as HTMLElement;
  //   var swiperNext = document.querySelector('.swiper-button-next') as HTMLElement;
  //   if (window.innerWidth < 1024) {
  //     swiperPrev.style.display = 'block';
  //     swiperNext.style.display = 'block';
  //   } else {
  //     swiperPrev.style.display = 'none';
  //     swiperNext.style.display = 'none';
  //   }
  // }

  // public getHeightCard() {
  //   let scrollCard = document.querySelectorAll('.wrapper-flip-card > .card-new-looking');
  //   let a: any[] = [];
  //   scrollCard.forEach((item) => {
  //     a.push(item.scrollHeight);
  //   });

  //   let r = Math.max.apply(null, a);
  //   let height: string = (r + 'px')
  //   var i;
  //   for (i = 0; i < scrollCard.length; i++) {
  //     if (window.innerWidth >= 768) {
  //       scrollCard[i].setAttribute("style", "height :" + height);
  //     } else {
  //       scrollCard[i].setAttribute("style", "height : auto");
  //     }
  //   }
  // }

  public getModel() {
    this.isLoading = true;
    if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
      this.getMainPageModel(this.userCloneDatas.id);
    } else {
      this.getMainPageModel();
    }
  }

  private getMainPageModel(userId?: string) {
    this.mainPageModelFacade.getMainPageModel(userId).then((res) => {
      this.dataMainPage = res;
      console.log('dataMainPage', this.dataMainPage);
      let contentsIndex = 0;
      for (let image of this.dataMainPage.emergencyEvents.contents) {
        this.dataMainPage.emergencyEvents.contents[contentsIndex].isLoadingCover = true;
        if (image.coverPageUrl && image.coverPageUrl !== null && image.coverPageUrl !== "" && image.coverPageUrl !== undefined) {
          this.getDataIcon(image.coverPageUrl, "cover", contentsIndex);
          contentsIndex++;
        }
      }
      for (let image of this.dataMainPage.lastest.contents) {
        if (image.owner && image.owner.imageURL !== null && image.owner.imageURL !== "" && image.owner.imageURL !== undefined) {
          this.assetFacade.getPathFile(image.owner.imageURL).then((res: any) => {
            if (res.status === 1) {
              this.dataMainPage.isLoadingImage = false;
              if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                Object.assign(image.owner, { imageBase64: res.data });
              } else {
                Object.assign(image.owner, { imageBase64: null });
              }
            }
          }).catch((err: any) => {
            if (err.error.status === 0) {
              if (err.error.message === 'Unable got Asset') {
                Object.assign(image.owner, { imageBase64: undefined });
              }
            }
          });
        }
      }
      for (let image of this.dataMainPage.emergencyPin.contents) {
        if (image.coverPageUrl && image.coverPageUrl !== null && image.coverPageUrl !== "" && image.coverPageUrl !== undefined) {
          this.assetFacade.getPathFile(image.coverPageUrl).then((res: any) => {
            if (res.status === 1) {
              if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                Object.assign(image, { coverBase64: res.data });
              } else {
                Object.assign(image, { coverBase64: null });
              }
            }
            console.log('>>>> ', this.dataMainPage.emergencyPin.contents)
          }).catch((err: any) => {
            if (err.error.status === 0) {
              if (err.error.message === 'Unable got Asset') {
                Object.assign(image, { coverBase64: '' });
              }
            }
          });
        }
      }

      for (let image of this.dataMainPage.viewSection.contents) {
        if (image.coverPageUrl && image.coverPageUrl !== null && image.coverPageUrl !== "" && image.coverPageUrl !== undefined) {
          this.assetFacade.getPathFile(image.coverPageUrl).then((res: any) => {
            if (res.status === 1) {
              if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                Object.assign(image, { imageBase64: res.data });
              } else {
                Object.assign(image, { imageBase64: null });
              }
            }
          }).catch((err: any) => {
            if (err.error.status === 0) {
              if (err.error.message === 'Unable got Asset') {
                Object.assign(image, { imageBase64: '' });
              }
            }
          });
        }
        if (image && image.owner.imageURL && image.owner.imageURL !== null && image.owner.imageURL !== "" && image.owner.imageURL !== undefined) {
          this.assetFacade.getPathFile(image.owner.imageURL).then((res: any) => {
            if (res.status === 1) {
              if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                Object.assign(image.owner, { imageBase64: res.data });
              } else {
                Object.assign(image.owner, { imageBase64: null });
              }
            }
          }).catch((err: any) => {
            if (err.error.status === 0) {
              if (err.error.message === 'Unable got Asset') {
                Object.assign(image.owner, { imageBase64: '' });
              }
            }
          });
        }
      }
      for (let mode of this.dataMainPage.sectionModels) {
        if (mode.templateType === 'TWIN') {
          for (let dataTwin of mode.contents) {
            for (let card of dataTwin.contents) {
              if (card && card.coverPageUrl && card.coverPageUrl !== null && card.coverPageUrl !== "" && card.coverPageUrl !== undefined) {
                this.assetFacade.getPathFile(card.coverPageUrl).then((res: any) => {
                  if (res.status === 1) {
                    if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                      Object.assign(card, { imageBase64: res.data });
                    } else {
                      Object.assign(card, { imageBase64: null });
                    }
                  }
                }).catch((err: any) => {
                  if (err.error.status === 0) {
                    if (err.error.message === 'Unable got Asset') {
                      Object.assign(card, { imageBase64: '' });
                    }
                  }
                });
              }
              if (card && card.owner.imageURL && card.owner.imageURL !== null && card.owner.imageURL !== "" && card.owner.imageURL !== undefined) {
                this.assetFacade.getPathFile(card.owner.imageURL).then((res: any) => {
                  if (res.status === 1) {
                    if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                      Object.assign(card.owner, { imageBase64: res.data });
                    } else {
                      Object.assign(card.owner, { imageBase64: null });
                    }
                  }
                }).catch((err: any) => {
                  if (err.error.status === 0) {
                    if (err.error.message === 'Unable got Asset') {
                      Object.assign(card.owner, { imageBase64: '' });
                    }
                  }
                });
              }
            }
          }
        }
        if (mode.templateType === 'MULTIPLE') {
          console.log('mode ', mode)
          for (let dataMultiple of mode.contents) {
            if (dataMultiple && dataMultiple.coverPageUrl && dataMultiple.coverPageUrl !== null && dataMultiple.coverPageUrl !== "" && dataMultiple.coverPageUrl !== undefined) {
              this.assetFacade.getPathFile(dataMultiple.coverPageUrl).then((res: any) => {
                if (res.status === 1) {
                  if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                    Object.assign(dataMultiple, { imageBase64: res.data });
                  } else {
                    Object.assign(dataMultiple, { imageBase64: null });
                  }
                }
              }).catch((err: any) => {
                if (err.error.status === 0) {
                  if (err.error.message === 'Unable got Asset') {
                    Object.assign(dataMultiple, { imageBase64: '' });
                  }
                }
              });
            }
            if (dataMultiple && dataMultiple.owner.imageURL && dataMultiple.owner.imageURL !== null && dataMultiple.owner.imageURL !== "" && dataMultiple.owner.imageURL !== undefined) {
              this.assetFacade.getPathFile(dataMultiple.owner.imageURL).then((res: any) => {
                if (res.status === 1) {
                  if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                    Object.assign(dataMultiple.owner, { imageBase64: res.data });
                  } else {
                    Object.assign(dataMultiple.owner, { imageBase64: null });
                  }
                }
              }).catch((err: any) => {
                if (err.error.status === 0) {
                  if (err.error.message === 'Unable got Asset') {
                    Object.assign(dataMultiple.owner, { imageBase64: '' });
                  }
                }
              });
            }
          }
        }
        if (mode.templateType === 'ICON') {
          for (let dataIcon of mode.contents) {
            if (dataIcon && dataIcon.iconUrl && dataIcon.iconUrl !== null && dataIcon.iconUrl !== "" && dataIcon.iconUrl !== undefined) {
              this.assetFacade.getPathFile(dataIcon.iconUrl).then((res: any) => {
                if (res.status === 1) {
                  if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                    Object.assign(dataIcon, { iconBase64: res.data });
                  } else {
                    Object.assign(dataIcon, { iconBase64: null });
                  }
                }
              }).catch((err: any) => {
                if (err.error.status === 0) {
                  if (err.error.message === 'Unable got Asset') {
                    Object.assign(dataIcon, { iconBase64: '' });
                  }
                }
              });
            }
            if (dataIcon && dataIcon.owner.imageURL && dataIcon.owner.imageURL !== null && dataIcon.owner.imageURL !== "" && dataIcon.owner.imageURL !== undefined) {
              this.assetFacade.getPathFile(dataIcon.owner.imageURL).then((res: any) => {
                if (res.status === 1) {
                  if (ValidBase64ImageUtil.validBase64Image(res.data)) {
                    Object.assign(dataIcon.owner, { imageBase64: res.data });
                  } else {
                    Object.assign(dataIcon.owner, { imageBase64: null });
                  }
                }
              }).catch((err: any) => {
                if (err.error.status === 0) {
                  if (err.error.message === 'Unable got Asset') {
                    Object.assign(dataIcon.owner, { imageBase64: '' });
                  }
                }
              });
            }
          }
        }
        // // mutiple status bar 
        // if (mode && mode.iconUrl && mode.iconUrl !== null && mode.iconUrl !== "" && mode.iconUrl !== undefined) {
        //   this.assetFacade.getPathFile(mode.iconUrl).then((res: any) => {
        //     if (res.status === 1) {
        //       if (ValidBase64ImageUtil.validBase64Image(res.data)) {
        //         Object.assign(mode, { iconBase64: res.data });
        //       } else {
        //         Object.assign(mode, { iconBase64: null });
        //       }
        //     }
        //   }).catch((err: any) => {
        //     if (err.error.status === 0) {
        //       if (err.error.message === 'Unable got Asset') {
        //         Object.assign(mode, { imageBase64: '' });
        //       }
        //     }
        //   });
        // }
        // for (let dataPost of mode.contents) {
        //   //mutiple posts
        //   if (dataPost && dataPost.coverPageUrl && dataPost.coverPageUrl !== null && dataPost.coverPageUrl !== "" && dataPost.coverPageUrl !== undefined) {
        //     this.assetFacade.getPathFile(dataPost.coverPageUrl).then((res: any) => {
        //       if (res.status === 1) {
        //         if (ValidBase64ImageUtil.validBase64Image(res.data)) {
        //           Object.assign(dataPost, { imageBase64: res.data });
        //         } else {
        //           Object.assign(dataPost, { imageBase64: null });
        //         }
        //       }
        //     }).catch((err: any) => {
        //       if (err.error.status === 0) {
        //         if (err.error.message === 'Unable got Asset') {
        //           Object.assign(dataPost, { imageBase64: '' });
        //         }
        //       }
        //     });
        //     //icon user 
        //   } else if (dataPost && dataPost.iconUrl && dataPost.iconUrl !== null && dataPost.iconUrl !== '' && dataPost.iconUrl !== undefined) {
        //     this.assetFacade.getPathFile(dataPost.iconUrl).then((res: any) => {
        //       if (res.status === 1) {
        //         if (ValidBase64ImageUtil.validBase64Image(res.data)) {
        //           Object.assign(dataPost, { iconBase64: res.data });
        //         } else {
        //           Object.assign(dataPost, { iconBase64: null });
        //         }
        //       }
        //     }).catch((err: any) => {
        //       if (err.error.status === 0) {
        //         if (err.error.message === 'Unable got Asset') {
        //           Object.assign(dataPost, { iconBase64: '' });
        //         }
        //       }
        //     });
        //     console.log('dataPost ',dataPost)
        //     if (dataPost && dataPost.contents && dataPost.contents !== undefined) {
        //       for (let image of dataPost.contents) {
        //         if (image.coverPageUrl && image.coverPageUrl !== null && image.coverPageUrl !== "" && image.coverPageUrl !== undefined) {
        //           this.assetFacade.getPathFile(image.coverPageUrl).then((res: any) => {
        //             if (res.status === 1) {
        //               if (ValidBase64ImageUtil.validBase64Image(res.data)) {
        //                 Object.assign(image, { imageBase64: res.data });
        //               } else {
        //                 Object.assign(image, { imageBase64: null });
        //               }
        //             }
        //           }).catch((err: any) => {
        //             if (err.error.status === 0) {
        //               if (err.error.message === 'Unable got Asset') {
        //                 Object.assign(image, { imageBase64: '' });
        //               }
        //             }
        //           });
        //         }
        //         console.log('image ',image)
        //         if (image.owner && image.owner.imageURL !== null && image.owner.imageURL !== "" && image.owner.imageURL !== undefined) {
        //           console.log('owner ',image.owner.imageURL)
        //           this.assetFacade.getPathFile(image.owner.imageURL).then((res: any) => {
        //             if (res.status === 1) {
        //               if (ValidBase64ImageUtil.validBase64Image(res.data)) {
        //                 Object.assign(image.owner, { imageBase64: res.data });
        //               } else {
        //                 Object.assign(image.owner, { imageBase64: null });
        //               }
        //             }
        //           }).catch((err: any) => {
        //             if (err.error.status === 0) {
        //               if (err.error.message === 'Unable got Asset') {
        //                 Object.assign(image.owner, { imageBase64: '' });
        //               }
        //             }
        //           });
        //         }
        // }
        // }
        // }
        // }
      }
      this.isLoading = false;
      this.setCardSilder();

    }).catch((err) => {
      this.isLoading = false;
      console.log(err);
    })
  }

  private getDataIcon(imageURL: any, myType?: string, index?: number): void {
    if (myType === "cover") {
      Object.assign(this.dataMainPage, { isLoadingCover: true });
    } else if (myType === "image") {
      Object.assign(this.dataMainPage, { isLoadingImage: true });
    }
    this.assetFacade.getPathFile(imageURL).then((res: any) => {
      if (res.status === 1) {
        if (myType === "image") {
          this.dataMainPage.isLoadingImage = false;
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            Object.assign(this.dataMainPage, { imageBase64: res.data });
          } else {
            Object.assign(this.dataMainPage, { imageBase64: null });
          }
        } else if (myType === "cover") {
          this.dataMainPage.emergencyEvents.contents[index].isLoadingCover = false;
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            console.log('sss', this.dataMainPage.emergencyEvents.contents[index])
            Object.assign(this.dataMainPage.emergencyEvents.contents[index], { coverBase64: res.data });
          } else {
            Object.assign(this.dataMainPage.emergencyEvents.contents[index], { coverBase64: '' });
          }
        }
      }
    }).catch((err: any) => {
      if (err.error.status === 0) {
        if (err.error.message === 'Unable got Asset') {
          if (myType === "image") {
            this.dataMainPage.isLoadingImage = false;
            Object.assign(this.dataMainPage, { imageBase64: '' });
          } else {
            this.dataMainPage.isLoadingCover = false;
            Object.assign(this.dataMainPage, { coverBase64: '', isLoaded: true });
          }
        }
      }
    });
  }

  public extractVideoID(url: string) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length == 11) {
      return match[7];
    } else {
      return "Could not extract video ID.";
    }
  }

  /**
   * isStopSwiper
   */
  public isStopSwiper(isStop: boolean) {
    if (isStop) {
      // this.config2.autoplay = false;
    } else {
      // this.config2.autoplay = { delay: 8000, stopOnLastSlide: false, reverseDirection: false, disableOnInteraction: false }
    }
  }
  public isShow(index): boolean {
    let page = this.paginator.pageIndex;
    let itemStart = ((page + 1) * this.pageSize) - this.pageSize;
    let itemEnd = ((page + 1) * this.pageSize) - 1;
    if (itemStart <= index && itemEnd >= index) {
      return true;
    }
    return false
  }

  onMouseEnter(event: MouseEvent, outerDiv: HTMLElement) {
    const bounds = outerDiv.getBoundingClientRect();
    this.ganX = (event.clientX - bounds.left + 'px');
    this.ganY = (event.clientY - bounds.top + 'px');
  }


  public actionComment(action: any, index: number, card: string) {

    if (action.mod === 'REBOON') {
      this.showAlertDialog()
      // var aw = await this.pageFacade.search(search).then((pages: any) => {
      //   pageInUser = pages
      // }).catch((err: any) => {
      // })
      // for (let p of pageInUser) {
      //   var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
      //     p.img64 = res.data
      //   }).catch((err: any) => {
      //   });
      // }
      // const dialogRef = this.dialog.open(DialogReboonTopic, {
      //   width: '650pt',
      //   data: { options: { post: action.post, page: pageInUser } }
      // });

      // dialogRef.afterClosed().subscribe(result => {
      //   if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
      //     data.pageId = null
      //   } else {
      //     data.pageId = result.pageId
      //   }
      //   data.detail = result.text
      //   data.hashTag = result.hashTag
      //   this.postFacade.rePost(action.postData, data).then((res: any) => {
      //   }).catch((err: any) => {
      //     console.log(err)
      //   })
      // });
    } else if (action.mod === 'LIKE') {
      this.postLike(action.postId, index, card);
    } else if (action.mod === 'SHARE') {
      this.showAlertDialog()
    } else if (action.mod === 'COMMENT') {
      this.showAlertDialog()
    } else if (action.mod === 'POST') {
      this.showAlertDialog()
    }
  }

  public postLike(postId, index, cardType?) {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/home");
    } else {
      this.postFacade.like(postId).then((res: any) => {
        if (cardType === 'NEWCARDS') {
          this.dataMainPage.looking.contents[index].likeCount = res.likeCount;
          this.dataMainPage.looking.contents[index].isLike = res.isLike;
        } else if (cardType === 'NEWCARD') {
          this.dataMainPage.lastest.contents[0].likeCount = res.likeCount;
          this.dataMainPage.lastest.contents[0].isLike = res.isLike;
        } else if (cardType === 'POSTCARD') {
          this.dataMainPage.viewSection.contents[index].likeCount = res.likeCount;
          this.dataMainPage.viewSection.contents[index].isLike = res.isLike;
        } else if (cardType === 'POSTCARD2') {
          this.dataMainPage.sectionModels[0].contents[index].likeCount = res.likeCount;
          this.dataMainPage.sectionModels[0].contents[index].isLike = res.isLike;
        } else if (cardType === 'POSTCARD3') {
          this.dataMainPage.sectionModels[1].contents[index].likeCount = res.likeCount;
          this.dataMainPage.sectionModels[1].contents[index].isLike = res.isLike;
        }
      }).catch((err: any) => {
        console.log(err)
      });
    }
  }


  public showAlertDialog(): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: "ระบบอยู่ในระหว่างการพัฒนา",
        bottomText2: "ตกลง",
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
    });
  }

  // public checkMobile() {
  //   if (window.innerWidth > 768) {
  //     this.displayShow = false;
  //   } else {
  //     this.displayShow = true;
  //   }
  // }
}
