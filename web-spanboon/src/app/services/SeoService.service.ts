/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser'
import { environment } from '../../environments/environment';

export class MetaTag {
    name: string;
    value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {

    public keywords: string;
    public desc: string;
    public author: string;

    public webBaseURL = environment.webBaseURL;


    private keywordMeta: string = "keyword";
    private titleMeta: string = "title";
    private descriptionMeta: string = "description";
    private imageMeta: string = "image"; 

    private urlMetaFacebook: string = "og:url";
    private titleMetaFacebook: string = "og:title";
    private descriptionMetaFacebook: string = "og:description";
    private imageMetaFacebook: string = "og:image";
    private secureImageMetaFacebook: string = "og:image:secure_url";

    private urlMetaTwitter: string = "twitter:card";
    private titleMetaTwitter: string = "twitter:site";
    private descriptionMetaTwitter: string = "twitter:url";
    private imageMetaTwitter: string = "twitter:image";
    private secureImageMetaTwitter: string = "twitter:image:src";

    constructor(private title: Title, private meta: Meta) {

    }

    public updateTitle(title: string) {
        this.title.setTitle(title);
    }
    public setMetaInfo(url: string, title: string, description: string, image: string , keywords? :string): void {
        var tags = [
            new MetaTag(this.keywordMeta, keywords),
            new MetaTag(this.titleMeta, title),
            new MetaTag(this.descriptionMeta, description),
            new MetaTag(this.imageMetaFacebook, this.webBaseURL+image),
            new MetaTag(this.imageMeta, this.webBaseURL+image),

            new MetaTag(this.urlMetaFacebook, this.webBaseURL+url),
            new MetaTag(this.titleMetaFacebook, title),
            new MetaTag(this.descriptionMetaFacebook, description),
            new MetaTag(this.imageMetaFacebook, this.webBaseURL+image),
            new MetaTag(this.secureImageMetaFacebook, this.webBaseURL+image)
            
        ];
        this.updateMetaInfo(tags);
    }

    private updateMetaInfo(tags: MetaTag[]): void {
        tags.forEach(siteTag => {
            this.meta.updateTag({ property: siteTag.name, content: siteTag.value });
        }); 
    }


    // public updateMetaInfo(keywords: any, description: string, title: string, url?: string, image?: string) {

    //     if (keywords.length > 0 && keywords !== '' && keywords !== undefined && keywords !== null) {
    //         this.meta.updateTag({ name: 'keywords', content: keywords });
    //         this.meta.updateTag({ property: 'og:keywords', content: keywords });
    //     } else {
    //         this.meta.removeTag("name='keywords'")
    //     }
    //     if (description !== '' && description !== undefined && description !== null) {
    //         this.meta.updateTag({ name: 'description', content: description });
    //         this.meta.updateTag({ property: 'og:description', content: description });
    //         this.meta.updateTag({ name: 'twitter:description', content: description });
    //     } else {
    //         this.meta.removeTag("name='description'")
    //     }
    //     if (title !== '' && title !== undefined && title !== null) {
    //         this.meta.updateTag({ name: 'title', content: title });
    //         this.meta.updateTag({ name: 'twitter:title', content: title });
    //         this.meta.updateTag({ property: 'og:title', content: title });
    //     } else {
    //         this.meta.removeTag("name='description'")
    //     }
    //     this.meta.updateTag({ property: 'og:image', content: this.webBaseURL + image })
    //     this.meta.updateTag({ name: 'twitter:image', content: this.webBaseURL + image });
    //     this.meta.updateTag({ name: 'twitter:image:src', content: this.webBaseURL + image });

    //     this.meta.updateTag({ name: 'twitter:url', content: this.webBaseURL + image });
    //     this.meta.updateTag({ name: 'og:url', content: this.webBaseURL + url });
    //     this.meta.updateTag({ property: 'og:url', content: this.webBaseURL + url });

    // }

    public removeMeta() {
        this.meta.removeTag("name='keywords'");
        this.meta.removeTag("name='description'");
        this.meta.removeTag("name='og:url'");
    } 
}
