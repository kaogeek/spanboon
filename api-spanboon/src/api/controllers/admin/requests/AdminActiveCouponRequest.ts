/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty ,IsBoolean, IsString } from 'class-validator';

export class AdminActiveCouponRequest {

    @IsNotEmpty()
    @IsBoolean()
    public active: boolean;

    @IsNotEmpty()
    @IsString()
    public expireDate: Date;

    @IsNotEmpty()
    @IsString()
    public activeDate: Date;

    @IsNotEmpty()
    @IsString()
    public id: string;

    @IsNotEmpty()
    @IsString()
    public userId: string;
}
