/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class CreatePageObjectiveRequest {

    public pageId: string;
    @IsNotEmpty({ message: 'title is required' })
    public title: string;
    public detail: string;
    public hashTag: string;
    public category: string;
    public asset: any;
    public personal: boolean;
}
