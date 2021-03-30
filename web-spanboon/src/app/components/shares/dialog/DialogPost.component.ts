/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { ViewChild } from '@angular/core';
import { BoxPost } from '../BoxPost.component';
import { UserAccessFacade } from '../../../services/facade/UserAccessFacade.service';
import { AssetFacade } from '../../../services/facade/AssetFacade.service';
import { PostFacade } from '../../../services/facade/PostFacade.service';
import { AbstractPage } from '../../pages/AbstractPage';
import { Subscription } from 'rxjs/internal/Subscription';
import { FulfillFacade, ObservableManager, PageFacade } from '../../../../app/services/services';
import { Router } from '@angular/router';
import { SearchFilter } from 'src/app/models/models';

const PAGE_NAME: string = 'editcomment';
const REFRESH_DATA: string = 'refresh_page';
const STATUS_MESSAGE: string = 'status.message';

@Component({
  selector: 'dialog-post',
  templateUrl: './DialogPost.component.html',
})
export class DialogPost extends AbstractPage {

  @Output()
  public submitDialog: EventEmitter<any> = new EventEmitter();
  @Output()
  public submitCanCelDialog: EventEmitter<any> = new EventEmitter();

  private userAccessFacade: UserAccessFacade;
  private postFacade: PostFacade;
  private pageFacade: PageFacade;
  private fulfillFacade: FulfillFacade;
  private subscription: Subscription;
  protected observManager: ObservableManager;
  public confirmEventEmitter: EventEmitter<any> = new EventEmitter();
  public canCelEventEmitter: EventEmitter<any> = new EventEmitter();

  message: string;
  public resListPage: any;
  public prefix: any;
  public isListPage: boolean = true;
  public isEdit: boolean = true;
  public isFulfill: boolean = true;
  public isPreload: boolean = true;
  public isFulfillNull: boolean = false;
  public isSharePost: boolean = false;
  public snackBar: MatSnackBar;
  public selectedAccessPage: any;

  public static readonly PAGE_NAME: string = PAGE_NAME;

  @ViewChild('boxPost', { static: false }) boxPost: BoxPost;

  constructor(router: Router, dialog: MatDialog, snackBar: MatSnackBar, fulfillFacade: FulfillFacade, public dialogRef: MatDialogRef<DialogPost>, @Inject(MAT_DIALOG_DATA) public data: any, userAccessFacade: UserAccessFacade, postFacade: PostFacade,
    pageFacade: PageFacade, observManager: ObservableManager) {
    super(null, null, dialog, router);
    this.userAccessFacade = userAccessFacade;
    this.observManager = observManager;
    this.router = router;
    this.snackBar = snackBar;
    this.postFacade = postFacade;
    this.pageFacade = pageFacade;
    this.fulfillFacade = fulfillFacade;
    this.prefix = {};

    setTimeout(() => {
      this.isPreload = false
    }, 1000);

    this.observManager.createSubject(REFRESH_DATA);
    this.observManager.createSubject('scroll.fix'); 
    if (this.data && this.data.isListPage && this.data.isListPage !== '' && this.data.isListPage !== undefined && this.data.isListPage !== null) {
      this.isFulfill = this.data.isFulfill;
      this.isEdit = this.data.isEdit;
      this.isListPage = this.data.isListPage;
      if(this.data && !this.data.isSharePost){
        this.isSharePost = this.data.isSharePost;
      } else { 
        this.isSharePost = true;
      } 
    }

    if (this.data && this.data.fulfillRequest && this.data.fulfillRequest !== '' && this.data.fulfillRequest !== undefined && this.data.fulfillRequest !== null) {
      this.isFulfill = this.data.isFulfill;
      this.isEdit = this.data.isEdit;
      this.isListPage = this.data.isListPage;
      this.isFulfillNull = this.data.isFulfillNull;
    }

    if (this.data && this.data.story && this.data.story !== '' && this.data.story !== undefined && this.data.story !== null) {
      let search: SearchFilter = new SearchFilter();
      search.limit = 5;
      search.count = false;
      search.whereConditions = { _id: this.data._id };
      this.postFacade.searchPostStory(search).then((res: any) => {
        this.data.story = res[0].story
      }).catch((err: any) => {
        console.log(err)
      })
    }


  }

  public ngOnInit() {
    if (this.isListPage) {
      this.prefix.header = 'header';
      this.prefix.detail = 'post';
      if (!this.isEdit) {
        this.postFacade.nextMessageTopic(this.data.topic);
        this.postFacade.nextMessage(this.data.content);

        this.subscription = this.postFacade.sharedMessage.subscribe(message => {
          this.data.content = message;
        });
        this.subscription = this.postFacade.sharedMessageTopic.subscribe(messages => {
          this.data.topic = messages;
        });
      }
    }

    this.confirmEventEmitter = new EventEmitter<any>();
    this.confirmEventEmitter.subscribe(() => {
      this.submitDialog.emit(this.data);
    });
    this.canCelEventEmitter = new EventEmitter<any>();
    this.canCelEventEmitter.subscribe(() => {
      this.submitCanCelDialog.emit(this.data);
    });

    this.dialogRef.backdropClick().subscribe(result => {
      //open confirmation dialog;
      let check;
      if (!this.isEdit) {
        check = (this.data.topic !== '' && this.data.topic !== undefined && this.data.topic !== null) || (this.data.content !== '' && this.data.content !== undefined && this.data.content !== null)
      } else {
        check = (this.data.title !== '' || this.data.detail)
      }
      if (result.type === 'click' && check) {
        let dialog = this.showDialogWarming("คุณต้องการออกจากหน้านี้ใช่หรือไม่", "ยกเลิก", "ตกลง", this.confirmEventEmitter, this.canCelEventEmitter);
        dialog.afterClosed().subscribe((res) => {
          if (res) {
            if (this.isListPage) {
              if (!this.isEdit) {
                this.data.topic = '';
                this.data.content = '';
                this.postFacade.nextMessageTopic(this.data.topic);
                this.postFacade.nextMessage(this.data.content);
              }
            }
            this.dialogRef.close();
          } else {
            if (!this.isEdit) {
              this.dialog.open(DialogPost, {
                data: this.data
              });
            }
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

  public ngAfterViewInit(): void {

  }

  public createPost(data) {
    if (this.isEdit) {
      if (data.title) {
        let pageId = this.data.pageId;
        this.pageFacade.editPost(pageId, this.data._id, data).then((res) => {
          let alertMessages: string;
          if (res.status === 1) {
            if (res.message === 'Update PagePost Successful') {
              alertMessages = 'แก้ไขโพสต์สำเร็จ'
              this.showAlertDialogWarming(alertMessages, "none");
              this.observManager.publish(REFRESH_DATA, data.type);
              this.boxPost.clearDataAll();
              this.dialogRef.close();
            }
          }
        }).catch((err: any) => {
          console.log(err);
          let alertMessages: string;
          if (err && err.error && err.error.message === 'Objective was not found.') {
            alertMessages = 'เกิดข้อผิดพลาด กรุณาทำใหม่อีกครั้ง'
            this.showAlertDialogWarming(alertMessages, "none");
          }
        })
      }
    } else {
      if (data.title) {
        let pageId = data.id;
        this.pageFacade.createPost(pageId, data).then((res) => {
          let alertMessages: string;
          if (res.status === 1) {
            if (res.message === 'Create PagePost Success') {
              if (data.isDraft || data.settingsPost) {
                if (data.isDraft) {
                  alertMessages = 'สร้างโพสต์ฉบับร่างสำเร็จ'
                } else {
                  alertMessages = 'โพสต์ของคุณจะแสดงเมื่อถึงเวลาที่คุณตั้งไว้'
                }
                this.showAlertDialogWarming(alertMessages, "none");
              }
              this.postFacade.nextMessageTopic('');
              this.postFacade.nextMessage('');
              this.boxPost.clearDataAll();
              this.observManager.publish(REFRESH_DATA, data.type);
              this.dialogRef.close();
            }
          }
        }).catch((err: any) => {
          console.log(err);
        })
      }
    }
  }

  public createFullfillPost(data) {
    if (this.isFulfill) {
      this.fulfillFacade.createFulfillmentPostFromCase(data.fulfillCaseId, data, data.asPage).then((res) => {
        if (res.status === 1) {
          if (res.message === 'Create Post of FulfillmentCase Complete') {
            const result = {
              caseId: data.fulfillCaseId,
              status: 'green'
            }
            this.observManager.publish(STATUS_MESSAGE, result);
            this.boxPost.clearDataAll();
            this.dialogRef.close(res.data);
          }
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  public onConfirm(): void {
  }

  public onResizeClose(data): void {
    if (this.data.isBox === true) {
      this.dialogRef.close(this.data);
    }
  }

  public onClose(data): void {
    if ((data.topic !== '' && data.topic !== undefined) || (data.content !== '' && data.content !== undefined) || (data.arrList && data.arrList.length > 0)) {
      this.confirmEventEmitter = new EventEmitter<any>();
      this.confirmEventEmitter.subscribe(() => {
        this.submitDialog.emit(this.data);
      });
      this.canCelEventEmitter = new EventEmitter<any>();
      this.canCelEventEmitter.subscribe(() => {
        this.submitCanCelDialog.emit(this.data);
      });

      let dialog = this.showDialogWarming("คุณต้องการออกจากหน้านี้ใช่หรือไม่", "ยกเลิก", "ตกลง", this.confirmEventEmitter, this.canCelEventEmitter);
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.data.topic = '';
          this.data.content = '';
          this.postFacade.nextMessageTopic(this.data.topic);
          this.postFacade.nextMessage(this.data.content);
          this.dialogRef.close();
        }
      }); 
    } else {
      this.dialogRef.close(this.data);
    }
  }

  public selectedInformation(data : any){ 
    this.selectedAccessPage = data.name || data.displayName;
  }
}
