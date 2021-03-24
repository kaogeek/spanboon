/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class CreatePageRequest {

    @IsNotEmpty({ message: 'Pagename is required' })
    public name: string;
    public pageUsername: string;
    public subTitle: string;
    public backgroundStory: string;
    public detail: string;
    public coverPosition: number;
    public color: string;
    public category: string;
    public asset: any;
    public email: string;
}
