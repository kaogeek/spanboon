/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty } from 'class-validator';
import 'reflect-metadata';

export class UpdatePageObjectiveRequest {

    @IsNotEmpty()
    public pageId: string;
    public title: string;
    public detail: string;
    public hashTag: string;
    public asset: any;
    public category: string;
    public personal: boolean;
}
