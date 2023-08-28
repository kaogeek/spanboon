/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class PagePostRequest {

    @IsNotEmpty({ message: 'title is required' })
    public title: string;
    @IsNotEmpty({ message: 'detail is required' })
    public detail: string;
    public story: any;
    public referenceMode: number;
    public isDraft: boolean;
    public postsHashTags: any;
    public userTags: any;
    public coverImage: any;
    public type: string;
    public needs: any[];
    public objective: string;
    public emergencyEvent: string;
    public postGallery: any[];
    public startDateTime: Date;
    public postType: string;
}
