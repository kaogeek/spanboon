import 'reflect-metadata';
import { ObjectID } from 'typeorm';

export class ManipulateRequest {

    public userId: string;
    public postId:ObjectID;
    public pageIdOwner:ObjectID;
    public userIdOwner:ObjectID;
    public type: string;
    public detail: string;
}