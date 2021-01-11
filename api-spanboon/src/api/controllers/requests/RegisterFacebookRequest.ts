/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';
import { BasePageUserRegisterRequest } from './BasePageUserRegisterRequest';

export class RegisterFaceBookRequest extends BasePageUserRegisterRequest {

    // facebook authen field
    @IsNotEmpty({ message: 'Facebook UserId is required' })
    public fbUserId: string;

    @IsNotEmpty({ message: 'Facebook Token is required' })
    public fbToken: string;

    @IsNotEmpty({ message: 'Facebook ExpirationTime is required' })
    public fbAccessExpirationTime: number;

    @IsNotEmpty({ message: 'Facebook SignedRequest is required' })
    public fbSignedRequest: string;
}
