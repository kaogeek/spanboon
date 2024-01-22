/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'readmore'
})

export class ReadmorePipe implements PipeTransform {
  transform(text: any, count: number): any {
    if (text.length > count) {
      const textslice = text.slice(0, count);
      const finalText = `${textslice}<span (click)="showMore()">[show more]</span>`;
      return finalText;
    } else {
      return text;
    }
  }
}
