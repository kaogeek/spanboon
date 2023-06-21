import 'reflect-metadata';
import { ObjectID } from 'typeorm';

export class ManipulatePostRequest {

    public userId: string;
    public postId:ObjectID;
    public pageIdOwnerPost:ObjectID;
    public userIdOwnerPost:ObjectID;
    public type: string;
    public detail: string;
}