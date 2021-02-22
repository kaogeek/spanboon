/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('PageSocialAccount')
export class PageSocialAccount {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'page' })
    public page: ObjectID;

    @Column({ name: 'lastAuthenTime' })
    public lastAuthenTime: Date;

    @Column({ name: 'lastSuccessAuthenTime' })
    public lastSuccessAuthenTime: Date;

    @Column({ name: 'providerName' })
    public providerName: string;

    @Column({ name: 'providerPageId' })
    public providerPageId: any;

    @Column({ name: 'storedCredentials' })
    public storedCredentials: string;

    @Column({ name: 'properties' })
    public properties: any;

}