/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class CreateKaokaiTodayRequest {

    @IsNotEmpty({ message: 'title is required' })
    public title: string;
    public type: string;
    public field: string;
    public position:number;
    public flag: boolean;
    public limit: number;
    public buckets: any;
    public deleteIndex:any;

}