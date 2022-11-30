/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MESSAGE } from '../../../../app/AlertMessage';
import { environment } from '../../../../environments/environment';
import { DialogAlert } from '../dialog/DialogAlert.component';


@Component({
  selector: 'recommend-card',
  templateUrl: './RecommendCard.component.html'
})
export class RecommendCard {

  @Input()
  public images: string = "https://pbs.twimg.com/media/EOoioS8VAAAy6lO.jpg";
  @Input()
  public data: any;
  @Input()
  public title: string;
  @Input()
  public isFollow: boolean = false;
  @Input()
  public selectedIndex: number;

  public isIconPage: boolean;

  public apiBaseURL = environment.apiBaseURL;
  public dialog: MatDialog;
  @Output()
  public submitFollow: EventEmitter<any> = new EventEmitter();

  constructor(dialog: MatDialog) {
    this.dialog = dialog;
  }
  public ngOnInit(): void {

  }

  public clickSystemDevelopment(): void {
    let dialog = this.dialog.open(DialogAlert, {
      disableClose: true,
      data: {
        text: MESSAGE.TEXT_DEVERLOP,
        bottomText2: MESSAGE.TEXT_BUTTON_CONFIRM,
        bottomColorText2: "black",
        btDisplay1: "none"
      }
    });
    dialog.afterClosed().subscribe((res) => {
    });
  }

  public onClick(index: number, recommed: any){ 
    let data = {
      index : index,
      recommed
    } 
    this.submitFollow.emit(data);
  }


}
