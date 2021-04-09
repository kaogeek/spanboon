/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { DialogManageImage, DialogImage, DialogDoIng, DialogCreateStory, DialogSettingDateTime, DialogPost, DialogPreview } from './dialog/dialog';
import { MatDialog, MatSelect, MatAutocompleteTrigger, MatSlideToggleChange, MatTableDataSource, MatMenuTrigger, MatSelectChange, MatSnackBar } from '@angular/material';
import { FormControl } from '@angular/forms';
import { AbstractPage } from '../pages/AbstractPage';
import { PostFacade, HashTagFacade, EmergencyEventFacade, ObjectiveFacade, AssetFacade, UserFacade, ObservableManager, UserAccessFacade, AuthenManager, NeedsFacade, PageFacade, TwitterService, CacheConfigInfo } from '../../services/services';
import { Asset } from '../../models/Asset';
import { PageSocialTW, SearchFilter } from '../../models/models';
import { POST_TYPE } from '../../TypePost';
import * as $ from 'jquery';
import { Observable, fromEvent, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ValidBase64ImageUtil } from '../../utils/ValidBase64ImageUtil';
import { environment } from '../../../environments/environment';
import { NeedsCard } from './card/card';
import { TwitterUtils } from '../../utils/TwitterUtils';
import { Router } from '@angular/router';
import { FACEBOOK_AUTO_POST, TWITTER_AUTO_POST } from '../../Config';
import { cpuUsage } from 'process';
import { F } from '@angular/cdk/keycodes';

declare var $: any;
declare const window: any;

const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;
const TEXT_LIMIT: number = 230;

@Component({
  selector: 'box-post',
  templateUrl: './BoxPost.component.html'
})
export class BoxPost extends AbstractPage implements OnInit {

  @ViewChild('topic', { static: false }) topic: ElementRef;
  @ViewChild('storyPost', { static: false }) storyPost: ElementRef;
  @ViewChild('matSelect', { static: false }) matSelect: MatSelect;
  @ViewChild('auto', { static: false }) auto;
  @ViewChild('objectiveDoing', { static: false }) objectiveDoing: ElementRef;
  @ViewChild('objectiveDoingName', { static: false }) objectiveDoingName: ElementRef;
  @ViewChild('objectCategory', { static: false }) objectCategory: MatSelect;
  @ViewChild('autoCompleteTag', { static: false }) autoCompleteTag: ElementRef;
  @ViewChild('menuTag', { static: false }) menu: MatMenuTrigger;

  @ViewChild('headerTop', { static: false }) headerTop: ElementRef;
  @ViewChild('tagEvent', { static: false }) tagEvent: ElementRef;
  @ViewChild('toolBar', { static: false }) toolBar: ElementRef;
  @ViewChild('middle', { static: false }) middle: ElementRef;
  @ViewChild('needsCard', { static: false }) needsElement: NeedsCard;

  @ViewChild('autoCompleteTag', { static: true, read: MatAutocompleteTrigger })
  updatePosition: MatAutocompleteTrigger;

  @ViewChild('autocompleteEmergency', { static: false })
  autocompleteEmergency: ElementRef;

  public links = [{ label: 'แท็กทั้งหมด', keyword: 'tab1' }, { label: 'แท็กที่ถูกเลือก', keyword: 'tab2' }];
  public activeLink = this.links[0].keyword;

  @Input()
  public dataPage: any;
  @Input()
  public userPage: any;
  @Input()
  public dataPageId: any;
  @Input()
  public content: any;
  @Input()
  public prefix: any;
  @Input()
  public rePote: any;
  @Input()
  public pages: any;
  @Input()
  public isHeaderPage: any;
  @Input()
  public accessDataPage: any;
  @Input()
  public isRepost: boolean; 
  @Input()
  public isListPage: boolean;
  @Input()
  public isClickPostPreLoad: boolean = false;
  @Input()
  public isEdit: boolean = false;
  @Input()
  public isFulfill: boolean = false;
  @Input()
  public isFulfillNull: boolean = false;
  @Input()
  public modeShowDoing: boolean = false;
  @Input()
  public modeDoIng: boolean = false;
  @Input()
  public isMobilePost: boolean = false;
  @Input()
  public isMobileText: boolean = false;
  @Input()
  public isMobileButton: boolean = false;
  @Input()
  public selectedPage: string = "แชร์เข้าไทมไลน์ของฉัน"
  @Input()
  public repostPage: string = "";
  @Input()
  public isShowTablet: boolean = false;
  @Input()
  public isSharePost: boolean = true;
  @Input()
  public isShowMaxWidth: number;
  @Input()
  public profile: string = "";
  @Input()
  public class: string | [string];
  @Output()
  public createPost: EventEmitter<any> = new EventEmitter();
  @Output()
  public createFullfillPost: EventEmitter<any> = new EventEmitter();
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitCanCel: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitDialog: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitCanCelDialog: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitClose: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitResizeClose: EventEmitter<any> = new EventEmitter();
  @Output()
  public selectedInformation: EventEmitter<any> = new EventEmitter();

  public dialog: MatDialog;
  private postFacade: PostFacade;
  private emergencyEventFacade: EmergencyEventFacade;
  private objectiveFacade: ObjectiveFacade;
  private userAccessFacade: UserAccessFacade;
  private userFacade: UserFacade;
  private assetFacade: AssetFacade;
  private observManager: ObservableManager;
  private hashTagFacade: HashTagFacade;
  private needsFacade: NeedsFacade;
  private pageFacade: PageFacade;
  private cacheConfigInfo: CacheConfigInfo;

  public snackBar: MatSnackBar;

  private masterSelected: boolean; 

  public httpItems: Observable<any[]>;
  public isShowEmergency: boolean;
  public isShowObjective: boolean;
  public isLoading: boolean;
  public isUpload: boolean;
  public isMouseEnter: boolean;
  public isChecked: boolean;
  public isSelect: boolean;
  public isNotAccess: boolean;
  public isShowCheckboxTag: boolean;
  public isShowUserTag: boolean;
  public isMsgNeeds: boolean;
  public isShowImage: boolean;
  public modeShowImage: boolean;
  public isMsgError: boolean;
  public isMsgNull: boolean;
  public isStory: boolean;
  public isDataStroy: boolean;
  public isTablet: boolean;
  public isButtonFulfill: boolean;
  public isShowText: boolean;
  public isTypeNeed: boolean = true;
  public typeStroy: any;
  public dataAutoComp: any; // 2: click, 1: totic, 0: content
  public dataObjective: any; // 2: click, 1: totic, 0: content
  public names: string;
  public emojis: string;
  public textMsg: string;
  public mTopic: string;
  public prefix_button: string;
  public setTimeoutAutocomp: any;
  public isStoryResultData: boolean;
  public setTimeoutDoubleCheckEmergency: any;
  public setTimeoutDoubleCheckObjective: any;
  public elementCheck: any;
  public dataImage: any[] = [];
  public dataHashTag: any;
  public imagesTimeline: any[] = [];
  public imageIcon: any;
  public whereConditions: string[];
  public resEmergency: any[] = [];
  public resObjective: any[] = [];
  public userTag: any[] = [];
  public resPageCategory: any[] = [];
  public resHashTag: any[] = [];
  public selectValueTag: any[] = [];
  public listHashTagNew: any[] = [];
  public resUser: any[] = [];
  public emerArray: any[] = [];
  public objectArray: any[] = [];
  public arrListItem: any[];
  public dataStroy: any;
  public coverImage: any;
  public dataItem: any;
  public mStory: string;
  public settingsPost: any;
  public listTag: any[] = [];
  public hashTag: any[] = [];
  public setTimeKeyup: any;
  public setTimeHashTag: any;
  public setTimeHashTags: any;
  public choiceTag: any = [];
  public user: any = [];
  public onPost: boolean
  public searchTag: string = "";
  public cloneTime: any;
  public placeHolder: any;
  public accessPage: any;
  public dataClone: any;
  public pageId: any;
  public userClone: any;
  public accessPageImage: any;
  public dataMessage: any;
  public data: any;
  public twitterConection: any;
  public facebookConection: any;
  public isAutoPostTwitter: any;
  public isAutoPostFacebook: any;
  private twitterService: TwitterService;

  public isSelectOption: boolean;

  keyword = "hashTag";
  selectedIndex: number;
  selectedObjectiveId: string;
  itemControl = new FormControl();
  control = new FormControl();
  filteredOptions: Observable<string[]>;
  tag: Observable<string[]>;
  filtered: any;
  dataSource = new MatTableDataSource(this.resHashTag);

  public authorizeLink = 'https://api.twitter.com/oauth/authorize';

  chooseStory: any[] = [
    { value: this.PLATFORM_GENERAL_TEXT, viewValue: this.PLATFORM_GENERAL_TEXT, class: 'icon-feed' },
    { value: this.PLATFORM_NEEDS_TEXT, viewValue: this.PLATFORM_NEEDS_TEXT, class: 'icon-feed looking' },
  ];
  chooseStorys: any[] = [
    { value: this.PLATFORM_GENERAL_TEXT, viewValue: this.PLATFORM_GENERAL_TEXT, class: 'icon-feed' },
  ];

  selected: string = this.PLATFORM_GENERAL_TEXT;
  selected1: string = "โพสต์"
  selected2: string = "โพสต์"
  selectedAccessPage: string = "โพสต์เข้าไทม์ไลน์ของฉัน"
  selectedValue: string = "เลือกหมวดหมู่";

  public apiBaseURL = environment.apiBaseURL;
  public webBaseURL = environment.webBaseURL;

  constructor(dialog: MatDialog, postFacade: PostFacade, emergencyEventFacade: EmergencyEventFacade, hashTagFacade: HashTagFacade, authenManager: AuthenManager, pageFacade: PageFacade,
    objectiveFacade: ObjectiveFacade, assetFacade: AssetFacade, userFacade: UserFacade, observManager: ObservableManager, userAccessFacade: UserAccessFacade, needsFacade: NeedsFacade,
    router: Router, twitterService: TwitterService, cacheConfigInfo: CacheConfigInfo, snackBar: MatSnackBar) {
    super(null, authenManager, dialog, router);
    this.isRepost = true
    this.dialog = dialog
    this.postFacade = postFacade
    this.assetFacade = assetFacade
    this.objectiveFacade = objectiveFacade
    this.emergencyEventFacade = emergencyEventFacade
    this.userFacade = userFacade
    this.observManager = observManager;
    this.hashTagFacade = hashTagFacade;
    this.needsFacade = needsFacade;
    this.pageFacade = pageFacade;
    this.twitterService = twitterService;
    this.cacheConfigInfo = cacheConfigInfo;
    this.snackBar = snackBar;
    this.isLoading = false;
    this.masterSelected = false;
    this.onPost = false;
    this.dataObjective = {};
    this.dataHashTag = {};
    this.dataItem = {};
    this.dataPageId = {};
    this.imageIcon = {};
    this.isChecked = false;
    this.listTag = [];
    this.dataStroy = {};
    this.dataAutoComp = {};
    this.arrListItem = [];
    this.settingsPost = {};
    this.accessPageImage = {};
    this.userAccessFacade = userAccessFacade;
    this.isStoryResultData = true;
    this.isListPage = false;
    this.isTablet = false;
    this.isButtonFulfill = false;
    this.isSelectOption = true;
    this.router = router;
    this.data = {};

    this.observManager.subscribe('authen.check', (data) => {
    });

    // this.cacheConfigInfo.getConfig(TWITTER_AUTO_POST).then((config: any) => { 
    //   if (config.value !== undefined) {
    //     // this.isShowFacebook = (config.value.toLowerCase() === 'true');
    //   }
    // }).catch((error: any) => {
    //   // console.log(error) 
    // }); 
  }
 
  public ngOnInit(): void {
    this.searchAccessPage();
    this.checkTabs();
    this.onResize();
    this.setContentStory();
    setTimeout(() => {
      this.keyUpSearchEmergencyEvent("", true);
      this.keyUpSearchObjective("");
      this.keyUpSearchHashTag("", false);
      this.searchObjectivePageCategory();
    }, 1000);
  }

  public setContentStory() {
    if (this.content && this.content.story !== null && this.content.story !== undefined && this.content.story !== "") {
      this.isStory = true
      this.isDataStroy = true
      this.isStoryResultData = false
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.socialGetBindingTwitter();
    this.socialGetBindingFacebook();
    this.getConfigTwitter();
    this.getConfigFacebook();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.isListPage) {
        this.prefix_button = 'box-file-input1';
      } else {
        this.prefix_button = 'box-file-input';
      }
    }, 0);
    if (this.isListPage && this.content) { 
      setTimeout(() => {
        let detail = this.content && (this.content.content || this.content.detail) ? (this.content.content || this.content.detail) : '';
        if (detail.includes('#')) {
          let editableStoryPost = $('#' + this.prefix.detail + 'editableStoryPost');
          const hashTag: string[] = detail.match(/#[\wก-๙]+/g) || [];
          for (let hTag of hashTag) {
            let filter = new SearchFilter();
            filter.whereConditions = {
              name: hTag.substring(1)
            };
            let data = {
              filter
            }
            this.hashTagFacade.searchTrend(data).then((res: any) => {
              if (res) {
                this.resHashTag = res;
                const isData = this.resHashTag.find(data => {
                  return data.value === hTag.substring(1)
                });
                detail = detail.replace(hTag, '<span class="atwho-inserted" data-atwho-at-query="#"><span id="container-hashtag" class="tribute-container-hashtag">' + hTag + '</span></span>&nbsp;');
                editableStoryPost.html(detail);
                if (isData) {
                  this.listTag.push(Object.assign({}, { name: isData.value, isText: true, isTopic: false, isServer: true }));
                } else {
                  this.listTag.push(Object.assign({}, { name: hTag.substring(1), isText: true, isTopic: false, isServer: false }));
                }
              }
            }).catch((err: any) => {
              console.log(err)
            })
          }
        } else {
          document.getElementById(this.prefix.detail + 'editableStoryPost').innerText = detail
        }
        let topic = this.content && (this.content.topic || this.content.title) ? (this.content.topic || this.content.title) : '';
        if (topic.includes('#')) {
          let topicEdit = $('#' + this.prefix.header + 'topic');
          const hashTag: string[] = topic.match(/#[\wก-๙]+/g) || [];
          for (let hTag of hashTag) {
            let filter = new SearchFilter();
            filter.whereConditions = {
              name: hTag.substring(1)
            };
            let data = {
              filter
            }
            this.hashTagFacade.searchTrend(data).then((res: any) => {
              if (res) {
                this.resHashTag = res;
                const isData = this.resHashTag.find(data => {
                  return data.value === hTag.substring(1)
                });
                topic = topic.replace(hTag, '<span class="atwho-inserted" data-atwho-at-query="#"><span id="container-hashtag" class="tribute-container-hashtag">' + hTag + '</span></span>&nbsp;');
                topicEdit.html(topic);
                if (isData) {
                  this.listTag.push(Object.assign({}, { name: isData.value, isText: true, isTopic: true, isServer: true }));
                } else {
                  this.listTag.push(Object.assign({}, { name: hTag.substring(1), isText: true, isTopic: true, isServer: false }));
                }
              }
            }).catch((err: any) => {
              console.log(err)
            })
          }
        } else {
          document.getElementById(this.prefix.header + 'topic').innerText = topic
        }

        if (this.isEdit) {
          this.selected1 = "แก้ไขโพสต์"
          if (this.content && this.content.gallery && this.content.gallery.length > 0) {
            this.isLoading = true;
            for (let image of this.content.gallery) {
              this.imagesTimeline.push(image);
              this.modeShowImage = true;
            }
          }
          if (this.content.type === POST_TYPE.NEEDS) {
            this.selected = this.PLATFORM_NEEDS_TEXT;
            if (this.content.needs && this.content.needs.length > 0) {
              let index = 0;
              for (let needs of this.content.needs) {
                this.needsFacade.getNeedsPost(needs._id).then((res) => {
                  needs.category = res.category
                }).catch((err) => {
                  console.log('err ', err)
                });
                this.arrListItem.push(needs);
              }
              index++;
            }
          } else {
            this.selected = this.PLATFORM_GENERAL_TEXT
          }
          if (this.content && this.content.pageId !== '' && this.content.pageId !== undefined && this.content.pageId !== null) {
            this.modeShowDoing = true;
          }
          if (this.content && this.content.objectiveTag !== '' && this.content.objectiveTag !== undefined && this.content.objectiveTag !== null) {
            this.dataObjective.hashTag = this.content.objectiveTag
          }
          if (this.content && this.content.objective !== '' && this.content.objective !== undefined && this.content.objective !== null) {
            this.dataObjective.id = this.content.objective.hashTag
          }
          if (this.content && this.content.emergencyEventTag !== '' && this.content.emergencyEventTag !== undefined && this.content.emergencyEventTag !== null) {
            this.dataAutoComp.hashtag = this.content.emergencyEventTag
          }
          if (this.content && this.content.emergencyEvent !== '' && this.content.emergencyEvent !== undefined && this.content.emergencyEvent !== null) {
            this.dataAutoComp.id = this.content.emergencyEvent.hashTag
          }
          if (this.content && this.content.hashTags && this.content.hashTags.length > 0) {
            for (let tag of this.content.hashTags) {
              this.selectValueTag.push({
                tag: tag.name
              })
            }
          }
        } else {
          this.selected1 = 'โพสต์';
        }
        this.isLoading = false;
      }, 100);
    } else {
      if (this.content && this.content.isFulfill) {
        this.isButtonFulfill = false;
        this.isTypeNeed = false;
        for (let data of this.content.fulfillRequest) {
          this.arrListItem.push(data)
        }
      }
    }
    this.onResize();

    $(() => {
      $.fn.atwho.debug = true
      var at_config = {
        at: "@",
        insertTpl: '<span class="tribute-container">${displayName}</span>',
        displayTpl: '<li >${displayName}</li>',
        delay: 100,
        limit: 10,
        searchKey: 'displayName',
        callbacks: {
          remoteFilter: (query, callback) => {
            $.ajax({
              url: this.apiBaseURL + '/user/tag/',
              beforeSend: (xhr) => {
                xhr.setRequestHeader('Authorization', "Bearer " + sessionStorage.getItem('token'));
              },
              type: "POST",
              dataType: "json",
              data: {
                name: query ? query : ""
              },
              success: (data) => {
                this.user = data
                callback(data);
              }
            });
          }
        }
      }
      var hashTag_config = {
        at: "#",
        searchKey: 'value',
        insertTpl: '<span class="tribute-container-hashtag">#${value}</span>&nbsp',
        displayTpl: "<li class='list-add-hashtaggg'>${value}</li>",
        delay: 100,
        limit: 10,
        callbacks: {
          remoteFilter: (query, callback) => {
            let filter : SearchFilter = new SearchFilter();
            filter.whereConditions = {
              name: query
            };
            let data = {
              filter
            }
            this.hashTagFacade.searchTrend(data).then(res => {
              callback(res);
              this.choiceTag = res;
            }).catch(error => {
              console.log(error);
            });
          },
        }
      }
      if (this.isListPage) {
        $('#textarea-editor').focus().atwho('run');
        $('#' + this.prefix.detail + 'editableStoryPost').atwho(at_config).atwho(hashTag_config);
        $('#' + this.prefix.detail + 'editableStoryPost').atwho(at_config).atwho(at_config);

        $('#header-story').focus().atwho('run');
        $('#' + this.prefix.header + 'topic').atwho(at_config).atwho(hashTag_config);
        $('#' + this.prefix.header + 'topic').atwho(at_config).atwho(at_config);
      } else {
        $('#textarea-editor').focus().atwho('run');
        $('#editableStoryPost').atwho(at_config).atwho(hashTag_config);
        $('#editableStoryPost').atwho(at_config).atwho(at_config);

        $('#header-story').focus().atwho('run');
        $('#topic').atwho(at_config).atwho(hashTag_config);
        $('#topic').atwho(at_config).atwho(at_config);
      }
    });
    this.updateText();

    // contenteditable
    $('#editableStoryPost').bind('dragover drop', function (event) {
      event.preventDefault();
      return false;
    });

    $('.header-story').bind('dragover drop', function (event) {
      event.preventDefault();
      return false;
    });

    setTimeout(() => {
      if (this.accessDataPage !== undefined) {
        const cloneData = JSON.parse(JSON.stringify(this.accessDataPage))
        this.cloneDataCheck(cloneData);
      }
      this.socialGetBindingTwitter();
      this.socialGetBindingFacebook();
      this.getConfigTwitter();
      this.getConfigFacebook(); 
    }, 0);
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

  public updateText() {
    document.addEventListener('paste', (evt: any) => {
      if (evt.srcElement.className === "textarea-editor" || evt.srcElement.className === 'textarea-editor ng-star-inserted' || evt.srcElement.className === 'textarea-editor ng-star-inserted msg-error-shake' || evt.srcElement.className === 'textarea-editor msg-error-shake'
        || evt.srcElement.className === 'header-story' || evt.srcElement.className === 'header-story ng-star-inserted' || evt.srcElement.className === 'header-story ng-star-inserted msg-error-shake' || evt.srcElement.className === 'header-story msg-error-shake') {
        evt.preventDefault();
        let clipdata = evt.clipboardData || (<any>window).clipboardData;
        let text = clipdata.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    });
  }

  public async checkAccessPage(pageId: string) { 
    await this.pageFacade.getAccess(pageId).then((res: any) => { 
      for (let dataPage of res.data) {
        if (dataPage.level === 'OWNER') {
          this.isNotAccess = true; 
        }
      }

    }).catch((err: any) => { 
      if (err.error.message === 'Unable to get User Page Access List') {
        this.isNotAccess = false; 
      }
    })
  }


  public searchAccessPage() {
    this.userAccessFacade.getPageAccess().then((res: any) => {
      if (res.length > 0) {
        let index = 0; 
        for (let data of res) {
          if (index === 0) {
            Object.assign(data.user, { type: 'user' });
            if (data.user && data.user.imageURL !== '' && data.user.imageURL !== null && data.user.imageURL !== undefined) {
              this.assetFacade.getPathFile(data.user.imageURL).then((image: any) => {
                if (image.status === 1) {
                  if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                    data.user.imageURL = null
                  } else {
                    data.user.imageURL = image.data
                  }
                  this.accessPage = res;
                }
              }).catch((err: any) => {
                if (err.error.message === "Unable got Asset") {
                  data.user.imageURL = ''
                }
              })
            }
          }
          if (data.page && data.page.imageURL !== '' && data.page.imageURL !== null && data.page.imageURL !== undefined) {
            this.assetFacade.getPathFile(data.page.imageURL).then((image: any) => {
              if (image.status === 1) {
                if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                  data.page.imageURL = null
                } else {
                  data.page.imageURL = image.data
                } 
              }
            }).catch((err: any) => {
              if (err.error.message === "Unable got Asset") {
                data.page.imageURL = ''
              }
            })
          } else {
            this.accessPage = res;
          }
          index++;
        }
      }
    }).catch((err: any) => {
      console.log(err)
    });
  }

  public cloneDataCheck(cloneData: any) {
    if (cloneData && cloneData.length > 0) {
      for (let data of cloneData) {
        if (this.router.url.split('/')[1] === "page") { 
          if (data.page.pageUsername === this.dataPage || data.page.id === this.dataPage) {
            const cloneDataPage = data.page;
            this.modeShowDoing = true;
            if (cloneDataPage.imageURL !== '' && cloneDataPage.imageURL !== undefined && cloneDataPage.imageURL !== null) {
              this.assetFacade.getPathFile(cloneDataPage.imageURL).then((image: any) => {
                if (image.status === 1) {
                  if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                    cloneDataPage.imageURL = null
                  } else {
                    cloneDataPage.imageURL = image.data
                  }
                  this.accessPageImage = cloneDataPage;
                  this.isSelectOption = false;
                }
              }).catch((err: any) => {
                if (err.error.message === "Unable got Asset") {
                  cloneDataPage.imageURL = ''
                }
              });
            } else {
              this.accessPageImage = cloneDataPage;
              this.isSelectOption = false;
            }
            this.dataPage = data.page.name;
            this.dataPageId = data.page;
            this.modeDoIng = false;
            break;
          } else {
            // mode user 
            if (!this.isNotAccess) {
              this.userCheck(data);
              this.dataPage = data.user.displayName;
              this.dataPageId = data.user;
              this.modeDoIng = true;
              this.isSharePost = false;
            }
          }
        } else {
          this.userCheck(data);
        }
      }
    }
  }

  public userCheck(data: any) {
    const cloneDataUser = data.user;
    this.dataPageId = data.user;
    if (cloneDataUser.imageURL !== undefined && cloneDataUser.imageURL !== '' && cloneDataUser.imageURL !== null) {
      this.assetFacade.getPathFile(cloneDataUser.imageURL).then((image: any) => {
        if (image.status === 1) {
          if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
            cloneDataUser.imageURL = null
          } else {
            cloneDataUser.imageURL = image.data
          }
          this.accessPageImage = cloneDataUser;
          this.isSelectOption = false;
        }
      }).catch((err: any) => {
        if (err.error.message === "Unable got Asset") {
          cloneDataUser.imageURL = ''
        }
      });
    } else {
      this.accessPageImage = cloneDataUser;
      this.isSelectOption = false;
    }
  }

  private clickAddHashtag(tag: string) {
    const indexLTag = this.listTag.findIndex(t => {
      return t.name === tag;
    });
    if (indexLTag === -1) {
      this.listTag.push(Object.assign({}, { name: tag, isText: true, isTopic: false, isServer: true, selected: true }));
    }
    let indexSTag = this.selectValueTag.findIndex(vTag => {
      return vTag.tag === this.listTag[indexLTag].name && vTag.tagId !== "";
    });
    if (indexSTag !== -1) {
      this.listTag[indexLTag].isText = true;
      this.listTag[indexLTag].isTopic = false;
      this.listTag[indexLTag].isServer = true;
      this.selectValueTag.splice(indexSTag, 1);
    }
  }

  private setAutoComp() {
    if (this.autoCompleteTag !== undefined) {
      clearTimeout(this.setTimeoutAutocomp);
      fromEvent(this.autoCompleteTag.nativeElement, 'keyup').pipe(
        // get value
        map((event: any) => {
          return event.target.value;
        })
        // if character length greater then 2
        // , filter(res => res.length > 2)
        // Time in milliseconds between key events
        , debounceTime(1000)
        // If previous query is diffent from current
        , distinctUntilChanged()
        // subscription for response
      ).subscribe((text: string) => {
        this.keyUpSearchHashTag(text, false);
      });
    }
  }

  public selectType(value) {
    if (value === this.PLATFORM_FULFILL_TEXT) {
      this.typeStroy = POST_TYPE.FULFILLMENT;
    } else if (value === this.PLATFORM_NEEDS_TEXT) {
      this.typeStroy = POST_TYPE.NEEDS;
      this.showDialogDoing();

    } else {
      this.typeStroy = POST_TYPE.GENERAL;
    }
  }

  public onChangeSlide(event?: MatSlideToggleChange) {
    this.isStory = event.checked;
    if (!this.isStory) {
      if (window.innerWidth <= 1024) {
        this.snackBarToast("ปิดสตอรี่", 1000);
      }

      if (!(Object.keys(this.dataStroy).length === 0 && this.dataStroy.constructor === Object)) {
        const confirmEventEmitter = new EventEmitter<any>();
        confirmEventEmitter.subscribe(() => {
          this.submitDialog.emit(this.dataStroy);
        });
        const canCelEventEmitter = new EventEmitter<any>();
        canCelEventEmitter.subscribe(() => {
          this.submitCanCelDialog.emit(this.dataStroy);
        });

        let dialog = this.showDialogWarming("คุณต้องการปิดการสร้าง" + this.PLATFORM_STORY + " ใช่หรือไม่ ?", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.closeDialog();
          } else {
            this.isStory = true;
          }
        });
      } else {
        this.closeDialog();
      }
      if (this.content !== '' && this.content !== undefined && this.content !== null) {
        if (!(Object.keys(this.content.story).length === 0 && this.content.story.constructor === Object)) {
          const confirmEventEmitter = new EventEmitter<any>();
          confirmEventEmitter.subscribe(() => {
            this.submitDialog.emit(this.dataStroy);
          });
          const canCelEventEmitter = new EventEmitter<any>();
          canCelEventEmitter.subscribe(() => {
            this.submitCanCelDialog.emit(this.dataStroy);
          });

          let dialog = this.showDialogWarming("คุณต้องการปิดการสร้าง" + this.PLATFORM_STORY + " ใช่หรือไม่ ?", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.dataStroy = {};
              this.closeDialog();
            } else {
              this.isStory = true;
            }
          });
        } else {
          this.closeDialog();
        }
      }
    } else {
      if (window.innerWidth <= 1024) {
        this.snackBarToast("เปิดสตอรี่", 1000);
      }
    }
  }

  public snackBarToast(text: string, duration?: any, vertical?: any, horizontal?: any, customize?: any) {
    this.snackBar.open(text, "", {
      duration: duration,
      verticalPosition: vertical,
      horizontalPosition: horizontal,
      panelClass: customize
    });
  }

  public showDialogDoing(): void {
    this.dataItem.pageId = this.dataPageId.id || this.dataPageId;
    if (this.arrListItem !== undefined && this.arrListItem.length > 0) {
      this.dataItem.arrListItem = this.arrListItem
    } else {
      this.dataItem.arrListItem = this.arrListItem
    }
    if (this.isEdit) {
      this.dataItem.isEdit = this.isEdit
    }
    const dialogRef = this.dialog.open(DialogDoIng, {
      width: 'auto',
      data: this.dataItem,
      panelClass: 'customize-dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(doingItem => {

      if (doingItem) {
        this.arrListItem = doingItem.arrListItem;
        if (doingItem && doingItem.resNeeds) {
          this.dataItem.resNeeds = doingItem.resNeeds
        }
        if (this.arrListItem !== undefined) {
          this.arrListItem = this.arrListItem.slice()
        }
      }
      if (doingItem && doingItem.length === 0) {
        this.arrListItem = doingItem.length;
        if (this.arrListItem !== undefined) {
          this.arrListItem = this.arrListItem.slice()
        }
      }
      this.stopLoading();
      this.onResize();
    });
  }

  public getObjectLength(arrListItem) {
    if (arrListItem && (Object.keys(arrListItem).length > 0)) {
      return Object.keys(arrListItem).length;
    }
  }

  public showDialogCreateStory(isEdit?: boolean): void {
    const topic = this.topic.nativeElement.innerHTML;
    const storyPostShort = this.storyPost.nativeElement.innerText
    let cloneStory = this.dataStroy ? this.dataStroy : '';
    this.dataStroy = this.content && this.content.story ? this.content.story : {};
    const storyPost = this.storyPost.nativeElement.innerText
    this.dataClone = {
      topic,
      cloneStory,
      storyPostShort,
      item: this.dataItem,
      user: this.userPage,
      imagesTimeline: this.imagesTimeline,
      dataStroy: this.dataStroy
    }
    const dialogRef = this.dialog.open(DialogCreateStory, {
      width: '100vw',
      height: '100vh',
      data: this.dataClone,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (storyPostShort.trim() === "") {
        this.isMsgError = true
        var contentAlert;
        if (this.isListPage) {
          contentAlert = document.getElementById(this.prefix.header + 'editableStoryPost');
          document.getElementById(this.prefix.detail + "editableStoryPost").focus();
        } else {
          contentAlert = document.getElementById('editableStoryPost');
          document.getElementById("editableStoryPost").focus();
        }
        contentAlert.classList.add('msg-error-shake');

        // remove the class after the animation completes
        setTimeout(function () {
          contentAlert.classList.remove('msg-error-shake');
        }, 1000);

        event.preventDefault();
        return;
      }
      if (result) {
        this.isStoryResultData = false
        this.dataStroy = { story: result.story, storyAry: result.storyAry, coverImage: result.coverImages.img64 }
        // delete this.dataStroy.item;
        // delete this.dataStroy.cloneStory;
        if (result.coverImages.asset !== undefined && result.coverImages.asset !== null) {
          const asset = new Asset();
          asset.mimeType = result.coverImages.asset.type;
          asset.fileName = result.coverImages.asset.name;
          asset.size = result.coverImages.asset.size;
          asset.data = result.coverImages.asset.data;
          this.coverImage = asset
        }
        let data = {
          title: topic,
          detail: storyPostShort,
          story: this.dataStroy,
          needs: this.arrListItem ? this.arrListItem : [],
          emergencyEvent: this.isEmptyObject(this.dataAutoComp) ? this.dataAutoComp.id : "",
          emergencyEventTag: this.isEmptyObject(this.dataAutoComp) ? this.dataAutoComp.hashtag : "",
          userTags: this.userTag,
          postsHashTags: this.hashTag,
          postGallery: this.dataImage,
          coverImage: this.coverImage
        }
        if (this.modeShowDoing) {
          Object.assign(data, { objective: this.isEmptyObject(this.dataObjective) ? this.dataObjective.id : "" });
          Object.assign(data, { objectiveTag: this.isEmptyObject(this.dataObjective) ? this.dataObjective.hashTag : "" });
        }
        this.isClickPostPreLoad = true;
        return this.createPost.emit(data);
      }
      this.stopLoading();
      this.onResize();
    });
  }

  public onLostFocus(data, isTopic: boolean) {
    let keyword = data && data.target && data.target.innerText ? data.target.innerText : "";
    if (keyword.includes("#")) {
      let editableStoryPost;

      if (this.isListPage) {
        if (isTopic) {
          editableStoryPost = $('#' + this.prefix.header + 'topic');
        } else {
          editableStoryPost = $('#' + this.prefix.detail + 'editableStoryPost')
        }
      } else {
        if (isTopic) {
          editableStoryPost = $('#topic');
        } else {
          editableStoryPost = $('#editableStoryPost')
        }
      }

      let atwhoInserted = $(".atwho-inserted");

      const hashTag: string[] = keyword.match(/#[\wก-๙]+/g) || [];
      if (hashTag.length > 0) {

        for (let hTag of hashTag) {

          let innerHTML = editableStoryPost.html();
          if (innerHTML.includes("<span class=\"atwho-query\">" + hTag + " " + "</span><br>")) {
            let text = "<span class=\"atwho-query\">" + hTag + " " + "</span><br>";
            innerHTML = innerHTML.replace(text, '<span class="atwho-inserted" data-atwho-at-query="#"><span id="container-hashtag" class="tribute-container-hashtag">' + hTag + '</span></span>&nbsp;&nbsp;');
            editableStoryPost.html(innerHTML);
            this.setCaretToEnd(data.target);

          } else if (innerHTML.includes(hTag + " ")) {

            let text = hTag + " ";
            innerHTML = innerHTML.replace(text, '<span class="atwho-inserted" data-atwho-at-query="#"><span id="container-hashtag" class="tribute-container-hashtag">' + hTag + '</span></span>&nbsp;&nbsp;');
            editableStoryPost.html(innerHTML);
            this.setCaretToEnd(data.target);

          } else if (innerHTML.includes(" " + hTag)) {
            let text = " " + hTag;
            innerHTML = innerHTML.replace(text, '<span class="atwho-inserted" data-atwho-at-query="#"><span id="container-hashtag" class="tribute-container-hashtag">' + hTag + '</span></span>&nbsp;&nbsp;');
            editableStoryPost.html(innerHTML);
            this.setCaretToEnd(data.target);

          } else if (innerHTML.includes(hTag + "&nbsp;") && !innerHTML.includes(">" + hTag + "&nbsp;</")) {
            let text = hTag + "&nbsp;";
            innerHTML = innerHTML.replace(text, '<span class="atwho-inserted" data-atwho-at-query="#"><span id="container-hashtag" class="tribute-container-hashtag">' + hTag + '</span></span>&nbsp;&nbsp;');
            editableStoryPost.html(innerHTML);
            this.setCaretToEnd(data.target);
          }

          const indexLTag = this.listTag.findIndex(tag => {
            return tag.name === hTag.substring(1);
          });

          if (indexLTag !== -1) {
            let isChoice = this.choiceTag.find(choice => {
              return hTag.substring(1) === choice.value;
            });
            if (isChoice) {
              this.listTag[indexLTag].isTopic = isTopic;
              this.listTag[indexLTag].isText = true;
              this.listTag[indexLTag].isServer = true;
            }

            let indexSTag = this.selectValueTag.findIndex(vTag => {
              return vTag.tag === this.listTag[indexLTag].name;
            });
            if (indexSTag !== -1) {
              this.selectValueTag.splice(indexSTag, 1);
            }

          } else {
            let isServer = false;
            for (let index = 0; index < atwhoInserted.length; index++) {
              const inserted = atwhoInserted[index];
              let insertedInnerText = inserted.innerText;
              if (insertedInnerText.replace(/\s/g, "") === hTag) {
                isServer = true;
              }
            }

            this.listTag.push(Object.assign({}, { name: hTag.substring(1), isText: true, isTopic: isTopic, isServer: isServer, selected: true }));
          }
        }

        let selectValueTaglone = JSON.parse(JSON.stringify(this.selectValueTag));
        let index = 0;
        for (const vTag of selectValueTaglone) {
          if (vTag.tagId == "") {
            const isPass1 = this.listTag.find(lTag => {
              return vTag.tag === lTag.name && !lTag.isServer && lTag.isText;
            });
            const isPass2 = hashTag.find(hTag => {
              return vTag.tag === hTag.substring(1);
            });
            if (!isPass1 && !isPass2) {
              this.selectValueTag.splice(index, 1);
              index--;
            }
          } else {
            const isPass3 = this.listTag.find(lTag => {
              return vTag.tag === lTag.name && lTag.isServer && lTag.isText;
            });
            if (isPass3) {
              this.selectValueTag.splice(index, 1);
              index--;
            }
          }
          index++;
        }
      }
      this.removeListTag(hashTag, isTopic);
    } else {
      let hashTag = [];
      let listTagClone = JSON.parse(JSON.stringify(this.listTag));
      let index = 0;
      for (const tag of listTagClone) {
        if (tag.isTopic !== isTopic) {
          hashTag.push("#" + tag.name);
        } else {
          this.listTag.splice(index, 1);
          index--;
        }
        index++;
      }
    }
  }

  private removeListTag(hashTag: string[], isTopic: boolean): void {
    let listTagClone = JSON.parse(JSON.stringify(this.listTag));
    let index = 0;
    for (const tag of listTagClone) {
      if (tag.isText && tag.isTopic === isTopic) {
        const isPass = hashTag.find(hTag => {
          return tag.name === hTag.substring(1);
        });
        if (!isPass) {
          let editableStoryPost;
          if (this.isListPage) {
            if (!isTopic) {
              editableStoryPost = $('#' + this.prefix.header + 'topic').text();
            } else {
              editableStoryPost = $('#' + this.prefix.detail + 'editableStoryPost').text();
            }
          } else {
            if (!isTopic) {
              editableStoryPost = $('#topic').text();
            } else {
              editableStoryPost = $('#editableStoryPost').text();
            }
          }

          const hashTagTop = editableStoryPost.match(/#[\wก-๙]+/g) || [];
          const isHas = hashTagTop.find(hTag => {
            return tag.name === hTag.substring(1);
          });
          if (!isHas) {
            this.listTag.splice(index, 1);
          }
          index--;
        }
      }
      index++;
    }
  }

  private removeListHashTagNew(hashTag: string[], isTopic: boolean): void {
    let listHashTagNewClone = JSON.parse(JSON.stringify(this.listHashTagNew));
    let index = 0;
    for (const tagNew of listHashTagNewClone) {
      if (tagNew.isText && isTopic === tagNew.isTopic) {
        const isPass = hashTag.find(hTag => {
          return tagNew.name === hTag.substring(1);
        });
        if (!isPass) {
          this.listHashTagNew.splice(index, 1);
          index--;
        }
      }
      index++;
    }
  }

  setCaretToEnd(target/*: HTMLDivElement*/, isStart?) {
    const range = document.createRange();
    const sel = window.getSelection();
    const ranges = sel.getRangeAt(0);
    const start = range.startOffset;
    if (isStart) {
      const newText = document.createTextNode('');
      target.appendChild(newText);
      ranges.setStart(target.childNodes[0], start);
    } else {
      range.selectNodeContents(target);
    }
    range.collapse(isStart);
    sel.removeAllRanges();
    sel.addRange(range);
    target.focus();

    // set scroll to the end if multiline
    target.scrollTop = target.scrollHeight;
  }

  public onKeyupTopic(event) {
    // var limit = parseInt($('.header-story').attr('maxlength'));
    // var text = $('.header-story').html();
    // var chars = text.length;
    // if (chars > limit) {
    //   $('.header-story').addClass('msg-error-shake');
    //   text = text.substr(0, limit);
    // } else if (chars == 0) {
    //   $('.header-story').removeClass('msg-error-shake');
    // } else {
    //   $('.header-story').removeClass('msg-error-shake');
    // }

    this.mStory = event.target.innerText.trim();
    if (!this.isFulfillNull) {
      if (this.mStory === "") {
        var myselect = $('#topic').attr('contenteditable', 'true');
        myselect.find("br:last-child").remove();
        $('.header-story').addClass('msg-error-shake');
      } else {
        // $('.header-story').removeClass('msg-error-shake');
      }
    }
    if (this.isListPage) {
      this.postFacade.nextMessageTopic(this.mStory);
    }

    let tagClass;
    if (this.isListPage) {
      tagClass = $('#' + this.prefix.header + 'topic').find('font');
    } else {
      tagClass = $('#topic').find('font');

    }
    if (tagClass.length > 0) {
      for (let index = 0; index < tagClass.length; index++) {
        tagClass[index].color = "black"
      }
    }

    clearTimeout(this.setTimeHashTags);
    this.setTimeHashTags = setTimeout(() => {
      this.onLostFocus(event, true);
    }, 150);
  }

  public onKeyup(event) {
    clearTimeout(this.setTimeKeyup);
    this.setTimeKeyup = setTimeout(() => {
      $('.list-add-hashtaggg').click((dom) => {
        this.clickAddHashtag(dom.target.innerText);
      });
      this.getTextLength();

    }, 200);

    this.mTopic = event && event.target && event.target.innerText ? event.target.innerText : "";
    if (!this.isFulfillNull) {
      if (this.mTopic.trim() === "") {
        var myselect = $('#editableStoryPost').attr('contenteditable', 'true');
        myselect.find("br:last-child").remove();
        $('.textarea-editor').addClass('msg-error-shake');
      } else {
        $('.textarea-editor').removeClass('msg-error-shake');
      }
    }
    this.postFacade.nextMessage(this.mTopic);

    let tagClass;
    var topicAlert;
    if (this.isListPage) {
      tagClass = $('#' + this.prefix.detail + 'editableStoryPost').find('font');
    } else {
      tagClass = $('#editableStoryPost').find('font');
    }
    if (tagClass.length > 0) {
      for (let index = 0; index < tagClass.length; index++) {
        tagClass[index].color = "black"
      }
    }

    clearTimeout(this.setTimeHashTags);
    this.setTimeHashTags = setTimeout(() => {
      this.onLostFocus(event, false);
    }, 150);
  }

  public searchUserTag(name: any) {
    let filter = {
      name: name
    }
    this.userFacade.search(filter).then((res: any) => {
      this.resUser = res;
    }).catch((err: any) => {
      console.log(err)
    })
  }

  optionClicked(event, item: any) {
    event.stopPropagation();
    this.checkCheckBoxvalue(event, item);
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  public closeDialog(): void {
    this.isUpload = false;
    this.isShowObjective = false;
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  public genImages(images: any): void {
    this.modeShowImage = true;
    this.imagesTimeline.push(images);
    this.isLoading = true;

    const asset = new Asset();
    let data = images.image.split(',')[0];
    let typeImage = data.split(':')[1];
    asset.mimeType = typeImage.split(';')[0];
    asset.data = images.image.split(',')[1];
    asset.fileName = images.fileName;
    asset.size = images.size;

    let temp = {
      asset
    }
    this.postFacade.upload(temp).then((res: any) => {
      if (res.status === 1) {
        for (let result of this.imagesTimeline) {
          if (result.fileName === images.fileName) {
            result.fileName = res.data.fileName
            Object.assign(result, { id: res.data.id === null || res.data.id === undefined ? "" : res.data.id });
            Object.assign(result, { isUpload: true });
          }
        }
      }
      this.stopLoading();

    }).catch((err: any) => {
      console.log(err)
    })
  }

  public eventClick() {
    if (this.isShowEmergency === true) {
      this.closeSearchAutocomp();
    } else {
      this.isShowEmergency = true;
    }
  }

  public selectAccessPage(event: any, type?: string) {
    this.pageId = event.id;
    this.dataPage = event.name || event.displayName;
    this.dataPageId = {};
    this.dataPageId.id = event.id;
    if (type === 'PAGE') {
      this.modeDoIng = false;
      this.isSharePost = true;
      this.modeShowDoing = true;
      this.accessPageImage.name = event.name;
      this.accessPageImage.imageURL = event.imageURL;
      this.accessPageImage.id = event.id;
    } else {
      this.modeDoIng = true;
      this.isSharePost = false;
      this.modeShowDoing = false;
      this.accessPageImage.displayName = event.displayName;
      this.accessPageImage.imageURL = event.imageURL;
      this.accessPageImage.id = event.id
    }
    this.socialGetBindingTwitter();
    this.socialGetBindingFacebook();
    this.getConfigTwitter();
    this.getConfigFacebook();

    this.selectedInformation.emit(event);
  }

  public onClickGetDataPost(isDraft?: boolean) {
    if (this.getTextLength() > TEXT_LIMIT) {
      return this.showAlertDialogWarming("เนื้อหาโพสต์ของคุณเกิน 230 คำ", "none");
    }
    let topic: any, storyPostShort: any;
    if (this.isListPage) {
      topic = document.getElementById(this.prefix.header + 'topic').innerText;
      storyPostShort = document.getElementById(this.prefix.detail + 'editableStoryPost').innerText;
    } else {
      topic = document.getElementById('topic').innerText;
      storyPostShort = document.getElementById('editableStoryPost').innerText;
    }
    if (!this.isFulfillNull) {
      if (topic.trim() === "" && this.isRepost) {
        this.isMsgNull = true;
        var topicAlert;
        if (this.isListPage) {
          topicAlert = document.getElementById(this.prefix.header + 'topic');
          document.getElementById(this.prefix.header + 'topic').focus();
        } else {
          topicAlert = document.getElementById('topic');
          document.getElementById("topic").focus();
        }
        topicAlert.classList.add('msg-error-shake');

        // remove the class after the animation completes
        setTimeout(function () {
          topicAlert.classList.remove('msg-error-shake');
        }, 1000);

        event.preventDefault();
        return;
      }
      if (storyPostShort.trim() === "") {
        this.isMsgError = true
        var contentAlert;
        if (this.isListPage) {
          contentAlert = document.getElementById(this.prefix.detail + 'editableStoryPost');
          document.getElementById(this.prefix.detail + 'editableStoryPost').focus();
        } else {
          contentAlert = document.getElementById('editableStoryPost');
          document.getElementById("editableStoryPost").focus();
        }
        contentAlert.classList.add('msg-error-shake');

        // remove the class after the animation completes
        setTimeout(function () {
          contentAlert.classList.remove('msg-error-shake');
        }, 1000);

        event.preventDefault();
        return;
      }
    }

    if (this.typeStroy === POST_TYPE.NEEDS) {
      if (this.arrListItem.length === 0) {
        this.isMsgNeeds = true
        var topicAlerts = document.getElementById('needs');
        topicAlerts.classList.add('msg-error-shake');

        setTimeout(function () {
          topicAlerts.classList.remove('msg-error-shake');
        }, 1000);
        return;
      }
    }

    var item = $('div.textarea-editor:contains("@")').text();
    // const replace = mention.match(/@[\wก-๙]+/g) || [];
    // console.log('replace ',replace)
    // this.userTag = user

    let atwhoInsertedUser = $('.atwho-inserted').find('.tribute-container');

    for (let index = 0; index < atwhoInsertedUser.length; index++) {
      const inserted = atwhoInsertedUser[index];
      const text = '@' + inserted.innerText;
      // this.userTag.push(text);
      const result = this.user.find(users => {
        return text.substring(1) === users.displayName
      });
      var innerHTMLMention = $('div.textarea-editor').html();

      if (innerHTMLMention.includes('<span class="atwho-inserted" data-atwho-at-query="@"><span class="tribute-container">' + text.substring(1) + '</span></span>‍') && storyPostShort.includes(text.substring(1))) {
        let userId = '@{' + result.id + '}'
        storyPostShort = storyPostShort.replace(text.substring(1), userId)
      }
      this.userTag.push(result.id);
    }

    if (this.imagesTimeline.length > 0) {
      this.dataImage = [];
      for (let [index, image] of this.imagesTimeline.entries()) {
        // upload image
        const asset = new Asset();
        if (image && image.image) {
          let data = image.image.split(',')[0];
          const typeImage = data.split(':')[1];
          asset.mimeType = typeImage.split(';')[0];
          asset.data = image.image.split(',')[1];
          asset.size = image.size;
          asset.ordering = index + 1;

          this.dataImage.push({
            id: image.id,
            asset,
          });
        } else {
          if (image.imageURL !== undefined && image.imageURL !== '' && image.imageURL !== null) {
            image.ordering = index + 1;
            asset.ordering = image.ordering;
            this.dataImage.push({
              fileId: image.fileId,
              id: image._id,
              postId: image.post,
              asset
            });
          }

        }
      }
    } 

    this.listTag.forEach(element => {
      this.hashTag.push(element.name);
    });
    if (this.isStory && (this.isStoryResultData || !this.isEmptyObject(this.dataStroy))) {
      this.showDialogCreateStory();
    } else {
      let data = {
        title: topic,
        detail: storyPostShort,
        needs: this.arrListItem,
        emergencyEvent: this.isEmptyObject(this.dataAutoComp) ? this.dataAutoComp.id : "",
        emergencyEventTag: this.isEmptyObject(this.dataAutoComp) ? this.dataAutoComp.hashtag : "",
        story: this.isEmptyObject(this.dataStroy) ? this.dataStroy : undefined,
        userTags: this.userTag,
        postsHashTags: this.hashTag,
        postGallery: this.dataImage,
        isDraft: true,
        pageId: this.selectedPage,
        coverImage: this.coverImage,
        postSocialTW: this.twitterConection && this.isAutoPostTwitter ? true : false,
        postSocialFB: this.facebookConection && this.isAutoPostFacebook ? true : false
      }
      if (this.isEmptyObject(this.settingsPost)) {
        delete this.settingsPost.time;
        Object.assign(data, { startDateTime: this.settingsPost.startDateTime })
      }
      if (this.modeShowDoing) {
        Object.assign(data, { objective: this.isEmptyObject(this.dataObjective) ? this.dataObjective.id : "" });
        Object.assign(data, { objectiveTag: this.isEmptyObject(this.dataObjective) ? this.dataObjective.hashTag : "" });
      }

      if (this.isRepost) {
        delete data.pageId
      }
      if (!isDraft) {
        delete data.isDraft
      }
      if (this.arrListItem.length === 0) {
        delete data.needs
      }
      if (this.isListPage) {
        if (this.accessPageImage.name) {
          Object.assign(data, { id: this.accessPageImage.id });
        } else {
          Object.assign(data, { id: undefined });
        }
      }

      if (this.isFulfill) {
        Object.assign(data, { asPage: this.content.asPage, fulfillCaseId: this.content.fulfillCaseId });
        return this.createFullfillPost.emit(data);
      } else {
        return this.createPost.emit(data);
      }
    }
  }

  public keyUpSearchEmergencyEvent(text: string, isSetResEmergency: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      const keywordFilter: any = {
        filter: {
          limit: SEARCH_LIMIT,
          offset: SEARCH_OFFSET,
          relation: [],
          whereConditions: {},
          count: false,
          orderBy: {}
        },
      };
      Object.assign(keywordFilter, { hashTag: text })
      if (typeof text !== "string" || text.trim() === "") {
        delete keywordFilter.filter.whereConditions.hashTag;
      }

      this.emergencyEventFacade.searchEmergency(keywordFilter).then((res: any) => {
        if (isSetResEmergency) {
          this.resEmergency = res;
        }
        resolve(res);
        this.isLoading = false;
      }).catch((err: any) => {
        reject(err);
        console.log(err)
      });
    });
  }

  public clearDataAll() {
    if (this.topic !== undefined) {
      this.topic.nativeElement.innerText = "";
    }
    if (this.storyPost !== undefined) {
      this.storyPost.nativeElement.innerText = "";
    }
    if (this.objectiveDoingName !== undefined) {
      this.objectiveDoingName.nativeElement.value = "";
    }
    if (this.objectiveDoing !== undefined) {
      this.objectiveDoing.nativeElement.value = "";
    }
    this.autoCompleteTag = undefined;
    this.selectedObjectiveId = undefined;
    this.resPageCategory = []
    this.dataAutoComp = {};
    this.dataObjective = {};
    this.imagesTimeline = [];
    this.selectValueTag = [];
    this.dataImage = [];
    this.hashTag = [];
    this.listTag = [];
    this.userTag = [];
    this.selected = this.PLATFORM_GENERAL_TEXT;
    this.selected1 = "โพสต์";
    this.isShowImage = false;
    this.isChecked = false;
    this.arrListItem = [];
    this.dataItem = {};
    this.settingsPost = {};
    this.dataStroy = {};
    this.isStory = false;
    this.isStoryResultData = true;

  }

  public keyUpSearchObjective(value: string) {
    this.resObjective = []
    const keywordFilter: any = {
      filter: {
        limit: SEARCH_LIMIT,
        offset: SEARCH_OFFSET,
        relation: [],
        whereConditions: {
          pageId: (this.dataPageId && this.dataPageId.id) ? (this.dataPageId.id || this.dataPageId) : '',
        },
        count: false,
        orderBy: {
          createdDate: "DESC",
        }
      },
    };
    Object.assign(keywordFilter, { hashTag: value })

    this.objectiveFacade.searchObjective(keywordFilter).then((result: any) => {
      if (result.status === 1) {
        this.resObjective = result.data;
        let index = 0;
        this.isLoading = true;
        for (let data of this.resObjective) {
          if (data.iconURL !== '' && data.iconURL !== undefined && data.iconURL !== null) {
            Object.assign(this.resObjective[index], { isLoadImageIcon: true });
            this.getDataIcon(data.iconURL, index);
          } else {
            Object.assign(this.resObjective[index], { isLoadImageIcon: false });
            this.isLoading = false;
          }
          index++;
        }
        this.isLoading = false;
      }
    }).catch((err: any) => {
      console.log(err)
      if (err.error.message === 'Cannot Search PageObjective') {
        this.resObjective = []
      }
    });
  }

  private getDataIcon(iconURL, index): void {
    this.assetFacade.getPathFile(iconURL).then((res: any) => {
      if (res.status === 1) {
        if (ValidBase64ImageUtil.validBase64Image(res.data)) {
          this.resObjective[index].isLoadImageIcon = false;
          Object.assign(this.resObjective[index], { iconBase64: res.data });
          this.isLoading = false;
        } else {
          Object.assign(this.resObjective[index], { iconBase64: '' });
          this.isLoading = false;
        }

      }
    }).catch((err: any) => {
      console.log(err)
    });
  }

  public keyUpSearchHashTag(data: string, isEdit: boolean) {
    if (this.isLoading) {
      return;
    }
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {
      name: data
    };
    if (typeof data !== "string" || data.trim() === "") {
      delete filter.whereConditions.name;
    }
    filter.count = false;
    filter.orderBy = {}
    this.resHashTag = [];
    this.isLoading = true;
    let result = {
      filter
    }
    this.hashTagFacade.searchTrend(result).then((res: any) => {
      if (res) {

        this.resHashTag = res;
        this.checkHashTag();
      }
      this.isLoading = false;
    }).catch((err: any) => {
      console.log(err)
    })
  }

  private checkHashTag() {
    if (this.listTag && this.listTag.length > 0) {
      let atwhoInserted = $(".atwho-inserted");
      let listClone = JSON.parse(JSON.stringify(this.listTag));
      if (atwhoInserted.length > 0) {
        for (let [index, data] of listClone.entries()) {
          let isPass = false;
          if (data.isText) {
            for (let index = 0; index < atwhoInserted.length; index++) {
              const inserted = atwhoInserted[index];
              let insertedInnerText = inserted.innerText;
              if (insertedInnerText.replace(/\s/g, "") === "#" + data.name) {
                isPass = true;
              }
            }
          } else {
            isPass = true;
          }
          if (!isPass) {
            this.listTag.splice(index, 1);
          } else {
            for (let [i, dataTag] of this.resHashTag.entries()) {
              const tag = data.name
              if (dataTag.value === tag) {
                Object.assign(this.resHashTag[i], { selected: true });
                break;
              }
            }
          }
        }
      } else {
        // กรณีติ๊กเลือก hashtag แล้ว out focus ออก กลับมาดูข้อมูลก็ยังติ๊กอยู่
        for (let [index, data] of listClone.entries()) {
          for (let [i, dataTag] of this.resHashTag.entries()) {
            const tag = data.name
            if (dataTag.value === tag) {
              Object.assign(this.resHashTag[i], { selected: true });
              break;
            }
          }
        }
      }
    }
    if (this.listHashTagNew && this.listHashTagNew.length > 0) {
      for (let [index, object] of this.resHashTag.entries()) {
        for (let [i, arr] of this.listHashTagNew.entries()) {
          if (object.value === arr.name) {
            Object.assign(this.resHashTag[index], { selected: true });
            break;
          }
        }
      }
    }
    if (this.selectValueTag && this.selectValueTag.length > 0) {
      for (let [index, object] of this.resHashTag.entries()) {
        for (let [i, arr] of this.selectValueTag.entries()) {
          if (object.value === arr.tag) {
            Object.assign(this.resHashTag[index], { selected: true });
            break;
          }
        }
      }
    }

    this.isLoading = false;
  }

  public clickListTag() {
    this.isShowCheckboxTag = true;
    this.activeLink = 'tab1';
    this.keyUpSearchHashTag("", false);
    setTimeout(() => {
      let search = $('input[id=autocompleteField]');
      search.focus();
      this.setAutoComp();
    }, 30);

  }

  public clickUserTag() {
    this.isShowUserTag = true;
  }

  public removeEmergency() {
    this.dataAutoComp = {};
    document.querySelector('.mat-selected').classList.remove('mat-selected');
  }

  public unCheckboxAll() {
    event.stopPropagation();

    for (var hashTagNew of this.listHashTagNew) {
      hashTagNew.selected = false;
    }
    const confirmEventEmitter = new EventEmitter<any>();
    confirmEventEmitter.subscribe(() => {
      this.submitDialog.emit();
    });
    const canCelEventEmitter = new EventEmitter<any>();
    canCelEventEmitter.subscribe(() => {
      this.submitCanCelDialog.emit();
    });
    let arr = [];
    let indexArr = 0;
    if (this.listTag && this.listTag.length > 0) {
      for (let [i, dataTag] of this.listTag.entries()) {
        if (dataTag.isText && dataTag.isServer) {
          arr.push(dataTag);
          Object.assign(arr[indexArr], { index: i });
        }
        indexArr++;
      }
      if (arr.length > 0) {
        let dialog = this.showDialogWarming("แท็กของคุณมีอยู่ในเนื้อหาทั้งหมด " + arr.length + " คำ คุณต้องการลบใช่ไหม ", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            for (let [indexData, data] of arr.entries()) {
              let atwhoInserted = $(".atwho-inserted");
              for (let index = 0; index < atwhoInserted.length; index++) {
                const inserted = atwhoInserted[index];
                let insertedInnerText = inserted.innerText.replace(/\s/g, "");
                if ("#" + data.name === insertedInnerText) {
                  let find;
                  if (this.isListPage) {
                    find = $('#' + this.prefix.detail + 'editableStoryPost , #' + this.prefix.header + 'topic').find(inserted);
                  } else {
                    find = $('#editableStoryPost , #topic').find(inserted);
                  }
                  this.listTag.splice(indexData, 1);
                  find.remove();
                  this.dataAutoComp = {};
                  this.getTextLength();
                }
              }
            }
          }
        });
      }
    }

    if (this.selectValueTag.length > 0) {
      for (let [i, dataTag] of this.selectValueTag.entries()) {
        for (let [index, data] of this.listTag.entries()) {
          if (data.name === dataTag.tag) {
            this.listTag.splice(index, 1);
          }
        }
      }
      this.selectValueTag = this.selectValueTag.filter(d => {
        return d.tagId === ""
      });
    }

    this.getTextLength();
  }

  public checkCheckBoxvalue(event, item) {
    const dataTag = item.value ? item.value : item.name;
    this.getTextLength();

    if (event.checked) {
      this.selectValueTag.push({
        tagId: item.id,
        tag: item.value
      });
      this.listTag.push(Object.assign({}, { name: item.value, selected: true, count: item.count, isSelectData: true }));

    } else {
      this.selectValueTag = this.selectValueTag.filter(d => {
        return d.tag !== item.value
      });

      this.listHashTagNew = this.listHashTagNew.filter(newTag => {
        return newTag.name !== item.value ? item.value : item.name;
      });

      const confirmEventEmitter = new EventEmitter<any>();
      confirmEventEmitter.subscribe(() => {
        this.submitDialog.emit();
      });
      const canCelEventEmitter = new EventEmitter<any>();
      canCelEventEmitter.subscribe(() => {
        this.submitCanCelDialog.emit();
      });

      if (this.listTag.length > 0) {
        let atwhoInserted = $(".atwho-inserted");
        let data;
        for (let index = 0; index < atwhoInserted.length; index++) {
          const inserted = atwhoInserted[index];
          let insertedInnerText = inserted.innerText;
          if (insertedInnerText.replace(/\s/g, "") === "#" + dataTag) {
            let find;
            if (this.isListPage) {
              find = $('#' + this.prefix.detail + 'editableStoryPost , #' + this.prefix.header + 'topic').find(inserted);
            } else {
              find = $('#editableStoryPost , #topic').find(inserted);
            }
            data = find.length
          }
        }
        if (atwhoInserted.length > 0) {
          let dialog = this.showDialogWarming("แท็กของคุณมีอยู่ในเนื้อหาทั้งหมด " + data + " คำ คุณต้องการลบใช่ไหม ", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              let atwhoInserted = $(".atwho-inserted");
              for (let index = 0; index < atwhoInserted.length; index++) {
                const inserted = atwhoInserted[index];
                let insertedInnerText = inserted.innerText;
                if (insertedInnerText.replace(/\s/g, "") === "#" + dataTag) {
                  let find;
                  if (this.isListPage) {
                    find = $('#' + this.prefix.detail + 'editableStoryPost , #' + this.prefix.header + 'topic').find(inserted);
                  } else {
                    find = $('#editableStoryPost , #topic').find(inserted);
                  }
                  find.remove();
                }
              }
            }
          });
        }

      }
    }
    this.getTextLength();
  }

  public clickCardObjective(index: number, item: any) {
    if (this.elementCheck) {
      if (this.dataObjective && this.dataObjective.id === item.id) {
        this.dataObjective = {};
        this.selectedObjectiveId = undefined;
        document.querySelector('.active-click-doing').classList.remove('active-click-doing');
      } else {
        this.selectedObjectiveId = item.id;
        this.dataObjective.id = item.id;
        this.dataObjective.hashTag = item.hashTag;
        this.dataObjective.status = 2;
      }
    } else {
      this.selectedObjectiveId = item.id;
      this.dataObjective.id = item.id;
      this.dataObjective.hashTag = item.hashTag;
      this.dataObjective.status = 2;
      let objectClone = JSON.parse(JSON.stringify(this.dataObjective));

      const isPass = this.objectArray.find(objective => {
        return objective.hashTag === this.dataObjective.hashTag
      });

      if (!isPass) {
        this.objectArray.push({
          id: this.dataObjective.id,
          name: this.dataObjective.hashTag,
          isText: true,
          isTopic: false
        });
      }
      let indexData = this.objectArray.map(function (e) { return e.name; }).indexOf(objectClone.title);
      if (indexData != 0) {
        this.objectArray = this.objectArray.splice(index, 1);
      }
    }
    this.closeDialog();
    $("#menubottom").css({
      'overflow-y': "auto"
    });
  }
  public isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length > 0));
  }

  public focus(e): void {
    e.stopPropagation();
    this.auto.focus();
  }
  private closeSearchAutocomp(): void {
    this.isShowEmergency = false;
  }

  public focusOutFunction() {
    if (!this.isSelect) {
      this.closeSearchAutocomp();
      // this.auto.close();
    }
  }

  selectEvent(item) {
    // do something with selected item  
    this.closeSearchAutocomp();
    this.isSelect = false;

    if (this.dataAutoComp && this.dataAutoComp.id === item.id) {
      this.dataAutoComp = {};
      document.querySelector('.mat-selected').classList.remove('mat-selected');
    } else {
      this.dataAutoComp.id = item.id;
      this.dataAutoComp.hashtag = item.hashTag;
      this.dataAutoComp.status = 2;
      const value = document.querySelector('.mat-selected')
      if (value && value.classList) {
        value.classList.remove('mat-selected');
      }
      let emergencyClone = JSON.parse(JSON.stringify(this.dataAutoComp));
      if (this.listHashTagNew.length > 0) {
        for (let data of this.listHashTagNew) {
          if (data.name !== this.dataAutoComp.hashtag) {
            this.listHashTagNew.push({
              id: null,
              name: this.dataAutoComp.hashtag,
              isText: true,
              isClickEmercengy: true,
              isTopic: false
            });
          }
          if (data.isClickEmercengy) {
            let index = this.listHashTagNew.map(function (e) { return e.name; }).indexOf(emergencyClone.hashtag);
            if (index !== -1) {
              this.listHashTagNew = this.listHashTagNew.splice(index, 1);
            }
          }
        }
      } else {
        this.listHashTagNew.push({
          id: null,
          name: this.dataAutoComp.hashtag,
          isText: true,
          isClickEmercengy: true,
          isTopic: false
        });
      }
    }

    return this.dataAutoComp;
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onMouseEnterItem(e) {
    // do something when input is focused
    this.isSelect = true;
  }

  onMouseLeaveItem(e) {
    // do something when input is focused
    this.isSelect = false;
  }

  onFocused(e) {
    // do something when input is focused
  }

  public onDeleteTagEmergency(index: number, tag: any) {
    if (this.selectValueTag.length > 0) {
      for (let [i, data] of this.resHashTag.entries()) {
        if (tag === data.name) {
          Object.assign(this.resHashTag[i], { selected: this.masterSelected });
          this.selectValueTag = this.selectValueTag.filter(d => d.tag !== tag.tag);
        }
      }
      const isDelete = this.listTag.findIndex(tags => {
        return tags.name === tag
      });
      if (isDelete > -1) {
        this.listTag.splice(isDelete, 1);
      }
    }
    return this.selectValueTag.splice(index, 1);
  }

  public clickObjectiveDoing() {
    this.isUpload = false;
    this.isShowObjective = true;
    this.keyUpSearchObjective("");
    setTimeout(() => {
      const element = document.querySelector('.active-click-doing');
      this.elementCheck = element && element.classList && element.classList.contains('active-click-doing');
    }, 500);

    setTimeout(() => {
      this.setTopobj();
    }, 0);
  }

  public UploadImage() {
    this.searchObjectivePageCategory();
    return this.isUpload = true;
  }

  public setTopobj() {
    var Wheight = window.innerHeight;
    var objective = document.querySelector('.wrapper-body-objective');
    var objHeight = objective.getBoundingClientRect().height;
    var objTop = objective.getBoundingClientRect().top + window.scrollY;
    var obj = objHeight + objTop;

    if (obj > Wheight) {
      objective.classList.add("active");
    } else {
      objective.classList.remove("active");
    }
  }

  public setTopupload() {
    var Wheight = window.innerHeight;
    var upload = document.querySelector('.upload-image-doing');
    var uploadHeight = upload.getBoundingClientRect().height;
    var uploadTop = upload.getBoundingClientRect().top + window.scrollY;
    var upl = uploadHeight + uploadTop;

    if (upl > Wheight) {
      upload.classList.add("active");
    } else {
      upload.classList.remove("active");
    }
  }

  public clickCanCel() {
    this.submitCanCel.emit(this.imagesTimeline);
    this.imagesTimeline = [];
    this.closeDialog();
  }

  public onBack() {
    this.isShowObjective = true;
    this.isUpload = false
    this.keyUpSearchObjective("");

    setTimeout(() => {
      this.setTopobj();
    }, 0);
  }

  public searchObjectivePageCategory() {
    let filter = new SearchFilter();
    filter.limit = SEARCH_LIMIT;
    filter.offset = SEARCH_OFFSET;
    filter.relation = [];
    filter.whereConditions = {
      active: true
    };
    filter.count = false;
    filter.orderBy = {}
    this.objectiveFacade.searchObjectiveCategory(filter).then((res: any) => {
      this.resPageCategory = res.data;
    }).catch((err: any) => {
      console.log(err)
    })
  }

  public createImageObjective(): void {
    this.isLoading = true;
    let pageId = this.dataPageId.id;
    const dataDoing = this.objectiveDoing.nativeElement.value;
    const tagName = this.objectiveDoingName.nativeElement.value;
    const category = this.objectCategory.value;

    if (category === undefined) {
      return this.showAlertDialog("เลือกหมวดหมู่");
    }

    if (tagName === "") {
      document.getElementById('objective-doing-name').focus();
      return this.showAlertDialog("กรุณาใส่แฮชแท็ก");
    }

    if (dataDoing === "") {
      document.getElementById('objective-doing').focus();
      return this.showAlertDialog("กรุณากรอกสิ่งที่คุณกำลังทำ");
    }

    if (!this.isEmptyObject(this.imageIcon)) {
      return this.showAlertDialog("กรุณาอัพโหลดรูปภาพ");
    }

    const asset = new Asset();
    if (this.isEmptyObject(this.imageIcon)) {
      let data = this.imageIcon.image.split(',')[0];
      const typeImage = data.split(':')[1];
      asset.mimeType = typeImage.split(';')[0];
      asset.data = this.imageIcon.image.split(',')[1];
      asset.size = this.imageIcon.size;
    }
    if (dataDoing !== '' && tagName !== '' && category !== undefined) {
      let objectiveImage = {
        asset,
        hashTag: tagName,
        title: dataDoing,
        category: category,
        pageId: pageId
      }
      this.objectiveFacade.uploadImageObjective(objectiveImage).then((res: any) => {
        let index = 0;
        if (res.status === 1) {
          this.getDataIcon(res.data.iconURL, index);
          index++;
          let object = {
            id: res.data.id,
            title: res.data.title,
            hashTag: res.data.hashTag,
          }
          this.dataObjective = object
          this.clickCardObjective(0, this.dataObjective);
          this.keyUpSearchObjective("");
          this.closeDialog();
          this.imageIcon = {};
          this.selectedValue = 'เลือกหมวดหมู่';
          this.searchObjectivePageCategory();
          this.isMsgError = false
        }
      }).catch((err: any) => {
        console.log(err);
        let alertMessages: string;
        if (err.error.message === 'PageObjective is Exists') {
          alertMessages = 'สิ่งที่คุณกำลังถูกสร้างแล้ว'
        } else if (err.error.message === 'PageObjective HashTag is Exists') {
          alertMessages = 'แฮชแท็กถูกสร้างไว้แล้ว'
        }
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
      })
    }
    $("#menubottom").css({
      'overflow-y': "auto"
    });
  }

  public canCelImageObject() {
    this.isUpload = false;
    this.isShowObjective = false;
    $("#menubottom").css({
      'overflow-y': "auto"
    });
  }

  public onFileMultiSelectedImage(event) {
    this.isShowImage = true;
    let files = event.target.files;
    if (files.length === 0) {
      return;
    }
    if (files) {
      for (let file of files) {
        let reader = new FileReader();

        reader.onload = (event: any) => {
          let data = {
            fileName: file.name,
            size: file.size,
            image: event.target.result
          }
          this.genImages(data);
        }
        reader.readAsDataURL(file);
      }
    }
  }

  public showDialogImage(): void {
    const dialogRef = this.dialog.open(DialogImage, {
      width: 'auto',
      disableClose: true,
      data: this.imageIcon
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.imageIcon = result;
      }
      this.stopLoading();
    });
  }

  public focutOut() {
    if (this.imagesTimeline && this.imagesTimeline.length > 0) {
      const confirmEventEmitter = new EventEmitter<any>();
      confirmEventEmitter.subscribe(() => {
        this.submitDialog.emit(this.imagesTimeline);
      });
      const canCelEventEmitter = new EventEmitter<any>();
      canCelEventEmitter.subscribe(() => {
        this.submitCanCelDialog.emit(this.imagesTimeline);
      });

      let dialog = this.showDialogWarming("ไฟล์กำลังอัพโหลด คุณต้องการปิดหรือไม่ ?", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.imagesTimeline = [];
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }

  }
  public focusOutObjective() {
    if (this.isEmptyObject(this.imageIcon)) {
      const confirmEventEmitter = new EventEmitter<any>();
      confirmEventEmitter.subscribe(() => {
        this.submitDialog.emit(this.imageIcon);

      });
      const canCelEventEmitter = new EventEmitter<any>();
      canCelEventEmitter.subscribe(() => {
        this.submitCanCelDialog.emit(this.imageIcon);
      });

      let dialog = this.showDialogWarming("ไฟล์กำลังอัพโหลด คุณต้องการปิดหรือไม่ ?", "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.imageIcon = {};
          this.selectedValue = "เลือกหมวดหมู่";
          this.closeDialog();
        } else {
          this.closeDialog();
        }
      });
    } else {
      this.closeDialog();
    }
    $("#menubottom").css({
      'overflow-y': "auto"
    });

  }
  public focusOutTag() {
    this.isShowCheckboxTag = false;
    this.isLoading = false;
    return event.stopPropagation();
  }

  public focusOutEmergency() {
    this.isShowEmergency = false;
    return event.stopPropagation();
  }

  public onShowDragandDrop() {
    const dialogRef = this.dialog.open(DialogManageImage, {
      data: this.imagesTimeline
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res !== undefined) {
        this.imagesTimeline = res;
      }
    });
  }

  public onClickSettingTime() {
    const topic = this.topic.nativeElement.value
    let storyPostShort = this.storyPost.nativeElement.innerText;

    if (topic === "") {
      this.isMsgNull = true;
      var topicAlert;
      if (this.isListPage) {
        topicAlert = document.getElementById(this.prefix.header + 'topic');
        document.getElementById(this.prefix.header + "topic").focus();
      } else {
        topicAlert = document.getElementById('topic');
        document.getElementById("topic").focus();
      }
      topicAlert.classList.add('msg-error-topic');

      // remove the class after the animation completes
      setTimeout(function () {
        topicAlert.classList.remove('msg-error-topic');
      }, 1000);

      event.preventDefault();
      return;
    }

    if (storyPostShort.trim() === "") {
      this.isMsgError = true
      var contentAlert;
      if (this.isListPage) {
        contentAlert = document.getElementById(this.prefix.detail + 'editableStoryPost');
        document.getElementById(this.prefix.detail + "editableStoryPost").focus();

      } else {
        contentAlert = document.getElementById('editableStoryPost');
        document.getElementById("editableStoryPost").focus();
      }
      contentAlert.classList.add('msg-error-story');

      // remove the class after the animation completes
      setTimeout(function () {
        contentAlert.classList.remove('msg-error-story');
      }, 1000);

      event.preventDefault();
      return;
    }

    if (this.isEmptyObject(this.settingsPost)) {
      this.settingsPost.time = this.cloneTime;
    }
    const dialogRef = this.dialog.open(DialogSettingDateTime, {
      data: this.settingsPost,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(res => {
      this.settingsPost = res;
      if (this.settingsPost && this.settingsPost.startDateTime && this.settingsPost.time !== "") {
        this.cloneTime = this.settingsPost.time;
        this.onClickGetDataPost();
      }
    });
  }

  public getTextLength() {
    var topic = "";
    var detail = "";

    if (this.isListPage) {
      topic = $('#' + this.prefix.header + 'topic').text();
      detail = $('#' + this.prefix.detail + 'editableStoryPost').text();
    } else {
      topic = $('#topic').text();
      detail = $('#editableStoryPost').text();
    }

    let link = this.webBaseURL + '/post/' + this.getRandom(23, false);
    let isCount = TwitterUtils.getTwitterValidate(topic, detail, '', '', this.dataAutoComp.hashtag, this.dataObjective.hashTag);
    if (isCount && isCount.weightedLength !== 0) {
      return isCount.weightedLength;
    }
  }

  getRandom(positions, float) {
    var number = "";
    var point = -1;

    if (float) point = Math.floor(Math.random() * positions) + 1;

    for (let i = 0; i < positions; i++) {
      if (i == point) number += ".";
      number += Math.floor(Math.random() * 10);
    }

    return number;
  }

  public checkActiveList() {
    if (this.listTag.length > 0) {
      for (let data of this.listTag) {
        if (data.isServer) {
          return data.isServer;
        }
        break;
      }
    }
  }

  public removeNeeds(item) {
    let index = 0;
    // for (let data of this.arrListItem) {
    //   if (data.standardItemId === item.standardItemId) {
    //     this.arrListItem.splice(index, 1);
    //     console.log('this.arrListItem ',this.arrListItem)
    //     break;
    //   }
    //   index++; 
    // }
  }

  public onResize() {
    this.checkTabs();
    this.socialGetBindingTwitter();
    this.socialGetBindingFacebook();
    this.getConfigTwitter();
    this.getConfigFacebook();

    if (window.innerWidth <= 479) {
      this.isMobilePost = true;
      this.isMobileText = true;
      this.isTablet = false;
      this.isShowText = false;
      var postion = $('.wrapper-tool-post');
      postion.addClass("m-tool-post");

      var postion1 = $('.box-left');
      postion1.addClass("m-left");

      var postion2 = $('.box-center');
      postion2.addClass("m-center");

      var postion3 = $('.box-right');
      postion3.addClass("m-right");
    } else if (window.innerWidth > 1024) {
      this.isMobilePost = false;
      this.isMobileText = false;
      this.isShowText = true;
    }

    if (window.innerWidth <= 1024 && 768 < window.innerWidth) {
      this.isMobilePost = true;
      this.isMobileText = false;
      this.isTablet = true;
      this.isShowText = true;
    } else if (window.innerWidth > 1024) {
      this.isMobilePost = false;
      this.isShowText = true;
      this.onResizeCloseDialog();
    } else if (479 < window.innerWidth) {
      this.isMobilePost = true;
      this.isMobileText = false;
      this.isTablet = true;
      this.isShowText = false;
    }
  }

  public checkTabs() {
    if (window.innerWidth <= this.isShowMaxWidth) {
      this.isShowTablet = true;
    } else {
      this.isShowTablet = false;
    }
  }

  public dialogPost() {
    if (window.innerWidth <= 768 || 1024 >= window.innerWidth) {
      this.data.isMobilePost = false;
      this.data.isMobileText = false;
    } else if (479 <= window.innerWidth) {
      this.data.isMobilePost = true;
      this.data.isMobileText = true;
    }
    this.data.name = this.dataPage;
    this.data.pageId = this.dataPageId.id;
    this.data.isListPage = true;
    this.data.isEdit = false;
    this.data.isFulfill = false;
    this.data.id = this.user.id;
    this.data.modeShowDoing = true;
    if (this.router.url.split('/')[1] === "page") {
      this.data.isSharePost = true;
    } else {
      this.data.isSharePost = false;
    }
    // this.data.isBox = true;

    const dialogRef = this.dialog.open(DialogPost, {
      data: this.data,
      panelClass: 'customize-dialog',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      this.stopLoading();
    });
    this.onResize();
  }

  public onCloseDialog() {
    let body = {
      topic: this.mTopic,
      content: this.mStory,
      arrList: this.arrListItem
    }
    this.submitClose.emit(body);
  }

  public onResizeCloseDialog() {
    let body = {
      topic: this.mTopic,
      content: this.mStory,
      arrList: this.arrListItem
    }
    this.submitResizeClose.emit(body);
  }

  public preview() {
    let dataPreview = {
      title: this.topic.nativeElement.value,
      detail: this.storyPost.nativeElement.innerText,
    }
    const dialogRef = this.dialog.open(DialogPreview, {
      panelClass: 'dialog-review-full-screen',
      data: dataPreview
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  public socialGetBindingTwitter() {
    if (this.dataPageId && this.dataPageId.id !== undefined) {
      this.pageFacade.socialGetBindingTwitter(this.dataPageId.id).then((res: any) => {
        this.twitterConection = res.data;
      }).catch((err: any) => {
        console.log('err ', err)
      });
    }
  }

  public socialGetBindingFacebook() {
    if (this.dataPageId && this.dataPageId.id !== undefined) {
      this.pageFacade.socialGetBindingFacebook(this.dataPageId.id).then((res: any) => {
        this.facebookConection = res.data;
      }).catch((err: any) => {
        console.log('err ', err)
      });
    }
  }

  public socialBinding(socialBind: boolean, platform: string) {
    if (platform === 'twitter' && !this.twitterConection) {
      if (!socialBind) {
        this.unbindTwitter();
      } else {
        let callback = environment.webBaseURL + "/callback";
        this.twitterService.requestToken(callback).then((result: any) => {
          this.authorizeLink += '?' + result;
          window.open(this.authorizeLink);
          window.bindTwitter = (resultTwitter) => {
            if (resultTwitter !== undefined && resultTwitter !== null) {
              const twitter = new PageSocialTW();
              twitter.twitterOauthToken = resultTwitter.token;
              twitter.twitterTokenSecret = resultTwitter.token_secret;
              twitter.twitterUserId = resultTwitter.userId;

              this.pageFacade.socialBindingTwitter(this.dataPageId.id, twitter).then((res: any) => {
                if (res.data) {
                  this.twitterConection = res.data;
                  if (this.twitterConection) {
                    let alertMessage: string = "คุณต้องการสร้างแชร์โพสต์ไปยัง twitter อัตโนมัติไหม ?"

                    const confirmEventEmitter = new EventEmitter<any>();
                    confirmEventEmitter.subscribe(() => {
                      this.submitDialog.emit();
                    });
                    const canCelEventEmitter = new EventEmitter<any>();
                    canCelEventEmitter.subscribe(() => {
                      this.submitCanCelDialog.emit();
                    });

                    let dialog = this.showDialogWarming(alertMessage, "ยกเลิก", "ตกลง", confirmEventEmitter, canCelEventEmitter);
                    dialog.afterClosed().subscribe((res) => {
                      if (res) {
                        this.setAutoPostSocial(true, 'twitter')
                      } else {
                        this.isAutoPostTwitter = false;
                      }
                    });
                  }
                }
              }).catch((err: any) => {
                if (err.error.message === 'This page was binding with Twitter Account.') {
                  this.showAlertDialog('บัญชีนี้ได้ทำการเชื่อมต่อ Twitter แล้ว');
                }
              });
            }
          }
        }).catch((error: any) => {
          console.log(error);
          this.showAlertDialog('เกิดข้อมูลผิดพลาด กรุณาลองใหม่อีกครั้ง');
        });
      }
    } else {
      this.setAutoPostSocial(socialBind, platform);
    }
  }

  public popup(url, title, width, height, scroll) {

    var LeftPosition = (screen.width) ? (screen.width - width) / 2 : 0;
    var TopPosition = (screen.height) ? (screen.height - height) / 2 : 0;
    var settings = 'height=' + height + ',width=' + width + ',top=' + TopPosition + ',left=' + LeftPosition + ',scrollbars=' + scroll + ',resizable'

    return window.open(url, title, settings);
  }

  public unbindTwitter() {
    this.pageFacade.socialUnBindingTwitter(this.dataPageId.id).then((res: any) => {
      // if delete true set false
      if (res.data) {
        this.twitterConection = false;
      }
    }).catch((err: any) => {
      console.log('err ', err)
      this.showDialogError(err.error.name, this.router.url);
    });
  }

  public unbindFacebook() {
    this.pageFacade.socialUnBindingFacebook(this.dataPageId.id).then((res: any) => {
      // if delete true set false
      if (res.data) {
        this.facebookConection = false;
      }
    }).catch((err: any) => {
      console.log('err ', err)
      this.showDialogError(err.error.name, this.router.url);
    });
  }

  public getConfigFacebook() {
    if (this.dataPageId && this.dataPageId.id !== undefined) {
      this.pageFacade.getConfigByPage(this.dataPageId.id, FACEBOOK_AUTO_POST).then((res: any) => {
        this.isAutoPostFacebook = res.value;
      }).catch((err: any) => {
        if (err && err.error && err.error.message === 'Unable to Get Page Config') {
          this.isAutoPostFacebook = false;
        }
      })
    }
  }

  public getConfigTwitter() {
    if (this.dataPageId && this.dataPageId.id !== undefined) {
      this.pageFacade.getConfigByPage(this.dataPageId.id, TWITTER_AUTO_POST).then((res: any) => {
        this.isAutoPostTwitter = res.value;
      }).catch((err: any) => {
        if (err && err.error && err.error.message === 'Unable to Get Page Config') {
          this.isAutoPostTwitter = false;
        }
      });
    }
  }

  public setAutoPostSocial(checked: boolean, social: string) {
    let autopost: string = '';
    if (social === 'facebook') {
      autopost = FACEBOOK_AUTO_POST;
    } else if (social === 'twitter') {
      autopost = TWITTER_AUTO_POST;
    }
    let config = {
      value: checked,
      type: "boolean"
    }
    this.pageFacade.getEditConfig(this.dataPageId.id, config, autopost).then((res: any) => {
      if (res.name === FACEBOOK_AUTO_POST) {
        this.isAutoPostFacebook = res.value;
      } else if (res.name === TWITTER_AUTO_POST) {
        this.isAutoPostTwitter = res.value;
      }
    }).catch((err: any) => {
      console.log('err ', err)
    })
  }

  public redirectSetting() {
    if (this.dataPageId && this.dataPageId.pageUsername !== undefined && this.dataPageId.pageUsername !== '' && this.dataPageId.pageUsername !== null) {
      this.router.navigateByUrl('page/' + this.dataPageId.pageUsername + '/settings?tab=connect');
    } else {
      this.router.navigateByUrl('page/' + this.dataPageId.id + '/settings?tab=connect');
    }
    this.dialog.closeAll();
  }
}
