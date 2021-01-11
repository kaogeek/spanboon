/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SearchFilter } from '../../models/SearchFilter';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DialogWarningComponent } from './DialogWarningComponent.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'admin-autocomp-selector',
  templateUrl: './AutoCompSelector.component.html'
})
export class AutoCompSelector implements OnInit {

  private dialog: MatDialog;

  @ViewChild("inPut")
  public inPut: ElementRef;
  @Input("facade")
  public facade: any;
  @Input("title")
  public title: string;
  @Input("field")
  public field: string;
  @Input("fieldSearch")
  public fieldSearch: string | string[];
  @Input("data")
  public data: any;
  public options: any;
  public isLoading: boolean;

  constructor(dialog: MatDialog) {
    this.dialog = dialog;
    this.options = [];
    this.isLoading = false;
  }

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.data[this.field] = this.data[this.field] ? this.data[this.field] : [];
    if (this.data[this.field].length > 0) {
      let search: SearchFilter = new SearchFilter();
      search.whereConditions = "";
      search.count = false;
      let whereIn = "";
      for (let data of this.data[this.field]) {
        if (whereIn === "") {
          whereIn += "'"+data+"'";
        } else {
          whereIn += ", '"+data+"'";
        }
      }
      search.whereConditions = "id in (" + whereIn + ")";
      this.facade.search(search).then((res) => {
        this.data[this.field] = res;
      }).catch((err) => {
        this.dialogWarning(err.error.message);
      });
    } else {
      this.data[this.field] = [];
    }
  }

  public ngAfterViewInit(): void {
    fromEvent(this.inPut.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // Time in milliseconds between key events
      , debounceTime(1000)
      // If previous query is diffent from current   
      , distinctUntilChanged()
      // subscription for response
    ).subscribe((text: string) => {
      this.isLoading = true;
      this.keyUpAutoComp(text);
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

  private checkSelected(id: any): boolean {
    for (let d of this.data[this.field]) {
      if (d.id == id) {
        return true;
      }
    }
    return false;
  }

  private keyUpAutoComp(value: string): void {
    let isTitle: boolean = this.field === "roomId" || this.field === "tagId" ? false : true;
    let search: SearchFilter = new SearchFilter();
    let searchText = value.trim();
    search.limit = 5;
    search.whereConditions = "";
    search.count = false;
    if (searchText !== "") {
      search.whereConditions = isTitle ? "title like '%" + searchText + "%'" : "name like '%" + searchText + "%'";
      // for (let fieldSearch of  this.fieldSearch) {
      // if (search.whereConditions === "") {
      //   search.whereConditions =  fieldSearch+" like '%"+searchText+"%'";
      // } else {
      //   search.whereConditions =  "or "+fieldSearch+" like '%"+searchText+"%'";
      // }
      // }
    }
    this.facade.search(search).then((res: any) => {
      this.options = res.map(obj => {
        var rObj: any = obj;
        rObj["selected"] = this.checkSelected(obj.id);
        return rObj;
      });
      this.stopIsloading();
    }).catch((err: any) => {
      this.stopIsloading();
      this.dialogWarning(err.error.message);
    });
  }

  public changeSelect(value: any, del?: boolean): void {
    if (value.selected && !del) {
      this.data[this.field].push(value);
    } else {
      let index = 0;
      for (let d of this.data[this.field]) {
        if (d.id == value.id) {
          this.data[this.field].splice(index, 1);
          break;
        }
        index++;
      }
    }
  }

  public clearAutoComp(): void {
    this.inPut.nativeElement.value = "";
    this.options = [];
  }
}
