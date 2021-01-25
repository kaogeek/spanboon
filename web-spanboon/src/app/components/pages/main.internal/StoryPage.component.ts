/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { ObjectiveFacade, NeedsFacade, AssetFacade, AuthenManager, ObservableManager, PageFacade, PostCommentFacade, PostFacade } from '../../../services/services';
import { MatDialog } from '@angular/material';
import { SwiperConfigInterface, SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { AbstractPage } from '../AbstractPage';
import { FileHandle } from '../../shares/directive/directives';
import * as $ from 'jquery';
import { Asset } from '../../../models/Asset';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CacheConfigInfo } from '../../../services/CacheConfigInfo.service';
import { BoxPost, DialogMedia, DialogAlert, DialogReboonTopic } from '../../shares/shares';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { SearchFilter } from 'src/app/models/SearchFilter';
import { environment } from '../../../../environments/environment';
import { CommentPosts } from 'src/app/models/CommentPosts';

const PAGE_NAME: string = 'story';
const URL_PATH: string = '/story/';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

declare var $: any;
@Component({
  selector: 'spanboon-story-page',
  templateUrl: './StoryPage.component.html',
})
export class StoryPage extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @Input()
  protected isIconPage: boolean;
  @Input()
  protected text: string = "ข้อความ";

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: 'ทั่วไป', keyword: 'general' }, { label: 'กำลังมองหา', keyword: 'needs' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild('pagefixHeight', { static: false }) pagefixHeight: ElementRef;
  @ViewChild('sidefeedHeight', { static: false }) sidefeedHeight: ElementRef;

  protected observManager: ObservableManager;
  protected assetFacade: AssetFacade;
  protected pageFacade: PageFacade;
  protected postCommentFacade: PostCommentFacade;
  protected postFacade: PostFacade;
  private routeActivated: ActivatedRoute;

  public imageURL: "/file/5f8e68d3a554f760422bc339";
  public pageId: string;
  public resDataPage: any;
  public imageCover: any
  public postStoryData: any;
  public htmlYouWantToAdd: any;
  public commentpost: any[] = [];
  public textComment: any;
  public userImage: any;
  public dataTypeM: any = { type: '' };
  public position: any
  public dataNeeds: any;
  public test: any;
  public pageUser: any
  public userCloneDatas: any
  public url: any
  public user: any
  public asPage: any
  public recommendedStory: any
  public recommendedStoryHashtag: any
  public loding: boolean;
  public isComment: boolean
  public isPreload: boolean = true;
  public isSearchHashTag: boolean
  public apiBaseURL = environment.apiBaseURL;
  public h: number
  public commentCount: number;
  public repostCount: number;
  public likeCount: number;
  public shareCount: number;


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
  public configSlider: SwiperConfigInterface = {
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
      768: {
        slidesPerView: 1,
        spaceBetween: 5,
      },
      1024: {
        slidesPerView: 2,
      },
      1400: {
        slidesPerView: 3,
      },
      1600: {
        slidesPerView: 4,
        spaceBetween: 10,
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
      768: {
        slidesPerView: 1,
        spaceBetween: 5,
      },
      1024: {
        slidesPerView: 2,
      },
      1400: {
        slidesPerView: 3,
      },
      1600: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
    },
  }

  @ViewChild(SwiperComponent, { static: false }) componentRef: SwiperComponent;
  @ViewChild(SwiperDirective, { static: false }) directiveRef: SwiperDirective;
  @ViewChild("swiperVote", { static: false }) swiperVote: ElementRef;

  @Output()
  public action: EventEmitter<any> = new EventEmitter();

  mySubscription: any;
  files: FileHandle[] = [];

  constructor(router: Router, postCommentFacade: PostCommentFacade, postFacade: PostFacade, dialog: MatDialog, authenManager: AuthenManager, pageFacade: PageFacade, cacheConfigInfo: CacheConfigInfo, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute) {
    super(PAGE_NAME, authenManager, dialog, router);
    // this.dialog = dialog
    this.observManager = observManager;
    this.assetFacade = assetFacade;
    this.pageFacade = pageFacade;
    this.routeActivated = routeActivated;
    this.postCommentFacade = postCommentFacade;
    this.postFacade = postFacade;
    this.isComment = false
    this.isSearchHashTag = false
    // this.loding = true
    this.position = "50% 80%"
    this.h = 80
    this.test = [1, 2, 3]
    this.dataNeeds = [
      {
        "id": "วัตถุดิบ(ปลาหมึก)",
        "createdDate": "2020-10-22T04:19:24.469Z",
        "customItemId": "5f91084ca23f15136bd56350",
        "pageId": "5f8e6b11a554f760422bc347",
        "name": "วัตถุดิบ(ปลาหมึก)",
        "active": true,
        "quantity": 10,
        "unit": "กิโล",
        "post": "5f91084ca23f15136bd5634c"
      },
      {
        "id": "5f4349d1669c480f8bb67f20",
        "createdDate": "2020-10-25T16:36:51.480Z",
        "standardItemId": "5f4349d1669c480f8bb67f20",
        "pageId": "5f8e6b11a554f760422bc347",
        "name": "ข้าวสาร",
        "active": true,
        "fullfilled": false,
        "quantity": 5,
        "unit": "กิโลกรัม",
        "post": "5f95a9a3b5184e606cec452e",
        "fulfillQuantity": 0,
        "pendingQuantity": 0
      },
      {
        "id": "5f4349e8669c480f8bb67f23",
        "createdDate": "2020-10-22T04:19:24.471Z",
        "standardItemId": "5f4349e8669c480f8bb67f23",
        "pageId": "5f8e6b11a554f760422bc347",
        "name": "ปลากระป๋อง",
        "active": true,
        "quantity": 4,
        "unit": "กระป๋อง",
        "post": "5f91084ca23f15136bd5634c"
      },
      {
        "id": "อาหารแห้ง",
        "createdDate": "2020-10-22T04:19:24.465Z",
        "customItemId": "5f91084ca23f15136bd5634e",
        "pageId": "5f8e6b11a554f760422bc347",
        "name": "อาหารแห้ง",
        "active": true,
        "quantity": 4,
        "unit": "ชุด",
        "post": "5f91084ca23f15136bd5634c"
      }
    ]

    // let users = this.authenManager.getCurrentUser()

    this.routeActivated.params.subscribe((params) => {
      this.url = params['postId']
    })
    // var dataPageObj = JSON.parse(sessionStorage.dataPage);

    // this.pageId = dataPageObj.pageId
    let imgGallery: any[]
    let search: SearchFilter = new SearchFilter();
    search.limit = 5;
    search.count = false;
    search.whereConditions = { _id: this.url };
    this.postFacade.searchPostStory(search).then((res: any) => {
      this.postStoryData = res[0]
      this.assetFacade.getPathFile(this.postStoryData.coverImage).then((res: any) => {
        this.imageCover = res.data
      }).catch((err: any) => {
      });
      document.getElementById("storyBody").innerHTML = this.postStoryData.story.story
      document.querySelectorAll('contenteditable').forEach(function (element) {
        element.removeAttribute("contenteditable");
      });
      this.getComment();
      this.htmlYouWantToAdd = this.postStoryData.story.storyPost;
      if (typeof this.postStoryData.gallery !== 'undefined' && this.postStoryData.gallery.length > 0) {
        this.assetFacade.getPathFile(this.postStoryData.gallery[0].imageURL).then((res: any) => {
          this.postStoryData.coverImage = res.data
          for (let img of this.postStoryData.gallery) {
            this.assetFacade.getPathFile(img.imageURL).then((res: any) => {
              imgGallery.push(res)
            }).catch((err: any) => {
            });
          }
          this.postStoryData.gallery = imgGallery
        }).catch((err: any) => {
        });
      }
      setTimeout(() => {
        this.loding = false
        this.getRecommendedStory();
        this.getRecommendedHashtag();
        this.setCardSilder()
      }, 1500);
      setTimeout(() => {
        this.isPreload = false
      }, 500);

    }).catch((err: any) => {

      console.log(err)
    })
    this.user = this.authenManager.getCurrentUser();
    if (this.user !== undefined && this.user !== null) {
      this.getProfileImage(this.user);
      this.searchPageInUser(this.user.id)
    }
    this.userCloneDatas = JSON.parse(JSON.stringify(this.user));
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
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

    this.configSlider = {
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
        768: {
          slidesPerView: 1,
          spaceBetween: 5,
        },
        1024: {
          slidesPerView: 2,
        },
        1400: {
          slidesPerView: 3,
        },
        1600: {
          slidesPerView: 4,
          spaceBetween: 10,
        },
      },
    }

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

  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
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

  public menuProfile() { }

  public commentAction(data: any) {
    if (data.action === "LIKE") {
      if (this.user.id !== undefined && this.user.id !== null) {
        this.postCommentFacade.like(this.postStoryData._id, data.commentdata, this.user.id).then((res: any) => {
          this.commentpost[data.index].likeCount = res.likeCount
          this.commentpost[data.index].isLike = res.isLike
        }).catch((err: any) => {
        })
      } else {
        this.postCommentFacade.like(this.postStoryData._id, data.commentdata).then((res: any) => {
          this.commentpost[data.index].likeCount = res.likeCount
          this.commentpost[data.index].isLike = res.isLike
        }).catch((err: any) => {
        })
      }
    } else if (data.action === "DELETE") {
      let dialog = this.dialog.open(DialogAlert, {
        disableClose: true,
        data: {
          text: "ต้องการลบความคิดเห็น ?",
          bottomText2: "ตกลง",
          bottomColorText2: "black",
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.postCommentFacade.delete(this.postStoryData._id, data.commentdata).then((res: any) => {
            this.commentpost.splice(data.index, 1);
          }).catch((err: any) => {
          })
        }
      });
    } else if (data.action === "EDIT") {
      let cloneComment = JSON.parse(JSON.stringify(this.commentpost));
      if (data.commentEdit !== cloneComment[data.index].comment) {
        this.postCommentFacade.edit(this.postStoryData._id, data.commentdata, data.commentEdit).then((res: any) => {
          this.commentpost[data.index].comment = res.comment
          this.commentpost[data.index].isEdit = false;
        }).catch((err: any) => {
        })
      } else {
        this.commentpost[data.index].isEdit = true;
      }
      // let dialog = this.dialog.open(DialogAlert, {
      //   disableClose: true,
      //   data: {
      //     text: "ระบบอยู่ในระหว่างการพัฒนา",
      //     bottomText2: "ตกลง",
      //     bottomColorText2: "black",
      //     btDisplay1: "none"
      //   }
      // });
      // dialog.afterClosed().subscribe((res) => {
      // });
    } else if (data.action === 'CANCEL') {
      this.commentpost[data.index].isEdit = false;
    }
  }

  public getRecommendedStory() {
    this.postFacade.recommendedStory(this.postStoryData._id).then((res: any) => {
      this.recommendedStory = res.data
      for (let c of this.recommendedStory.contents) {
        c.coverPageUrl = "/file/5f95a82db5184e606cec4517"
      }
    }).catch((err: any) => {
    })
  }

  public getRecommendedHashtag() {
    this.postFacade.recommendedHashtag(this.postStoryData._id).then((res: any) => {
      this.recommendedStoryHashtag = res.data
    }).catch((err: any) => {
    })
  }

  private getComment(limit?) {
    let search: SearchFilter = new SearchFilter();
    if (limit) {
      search.limit = 0
    } else {
      search.limit = 0
    }
    this.postCommentFacade.search(search, this.postStoryData._id).then((res: any) => {
      for (let c of res) {
        c.isEdit = false
      }
      let arr: any[] = []
      if (res != null && res != undefined) {
        arr = res
        for (let comment of arr) {
          if (comment.commentAsPage !== undefined && comment.commentAsPage !== null) {
            search.limit = 0
            this.pageFacade.search(search).then((page: any) => {
              let index = page.map(function (e) { return e.id; }).indexOf(comment.commentAsPage);
              comment.user.displayName = page[index].name
              this.assetFacade.getPathFile(page[index].imageURL).then((res: any) => {
                comment.user.imageURL = res.data
              }).catch((err: any) => {
              });
            }).catch((err: any) => {
              this.assetFacade.getPathFile(comment.user.imageURL).then((res: any) => {
                comment.user.imageURL = res.data
              }).catch((err: any) => {
              });
            });
          } else if (comment.user.imageURL != null && comment.user.imageURL != undefined) {
            this.assetFacade.getPathFile(comment.user.imageURL).then((res: any) => {
              comment.user.imageURL = res.data
            }).catch((err: any) => {
            });
          }
        }
        this.commentpost = arr
      }
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
    });
  }

  public getProfileImage(data: any) {
    if (data !== undefined && data !== null && data.imageURL && data.imageURL !== '') {
      this.assetFacade.getPathFile(data.imageURL).then((res: any) => {
        if (res.status === 1) {
          this.userImage = data
          if (ValidBase64ImageUtil.validBase64Image(res.data)) {
            this.userImage.imageURL = res.data
          } else {
            this.userImage.imageURL = null
          }

        }
      }).catch((err: any) => {
        console.log(err)
        if (err.error.message === "Unable got Asset") {
          data.imageURL = ''
          this.userImage = data;
        }
      })
    } else {
      this.userImage = data;
    }
  }

  public onClickComment(data: any) {
    let commentPosts = new CommentPosts
    if (this.userCloneDatas.ownerUser !== undefined && this.userCloneDatas.ownerUser !== null) {
      commentPosts.commentAsPage = this.userCloneDatas.id
    }
    commentPosts.comment = this.textComment
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, this.postStoryData._id).then((res: any) => {
      this.getComment();
      this.textComment = '';
    }).catch((err: any) => {
    })
  }

  public parallax(event) {
    if (event === 'DOWE') {
      this.h--
    } else if (event === 'UP') {
      this.h++
    }
    this.position = ("50%" + this.h + "%")
  }

  public ngOnInit(): void {
    let scroll = 0
    this.observManager.subscribe('scroll', (scrolls) => {
      if (scrolls > scroll) {
        this.parallax('DOWE');
      } else if (scrolls < scroll) {
        this.parallax('UP');
      }
      scroll = scrolls
    });
  }

  private isLoginUser() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
      return
    }
  }

  public postLike() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/page/" + this.resDataPage.id);
    } else {
      this.postFacade.like(this.postStoryData._id, this.asPage).then((res: any) => {
        this.postStoryData.isLike = res.isLike
        this.postStoryData.likeCount = res.likeCount
      }).catch((err: any) => {
        console.log(err)
      });
    }
  }

  public async postAction(action: any) {
    let userAsPage: any
    let pageInUser: any[]
    let search: SearchFilter = new SearchFilter();
    search.limit = 10;
    search.count = false;
    search.whereConditions = { ownerUser: this.userCloneDatas.id };
    this.isLoginUser();
    if (action.mod === 'COMMENT') {
    } else if (action.mod === 'LIKE') {
      this.postLike();
      // this.action.emit({ mod: action.mod, postData: this.postStoryData, userAsPage: this.user });
    } else if (action.mod === 'REBOON') {
      this.isLoginUser();
      if (this.user.id !== undefined && this.user.id !== null) {
        userAsPage = this.user.id
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
          data: { options: { post: action.post, page: pageInUser, userAsPage: userAsPage, pageUserAsPage: this.user } }
        });

        // dialogRef.afterClosed().subscribe(result => {
        //   if (!result) {
        //     return
        //   }
        //   if (result.isConfirm) {
        //     if (result.pageId === 'แชร์เข้าไทมไลน์ของฉัน') {
        //       data.pageId = null
        //       if (result.text === "") {
        //         if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
        //           dataPost = action.post.referencePost._id
        //         } else {
        //           dataPost = action.post._id
        //         }
        //       } else {
        //         dataPost = action.post._id
        //       }
        //     } else {
        //       data.pageId = result.pageId
        //       if (result.text === "") {
        //         if (action.post.referencePost !== undefined && action.post.referencePost !== null) {
        //           dataPost = action.post.referencePost._id
        //         } else {
        //           dataPost = action.post._id
        //         }
        //       } else {
        //         dataPost = action.post._id
        //       }
        //     }
        //     data.detail = result.text
        //     if (action.userAsPage.id !== undefined && action.userAsPage.id !== null) {
        //       data.postAsPage = action.userAsPage.id
        //     }
        //     if (result.hashTag !== undefined && result.hashTag !== null) {
        //       data.hashTag = result.hashTag
        //     }
        //     this.postFacade.rePost(dataPost, data).then((res: any) => {
        //       this.resPost.posts[index].repostCount++
        //     }).catch((err: any) => {
        //       console.log(err)
        //     })
        //   }
        // });
      } else if (action.type === "NOTOPIC") {
        // data.pageId = null
        // dataPost = action.post._id
        // this.postFacade.rePost(dataPost, data).then((res: any) => {
        //   this.resPost.posts[index].repostCount++
        //   this.resPost.posts[index].isRepost = true
        // }).catch((err: any) => {
        //   console.log(err)
        // })
      } else if (action.type === "UNDOTOPIC") {
        this.postFacade.undoPost(action.post._id).then((res: any) => {
        }).catch((err: any) => {
        })
      }
      // this.action.emit({ mod: action.mod, postData: this.postStoryData._id, type: action.type, post: this.postStoryData, userAsPage: this.user });
    } else if (action.mod === 'SHARE') {
      this.action.emit({ mod: action.mod });
    }
  }

  public pageAction(action: any) {
    let comments: any[] = []
    this.userCloneDatas = action
    if (action.ownerUser !== undefined && action.ownerUser !== null) {
      this.asPage = action.id
    } else {
      this.asPage = undefined
    }
    // if (this.commentpost.length !== 0) {
    //   for (let c of this.commentpost) {
    //     comments.push(c.id)
    //   }
    // }
    this.postFacade.getAaaPost(this.postStoryData._id, this.asPage).then((pages: any) => {
      this.postStoryData.isComment = pages.isComment
      this.postStoryData.isLike = pages.isLike
      this.postStoryData.isRepost = pages.isRepost
      this.postStoryData.isShare = pages.isShare
    }).catch((err: any) => {
    })
  }

}




