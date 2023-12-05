/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';
import { ObjectID } from 'typeorm';

export class IsRead {
    @IsNotEmpty({ message: 'isRead is required' })
    public userId: ObjectID;
    public postId: any;
    public isRead: boolean;
    public createdDate: Date;
}
