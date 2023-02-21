/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { BasePageUserRegisterRequest } from './BasePageUserRegisterRequest';

export class CreateUserRequest extends BasePageUserRegisterRequest {

    @IsEmail({}, { message: 'email is invalid' })
    @IsNotEmpty({ message: 'email is required' })
    public email: string;
    public password: string;
    public firstName: string;
    public lastName: string;
    @IsNotEmpty({ message: 'displayName is required' })
    public displayName: string;
    public uniqueId: string;
    public birthdate: Date;
    // @IsNotEmpty({ message: 'citizenId is required' })
    // @IsNumberString()
    // @Length(13, 13)
    public citizenId: string;
    public gender: number;
    public customGender: string;
    public asset: any;
    public appleUserId: any;
    public userId: any;
    public emailHide: any;
    public username: any;
    public isAdmin: boolean;
    public province: string;
}
