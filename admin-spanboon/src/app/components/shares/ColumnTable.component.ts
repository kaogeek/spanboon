/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input } from '@angular/core';
import { FieldTable } from './TableComponent.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'admin-col-table',
  templateUrl: './ColumnTable.component.html'
})
export class ColumnTable implements OnInit {
  protected baseURL: string;

  @Input()
  public fieldTable: FieldTable;
  @Input()
  public data: any;
  public isSeeMore: boolean = false;

  constructor() {
    this.baseURL = environment.apiBaseURL;
  }

  public ngOnInit() {
  }

  public getLink(): string {
    let url = "";
    for (const link of this.fieldTable.link) {
      url += link.isField ? this.data[link.link] : link.link;
    }
    return url;
  }

  public isWordCountOver(data: string): boolean {
    if (data === undefined || data === null) {
      return false;
    }

    return data.length > 220;
  }

  public clickOpenDropDown(): void {
    this.isSeeMore = !this.isSeeMore;
  }
}
