/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Column } from 'typeorm';
import { ObjectID } from 'mongodb';
import { Exclude } from 'class-transformer';

export abstract class BaseModel {

    @Exclude()
    @Column({ name: 'createdBy' })
    public createdBy: ObjectID;

    @Column({ name: 'createdDate' })
    public createdDate: Date;

    @Column({ name: 'createdTime' })
    public createdTime: Date;

    @Column({ name: 'createdByUsername' })
    public createdByUsername: string;

    @Exclude()
    @Column({ name: 'updateDate' })
    public updateDate: Date;

    @Column({ name: 'updateByUsername' })
    public updateByUsername: string;
}
