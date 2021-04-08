/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Renderer2, EventEmitter, Output } from '@angular/core';
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
import { MESSAGE } from '../../../../custom/variable';
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

  public links = [{ label: 'ไทมไลน์', keyword: 'timeline' }, { label: this.PLATFORM_GENERAL_TEXT, keyword: 'general' }, { label: 'กำลัง' + this.PLATFORM_NEEDS_TEXT, keyword: 'needs' }];
  public activeLink = this.links[0].label;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;
  @ViewChild('pagefixHeight', { static: false }) pagefixHeight: ElementRef;
  @ViewChild('sidefeedHeight', { static: false }) sidefeedHeight: ElementRef;

  protected observManager: ObservableManager;
  protected assetFacade: AssetFacade;
  protected myElement: ElementRef;
  protected pageFacade: PageFacade;
  protected postCommentFacade: PostCommentFacade;
  protected postFacade: PostFacade;
  private routeActivated: ActivatedRoute;
  private mainPostLink: string = window.location.origin + '/post/'
  private mainPageLink: string = window.location.origin + '/page/'

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
  public type: string;
  public pageUser: any
  public userCloneDatas: any;
  public url: any;
  public user: any;
  public asPage: any;
  public recommendedStory: any = [];
  public recommendedStorys: any = [];
  public recommendedStoryHashtag: any;

  public story: any;
  public title: any;

  public emergencyEventTag: any
  public objectiveTag: any
  public createdDate: any
  public ownerUser: any
  public userId: any

  public linkPage: any

  public loding: boolean;
  public isStoryData: boolean;
  public isPreload: boolean = true;
  public isLoding: boolean = true;
  public isPendingFulfill: boolean = false;
  public isSearchHashTag: boolean
  public apiBaseURL = environment.apiBaseURL;
  public h: number

  public needs: any = [];

  public isComment: boolean;
  public isRepost: boolean;
  public isLike: boolean;
  public isShare: boolean;
  public commentCount: number;
  public repostCount: number;
  public likeCount: number;
  public shareCount: number;

  public pageName: string;


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

  constructor(router: Router, postCommentFacade: PostCommentFacade, private renderer: Renderer2, postFacade: PostFacade, dialog: MatDialog, myElement: ElementRef, authenManager: AuthenManager, pageFacade: PageFacade, cacheConfigInfo: CacheConfigInfo, objectiveFacade: ObjectiveFacade, needsFacade: NeedsFacade, assetFacade: AssetFacade,
    observManager: ObservableManager, routeActivated: ActivatedRoute) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.observManager = observManager;
    this.assetFacade = assetFacade;
    this.pageFacade = pageFacade;
    this.routeActivated = routeActivated;
    this.postCommentFacade = postCommentFacade;
    this.postFacade = postFacade;
    this.isSearchHashTag = false
    this.isLoding = true;
    this.position = "50% 80%"
    this.h = 80
    this.dataNeeds = []


    this.routeActivated.params.subscribe((params) => {
      this.url = params['postId']
    })
    let imgGallery: any[]
    let search: SearchFilter = new SearchFilter();
    search.limit = 5;
    search.count = false;
    search.whereConditions = { _id: this.url };
    this.postFacade.searchPostStory(search).then((res: any) => {
      this.postStoryData = res[0]
      this.type = this.postStoryData.type
      this.objectiveTag = this.postStoryData.objectiveTag
      this.emergencyEventTag = this.postStoryData.emergencyEventTag
      this.createdDate = this.postStoryData.createdDate;
      this.ownerUser = this.postStoryData.ownerUser;
      if (this.postStoryData.pageId !== null && this.postStoryData.pageId !== undefined) {
        this.pageFacade.getProfilePage(this.postStoryData.pageId).then((page: any) => {
          this.postStoryData.pageData = page
        }).catch((err: any) => {
        });

        console.log('this.postStoryData >>> ', this.postStoryData.pageId);

        this.pageFacade.getProfilePage(this.postStoryData.pageId).then((page: any) => {
          console.log(page)
          if (page.data.uniqueId !== undefined && page.data.uniqueId !== null) {
            this.linkPage = (this.mainPageLink + page.data.uniqueId)
          } else if (page.data.id !== undefined && page.data.id !== null) {
            this.linkPage = (this.mainPageLink + page.data.id)
          }
        }).catch((err: any) => {
        });
      }
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
      this.loding = false
      this.getRecommendedStory();
      this.getRecommendedStorys();
      this.getRecommendedHashtag();
      this.setCardSilder();
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
      this.userCloneDatas = JSON.parse(JSON.stringify(this.user));
      this.userId = this.userCloneDatas.id
    }

    setTimeout(() => {
      this.pageName = this.postStoryData.pageData.data.name;
      this.story = this.postStoryData.story;
      this.title = this.postStoryData.title;

      this.isComment = this.postStoryData.isComment;
      this.isRepost = this.postStoryData.isRepost;
      this.isLike = this.postStoryData.isLike;
      this.isShare = this.postStoryData.isShare;
      this.commentCount = this.postStoryData.commentCount;
      this.repostCount = this.postStoryData.repostCount;
      this.likeCount = this.postStoryData.likeCount;
      this.shareCount = this.postStoryData.shareCount;
      this.needs = this.postStoryData.needs;
      this.isLoding = false;

    }, 3500);

  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public scrollFulfill() {
    try {
      const errorField = this.renderer.selectRootElement('.needs-display');
      errorField.scrollIntoTop();
    } catch (err) {
    }
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
  }

  public isLogin(): boolean {
    this.user = this.authenManager.getCurrentUser();
    return this.user !== undefined && this.user !== null;
  }

  isPageDirty(): boolean {
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    return;
  }

  public menuProfile() { }

  public checkAccessCustom(): boolean {
    return this.userCloneDatas.id === this.postStoryData.id;
  }

  public commentAction(data: any) {
    if (!this.isLogin()) {
      return this.showAlertLoginDialog("/story/" + this.postStoryData._id);
    }

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
          text: MESSAGE.TEXT_TITLE_DELETE_COMMENT_CONFIRM,
          bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
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
    } else if (data.action === 'CANCEL') {
      this.commentpost[data.index].isEdit = false;
    }
  }


  public getRecommendedHashtag() {
    this.postFacade.recommendedHashtag(this.postStoryData._id).then((res: any) => {
      this.recommendedStoryHashtag = res.data
    }).catch((err: any) => {
    })
  }

  public getRecommendedStory() {
    this.postFacade.recommendedStory(this.postStoryData._id).then((res: any) => {
      this.recommendedStory = res.data.contents;
    }).catch((err: any) => {
    })
  }

  public getRecommendedStorys() {
    this.postFacade.recommendedStorys(this.postStoryData._id, this.postStoryData.pageId).then((res: any) => {
      this.recommendedStorys = res.data.contents;
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
      this.commentCount++;
      this.isComment = true
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

    setTimeout(() => {
      if (this.postStoryData.pageId !== null && this.postStoryData.pageId !== undefined) {
        this.pageFacade.getProfilePage(this.postStoryData.pageId).then((page: any) => {
          this.postStoryData.pageData = page
        }).catch((err: any) => {
        });

        this.pageFacade.getProfilePage(this.postStoryData.pageId).then((page: any) => {
          console.log(page)
          if (page.data.uniqueId !== undefined && page.data.uniqueId !== null) {
            this.linkPage = (this.mainPageLink + page.data.uniqueId)
          } else if (page.data.id !== undefined && page.data.id !== null) {
            this.linkPage = (this.mainPageLink + page.data.id)
          }
        }).catch((err: any) => {
        });
      }
    }, 2000);
  }

  private isLoginUser() {
    if (!this.isLogin()) {
      return this.showAlertLoginDialog("/story/" + this.postStoryData._id);
    }
  }

  public postLike() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/story/" + this.postStoryData._id);
    } else {
      this.postFacade.like(this.postStoryData._id, this.asPage).then((res: any) => {
        this.postStoryData.isLike = res.isLike
        this.postStoryData.likeCount = res.likeCount
        this.likeCount = this.postStoryData.likeCount
        this.isLike = this.postStoryData.isLike
      }).catch((err: any) => {
        console.log(err)
      });
    }
  }

  public async postAction(action: any) {
    this.isLoginUser();
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
      } else if (action.type === "NOTOPIC") {
      } else if (action.type === "UNDOTOPIC") {
        this.postFacade.undoPost(action.post._id).then((res: any) => {
        }).catch((err: any) => {
        })
      }
    } else if (action.mod === 'SHARE') {
      this.action.emit({ mod: action.mod });
    }
  }

  public pageAction(action: any) {
    this.userCloneDatas = action
    if (action.ownerUser !== undefined && action.ownerUser !== null) {
      this.asPage = action.id
    } else {
      this.asPage = undefined
    }
    this.postFacade.getAaaPost(this.postStoryData._id, this.asPage).then((pages: any) => {
      this.postStoryData.isComment = pages.isComment
      this.postStoryData.isLike = pages.isLike
      this.postStoryData.isRepost = pages.isRepost
      this.postStoryData.isShare = pages.isShare
    }).catch((err: any) => {
    })
  }

  public navigateHomePage() {

    this.router.navigate(["/home"]);

  }

  public developDialog() {
    this.showAlertDevelopDialog();
  }

  public convertTextType(text): string {
    if (text === "GENERAL") {
      return "ทั่วไป"
    } else if (text === "NEEDS") {
      return "มองหา"
    }
  }

  public typeStatusGeneral(type): boolean {
    if (type === "GENERAL") {
      return true
    } else
      return false
  }

  public typeStatusNeeds(type): boolean {
    if (type === "NEEDS") {
      return true
    } else
      return false
  }

}




