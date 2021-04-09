import { Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser'
@Injectable({
    providedIn: 'root'
})
export class SeoService {

    constructor(private title: Title, private meta: Meta) {

    }

    updateTitle(title: string) {
        console.log(title)
        this.title.setTitle(title);
    }

    updateMetaInfo(keywords: string, desc: string, author?: string) {
        this.meta.updateTag({ name: 'description', content: desc });
        this.meta.updateTag({ name: 'author', content: author });
        this.meta.updateTag({ name: 'keywords', content: keywords });
    }
}
