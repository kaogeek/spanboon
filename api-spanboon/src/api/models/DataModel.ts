/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectID } from 'mongodb';

@Entity('DataModel')
export class DataModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'description' })
    public description: string;

    @Column({ name: 'dataProcessor' })
    public dataProcessor: string;

    @Column({ name: 'dataSource' })
    public dataSource: string;

    @Column({ name: 'config' })
    public config: any;
}