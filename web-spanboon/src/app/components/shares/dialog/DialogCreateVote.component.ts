/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, ThemePalette } from '@angular/material';
import { AbstractPage } from '../../pages/AbstractPage';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FormControl } from '@angular/forms';
import { FileHandle } from '../directive/DragAndDrop.directive';
import * as $ from 'jquery';
import { Asset } from 'src/app/models/Asset';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { VoteEventFacade } from 'src/app/services/facade/VoteEventFacade.service';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { DialogAlert } from './DialogAlert.component';
import { P } from '@angular/cdk/keycodes';
import { UserAccessFacade } from 'src/app/services/facade/UserAccessFacade.service';

const PAGE_NAME: string = 'createvote';

@Component({
  selector: 'dialog-create-vote',
  templateUrl: './DialogCreateVote.component.html',
})
export class DialogCreateVote extends AbstractPage {
  public static readonly PAGE_NAME: string = PAGE_NAME;
  private input = new Subject<string>();
  private readonly debounceTimeMs = 500;
  inputText: string = '';

  @ViewChild('pickerStart', { static: false }) pickerStart: any;
  @ViewChild('pickerEnd', { static: false }) pickerEnd: any;
  @ViewChild('answer', { static: false }) answer: ElementRef;
  @ViewChild('voteContent', { static: false }) voteContent: ElementRef;

  private voteFacade: VoteEventFacade;
  private userAccessFacade: UserAccessFacade;
  public dialog: MatDialog;
  public apiBaseURL = environment.apiBaseURL;

  public stepHour = 1;
  public stepMinute = 1;
  public color: ThemePalette = 'primary';
  public isAddQuestion: boolean = false;
  public isLoading: boolean = false;
  public voteQuestionType: string = undefined;
  public listQuestion: any[] = [];
  public listQuestionImg: any[] = [];
  public listAnswers: any[] = [];
  public indexPage: any;
  public lastIndexPage: number;
  public typeQuestion: any = 'settings';

  public minSupport: number = 500;
  public countSupport: number = 0;
  public title: any;
  public detail: any;
  public selectTypeUser: string = 'สมาชิก';
  public hashtag: any;
  public selectUser: any = undefined;
  public createAsPage: any = null;
  public type: string = 'public';
  public status: string = 'support';
  public isShowVoterName: boolean = false;
  public isShowVoteResult: boolean = false;
  public voteItem: any[] = [];
  public files: FileHandle[] = [];
  public imageCoverSize: number;
  public isSelectImage: boolean = false;
  public thanksMessage: any;
  public listInputAns = [0, 1, 2, 3];
  public listHashtag: any[] = [];
  public userPage: any;
  public user: any;
  public image = {
    assetId: null,
    coverPageURL: null,
    s3CoverPageURL: null
  };

  public hashTag = new FormControl();
  public filteredOptions: Observable<string[]>;

  //question variable
  public titleQuestion: any;
  public indexQuestion = 1;

  public dateStart = new FormControl(new Date());
  public dateEnd = new FormControl(new Date());

  constructor(public dialogRef: MatDialogRef<DialogCreateVote>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    voteFacade: VoteEventFacade,
    userAccessFacade: UserAccessFacade,
    private changeDetectorRef: ChangeDetectorRef,
    dialog: MatDialog, authenManager: AuthenManager, router: Router) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.voteFacade = voteFacade;
    this.userAccessFacade = userAccessFacade;
  }

  public ngOnInit() {
    this._setDate();
    this._getAccessUser();
    this._getVoteHashtag();

    this.filteredOptions = this.hashTag.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.input
      .pipe(debounceTime(this.debounceTimeMs))
      .subscribe((text) => {
        this._performInput();
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.listHashtag.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _performInput() {
    this.clickSave(this.indexPage);
  }

  public onType() {
    this.input.next(this.inputText);
  }

  public ngOnDestroy() {
    this.input.complete();
  }

  public ngAfterViewInit(): void {
  }

  private _setDate() {
    let date_start = new Date();
    let date_end = new Date();
    date_start.setHours(0, 0, 0, 0);
    date_end.setHours(23, 59, 59, 0);
    date_end.setDate(date_end.getDate() + 15);
    this.dateStart = new FormControl(date_start);
    this.dateEnd = new FormControl(date_end);
  }

  public onClose(isSkip?: boolean, type?: string): void {
    if (isSkip) {
      if (!!type) {
        this.dialogRef.close(type);
      } else {
        this.dialogRef.close(true);
      }
    } else {
      if (!!this.title ||
        !!this.detail ||
        this.listQuestion.length > 0) {
        let dialog = this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: 'ต้องการที่จะปิดหน้านี้ใช่หรือไม่',
            bottomText1: 'ไม่',
            bottomText2: 'ใช่',
          }
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            this.dialogRef.close(false);
          }
        });
      } else {
        this.dialogRef.close(false);
      }
    }
  }

  isPageDirty(): boolean {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }

  public selectType() {
    if (this.selectTypeUser === 'ทั่วไป') {
      this.type = 'public';
    } else {
      this.type = 'member';
    }
  }

  public selectHashtag($event) {
    this.hashtag = $event.value;
  }

  public selectUserCreate($event) {
    if (this.selectUser.id === this.user.id) {
      this.createAsPage = null;
    } else {
      this.createAsPage = this.selectUser.id;
    }
  }

  public clickAddQuestion() {
    this.isAddQuestion = true;
  }

  public selectVoteQuestionType(type: string) {
    this.voteQuestionType = type;
  }

  public back() {
    this.isAddQuestion = false;
  }

  public next(type: string) {
    if (type !== undefined) {
      this.listQuestion.push({
        ordering: this.indexQuestion,
        titleItem: '',
        typeChoice: type,
        assetIdItem: null,
        coverPageURLItem: null,
        s3CoverPageURLItem: null,
        voteChoice: type !== 'text' ? [
          {
            title: '',
            assetId: null,
            coverPageURL: null,
            s3CoverPageURL: null
          },
          {
            title: '',
            assetId: null,
            coverPageURL: null,
            s3CoverPageURL: null
          },
          {
            title: '',
            assetId: null,
            coverPageURL: null,
            s3CoverPageURL: null
          },
          {
            title: '',
            assetId: null,
            coverPageURL: null,
            s3CoverPageURL: null
          }
        ] : [],
      });
      this.indexQuestion++;
      this.isAddQuestion = false;
      this.lastIndexPage = this.listQuestion.length - 1
      this.changeQuestion(this.indexQuestion - 2, type, true);
      // this.voteQuestionType = undefined;
    }
  }

  public changeQuestion(page, type?, isCreate?) {
    if (isCreate !== true) {
      this.voteContent.nativeElement.scrollTop = 0;
    }
    if (type === 'settings') {
      this.indexPage = page;
      this.typeQuestion = type;
      this.titleQuestion = undefined;
      this.listInputAns = [0, 1, 2, 3];
    } else {
      this.indexPage = page;
      this.typeQuestion = type;
      this.titleQuestion = undefined;
      this.listInputAns = [0, 1, 2, 3];
      if (!isCreate && type !== 'thanks') {
        this.setFieldData(page);
      }
    }
  }

  public setFieldData(index, isTitle?, isText?) {
    if (isText) {
      this.listQuestion[index].titleItem = this.titleQuestion;
      return;
    }
    if (!!this.listQuestion[index]!.titleItem) {
      this.titleQuestion = this.listQuestion[index].titleItem;
    }
    let data = this.listQuestion[index];
    if (data.voteChoice.length > 4) {
      this.listInputAns = [];
      for (let i = 0; i < data.voteChoice.length; i++) {
        this.listInputAns.push(i);
      }
    }
    if (this.typeQuestion !== 'text') {
      if (data.voteChoice.length === this.listInputAns.length && data.voteChoice[data.voteChoice.length - 1].title !== '') {
        this.listInputAns.push(this.listInputAns.length);
      }
    }
    this.changeDetectorRef.detectChanges();
    let input: HTMLInputElement[] = Array.from(document.getElementsByName('answer')) as HTMLInputElement[];
    for (var i = 0; i < data.voteChoice.length; i++) {
      input[i].value = data.voteChoice[i].title;
    }
  }

  public createVote() {
    this.isLoading = true;
    let data = {
      title: this.title,
      detail: this.detail,
      assetId: !!this.image ? this.image.assetId : null,
      coverPageURL: this.image ? this.image.coverPageURL : null,
      s3CoverPageURL: this.image ? this.image.s3CoverPageURL : null,
      approved: false,
      closed: false,
      minSupport: this.minSupport,
      count_support: this.countSupport,
      startVoteDatetime: new Date(this.dateStart.value.getTime()).toISOString(),
      endVoteDatetime: new Date(this.dateEnd.value.getTime()).toISOString(),
      status: this.status,
      createAsPage: this.createAsPage,
      type: this.type,
      hashTag: this.hashTag.value !== '' ? this.hashTag.value : "",
      pin: false,
      showVoterName: this.isShowVoterName,
      showVoteResult: this.isShowVoteResult,
      service: this.thanksMessage,
      voteItem: this.listQuestion
    }
    if (data.title === undefined || data.title === '') {
      this.showAlertDialog("กรุณากรอกชื่อโหวต");
      this.isLoading = false;
      return;
    }
    if (data.detail === undefined || data.detail === '') {
      this.showAlertDialog("กรุณากรอกรายละเอียดโหวต");
      this.isLoading = false;
      return;
    }
    if (data.voteItem.length === 0) {
      this.showAlertDialog("กรุณาเพิ่มคำถามของโหวต");
      this.isLoading = false;
      return;
    }
    if (data.voteItem.length > 0) {
      for (let index = 0; index < data.voteItem.length; index++) {
        if (data.voteItem[index].voteChoice.length === 0 && data.voteItem[index].typeChoice !== 'text') {
          this.showAlertDialog("กรุณาเพิ่มคำตอบของคำถาม");
          this.isLoading = false;
          return;
        }
      }
    }

    for (let index = 0; index < this.listQuestion.length; index++) {
      if (this.listQuestion[index].titleItem === '') {
        let dialog = this.dialog.open(DialogAlert, {
          disableClose: true,
          data: {
            text: "กรุณาตั้งคำถามโหวตข้อ " + (index + 1) + "",
            bottomText2: "ตกลง",
            bottomColorText2: "black",
            btDisplay1: "none"
          }
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (index !== this.indexPage) {
              this.changeQuestion(index, this.listQuestion[index].typeChoice);
            }
          }
        })
        this.isLoading = false;
        return;
      }
      for (let i = 0; i < this.listQuestion[index].voteChoice.length; i++) {
        if (this.listQuestion[index].voteChoice[i].title === '' && i <= 1) {
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: "กรุณาตั้งตัวเลือกโหวตข้อ " + (index + 1) + " ตัวเลือกที่ " + (i + 1) + "",
              bottomText2: "ตกลง",
              bottomColorText2: "black",
              btDisplay1: "none"
            }
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              if (index !== this.indexPage) {
                this.changeQuestion(index, this.listQuestion[index].typeChoice);
              }
            }
          });
          this.isLoading = false;
          return;
        }
        if (this.listQuestion[index].voteChoice[i].title === '' || this.listQuestion[index].voteChoice[i].title === undefined) {
          this.listQuestion[index].voteChoice.splice(i, 1);
          this.listQuestion[index].voteChoice.splice(i, 1);
        }
      }
    }

    if (data.createAsPage === null) {
      this.voteFacade.createVote(data).then((res) => {
        if (res) {
          this.isLoading = false;
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: 'คุณสร้างโหวตสำเร็จ',
              bottomText1: 'ตกลง',
              btDisplay1: "none"
            }
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.onClose(true, 'create');
            }
          });
        }
      }).catch((err) => {
        if (err) {
          if (err.error.message === 'End vote date is less than today.') {
            this.isLoading = false;
            this.showAlertDialog("วันสิ้นสุดโหวตไม่สามารถต่ำกว่าหนึ่งวัน");
          }
          if (err.error.message === 'Cannot create a voting Item, Vote Choice is empty.') {
            this.isLoading = false;
            this.showAlertDialog("กรุณาเพิ่มคำถามของโหวต");
          }
          if (err.error.message === 'You have no permission to create the vote event.') {
            this.isLoading = false;
            this.showAlertDialog("คุณไม่มีสิทธิ์สร้างกิจกรรมโหวต");
          }
        }
      });
    } else {
      this.voteFacade.createVoteAsPage(data, data.createAsPage).then((res) => {
        if (res) {
          this.isLoading = false;
          let dialog = this.dialog.open(DialogAlert, {
            disableClose: true,
            data: {
              text: 'คุณสร้างโหวตสำเร็จ',
              bottomText1: 'ตกลง',
              btDisplay1: "none"
            }
          });
          dialog.afterClosed().subscribe((res) => {
            if (res) {
              this.onClose(true);
            }
          });
        }
      }).catch((err) => {
        if (err) {
          if (err.error.message === 'End vote date is less than today.') {
            this.isLoading = false;
            this.showAlertDialog("วันสิ้นสุดโหวตไม่สามารถต่ำกว่าหนึ่งวัน");
          }
          if (err.error.message === 'Cannot create a voting Item, Vote Choice is empty.') {
            this.isLoading = false;
            this.showAlertDialog("กรุณาเพิ่มคำถามของโหวต");
          }
          if (err.error.message === 'You have no permission to create the vote event.') {
            this.isLoading = false;
            this.showAlertDialog("คุณไม่มีสิทธิ์สร้างกิจกรรมโหวต");
          }
        }
      });
    }
  }

  public clickSave(index) {
    let input: HTMLInputElement[] = Array.from(document.getElementsByName('answer')) as HTMLInputElement[];
    for (var i = 0; i < input.length; i++) {
      let value = input[i].value;
      if (input[i].value === '' && this.listInputAns.length > 4) {
        this.listAnswers.splice(i, 1, '');
      } else {
        this.listAnswers.push(value);
      }
      if (i > 3 && input[input.length - 2].value === '' && input.length > 4) {
        this.listInputAns.splice(i, 1);
      }
    }
    if (input[input.length - 1].value !== '' &&
      input[0].value !== '' &&
      input[1].value !== '' &&
      input[2].value !== '' &&
      input[3].value !== '') {
      this.listInputAns.push(this.listInputAns.length);
      this.listQuestion[this.indexPage].voteChoice.push({
        title: '',
        assetId: null,
        coverPageURL: null,
        s3CoverPageURL: null
      });
    }
    for (let i = 0; i < this.listAnswers.length; i++) {
      if (this.listQuestion[index].voteChoice[i] === undefined) {
        this.listQuestion[index].voteChoice.push({
          title: '',
          assetId: null,
          coverPageURL: null,
          s3CoverPageURL: null
        });
      } else {
        this.listQuestion[index].voteChoice[i].title = this.listAnswers[i] !== '' ? this.listAnswers[i] : '';
      }
    }
    this.listQuestion[index].titleItem = this.titleQuestion;
    this.listAnswers = [];
  }

  public onFileSelect(event, type, index?) {
    this.isLoading = true;
    let files = event.target.files[0];
    if (files.length === 0) {
      return;
    }
    if (files) {
      const reader = new FileReader();
      reader.onload = (events: any) => {
        this.imageCoverSize = files.size;
        this.rePositionImage(events.target.result);
        let img64 = events.target.result;
        let datas = img64.split(',');
        const asset = new Asset();
        asset.mimeType = files.type;
        asset.data = datas[1];
        asset.size = files.size;
        asset.fileName = files.name;
        let temp = {
          asset
        }
        if (type === 'question') {
          this.voteFacade.upload(temp).then((res: any) => {
            if (res) {
              this.listQuestion[this.indexPage].assetIdItem = res.data.id;
              this.listQuestion[this.indexPage].coverPageURLItem = '/file/' + res.data.id + '/image';
              this.listQuestion[this.indexPage].s3CoverPageURLItem = res.data.s3FilePath;
              this.isLoading = false;
            }
          }).catch((err: any) => {
            this.isLoading = false;
          })
        } else if (type === 'choice') {
          this.voteFacade.upload(temp).then((res: any) => {
            if (res) {
              this.listQuestion[this.indexPage].voteChoice[index].assetId = res.data.id;
              this.listQuestion[this.indexPage].voteChoice[index].coverPageURL = '/file/' + res.data.id + '/image';
              this.listQuestion[this.indexPage].voteChoice[index].s3CoverPageURL = res.data.s3FilePath;
              this.isLoading = false;
            }
          }).catch((err: any) => {
            this.isLoading = false;
          })
        } else {
          this.voteFacade.upload(temp).then((res: any) => {
            if (res) {
              this.image.assetId = res.data.id;
              this.image.coverPageURL = '/file/' + res.data.id + '/image';
              this.image.s3CoverPageURL = res.data.s3FilePath;
              this.isLoading = false;
            }
          }).catch((err: any) => {
            this.isLoading = false;
          })
        }
      }
      reader.readAsDataURL(files);
    }
  }

  public rePositionImage(image: any) {
    var imgWidth;
    var imgHeight;
    var imgHeightTotal;
    var img = new Image();
    img.src = image;

    $(img).on('load', function () {
      imgWidth = img.width;
      imgHeight = img.height;
      let imgWidthTrue = $('#images').width();
      let imgHeightTrue = $('#images').height();
      let varImg;
      if (imgHeight > imgWidth) {
        varImg = imgHeight / imgWidth;
        varImg = parseFloat(varImg).toFixed(2);
        imgHeightTotal = (imgWidthTrue * varImg) - imgHeightTrue;
      } else if (imgWidth > imgHeight) {
        varImg = imgWidth / imgHeight;
        varImg = parseFloat(varImg).toFixed(2);
        imgHeightTotal = (imgWidthTrue / varImg) - imgHeightTrue;
      } else {
        imgHeightTotal = imgWidthTrue - imgHeightTrue;
      }

      $('#images').css('background-image', 'url(' + img.src + ')');
      $('#images').css('display', 'flex');
      $('#images').css('border-radius', '16px');
    });

    var start_y;
    var newPos;
    var curPos = $('#images').css('background-position-y');
    var mouseDown = false;
    var move = true;

    $('#images').mousedown(function (e) {
      mouseDown = true;
    });

    $(document).mouseup(function () {
      mouseDown = false;
      $('.image').css('background-position-y', curPos)
    });

    $('#images').mouseenter(function (e) {
      start_y = e.clientY;
    });

    $(document).mousemove(function (e) {
      newPos = e.clientY - start_y;
      start_y = e.clientY;

      if (mouseDown) {
        let newPercent = (100 / imgHeight) * newPos;
        newPercent = newPercent * 5;

        if (this.coverImageoldValue !== undefined) {
          if (this.coverImageoldValue >= 100) {
            this.coverImageoldValue = 100;
          } else {
            this.coverImageoldValue += newPercent;
          }

          if (this.coverImageoldValue <= 0) {
            this.coverImageoldValue = 0;
          } else {
            this.coverImageoldValue += newPercent;
          }
        } else {
          if (this.coverImageoldValue >= 100) {
            this.coverImageoldValue = 100;
          } else {
            this.coverImageoldValue = newPercent;
          }

          if (this.coverImageoldValue <= 0) {
            this.coverImageoldValue = 0;
          } else {
            this.coverImageoldValue = newPercent;
          }
        }

        $('#images').css('background-position-y', this.coverImageoldValue + '%');
        curPos = parseInt($('#images').css('background-position-y'));

        if (curPos > 100) {
          curPos = 100;
          $('#images').css('background-position-y', curPos + '%');
          this.position = curPos;
        }
        if (curPos < 0) {
          curPos = 0;
          $('#images').css('background-position-y', curPos + '%');
          this.position = curPos;
        }
      }
    });
    this.isSelectImage = true;
  }

  public movePosition(mode, old_index, new_index) {
    let item = this.listQuestion;
    if (mode === 'down' && old_index < item.length - 1) {
      if (new_index >= item.length) {
        let value = new_index - item.length + 1;
        while (value--) {
          item.push(undefined);
        }
      }
      item.splice(new_index, 0, item.splice(old_index, 1)[0]);
      this.listQuestion[old_index].ordering = new_index;
      this.listQuestion[new_index].ordering = new_index + 1;
      this.indexPage++;
    }
    if (mode === 'up' && old_index !== 0) {
      if (new_index >= item.length) {
        let value = new_index - item.length - 1;
        while (value--) {
          item.push(undefined);
        }
      }
      item.splice(new_index, 0, item.splice(old_index, 1)[0]);
      this.listQuestion[new_index].ordering = old_index;
      this.listQuestion[old_index].ordering = old_index + 1;
      this.indexPage--;
    }
  }

  public removeQuestion(index) {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: 'ต้องการที่จะลบคำถามนี้ใช่หรือไม่',
        bottomText1: 'ไม่',
        bottomText2: 'ใช่',
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        this.listQuestion.splice(index, 1);
        if (index !== 0) {
          this.indexPage--;
          this.indexQuestion--;
        } else {
          this.indexPage = null;
          this.indexQuestion = 1;
        }
      }
    });
  }

  private _getAccessUser() {
    if (this.isLogin()) {
      this.user = this.authenManager.getCurrentUser();
      this.selectUser = this.user.displayName;
      this.userAccessFacade.getPageAccess().then((res) => {
        if (res) {
          this.userPage = res;
        }
      }).catch((err) => {
        if (err) { }
      });
    }
  }

  private _getVoteHashtag() {
    this.voteFacade.getVoteHashtag().then((res) => {
      if (res) {
        this.listHashtag = res;
      }
    }).catch((err) => {
      if (err) { }
    });
  }
}
