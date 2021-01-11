/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prefixNumber'
})

export class PrefixNumberPipe implements PipeTransform {
  transform(number: any, ...args: any[]): any {
    if (isNaN(number) || number === undefined || number === null) {
      number = 0;
    }

    let digit = (args !== undefined && args.length > 0) ? args[0] : undefined;
    if (isNaN(digit) || digit === undefined || digit === null || digit <= 0) {
      return number;
    }

    let resultString = number+'';
    for (let i = resultString.length; i < digit; i++) {
      resultString = "0"+resultString;
    }

    return resultString;
  }
}
