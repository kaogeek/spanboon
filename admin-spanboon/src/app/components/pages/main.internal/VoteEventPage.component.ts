/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractPage } from '../AbstractPage.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningComponent } from '../../shares/DialogWarningComponent.component';
import { DialogImagePreview } from '../../shares/DialogImagePreview.component';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { Router } from '@angular/router';
import { VoteEventFacade } from '../../../services/facade/VoteEventFacade.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DialogAddNoti } from '../../shares/DialogAddNoti.component';
import { LoadingService } from '../../../services/loading/loading.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


const PAGE_NAME: string = "vote";

const SEARCH_LIMIT: number = 20;
const SEARCH_OFFSET: number = 0;


@Component({
  selector: 'admin-vote-page',
  templateUrl: './VoteEventPage.component.html'
})
export class VoteEventPage extends AbstractPage implements OnInit {

  public static readonly PAGE_NAME: string = PAGE_NAME;
  @ViewChild('myInput') myInputVariable: ElementRef;
  @ViewChild('inputOrder') public inputOrder: ElementRef;

  public baseURL: string;
  public voteEventFacade: VoteEventFacade;
  private authenManager: AuthenManager;
  private router: Router;
  private loadingService: LoadingService;

  public isSendNoti: boolean = false;
  public isHaveVoteEvent: boolean = false;
  public edit: boolean = false;
  public preview: boolean = false;
  public valueClosed: boolean = false;
  public valueApproved: boolean = false;
  public valuePin: boolean = false;
  public valueShowName: boolean = false;
  public valueShowResult: boolean = false;
  public valueStatus: any;
  public valueStartSupport: any;
  public valueEndSupport: any;
  public valueStartVote: any;
  public valueEndVote: any;
  public valueTitle: any;
  public valueDetail: any;
  public valueHashtag: any;
  public valueHide: any;
  public previewData: any;
  public imageCover: any;
  public _id: any;
  public listStatus: any[] = ['vote', 'support', 'close'];
  public listHashtag: any[] = [];
  public listVoteEvent: any[] = [];

  public hashTag = new FormControl();
  public filteredOptions: Observable<string[]>;

  constructor(voteEventFacade: VoteEventFacade, router: Router, dialog: MatDialog, authenManager: AuthenManager, loadingService: LoadingService) {
    super(PAGE_NAME, dialog);
    this.loadingService = loadingService;
    this.voteEventFacade = voteEventFacade;
    this.router = router;
    this.authenManager = authenManager;
    this.baseURL = environment.apiBaseURL;
    this.fieldTable = [
      {
        name: "isPin",
        label: "ปักหมุด",
        width: "50pt",
        class: "", formatColor: false, formatImage: false,
        link: [],
        formatDate: false,
        formatId: false,
        align: "center"
      },
      {
        name: "coverPageURL",
        label: "รูปภาพ",
        width: "60pt",
        class: "", formatColor: false, formatImage: true,
        link: [],
        formatDate: false,
        formatId: false,
        align: "center"
      },
      {
        name: "title",
        label: "หัวข้อ",
        width: "300pt",
        class: "", formatColor: false, formatImage: false,
        link: [],
        formatDate: false,
        formatId: false,
        align: "left"
      },
      {
        name: "detail",
        label: "รายละเอียด",
        width: "300pt",
        class: "", formatColor: false, formatImage: false,
        link: [],
        formatDate: false,
        formatId: false,
        align: "left"
      }
    ];
    this.actions = {
      isOfficial: false,
      isBan: false,
      isApprove: true,
      isUnApprove: true,
      isSelect: false,
      isCreate: false,
      isEdit: true,
      isDelete: true,
      isComment: false,
      isBack: false,
      isPreview: true,
    };
    this._setFields();
  }

  public ngOnInit() {
    setTimeout(() => {
      this.loadingService.isLoading.next(false);
    }, 2000);

    this.table.isVote = true;
    this._getHashTag();

    this.filteredOptions = this.hashTag.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value;

    return this.listHashtag.filter(option => option.includes(filterValue));
  }

  private _getHashTag() {
    this.voteEventFacade.getVoteHashtag().then((res) => {
      if (res) {
        this.listHashtag = res;
      }
    }).catch((err) => {
      if (err) { }
    });
  }

  private _setFields(): void {
    this.valueShowName = undefined;
    this.valueShowResult = undefined;
    this.valuePin = undefined;
    this.valueApproved = undefined;
    this.valueClosed = undefined;
    this.valueStatus = undefined;
    this.valueStartSupport = undefined;
    this.valueEndSupport = undefined;
    this.valueStartVote = undefined;
    this.valueEndVote = undefined;
    this.valueHide = undefined;
  }
  public clickCloseDrawer(): void {
    this.edit = false;
    this.preview = false;
    this.listVoteEvent = [];
    this.isSendNoti = false;
    this.isHaveVoteEvent = false;
    this.listVoteEvent = [];
    this.drawer.toggle();
  }

  public clickEditForm(data: any): void {
    this._id = data._id;
    this.valueClosed = data.closed;
    this.valueApproved = data.approved;
    this.valueStatus = data.status;
    this.valuePin = data.pin;
    this.valueShowName = data.showVoterName;
    this.valueShowResult = data.showVoteResult;
    this.valueStartSupport = data.startSupportDatetime;
    this.valueEndSupport = data.endSupportDatetime;
    this.valueStartVote = data.startVoteDatetime;
    this.valueEndVote = data.endVoteDatetime;
    this.valueTitle = data.title;
    this.valueDetail = data.detail;
    this.valueHide = data.hide;
    this.hashTag.setValue(data.hashTag);
    this.drawer.toggle();
  }

  public changeClosed($event) {
    if ($event.checked) {
      this.valueClosed = false;
    } else {
      this.valueClosed = true;
    }
  }

  public clickSendNoti(data: any): void {
    this.isSendNoti = true;
    this.drawer.toggle();
  }

  public clickSave(): void {
    const result: any = {};
    result.closed = this.valueClosed;
    result.pin = this.valuePin;
    result.title = this.valueTitle;
    result.detail = this.valueDetail;
    result.showVoterName = this.valueShowName;
    result.showVoteResult = this.valueShowResult;
    result.hashTag = this.hashTag.value;
    result.hide = this.valueHide;

    if (!!this.valueStartVote && !!this.valueEndVote) {
      result.startSupportDatetime = this.valueStartSupport;
      result.endSupportDatetime = this.valueEndSupport;
      result.startVoteDatetime = this.valueStartVote;
      result.endVoteDatetime = this.valueEndVote;
    } else {
      result.startSupportDatetime = this.valueStartSupport;
      result.endSupportDatetime = this.valueEndSupport;
      result.startVoteDatetime = null;
      result.endVoteDatetime = null;
    }
    this.voteEventFacade.edit(this._id, result).then((res) => {
      this.table.searchData();
      this._setFields();
      this.edit = false;
      this.drawer.toggle();
    }).catch((err) => {
      if (err) {
        if (err.error.message === "Cannot update: status is approved.") {
          this.dialogWarning("ไม่สามารถแก้ไขได้เนื่องจากอนุมัติแล้ว");
        }
      }
    });
  }

  public clickDelete(data: any): void {
    this.voteEventFacade.delete(data._id).then((res) => {
      let index = 0;
      let dataTable = this.table.data;
      for (let d of dataTable) {
        if (d.id == data.id) {
          dataTable.splice(index, 1);
          this.table.setTableConfig(dataTable);
          this.dialogWarning("ลบข้อมูลสำเร็จ");
          break;
        }
        index++;
      }
    }).catch((err) => {
      this.dialogWarning(err.error.message);
    });
  }

  public clickShowVote() {
    const voteData: any = {};
    voteData.hide = !this.valueHide;
    let dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: this.valueHide ? "คุณต้องการปิดการแสดงโหวตนี้ใช่หรือไม่" : "คุณต้องการแสดงโหวตนี้ใช่หรือไม่"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voteEventFacade.showHide(this._id, voteData).then((res) => {
          this.valueHide = !this.valueHide;
          this.table.searchData();
        });
      }
    });
  }

  public clickApprove(data) {
    const voteData: any = {};
    voteData.closed = false;
    voteData.approved = true;
    voteData.pin = true;
    voteData.status = "vote";
    let dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: "คุณต้องการอนุมัติโหวตนี้ใช่หรือไม่"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voteEventFacade.approve(data._id, voteData).then((res) => {
          this.table.searchData();
        });
      }
    });
  }

  public clickUnApprove(data) {
    const voteData: any = {};
    voteData.closed = true;
    voteData.approved = false;
    voteData.pin = false;
    voteData.status = "close";
    let dialogRef = this.dialog.open(DialogWarningComponent, {
      data: {
        title: "คุณต้องการไม่อนุมัติโหวตนี้ใช่หรือไม่"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.voteEventFacade.reject(data._id, voteData).then((res) => {
          this.table.searchData();
        });
      }
    });
  }

  public saveDate(event: any, type: any, mode): void {
    const inputDate = new Date(event.value);
    const isoDateString = inputDate.toISOString();
    if (type === 'start') {
      if (mode === 'support') {
        this.valueStartSupport = isoDateString;
      } else {
        this.valueStartVote = isoDateString;
      }
    } else {
      if (mode === 'support') {
        this.valueEndSupport = isoDateString;
      } else {
        this.valueEndVote = isoDateString;
      }
    }
  }

  public imagePreview(image) {
    let img = image.replace('/image', '');
    let dialogRef = this.dialog.open(DialogImagePreview, {
      data: img
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  public clickAddVoteEvent() {
    let dialogRef = this.dialog.open(DialogAddNoti, {
      data: {
        item: this.listVoteEvent.length,
        isClose: false,
        isConfirm: true,
        confirm: {
          text: "ตกลง"
        },
        value: this.listVoteEvent
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listVoteEvent = result;
      }
    });
  }

  public removeVote(index) {
    this.listVoteEvent.splice(index, 1);
  }

  public isWordCountOver(data: string): boolean {
    if (data === undefined || data === null) {
      return false;
    }

    return data.length > 220;
  }

  public drop(event: CdkDragDrop<{ title: string, poster: string }[]>) {
    moveItemInArray(this.listVoteEvent, event.previousIndex, event.currentIndex);
  }

  public clickNoti() {
    for (let index = 0; index < this.listVoteEvent.length; index++) {
      if (!this.listVoteEvent[index].s3) {
        this.listVoteEvent[index].image = this.baseURL + this.listVoteEvent[index].image + '/image';
      }
    }
    let content: any = {
      messages: [
        {
          "type": "flex",
          "altText": this.listVoteEvent[0].title,
          "contents": {
            "type": "bubble",
            "size": "mega",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [],
              "paddingAll": "0px",
              "width": "100%",
              "height": "100%"
            }
          }
        }
      ]
    };
    if (this.listVoteEvent.length > 0) {
      for (let index = 0; index < this.listVoteEvent.length; index++) {
        if (index === 0 && this.listVoteEvent.length > 0) {
          content['messages'][0].contents.body.contents.push(
            {
              'type': 'image',
              'url': this.listVoteEvent[0].image,
              'size': 'full',
              'aspectMode': 'cover',
              'aspectRatio': '1:1',
              'gravity': 'center'
            },
            {
              'type': 'box',
              'layout': 'vertical',
              'contents': [
                {
                  'type': 'text',
                  'text': 'ก้าวไกลโหวต',
                  'color': '#ffffff',
                  'weight': 'bold',
                  'size': '34px'
                }
              ],
              'position': 'absolute',
              'alignItems': 'center',
              'justifyContent': 'center',
              'width': '100%',
              'offsetTop': '30px'
            },
            {
              'type': 'box',
              'layout': 'vertical',
              'contents': [
                {
                  'type': 'box',
                  'layout': 'vertical',
                  'contents': [
                    {
                      'type': 'text',
                      'text': this.listVoteEvent[0].title + ' ' + this.listVoteEvent[0].detail,
                      'maxLines': 3,
                      'wrap': true
                    },
                    {
                      'type': 'box',
                      'layout': 'vertical',
                      'contents': [
                        {
                          'type': 'button',
                          'action': {
                            'type': 'uri',
                            'label': this.listVoteEvent[0].status === "support" ? "กดสนับสนุน" : (this.listVoteEvent[0].status === "vote" ? "เริ่มโหวตเลย" : "ดูผลโหวต"),
                            'uri': "https://today.moveforwardparty.org/vote/event/" + this.listVoteEvent[0].id + "?openExternalBrowser=1"
                          },
                          'color': '#F18805',
                          'scaling': false,
                          'style': 'primary',
                          'height': 'sm',
                          'adjustMode': 'shrink-to-fit',
                          'gravity': 'center',
                          'margin': '10px'
                        }
                      ],
                      'position': 'relative'
                    }
                  ],
                  'height': '130px',
                  'backgroundColor': '#F0F0F0',
                  'paddingAll': '10px',
                  'width': '100%'
                },
                {
                  'type': 'box',
                  'layout': 'vertical',
                  'contents': [],
                  "paddingAll": "10px",
                  "spacing": "10px",
                  "backgroundColor": "#F0F0F0",
                  "width": "100%"
                }
              ],
              'width': '100%',
              'height': '100%'
            }
          );
        }

        if (index === 1 && this.listVoteEvent.length > 0 && content['messages'][0].contents.body.contents.length > 0) {
          content['messages'][0].contents.body.contents[2].contents[1].contents.push(
            {
              'type': 'box',
              'layout': 'horizontal',
              'contents': [
                {
                  'type': 'box',
                  'layout': 'horizontal',
                  'contents': [
                    {
                      'type': 'image',
                      'url': this.listVoteEvent[1].image,
                      'size': '80px',
                      'align': 'start',
                      'aspectMode': 'cover'
                    }
                  ],
                  'paddingAll': '5px',
                  'cornerRadius': '8px',
                  'width': '30%'
                },
                {
                  'type': 'box',
                  'layout': 'vertical',
                  'contents': [
                    {
                      'type': 'text',
                      'text': this.listVoteEvent[1].title + ' ' + this.listVoteEvent[1].detail,
                      'wrap': true,
                      'size': '14px',
                      'align': 'start',
                      'gravity': 'center',
                      'maxLines': 3,
                      'margin': '5px'
                    }
                  ]
                }
              ],
              'backgroundColor': '#FFFFFF',
              'width': '100%',
              'height': '70px',
              'cornerRadius': '8px',
              'action': {
                'type': 'uri',
                'label': 'action',
                'uri': "https://today.moveforwardparty.org/vote/event/" + this.listVoteEvent[1].id + "?openExternalBrowser=1",
              },
            },
          );
        }

        if (index === 2 && this.listVoteEvent.length > 0 && content['messages'][0].contents.body.contents.length > 0) {
          content['messages'][0].contents.body.contents[2].contents[1].contents.push(
            {
              'type': 'box',
              'layout': 'horizontal',
              'contents': [
                {
                  'type': 'box',
                  'layout': 'horizontal',
                  'contents': [
                    {
                      'type': 'image',
                      'url': this.listVoteEvent[2].image,
                      'size': '80px',
                      'align': 'start',
                      'aspectMode': 'cover'
                    }
                  ],
                  'paddingAll': '5px',
                  'cornerRadius': '8px',
                  'width': '30%'
                },
                {
                  'type': 'box',
                  'layout': 'vertical',
                  'contents': [
                    {
                      'type': 'text',
                      'text': this.listVoteEvent[2].title + ' ' + this.listVoteEvent[2].detail,
                      'wrap': true,
                      'size': '14px',
                      'align': 'start',
                      'gravity': 'center',
                      'maxLines': 3,
                      'margin': '5px'
                    }
                  ]
                }
              ],
              'backgroundColor': '#FFFFFF',
              'width': '100%',
              'height': '70px',
              'cornerRadius': '8px',
              'action': {
                'type': 'uri',
                'label': 'action',
                'uri': "https://today.moveforwardparty.org/vote/event/" + this.listVoteEvent[2].id + "?openExternalBrowser=1",
              }
            },
          );
        }

        if (index === 3 && this.listVoteEvent.length > 0 && content['messages'][0].contents.body.contents.length > 0) {
          content['messages'][0].contents.body.contents[2].contents[1].contents.push(
            {
              'type': 'box',
              'layout': 'horizontal',
              'contents': [
                {
                  'type': 'box',
                  'layout': 'horizontal',
                  'contents': [
                    {
                      'type': 'image',
                      'url': this.listVoteEvent[3].image,
                      'size': '80px',
                      'align': 'start',
                      'aspectMode': 'cover'
                    }
                  ],
                  'paddingAll': '5px',
                  'cornerRadius': '8px',
                  'width': '30%'
                },
                {
                  'type': 'box',
                  'layout': 'vertical',
                  'contents': [
                    {
                      'type': 'text',
                      'text': this.listVoteEvent[3].title + ' ' + this.listVoteEvent[3].detail,
                      'wrap': true,
                      'size': '14px',
                      'align': 'start',
                      'gravity': 'center',
                      'maxLines': 3,
                      'margin': '5px'
                    }
                  ]
                }
              ],
              'backgroundColor': '#FFFFFF',
              'width': '100%',
              'height': '70px',
              'cornerRadius': '8px',
              'action': {
                'type': 'uri',
                'label': 'action',
                'uri': "https://today.moveforwardparty.org/vote/event/" + this.listVoteEvent[3].id + "?openExternalBrowser=1",
              }
            },
          );
        }
      }
    }

    this.voteEventFacade.sendNoti(content).then((res) => {
      if (res) {
        this.drawer.toggle();
      }
    }).catch((error) => {
      if (error) {
        this.dialogWarning(error.error.message);
        this.loadingService.isLoading.next(false);
      }
    });
  }
}
