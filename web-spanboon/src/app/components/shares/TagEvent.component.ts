/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from '../../services/AuthenManager.service';
import { AbstractPage } from '../pages/AbstractPage';

@Component({
  selector: 'tag-event',
  templateUrl: './TagEvent.component.html'
})
export class TagEvent extends AbstractPage implements OnInit {

  @Input()
  public class: string | [string];
  @Input()
  public isShowEmergency: boolean = true;
  @Input()
  public isShowObjective: boolean = true;
  @Input()
  public nameEmergency: string = "Tag Emergency";
  @Input()
  public nameObjective: string = "tag Objective";
  @Input()
  public isIconEmergency: boolean;
  @Input()
  public isIconObjective: boolean;
  @Input()
  public isNameEmergency: boolean;
  @Input()
  public isNameObjective: boolean;
  @Output()
  protected clickEmergency: EventEmitter<any> = new EventEmitter();
  @Output()
  protected clickObjective: EventEmitter<any> = new EventEmitter();
  @Output()
  public emergencyClick: EventEmitter<any> = new EventEmitter();
  @Output()
  public objectiveClick: EventEmitter<any> = new EventEmitter();
  

  constructor(authenManager: AuthenManager, dialog: MatDialog, router: Router) {
    super(null, authenManager, dialog, router);
  }

  public ngOnInit(): void {

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

  public actions() {
    // this.clickEmergency.emit(true);
  }

  public onResize(){
    if(window.innerWidth < 479){
      return true;
    }
  }
}
