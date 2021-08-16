/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser'
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class SeoService {

    public keywords: string;
    public desc: string;
    public author: string;

    public webBaseURL = environment.webBaseURL

    constructor(private title: Title, private meta: Meta) {

    }

    public updateTitle(title: string) {
        this.title.setTitle(title);
    }

    public addMetaInfo(keywords: string, url: string) {
        this.meta.addTags([
            { name: 'keywords', content: keywords },
            { name: 'description', content: '#' + keywords },
            { name: 'robots', content: 'index, follow' },
            // { name: 'author', content: 'John Smith' },  
            { name: 'og:url', content: this.webBaseURL + url },
        ]);
    }

    public updateMetaInfo(keywords: any, description: string, author?: string, url?: string ) {

        if (keywords.length > 0 && keywords !== '' && keywords !== undefined && keywords !== null) {
            // console.log('keywords ',keywords)
            this.meta.updateTag({ name: 'keywords', content: keywords });
        } else {
            this.meta.removeTag("name='keywords'")
        }
        if (description !== '' && description !== undefined && description !== null) {
            this.meta.updateTag({ name: 'description', content: description });
        } else {
            this.meta.removeTag("name='description'")
        } 
        this.meta.updateTag({ property : 'og:image' , content: '../../asset/img/favicon.svg' })

        this.meta.updateTag({ name: 'og:url', content: this.webBaseURL + url });
        this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    }

    public removeMeta() {
        this.meta.removeTag("name='keywords'");
        this.meta.removeTag("name='description'");
        this.meta.removeTag("name='og:url'");
    }

    public showMeta() {
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
