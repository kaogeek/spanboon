/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from '@angular/core';
import { BadWordUtils } from '../../../utils/BadWordUtils';

@Pipe({
  name: 'removeBadWords'
})

export class RemoveBadWords implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value === undefined || value === null || value === '' || typeof value !== 'string') {
      return value;
    }

    return BadWordUtils.clean(value);
  }
}
