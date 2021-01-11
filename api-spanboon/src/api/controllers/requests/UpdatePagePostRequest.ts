/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class UpdatePagePostRequest {

    @IsNotEmpty({ message: 'Pagename is required' })
    public title: string;
    @IsNotEmpty({ message: 'Page Detail is required' })
    public detail: string;
    public pinned: boolean;
    public hidden: boolean;
    public isDraft: boolean;
    public type: string;
    public referenceMode: number;
}
