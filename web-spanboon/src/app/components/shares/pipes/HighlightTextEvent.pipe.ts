/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'highlightevent'
})

export class HighlightTextEvent implements PipeTransform {
    transform(text: any, option?: string, url?: string, hidebar?: boolean): string {
        if (text !== undefined && text !== null) {
            var pattern = text.match(/#[\wก-๙]+/g);
            var link = text.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
            if (link !== null && link.length > 0) {
                for (let item of link) {
                    text = text.replace(item, (match) => `<a class="highlight-text" href="${item.replace("#", "")}" target="_blank">${match}</a>`)
                }
            }
            if (pattern !== null && pattern.length > 0) {
                if (hidebar) {
                    for (let item of pattern) {
                        text = text.replace(item, (match) => `<a class="highlight-text" href="${url}/search?hashtag=${item.replace("#", "")}&emertag=${option}">${match}</a>`)
                    }
                } else {
                    for (let item of pattern) {
                        text = text.replace(item, (match) => `<a class="highlight-text" href="${url}/search?hashtag=${item.replace("#", "")}&emertag=${option}&hidebar=true">${match}</a>`)
                    }
                }
            }
            return text;
        }
    }
}
