/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchFilter } from '../../models/SearchFilter';
import { Observable, fromEvent } from 'rxjs';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DialogWarningComponent } from './DialogWarningComponent.component';
import { MatDialog } from '@angular/material/dialog';

export interface autoComp {
  id: string;
  name: string;
  roomId: string;
}

@Component({
  selector: 'admin-autocomp',
  templateUrl: './AutoComp.component.html'
})
export class AutoComp implements OnInit {

  private dialog: MatDialog;

  @ViewChild("inPut")
  public inPut: ElementRef;
  @Input("facade")
  public facade: any;
  @Input("title")
  public title: string;
  @Input("field")
  public field: string;
  @Input("data")
  public data: any;
  @Input("whereConditionsPlus")
  public whereConditionsPlus: any;
  @Input("isDisabled")
  public isDisabled: boolean;
  public autoComp: any;
  public autoCompControl = new FormControl();
  public options: autoComp[];
  public filteredOptions: Observable<autoComp[]>;
  public isLoading: boolean;

  constructor(dialog: MatDialog) {
    this.dialog = dialog;
    this.options = [];
    this.isDisabled = false;
    this.isLoading = false;
  }

  public ngOnInit() {
    this.filteredOptions = this.autoCompControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this.filter(name) : this.options.slice())
      );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.data[this.field]) {
      this.isLoading = true;
      this.isDisabled = true;
      this.facade.find(this.data[this.field]).then((res) => {
        this.autoComp = res.name ? res.name : res.title;
        this.autoCompControl.setValue(this.autoComp);
        this.isDisabled = false;
        this.stopIsloading();
      }).catch((err) => {
        this.isDisabled = false;
        this.stopIsloading();
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
    fromEvent(this.inPut.nativeElement, 'focusout').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // Time in milliseconds between key events
      , debounceTime(100)
      // If previous query is diffent from current   
      , distinctUntilChanged()
      // subscription for response
    ).subscribe(() => {
      this.focusOutAutoComp();
    });
  }

  private stopIsloading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  private dialogWarning(message: string): void {
    this.dialog.open(DialogWarningComponent, {
      data: {
        title: message,
        error: true
      }
    });
  }

  private filter(name: string): autoComp[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  private keyUpAutoComp(value: string): void {
    let isTitle = this.field === "roomId" || this.field === "tagId" ? false : true;
    let search: SearchFilter = new SearchFilter();
    let searchText = value.trim();
    search.limit = 5;
    search.whereConditions = "";
    search.count = false;
    if (searchText !== "") {
      search.whereConditions = isTitle ? "title like '%" + searchText + "%'" : "name like '%" + searchText + "%'";
    }
    if (this.whereConditionsPlus) {
      search.whereConditions += search.whereConditions === "" ? this.whereConditionsPlus : " and " + this.whereConditionsPlus;
    }
    this.facade.search(search).then((res: any) => {
      this.options = res.map(obj => {
        var rObj: autoComp = {
          id: obj.id,
          name: isTitle ? obj.title : obj.name,
          roomId: obj.roomId
        };
        return rObj;
      });
      this.stopIsloading();
    }).catch((err: any) => {
      this.stopIsloading();
      this.dialogWarning(err.error.message);
    });
  }

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
    this.data[this.field] = option.id;
    if (this.field === "proposalId") {
      this.data["roomId"] = option.roomId;
    }
    this.autoComp = option.name;
    this.autoCompControl.setValue(option.name);
    this.isDisabled = true;
    setTimeout(() => {
      this.inPut.nativeElement.blur();
    }, 10);
  }
}
