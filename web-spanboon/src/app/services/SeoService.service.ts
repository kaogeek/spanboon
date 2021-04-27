/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser'
@Injectable({
    providedIn: 'root'
})
export class SeoService {

    public keywords: string;
    public desc: string;
    public author: string;

    constructor(private title: Title, private meta: Meta) {

    }

    updateTitle(title: string) {
        console.log(title)
        this.title.setTitle(title);
    }

    updateMetaInfo(keywords: string, desc: string, author?: string) {
        this.keywords = keywords;
        this.desc = desc;
        this.author = author;
        // this.meta.updateTag({ name: 'description', content: desc });
        // this.meta.updateTag({ name: 'author', content: author });
        // this.meta.updateTag({ name: 'keywords', content: keywords });
    }

    public showMeta(){ 
        return this.meta.addTags([
            { name: 'keywords', content: this.keywords },
            { name: 'description', content: this.desc },
            { name: 'robots', content: 'index, follow' },
            { name: 'author', content: this.author },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' }, 
            { charset: 'UTF-8' }
        ]);
    }
}
