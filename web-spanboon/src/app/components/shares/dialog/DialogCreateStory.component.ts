/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, ViewChild, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchFilter, Asset, Storycomponent } from '../../../models/models';
import { PageCategoryFacade, PageFacade, AuthenManager, AssetFacade, ObservableManager, HashTagFacade } from '../../../services/services';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DialogAlert } from '../../shares/dialog/DialogAlert.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { FileHandle } from '../directive/DragAndDrop.directive';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { POST_TYPE } from '../../../TypePost';
import { MESSAGE } from '../../../../custom/variable';
import * as $ from 'jquery';
import './../../../../assets/script/jquery.atwho.js';
import { environment } from 'src/environments/environment';

const PAGE_NAME: string = 'editcomment';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
  selector: 'create-story',
  templateUrl: './DialogCreateStory.component.html',
})
export class DialogCreateStory extends AbstractPage implements OnDestroy {

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('pageName', { static: false }) pageName: ElementRef;
  @ViewChild('autoCompleteTag', { static: false }) autoCompleteTag: ElementRef;

  public links = [{ label: 'เรื่องราว', keyword: 'story' }, { label: this.PLATFORM_NEEDS_TEXT, keyword: 'needs' }];
  public activeLink = this.links[0].label;

  chooseStory: any[] = [
    { value: this.PLATFORM_GENERAL_TEXT, viewValue: this.PLATFORM_GENERAL_TEXT, class: 'icon-feed' },
    { value: this.PLATFORM_NEEDS_TEXT, viewValue: this.PLATFORM_NEEDS_TEXT, class: 'icon-feed looking' },
  ];

  selected = this.PLATFORM_GENERAL_TEXT

  private pageCategoryFacade: PageCategoryFacade;
  private observManager: ObservableManager;
  private pageFacade: PageFacade;
  private assetFacade: AssetFacade;
  private hashTagFacade: HashTagFacade;

  public path: string = "https://www.youtube.com/embed/"

  public isLoading: boolean;
  public isText: boolean;
  public isTitleText: boolean;
  public isImage: boolean;
  public isImageLink: boolean;
  public isListPage: boolean;
  public isLink: boolean;
  public isVideo: boolean;
  public LinkNewTeb: boolean;
  public isSelectImage: boolean
  public isShowCheckboxTag: boolean;
  public isImageUPload: boolean;
  public isTextEditor: boolean;
  public isLeft: boolean;
  public isCenter: boolean;
  public isRight: boolean;
  public storyIndex: any = 0;
  public imageCover: any;
  public config: any;
  public arrListItem: any;
  public user: any;
  public setTimeoutAutocomp: any;
  public image: any;
  public video: any;
  public choiceTag: any = [];
  public textH: string;
  public textS: string;
  public linkUrl: string;
  public linkText: string;
  public imageUrl: string;
  public imageDetail: string;
  public imageSize: any;
  public videoSize: any;
  public videoUrl: string;
  public videoDetail: string;
  public typeStroy: any;
  public resDataObjective: any[] = [];
  public storyOriginal: any[] = [];
  public dialog: MatDialog;
  public isComponent: boolean;
  public textLimit: number;
  public selectIndex: any;
  public ary: any[] = [];
  public newTeb: any;
  public aligns: any;
  public drops: any;
  public selection: any;
  public selecIndex: any;
  public placeHolder: any;
  public coverImage: any;
  public keyWeb: any;
  public textFontArr: any[] = [];
  public file: FileHandle[] = [];
  public changeText: any;

  public Editor = ClassicEditor;


  private apiBaseURL = environment.apiBaseURL;
  files: any[] = [];

  constructor(public dialogRef: MatDialogRef<DialogCreateStory>, @Inject(MAT_DIALOG_DATA) public data: any, pageCategoryFacade: PageCategoryFacade, pageFacade: PageFacade,
    dialog: MatDialog, authenManager: AuthenManager, router: Router, assetFacade: AssetFacade, observManager: ObservableManager, hashTagFacade: HashTagFacade,
    private sanitizer: DomSanitizer) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.pageCategoryFacade = pageCategoryFacade;
    this.pageFacade = pageFacade;
    this.assetFacade = assetFacade;
    this.observManager = observManager;
    this.hashTagFacade = hashTagFacade;
    this.imageCover = {}
    this.arrListItem = {}
    this.isText = true;
    this.isImage = true;
    this.isImageLink = false;
    this.isLink = true;
    this.isVideo = true;
    this.LinkNewTeb = false;
    this.isTitleText = true;
    this.isComponent = false;
    this.isSelectImage = false;
    this.isImageUPload = false;
    this.isTextEditor = true;
    this.isListPage = false;
    this.isLeft = true;
    this.isCenter = true;
    this.textLimit = 0;
    this.isRight = true;
    this.imageSize = "50%";
    this.videoSize = "50%";
    this.image = undefined;
    this.textH = "เด็กไทยอีกมากยังขาดโอกาศ";
    this.textS = "ในปัจจุบันที่ความขัดแย้งยังคงกัดกินสังคมไทยอยู่ทุกเมื่อเชื่อวัน ทั้งเรื่องของผลประโยชการโกงกินต่างๆของทั้งภาครัฐหรือเอกชน แต่อีกมุมหนึ่งของปนะเทศในจุดที่ห่างไกลจากแสงสียังคงมีน้องๆที่ไม่ได้รับโอกาศ..";

    this.textS = this.data.storyPostShort
    this.textH = this.data.topic
    if (this.data.imagesTimeline.length > 0) {
      this.image = this.data.imagesTimeline[0].image
      this.coverImage = this.data.imagesTimeline[0]
    }
    if (this.data.dataStroy.storyAry !== null && this.data.dataStroy.storyAry !== undefined && this.data.dataStroy.storyAry.length > 0) {
      setTimeout(() => {
        this.ary = this.data.dataStroy.storyAry
        let index: number = 0
        if (this.data.dataStroy.coverImage !== null && this.data.dataStroy.coverImage !== undefined) {
          this.image = this.data.dataStroy.coverImage
        }
        setTimeout(() => {
          for (let n of this.ary) {
            if (n.htmlType === "TITLE") {
              document.getElementById(index.toString()).innerHTML = n.value
            }
            if (n.htmlType === "VIDEO") {
              var unit = n.videoUrl
              var index1 = unit.indexOf('v=')
              var index2 = unit.indexOf('&')
              if (index2 > 0) {
                this.video = (this.path + unit.substring(index1 + 2, index2));
              } else {
                this.video = (this.path + unit.substring(index1 + 2));
              }
              var div = document.getElementById(("iframeV" + index));
              div.setAttribute("src", this.video);
            }
            index++
          }
        }, 200);
      }, 500);
    }
    this.user = this.data.user
    // this.data.storyPost = this.data && this.data.storyPost || this.data.cloneStory && this.data.cloneStory.storyPost ? this.data.storyPost || this.data.cloneStory.storyPost : "";

  }

  public ngOnInit(): void {
    this.storyOriginal.push(JSON.parse(JSON.stringify(this.data)));
  }

  public ngAfterViewInit(): void {

  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public updateText() {
    document.addEventListener('paste', (evt: any) => {
      if (evt.srcElement.className === "textarea-editor" || evt.srcElement.className === 'header-story' || evt.srcElement.className === 'textarea-editor ng-star-inserted') {
        evt.preventDefault();
        let clipdata = evt.clipboardData || (<any>window).clipboardData;
        let text = clipdata.getData('text/plain');
        if (evt.srcElement.className === "textarea-editor" || evt.srcElement.className === 'textarea-editor ng-star-inserted') {
          if (evt.type === "paste") {
            this.textLimit = this.textLimit + text.length;
            if (this.textLimit > 280) {
              text = text.substr(0, 280);
              this.textLimit = text.length;
              event.preventDefault();
            }
          } else {
            this.textLimit = text.length;
          }
        }
        document.execCommand('insertText', false, text);
      }
    });
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

  public getTitleHtml() {
    let testHtml = document.getElementById(this.selectIndex).innerHTML
    this.ary[this.selectIndex].value = testHtml
  }

  public setImageUPload() {
    this.isImageUPload = !this.isImageUPload
  }

  public setImageBG(image) {
    this.image = image.image
    this.coverImage = image
    this.isSelectImage = false
  }

  public switImage() {
    this.isImageUPload = false
    this.isSelectImage = !this.isSelectImage
  }

  public selectType(value) {
    if (value === "เติมเต็ม") {
      this.typeStroy = POST_TYPE.FULFILLMENT;
    } else if (value === this.PLATFORM_NEEDS_TEXT) {
      this.activeLink === 'กำลัง' + this.PLATFORM_NEEDS_TEXT

    } else {
      this.typeStroy = POST_TYPE.GENERAL;
    }
  }

  public getDateTime() {
    return moment().locale("th").format('LLLL');
  }

  private isEmptyString(value: string): boolean {
    if (value === undefined || value === '') {
      return true;
    }

    const regEx = /^\s+$/;
    if (value.match(regEx)) {
      return true;
    }
    return false;
  }

  public onConfirm(): void {
    let index: number = 0

    if (this.image === undefined || this.image === null) {

      return this.showAlertDevelopDialog("กรุณาอัพโหลดรูปปก");

    }

    for (let n of this.ary) {
      if (n.htmlType === "TEXT") {
        n.value = document.getElementById(index.toString()).innerHTML
      }
      index++
    }
    let asset = { data: this.image.split(',')[1], name: this.coverImage.name, type: this.coverImage.type, size: this.coverImage.size }
    let story = document.getElementById("storybody").innerHTML
    let coverImages: any = { img64: this.image, asset: asset }
    let data = { story: story, storyAry: this.ary, coverImages: coverImages }
    this.dialogRef.close(data);
  }

  public reSetFrom() {
    this.linkUrl = null;
    this.linkText = null;
    this.imageUrl = null;
    this.imageDetail = null;
    this.videoUrl = null;
    this.videoDetail = null;
    this.LinkNewTeb = false;
    this.isImage = true
    this.isImageLink = false
    this.isLink = true
    this.isVideo = true
    this.isTitleText = true
    this.isComponent = false
    this.isSelectImage = false
    this.isImageUPload = false
    this.isLeft = true
    this.isCenter = true
    this.isRight = true
  }

  public onConfirmFrom(type): void {
    if (type === "LINK") {
      this.ary[this.selectIndex].value = this.linkText
      this.ary[this.selectIndex].link = this.linkUrl
      this.ary[this.selectIndex].isNewTeb = this.LinkNewTeb
      // this.reSetFrom();
    } else if (type === "IMAGE") {
      if (this.imageUrl !== undefined && this.imageUrl !== null) {
        this.ary[this.selectIndex].image64 = this.imageUrl
      }
      if (this.imageDetail !== undefined && this.imageDetail !== null) {
        this.ary[this.selectIndex].imageDetail = this.imageDetail
      }
      this.ary[this.selectIndex].isNewTeb = this.isImageLink
      this.ary[this.selectIndex].style.imageSize = this.imageSize
    } else if (type === "VIDEO") {
      var unit = this.videoUrl
      var index1 = unit.indexOf('v=')
      var index2 = unit.indexOf('&')
      if (index2 > 0) {
        this.video = (this.path + unit.substring(index1 + 2, index2));
      } else {
        this.video = (this.path + unit.substring(index1 + 2));
      }
      this.ary[this.selectIndex].videoUrl = this.videoUrl
      this.ary[this.selectIndex].videoDetail = this.videoDetail
      var div = document.getElementById(("iframeV" + this.selectIndex));
      div.setAttribute("src", this.video);
    }
  }

  public onClose(): void {
    if (this.ary.length > 0) {
      let dialog = this.showAlertDialogWarming("คุณยังไม่บันทึก" + this.PLATFORM_STORY_TALE + "ของคุณ?", "ยกเลิก")
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.dialogRef.close(null);
        }
      });
    }
    this.dialogRef.close(null);
  }

  private stopLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  public getVideo(data) {
    this.isVideo = true

    var div = document.createElement("div");
    div.className = "image-component"
    div.id = this.storyIndex

    document.getElementById("story").appendChild(div);



    setTimeout(() => {

      var iframe = document.createElement("iframe");
      iframe.setAttribute("src", data.link);
      iframe.className = "video"

      var span = document.createElement("div");
      span.innerText = data.dis

      document.getElementById(this.storyIndex).appendChild(iframe);
      document.getElementById(this.storyIndex).appendChild(span);

      // var div2 = document.createElement("div");
      // div2.innerText = '-'
      // div2.className = "delete"
      // function myFunction() {
      //   document.getElementById(iframe.id).remove();
      // }
      // div2.onclick = myFunction;
      // document.getElementById(this.storyIndex).appendChild(div2);
      this.storyIndex++

    }, 200);
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.ary, event.previousIndex, event.currentIndex);
  }

  public text() {
    this.ary[this.selectIndex].htmlType = "TEXT"
    this.ary[this.selectIndex].style = { textalign: "left", fontsize: "16px" }
    this.isText = !this.isText
    this.isImage = true
    this.isLink = true
    this.isVideo = true
    this.isTitleText = true
    this.setTextEditor()
    this.component()
    // $(() => {
    //   $.fn.atwho.debug = true
    //   var at_config = {
    //     at: "@",
    //     insertTpl: '<span class="tribute-container">${displayName}</span>',
    //     displayTpl: '<li >${displayName}</li>',
    //     delay: 100,
    //     limit: 10,
    //     searchKey: 'displayName',
    //     callbacks: {
    //       remoteFilter: (query, callback) => {
    //         $.ajax({
    //           url: this.apiBaseURL + '/user/tag/',
    //           beforeSend: (xhr) => {
    //             xhr.setRequestHeader('Authorization', "Bearer " + sessionStorage.getItem('token'));
    //           },
    //           type: "POST",
    //           dataType: "json",
    //           data: {
    //             name: query ? query : ""
    //           },
    //           success: (data) => {
    //             this.user = data
    //             callback(data);
    //           }
    //         });
    //       }
    //     }
    //   }
    //   var hashTag_config = {
    //     at: "#",
    //     searchKey: 'value',
    //     insertTpl: '<span class="tribute-container-hashtag">#${value}</span>&nbsp',
    //     displayTpl: "<li class='list-add-hashtaggg'>${value}</li>",
    //     delay: 100,
    //     limit: 10,
    //     callbacks: {
    //       remoteFilter: (query, callback) => {
    //         let searchFilter: SearchFilter = new SearchFilter();
    //         searchFilter.whereConditions = {
    //           name: query
    //         };
    //         this.hashTagFacade.searchTrend(searchFilter).then(res => {
    //           callback(res);
    //           this.choiceTag = res;
    //         }).catch(error => {
    //           console.log(error);
    //         });
    //       },
    //     }
    //   }
    //   if (this.isListPage) {
    //     $('#textarea-story-editor').focus().atwho('run');
    //     $('#editableStory').atwho(at_config).atwho(hashTag_config);
    //     $('#editableStory').atwho(at_config).atwho(at_config);

    //     $('#header-story').focus().atwho('run');
    //     $('#topic').atwho(at_config).atwho(hashTag_config);
    //     $('#topic').atwho(at_config).atwho(at_config);
    //   } else {
    //     $('#textarea-story-editor').focus().atwho('run');
    //     $('#editableStory').atwho(at_config).atwho(hashTag_config);
    //     $('#editableStory').atwho(at_config).atwho(at_config);

    //     $('#header-story').focus().atwho('run');
    //     $('#topic').atwho(at_config).atwho(hashTag_config);
    //     $('#topic').atwho(at_config).atwho(at_config);
    //   }
    // });
    // this.updateText();
  }

  public setTextEditor() {
    if (this.isTextEditor) {
      setTimeout(() => {
        var colorPalette = ['000000', 'FF9966', '6699FF', '99FF66', 'CC0000', '00CC00', '0000CC', '333333', '0066FF', 'FFFFFF'];
        var forePalette = $('.fore-palette');
        var backPalette = $('.back-palette');
        for (var i = 0; i < colorPalette.length; i++) {
          forePalette.append('<a href="#" data-command="forecolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="palette-item"></a>');
          backPalette.append('<a href="#" data-command="backcolor" data-value="' + '#' + colorPalette[i] + '" style="background-color:' + '#' + colorPalette[i] + ';" class="palette-item"></a>');
        }

        $('.toolbar a').click(function (e) {
          var command = $(this).data('command');
          if (command == 'h1' || command == 'h2' || command == 'p') {
            document.execCommand('formatBlock', false, command);
          }
          if (command == 'forecolor' || command == 'backcolor') {
            document.execCommand($(this).data('command'), false, $(this).data('value'));
          }
          if (command == 'createlink' || command == 'insertimage') {
            let url = prompt('www.google.com', 'http:\/\/'); document.execCommand($(this).data('command'), false, url);
          }
          else document.execCommand($(this).data('command'), false, null);
        });
        this.isTextEditor = false
      }, 1000);
    }
  }

  public Image() {
    this.ary[this.selectIndex].htmlType = "IMAGE"
    this.ary[this.selectIndex].imageUrl = "https://ssudjai.dblog.org/img/default.jpg"
    this.ary[this.selectIndex].imageDetail = ""
    this.ary[this.selectIndex].style = { imageSize: "50%", imagealign: "center" }
    this.isText = true
    this.isLink = true
    this.isVideo = true
    this.isTitleText = true
    this.isImage = !this.isImage
    this.component()
  }

  public Link() {
    this.ary[this.selectIndex].htmlType = "LINK"
    this.ary[this.selectIndex].style = { textalign: "left", fontsize: "16px" }
    this.ary[this.selectIndex].value = "Link Text"
    this.isText = true
    this.isImage = true
    this.isVideo = true
    this.isTitleText = true
    this.isLink = !this.isLink
    this.component()
  }

  public Video() {
    this.ary[this.selectIndex].htmlType = "VIDEO"
    this.ary[this.selectIndex].style = { videoSize: "50%", imagealign: "center" }
    this.isText = true
    this.isImage = true
    this.isLink = true
    this.isTitleText = true
    this.isVideo = !this.isVideo
    this.component()
  }

  public Title(value?) {
    let text = document.getElementById(this.selectIndex).innerText
    if (value) {
      if (value === "h1") {
        this.ary[this.selectIndex].style.fontsize = "32px"
      } else if (value === "h2") {
        this.ary[this.selectIndex].style.fontsize = "24px"
      } else if (value === "h3") {
        this.ary[this.selectIndex].style.fontsize = "18px"
      } else if (value === "h4") {
        this.ary[this.selectIndex].style.fontsize = "16px"
      } else if (value === "h5") {
        this.ary[this.selectIndex].style.fontsize = "13px"
      }
    } else {
      this.ary[this.selectIndex].htmlType = "TITLE"
      this.ary[this.selectIndex].style = { textalign: "left", fontsize: "16px", fontweight: "600" }
      this.isText = true
      this.isImage = true
      this.isLink = true
      this.isVideo = true
      this.isTitleText = !this.isTitleText
      document.getElementById(this.selectIndex).innerText = text
      this.component()
    }
  }

  public titleActive(value) {
    if (this.ary.length > 0) {
      if (this.ary[this.selectIndex] !== null && this.ary[this.selectIndex] !== undefined) {
        if (value === "H1") {
          if (this.ary[this.selectIndex].style.fontsize === "32px") {
            return true
          } else {
            return false
          }
        } else if (value === "H2") {
          if (this.ary[this.selectIndex].style.fontsize === "24px") {
            return true
          } else {
            return false
          }
        } else if (value === "H3") {
          if (this.ary[this.selectIndex].style.fontsize === "18px") {
            return true
          } else {
            return false
          }
        } else if (value === "H4") {
          if (this.ary[this.selectIndex].style.fontsize === "16px") {
            return true
          } else {
            return false
          }
        } else if (value === "H5") {
          if (this.ary[this.selectIndex].style.fontsize === "13px") {
            return true
          } else {
            return false
          }
        }
      }
    }
  }

  public component() {
    this.isComponent = !this.isComponent
  }

  public onFileSelect(event) {
    let file = event.target.files[0];
    if (file.length === 0) {
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.files.push({ file });
        var b64 = reader.result;
        // this.image = b64
        this.ary[this.selectIndex].image64 = b64
      }
      reader.readAsDataURL(file);
    }
    this.ary[this.selectIndex].image64 = this.image
  }

  public filesDropped(files: FileHandle[]): void {
    let file = files[0].file
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.files.push({ file });
        var b64 = reader.result;
        // this.image = b64
        this.ary[this.selectIndex].image64 = b64
      }
      reader.readAsDataURL(file);
    }
    this.ary[this.selectIndex].image64 = this.image
  }

  public onFileSelectB(event) {
    let file = event.target.files[0];
    if (file.length === 0) {
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.coverImage = file;
        var b64 = reader.result;
        this.image = b64
        this.isImageUPload = false
      }
      reader.readAsDataURL(file);
    }
  }

  public testCom() {
    this.reSetFrom();
    let story: Storycomponent = new Storycomponent();
    story.htmlType = "TEXT"
    story.style = { textalign: "left", fontsize: "16px" }
    this.ary.push(story)
    let num: any = this.ary.length - 1
    this.selectIndex = num
    // setTimeout(() => {
    //   document.getElementById(num).focus();
    // }, 200);
    this.isText = false
    this.isImage = true
    this.isLink = true
    this.isTitleText = true
    this.isVideo = true
    this.isLeft = true
    this.isCenter = true
    this.isRight = true
    this.setTextEditor()
  }

  public textType(value): boolean {
    if (value === "TEXT") {
      return true
    } else {
      return false
    }
  }

  public imageType(value): boolean {
    if (value === "IMAGE") {
      return true
    } else {
      return false
    }
  }

  public videoType(value): boolean {
    if (value === "VIDEO") {
      return true
    } else {
      return false
    }
  }

  public titleType(value): boolean {
    if (value === "TITLE") {
      return true
    } else {
      return false
    }
  }

  public linkType(value): boolean {
    if (value === "LINK") {
      return true
    } else {
      return false
    }
  }

  public align(value) {
    if (this.titleType(this.ary[this.selectIndex].htmlType)) {
      this.ary[this.selectIndex].style.textalign = value
    } else if (this.textType(this.ary[this.selectIndex].htmlType)) {
      this.ary[this.selectIndex].style.textalign = value
    } else if (this.linkType(this.ary[this.selectIndex].htmlType)) {
      this.ary[this.selectIndex].style.textalign = value
    } else if (this.imageType(this.ary[this.selectIndex].htmlType)) {
      if (value === "left") {
        this.ary[this.selectIndex].style.imagealign = "flex-start"
      } else if (value === "right") {
        this.ary[this.selectIndex].style.imagealign = "flex-end"
      } else {
        this.ary[this.selectIndex].style.imagealign = value
      }
    } else if (this.videoType(this.ary[this.selectIndex].htmlType)) {
      if (value === "left") {
        this.ary[this.selectIndex].style.imagealign = "flex-start"
      } else if (value === "right") {
        this.ary[this.selectIndex].style.imagealign = "flex-end"
      } else {
        this.ary[this.selectIndex].style.imagealign = value
      }
    }
    this.alignActive(value)
  }

  public componentDelete(index?, item?) {
    if (item === 0) {
      item = this.ary[index]
    }
    if (this.titleType(item.htmlType)) {
      let text = document.getElementById(index).innerText
      if (text !== '' && text !== undefined && text !== null) {
        let dialog = this.showAlertDialogWarming("คุณต้องการลบหัวข้อออกใช่ไหม ?", "ยกเลิก")
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (index !== null && index !== undefined) {
              this.ary.splice(index, 1)
            } else {
              this.ary.splice(this.selectIndex, 1)
            }
            this.selectIndex = null
            this.reSetFrom();
          }
        });
      } else {
        if (index !== null && index !== undefined) {
          this.ary.splice(index, 1)
        } else {
          this.ary.splice(this.selectIndex, 1)
        }
        this.selectIndex = null
        this.reSetFrom();
      }
    } else if (this.textType(item.htmlType)) {
      let text = document.getElementById(index).innerText
      if (text !== '' && text !== undefined && text !== null) {
        let dialog = this.showAlertDialogWarming("คุณต้องการลบ" + this.PLATFORM_STORY_TALE + "ออกใช่ไหม ?", "ยกเลิก")
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (index !== null && index !== undefined) {
              this.ary.splice(index, 1)
            } else {
              this.ary.splice(this.selectIndex, 1)
            }
            this.selectIndex = null
            this.reSetFrom();
          }
        });
      } else {
        if (index !== null && index !== undefined) {
          this.ary.splice(index, 1)
        } else {
          this.ary.splice(this.selectIndex, 1)
        }
        this.selectIndex = null
        this.reSetFrom();
      }
    } else if (this.linkType(item.htmlType)) {
      if (item.link !== '' && item.link !== undefined && item.link !== null) {
        let dialog = this.showAlertDialogWarming("คุณต้องการลบใช่ไหม ?", "ยกเลิก")
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (index !== null && index !== undefined) {
              this.ary.splice(index, 1)
            } else {
              this.ary.splice(this.selectIndex, 1)
            }
            this.selectIndex = null
            this.reSetFrom();
          }
        });
      } else {
        if (index !== null && index !== undefined) {
          this.ary.splice(index, 1)
        } else {
          this.ary.splice(this.selectIndex, 1)
        }
        this.selectIndex = null
        this.reSetFrom();
      }
    } else if (this.imageType(item.htmlType)) {
      if (item.image64 !== '' && item.image64 !== undefined && item.image64 !== null && item.imageUrl !== '') {
        let dialog = this.showAlertDialogWarming("คุณต้องการลบใช่ไหม ?", "ยกเลิก")
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (index !== null && index !== undefined) {
              this.ary.splice(index, 1)
            } else {
              this.ary.splice(this.selectIndex, 1)
            }
            this.selectIndex = null
            this.reSetFrom();
          }
        });
      } else {
        if (index !== null && index !== undefined) {
          this.ary.splice(index, 1)
        } else {
          this.ary.splice(this.selectIndex, 1)
        }
        this.selectIndex = null
        this.reSetFrom();
      }
    } else if (this.videoType(item.htmlType)) {
      if (item.videoUrl !== '' && item.videoUrl !== undefined && item.videoUrl !== null) {
        let dialog = this.showAlertDialogWarming("คุณต้องการลบใช่ไหม ?", "ยกเลิก")
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (index !== null && index !== undefined) {
              this.ary.splice(index, 1)
            } else {
              this.ary.splice(this.selectIndex, 1)
            }
            this.selectIndex = null
            this.reSetFrom();
          }
        });
      } else {
        if (index !== null && index !== undefined) {
          this.ary.splice(index, 1)
        } else {
          this.ary.splice(this.selectIndex, 1)
        }
        this.selectIndex = null
        this.reSetFrom();
      }
    }
    this.reSetFrom
  }

  public showAlertDialog(text: any, cancelText?: string): void {
    this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: text,
        bottomText1: (cancelText) ? cancelText : MESSAGE.TEXT_BUTTON_CANCEL,
        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
  }

  public alignActive(align) {
    if (align === "left") {
      this.isLeft = false;
      this.isRight = true;
      this.isCenter = true;
    } else if (align === "center") {
      this.isCenter = false;
      this.isLeft = true;
      this.isRight = true;
    } else if (align === "right") {
      this.isRight = false;
      this.isCenter = true;
      this.isLeft = true;
    }
  }

  public getDataInSelect(index, item) {
    this.selectIndex = index;
    if (this.titleType(item.htmlType)) {
      this.isText = true;
      this.isImage = true;
      this.isLink = true;
      this.isTitleText = false;
      this.isVideo = true;
      this.alignActive(item.style.textalign);
    } else if (this.textType(item.htmlType)) {
      this.isText = false;
      this.isImage = true;
      this.isLink = true;
      this.isTitleText = true;
      this.isVideo = true;
      this.setTextEditor();
      this.alignActive(item.style.textalign);
    } else if (this.linkType(item.htmlType)) {
      this.isText = true;
      this.isImage = true;
      this.isLink = false;
      this.isTitleText = true;
      this.isVideo = true;
      this.linkUrl = this.ary[index].link;
      this.linkText = this.ary[index].value;
      this.LinkNewTeb = this.ary[index].isNewTeb;
      this.alignActive(item.style.textalign);
    } else if (this.imageType(item.htmlType)) {
      this.isText = true;
      this.isImage = false;
      this.isLink = true;
      this.isTitleText = true;
      this.isVideo = true;
      this.imageUrl = this.ary[index].imageUrl;
      this.imageDetail = this.ary[index].imageDetail;
      this.isImageLink = this.ary[index].isNewTeb;
      this.imageSize = this.ary[index].style.imageSize;
      if (item.style.imagealign === "flex-start") {
        this.alignActive("left");
      } else if (item.style.imagealign === "flex-end") {
        this.alignActive("right");
      } else {
        this.alignActive("center");
      }
    } else if (this.videoType(item.htmlType)) {
      this.isText = true;
      this.isImage = true;
      this.isLink = true;
      this.isTitleText = true;
      this.isVideo = false;
      this.videoUrl = this.ary[index].videoUrl;
      this.videoDetail = this.ary[index].videoDetail;
      if (item.style.imagealign === "flex-start") {
        this.alignActive("left");
      } else if (item.style.imagealign === "flex-end") {
        this.alignActive("right")
      } else {
        this.alignActive("center")
      }
    }

  }

  public setTextStyles(type) {
    var text = this.selection;
    var inputText = document.getElementById(this.selectIndex);
    var innerHTML = inputText.innerHTML;
    var innerText = inputText.innerText
    var index = innerText.indexOf(text);

    if (type.includes("B")) {
      innerHTML = innerHTML.substring(0, index) + "<strong>" + innerHTML.substring(index, index + text.length) + "</strong>" + innerHTML.substring(index + text.length);
      inputText.innerHTML = innerHTML;
    } else if (type.includes("I")) {
      innerHTML = innerHTML.substring(0, index) + "<em>" + innerHTML.substring(index, index + text.length) + "</em>" + innerHTML.substring(index + text.length);
      inputText.innerHTML = innerHTML;
    } else if (type.includes("U")) {
      innerHTML = innerHTML.substring(0, index) + "<u>" + innerHTML.substring(index, index + text.length) + "</u>" + innerHTML.substring(index + text.length);
      inputText.innerHTML = innerHTML;
    }
  }

  public removeCoverImage() {
    this.coverImage.id = null;
    this.image = null;
    this.isImageUPload = false
  }

}

