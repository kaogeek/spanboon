/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('SearchHistory')
export class SearchHistory {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @ObjectIdColumn({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'clientId' })
    public clientId: string;

    @Column({ name: 'ip' })
    public ip: string;

    @Column({ name: 'keyword' })
    public keyword: string;

    @Column({ name: 'resultType' })
    public resultType: string;

    @Column({ name: 'resultId' })
    public resultId: string;

    @Column({ name: 'createdDate' })
    public createdDate: Date;

    @Column({ name: 'createdTime' })
    public createdTime: Date;
}