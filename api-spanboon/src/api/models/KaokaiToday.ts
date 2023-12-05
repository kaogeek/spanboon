import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('KaokaiToday')
export class KaokaiToday extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'type'})
    public type: string;

    @Column({ name: 'field'})
    public field:string;

    @Column({ name: 'flag'})
    public flag:boolean;

    @Column({ name: 'pics'})
    public pics:boolean;

    @Column({ name: 'buckets' })
    public buckets: any;

    @Column({ name: 'limit'})
    public limit: number;

    @Column({ name: 'position'})
    public position: number;

    @BeforeInsert()
    public createDetails(): any {
        this.createdDate = moment().toDate();
        this.createdTime = moment().toDate();
    }

    @BeforeUpdate()
    public updateDetails(): any {
        this.updateDate = moment().toDate();
    }
}