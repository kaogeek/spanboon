/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class CreateAllocateRequest {

    @IsNotEmpty({ message: 'needsId is required.' })
    public needsId: string;
    @IsNotEmpty({ message: 'amount is required.' })
    public amount: number;
    @IsNotEmpty({ message: 'fulfillmentReqId is required.' })
    public fulfillmentReqId: string;

}