/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Inject, EventEmitter, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, ThemePalette } from '@angular/material';
import { AuthenManager, PostFacade, PostCommentFacade, PostActionService, VoteEventFacade, SeoService } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FileHandle } from '../directive/DragAndDrop.directive';
import { CommentPosts } from '../../../models/CommentPosts';
import { DialogShare } from './DialogShare.component';
import { DialogAlert } from './DialogAlert.component';
import { environment } from '../../../../environments/environment';
import { MESSAGE } from '../../../../custom/variable';
import { SearchFilter } from 'src/app/models/SearchFilter';
import { DialogList } from './DialogList.component';

const PAGE_NAME: string = 'postcard';
const SEARCH_LIMIT: number = 10;
const SEARCH_OFFSET: number = 0;

@Component({
  selector: 'dialog-postcard',
  templateUrl: './DialogPostCrad.component.html',
})
export class DialogPostCrad extends AbstractPage {
  @Input()
  color: ThemePalette

  public static readonly PAGE_NAME: string = PAGE_NAME;

  public dialog: MatDialog;

  private postFacade: PostFacade;
  private postCommentFacade: PostCommentFacade;
  private postActionService: PostActionService;
  private voteFacade: VoteEventFacade;
  public apiBaseURL = environment.apiBaseURL;

  public isLoading: boolean;
  public isShowCheckboxTag: boolean;
  public showLoading: boolean = true;
  public isRepost: boolean = false;

  public imageCover: any;
  public config: any;
  public content: any;
  public datas: any;
  public setTimeoutAutocomp: any;
  public resDataObjective: any[] = [];
  public prefix: any;
  public posts: any;
  public ownVote: any;
  public ownVoteText: any[] = [];
  public isVoteAlready: boolean = false;
  public voteSuccess: boolean = false;

  public questions: any[] = [];
  public singleAns: any = undefined;
  public user: any;
  public isClosed: boolean;
  public isShowVoteResult: boolean;
  public menuType: any;
  public answerTextbox: any;

  public supportValue: number = 0;
  public voteChoiceValue: any[] = [];

  files: FileHandle[] = [];

  constructor(public dialogRef: MatDialogRef<DialogPostCrad>, @Inject(MAT_DIALOG_DATA) public data: any,
    postCommentFacade: PostCommentFacade,
    postActionService: PostActionService,
    postFacade: PostFacade,
    voteFacade: VoteEventFacade,
    private activeRoute: ActivatedRoute,
    private seoService: SeoService,
    dialog: MatDialog, authenManager: AuthenManager, router: Router) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.dialog = dialog;
    this.authenManager = authenManager;
    this.postCommentFacade = postCommentFacade;
    this.postActionService = postActionService;
    this.postFacade = postFacade;
    this.voteFacade = voteFacade;
    this.imageCover = {}
    this.prefix = {};

  }

  ngOnInit() {
    setTimeout(() => {
      this.showLoading = false
    }, 2000);
    if (this.data.vote) {
      this.seoService.updateTitle(this.data.post.title);
      this._getVotedOwn(this.data.post._id);
      this.supportValue = this._calculatePercentage();
      if (this.data.support !== undefined) {
        if (this.data.support.userSupport.length > 0) {
          this.posts = this.data.support.userSupport;
        } else {
          this.posts = [];
        }
      } else {
        this.posts = this.data.choice.voteItem;
      }
      if (this.posts.length > 0) {
        for (let index = 0; index < this.posts.length; index++) {
          if (this.posts[index].voteChoice !== undefined) {
            this.voteChoiceValue.push({
              maxValue: this._getVoteMaxCount(index),
              value: [],
            });
            for (let i = 0; i < this.posts[index].voteChoice.length; i++) {
              if (this.posts[index].voteChoice[i].voted.length > 0) {
                this.voteChoiceValue[index].value.push(this.posts[index].voteChoice[i].voted[0].votedCount);
              } else {
                this.voteChoiceValue[index].value.push(0);
              }
            }
          }
        }
        const arraySum = arr => arr.reduce((acc, val) => acc + val, 0);
        let percentagesPerVoteChoiceValue = this.voteChoiceValue.map(voteChoiceValue => {
          let sumOfValues = arraySum(voteChoiceValue.value);
          return voteChoiceValue.value.map(value => (value / sumOfValues) * 100);
        });
        for (let index = 0; index < this.voteChoiceValue.length; index++) {
          this.voteChoiceValue[index].value = percentagesPerVoteChoiceValue[index];
        }
        this.voteChoiceValue.forEach(obj => delete obj.maxValue);
      }
      if (this.data.post.page !== undefined && this.data.post.page !== null) {
        this.user = this.data.post.page;
      } else {
        this.user = this.data.post.user;
      }
      this.menuType = this.data.menu;
      this.isClosed = this.data.post.closed;
      this.isShowVoteResult = this.data.post.showVoteResult;
      if (this.posts.length > 0) {
        for (let index = 0; index < this.posts.length; index++) {
          this.questions.push(index);
        }
      }
    }
  }
  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public async actionComment(action: any, index?: number) {
    this.isLoginCh();
    let Arr: any = { posts: [this.data.post] };
    this.prefix.header = 'header';
    this.prefix.detail = 'post';
    if (action.mod === 'REBOON') {
      this.showLoading = true;
      this.postActionService.actionPost(action, 0, Arr, "PAGE", true).then((res: any) => {
        this.onClose('');
        // if (res.isDialog) {
        //   this.isRepost = true;
        //   this.datas = res;
        //   this.content = res.options;
        //   this.showLoading = false;
        // } else {
        //   this.showLoading = false;
        // }
      }).catch((err: any) => {
      });
    } else if (action.mod === 'LIKE') {
      this.postLike(action, index);
    } else if (action.mod === 'SHARE') {
      let dialog = this.dialog.open(DialogShare, {
        disableClose: true,
        autoFocus: false,
        data: {
          title: "แชร์",
          text: action.linkPost
        }
      });
    } else if (action.mod === 'COMMENT') {
    } else if (action.mod === 'POST') {
      this.router.navigateByUrl('/post/' + action.pageId);
    }
  }

  public postLike(data: any, index: number) {
    if (!this.isLogin()) {
      return
    }
    let userId: any;

    this.data.post.isLike = !this.data.post.isLike;
    if (this.data.post.isLike) {
      this.data.post.likeCount = this.data.post.likeCount + 1
    } else {
      this.data.post.likeCount = this.data.post.likeCount - 1
    }
    if (data.userAsPage !== undefined && data.userAsPage !== null) {
      userId = data.userAsPage.id
    } else {
      userId = this.data.user.id
    }
    this.postFacade.like(data.postData._id, data.userAsPage.username ? null : userId).then((res: any) => {
      if (res.isLike) {
        if (data.postData._id === res.posts.id) {
          this.data.post.likeCount = res.likeCount;
          this.data.post.isLike = res.isLike;
        }
      } else {
        // unLike 
        if (data.postData._id === res.posts.id) {
          this.data.post.likeCount = res.likeCount;
          this.data.post.isLike = res.isLike;
        }
      }
    }).catch((err: any) => {
      console.log(err)
      if (err.error.message === 'You cannot like this post type MFP.') {
        this.showDialogEngagementMember();
      } else if (err.error.message === 'Page cannot like this post type MFP.') {
        this.showAlertDialog('เพจไม่สามารถกดไลค์ได้');
      }
    });
  }

  private _calculatePercentage(): number {
    let min = this.data.post.minSupport;
    let value = this.data.post.countSupport;
    return (100 * value) / min;
  }

  public createComment(comment: any, index?: number) {
    let commentPosts = new CommentPosts
    if (comment.userAsPage.id !== undefined && comment.userAsPage.id !== null) {
      commentPosts.commentAsPage = comment.userAsPage.id
    }
    commentPosts.comment = comment.value
    commentPosts.asset = undefined
    this.postCommentFacade.create(commentPosts, comment.pageId).then((res: any) => {
      this.data.post.commentCount++
      this.data.post.isComment = true
    }).catch((err: any) => {
    })
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  private isLoginCh() {
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/home/");
      this.onClose('');
      return
    }
  }

  public dataRepost(data?: any) {
    this.isRepost = false;
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

  public onClose(data?) {
    if (!!data) {
      this.dialogRef.close(data);
    } else {
      this.dialogRef.close(false);
    }
  }

  onFileSelect() { }

  onConfirm() { }

  private _checkAllowVote() {
    let isMember: any = JSON.parse(localStorage.getItem('membership'));
    if (this.data.isAllow) {
      return true;
    }
    if (this.data.post.type === 'member') {
      if (!isMember) {
        this.showDialogEngagementMember('โหวตได้เฉพาะสมาชิกพรรคเท่านั้น', 'vote');
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  public addOrRemoveActive(item, type, mode, index?, choiceIndex?) {
    if (type === 'single') {
      if (mode === 'remove') {
        this.singleAns = undefined;
        this.questions[index] = [];
      }
    }
    if (type === 'multi') {
      if (mode === 'remove') {
        let indexRemove = this.questions[index].voteChoice.findIndex(value => value.answer === item.title);
        if (indexRemove !== -1) {
          item.active = false;
          this.questions[index].voteChoice.splice(indexRemove, 1);
        }
      } else {
        item.active = true;
      }
    }
  }

  public chooseChoice(question: any, choice: any, index: number, choiceIndex: number, type: any) {
    if (!this.isLogin()) {
      this.checkLogin();
      return;
    }
    if (type === 'single') {
      if (choice._id === this.questions[index].voteChoice && this.questions[index].voteChoice[0].voteChoiceId) {
        this.questions[index] = [];
      } else {
        if (this.questions[index].voteChoice === undefined) {
          this.questions[index] = {
            active: choice.title,
            type: question.type,
            voteItemId: question._id,
            voteChoice: [
              {
                answer: choice.title,
                voteChoiceId: choice._id
              }
            ]
          };
        } else {
          this.questions[index].active = choice.title;
          this.questions[index].voteChoice = [
            {
              answer: choice.title,
              voteChoiceId: choice._id
            }
          ];
        }
      }
    } else if (type === 'multi') {
      if (this.questions[index].voteChoice === undefined) {
        this.questions[index] = {
          type: question.type,
          voteItemId: question._id,
          voteChoice: [
            {
              answer: choice.title,
              voteChoiceId: choice._id
            }
          ]
        };
      } else {
        if (this.questions[index].voteChoice.length > 0) {
          this.questions[index].voteChoice.push({
            answer: choice.title,
            voteChoiceId: choice._id
          });
        } else {
          this.questions[index].voteChoice.push({
            answer: choice.title,
            voteChoiceId: choice._id
          });
        }
        let data = this.questions[index].voteChoice.findIndex(x => x.answer === choice.title);
        let array = this.questions[index].voteChoice.filter((value, i, self) =>
          self.findIndex(item => item.answer === value.answer && item.voteChoiceId === value.voteChoiceId) === i
        );
        this.questions[index].voteChoice = array;
      }
    }
  }

  public next() {
    if (this._checkAllowVote()) {
      for (let index = 0; index < this.questions.length; index++) {
        if (this.questions[index].voteChoice === undefined) {
          this.showAlertDialog("กรุณาตอบคำถามให้ครบทุกข้อ");
          return
        }
      }
      this.voteFacade.voting(this.data.post._id, this.questions).then((res) => {
        if (res) {
          this.voteSuccess = true;
        }
      }).catch((err) => {
        console.log("err", err)
        if (err) {
          if (err.error.message === "You have been already voted.") {
            this.showAlertDialog("คุณได้โหวตไปแล้ว");
          }
          if (err.error.message === "This vote only for membershipMFP, You are not membership.") {
            this.showDialogEngagementMember("โหวตได้เฉพาะสมาชิกพรรคเท่านั้น", "vote");
          }
          if (err.error.message === "Cannot Vote this vote status is close.") {
            this.showAlertDialog("โหวตนี้ถูกปิดแล้วคุณไม่สามารถโหวตได้", "vote");
            this.isVoteAlready = true;
          }
        }
      });
    }
  }

  public checkLogin() {
    if (!this.isLogin()) {
      let dialog = this.dialog.open(DialogAlert, {
        disableClose: false,
        data: {
          text: MESSAGE.TEXT_TITLE_LOGIN,
          bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
          bottomColorText2: "black",
          btDisplay1: "none"
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.onClose(true);
          this.router.navigate(["/login", { redirection: this.router.url }]);
        }
      });
    }
  }

  public voteSupport(id) {
    if (this._checkAllowVote()) {
      this.isLoading = true;
      this.voteFacade.voteSupport(id).then((res) => {
        if (res) {
          if (this.data.support !== undefined) {
            this.data.support.userSupport.push({
              user: {
                _id: res.userId,
                imageURL: res.imageURL,
                firstName: res.firstName,
                displayName: res.displayName,
                s3ImageURL: res.s3ImageURL,
                username: res.username,
              }
            });
          }
          this.isLoading = false;
          this.data.post.countSupport++;
          this.data.post.userSupport = true;;
          this.showAlertDialog("คุณได้สนับสนุนโหวตนี้");
        }
      }).catch((err) => {
        if (err) {
          console.log("err", err);
          this.isLoading = false;
          if (err.error.message === "You have been supported.") {
            this.showAlertDialog("คุณได้ทำการโหวตไปแล้ว");
          }
          if (err.error.message === "This vote only for membershipMFP, You are not membership.") {
            this.showDialogEngagementMember('โหวตได้เฉพาะสมาชิกพรรคเท่านั้น', 'vote');
          }
        }
      });
    }
  }

  public unVoteSupport(id) {
    let user: any = JSON.parse(localStorage.getItem('pageUser'));
    if (this._checkAllowVote()) {
      let index = this._findUserSupportIndex(user.id);
      let dialog = this.dialog.open(DialogAlert, {
        disableClose: false,
        data: {
          text: "คุณต้องการยกเลิกการสนับสนุนโหวตนี้หรือไม่",
          bottomText2: 'ใช่',
          bottomText1: 'ไม่',
        }
      });
      dialog.afterClosed().subscribe((res) => {
        if (res) {
          this.isLoading = true;
          this.voteFacade.unVoteSupport(id).then((res) => {
            this.data.post.countSupport--;
            this.data.post.userSupport = false;
            this.data.support.userSupport.splice(index, 1);
            this.isLoading = false;
          }).catch((err) => {
            if (err) {
              console.log("err", err);
              this.isLoading = false;
              if (err.error.message === "Not found user support.") {
                this.showAlertDialog("คุณยังไม่ได้ทำการสนับสนุนโหวตนี้");
              }
            }
          });
        }
      });
    }
  }

  private _findUserSupportIndex(userId) {
    return this.posts.findIndex(post => post.user._id === userId);
  }

  public setAnswer(question, index) {
    this.questions[index] = {
      voteItemId: question._id,
      voteChoice: [],
      type: question.type,
      answer: this.answerTextbox,
    };
  }

  private _getVoteMaxCount(index?) {
    let value: number = 0;
    if (this.posts[index].voteChoice !== undefined) {
      for (let i = 0; i < this.posts[index].voteChoice.length; i++) {
        if (this.posts[index].voteChoice[i].voted.length > 0) {
          value += this.posts[index].voteChoice[i].voted[0].votedCount;
        }
      }
    }

    return value;
  }

  public seeVoteTextUser(id: string) {
    let search: SearchFilter = new SearchFilter();
    search.limit = 8;
    search.offset = 0;
    let whereConditions = {
      "voteChoice": null
    };
    this.voteFacade.getTextUserVote(id, search, whereConditions).then((res) => {
      if (res) {
        let dialog = this.dialog.open(DialogList, {
          panelClass: 'panel-backgroud-vote',
          disableClose: true,
          data: {
            model: res,
            showVoterName: this.data.post.showVoterName,
          }
        });
        dialog.afterClosed().subscribe((res) => {
          if (res) {
          }
        });
      }
    }).catch((err) => {
      if (err) { }
    });
  }

  private _getVotedOwn(id: string) {
    this.voteFacade.getVotedOwn(id).then((res) => {
      if (res) {
        this.ownVote = res;
        for (let data of this.ownVote) {
          if (data.voteChoiceId === null) {
            this.ownVoteText.push(data);
          }
        }
        this.isVoteAlready = true;
        this._mapVoteChoice();
      }
    }).catch((err) => {
      if (err) { }
    });
  }

  private _mapVoteChoice() {
    const mappedPosts = this.posts.map(post => {
      if (post.voteChoice) {
        post.voteChoice = post.voteChoice.map(voteChoice => {
          const matchingOwnVote = this.ownVote.find(ownVote => ownVote.voteChoiceId === voteChoice._id);
          if (matchingOwnVote) {
            voteChoice.isVote = true;
          }

          return voteChoice;
        });
      }

      return post;
    });
    const matchedData = this.posts.map(question => {
      const matchedAnswer = this.ownVoteText.find(answer => answer.voteItemId === question._id);
      if (matchedAnswer) {
        question.answerData = matchedAnswer;
      }

      return question;
    });
  }

  public shareVote() {
    const dialog = this.dialog.open(DialogShare, {
      disableClose: true,
      autoFocus: false,
      data: {
        title: "แชร์",
        text: window.location.origin + this.router.url
      }
    });
  }
}
