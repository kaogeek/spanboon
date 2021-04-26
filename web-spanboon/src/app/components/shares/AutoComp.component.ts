/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchFilter } from '../../models/SearchFilter';
import { Observable, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogAlert } from './dialog/dialog';
import { MESSAGE } from '../../../custom/variable';
import { MatAutocompleteTrigger } from '@angular/material';

@Component({
  selector: 'autocomp',
  templateUrl: './AutoComp.component.html'
})
export class AutoComp implements OnInit {

  @Input("facade")
  protected facade: any;
  @Input("title")
  public title: string;
  @Input("field")
  public field: string;
  @Input("fieldValue")
  public fieldValue: string | string[];
  @Input("whereConditions")
  protected whereConditions: string[];
  @Input("data")
  public data: any;
  @Input()
  public autoCompHashTag: string;

  @ViewChild("inPut", { static: false })
  public inPut: ElementRef;

  @ViewChild('inPut', { static: false, read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;

  public autoComp: any;
  public autoCompControl = new FormControl();
  public options: any[];
  public filteredOptions: Observable<any[]>;
  public isLoading: boolean;
  public isDisabled: boolean;

  private dialog: MatDialog;

  constructor(dialog: MatDialog) {
    this.dialog = dialog;
    this.options = [];
    this.isDisabled = false;
    this.isLoading = false;
  }

  public ngOnInit() {
    window.addEventListener('scroll', this.scrollEvent, true);
  }

  scrollEvent = (event: any): void => {
    if (this.autoComplete.panelOpen)
      // this.autoComplete.closePanel();
      this.autoComplete.updatePosition();
  };

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.data[this.field]) {
      this.facade.find(this.data[this.field]).then((res) => {
        this.autoComp = this.getLabel(res);
        this.autoCompControl.setValue(this.autoComp);
      }).catch((err) => {
        this.dialogWarning(err.error.message);
      });
    }
  }

  public ngAfterViewInit(): void {
    fromEvent(this.inPut.nativeElement, 'keyup').pipe(
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
      this.isLoading = true;
      this.keyUpAutoComp(text);
    });

    // fromEvent(this.inPut.nativeElement, 'focusout').pipe(
    //   // get value
    //   map((event: any) => {
    //     return event.target.value;
    //   })
    //   // Time in milliseconds between key events
    //   , debounceTime(100)
    //   // If previous query is diffent from current
    //   , distinctUntilChanged()
    //   // subscription for response
    // ).subscribe(() => {
    //   // this.focusOutAutoComp();
    // });
  }

  private stopIsloading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 250);
  }

  private dialogWarning(message: string): void {
    this.dialog.open(DialogAlert, {
      data: {
        title: message,
        error: true
      }
    });
  }

  public getLabel(option: any): string {
    var result = "";
    for (let field of this.whereConditions) {
      if (result === "") {
        result += option[field];
      } else {
        result += " " + option[field];
      }
    }
    return result;
  }

  private keyUpAutoComp(value: string): void {
    let search: SearchFilter = new SearchFilter();
    let searchText = value.trim();
    search.limit = 5;
    search.count = false;
    search.whereConditions = "";
    for (let whereCondition of this.whereConditions) {
      if (search.whereConditions === "") {
        search.whereConditions += whereCondition + " like '%" + searchText + "%'";
      } else {
        search.whereConditions += "or " + whereCondition + " like '%" + searchText + "%'";
      }
    }
    this.facade.search(search).then((res: any) => {
      this.options = res;
      this.stopIsloading();
      this.data[this.field] = searchText;
    }).catch((err: any) => {
      // console.log(err);
      this.stopIsloading();
      this.dialogWarning(err.error.message);
    });
  }

  // public onClickSearch(): void {
  //   if (!this.autoComp && !this.isDisabled) {
  //     this.isLoading = true;
  //     this.keyUpAutoComp("");
  //   }
  // }

  public clearAutoComp(): void {
    this.isDisabled = false;
    this.data[this.field] = undefined;
    this.autoComp = undefined;
    this.autoCompControl.setValue("");
    setTimeout(() => {
      this.inPut.nativeElement.blur();
    }, 10);
  }

  public focusOutAutoComp(): void {
    if (this.autoComp !== this.autoCompControl.value) {
      this.data[this.field] = undefined;
      this.autoComp = undefined;
      this.autoCompControl.setValue("");
    }
  }

  public selectAutoComp(option: any): void {
    if (Array.isArray(this.fieldValue)) {
      for (let fieldName of this.fieldValue) {
        this.data[fieldName] = option[fieldName];
      }
    } else {
      this.data[this.field] = option[this.fieldValue];
    }

    this.autoComp = this.getLabel(option);
    this.autoCompControl.setValue(this.autoComp);
    this.isDisabled = true;
    setTimeout(() => {
      this.inPut.nativeElement.blur();
    }, 10);
  }
}
