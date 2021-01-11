/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNumber } from 'class-validator';

export class UpdateNeedsRequest {

    public name: string;
    public active: boolean;
    public fullfilled: boolean;
    @IsNumber({}, { message: 'quantity is a number' })
    public quantity: number;
    public item: string;
}
