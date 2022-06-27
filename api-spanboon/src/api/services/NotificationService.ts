/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Notification } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { USER_TYPE } from '../../constants/NotificationType';
import { ObjectID } from 'mongodb';
import{ Injectable } from '@nestjs/common';
import * as serviceAccount from '../../../pushnotification-ac673-firebase-adminsdk-er6wo-9a5d90f8c3.json';
import { ServiceAccount } from 'firebase-admin';
import * as admin from 'firebase-admin';
import {DeviceTokenService} from '../services/DeviceToken';
@Injectable()
export class NotificationService {

    constructor(
        @OrmRepository() private notificationRepository: NotificationRepository,
        private deviceTokenService:DeviceTokenService
    ) {
        console.log('constructor called()');
        admin.initializeApp({
            credential:admin.credential.cert(serviceAccount as ServiceAccount),
            databaseURL:'https://pushnotification-ac673-default-rtdb.asia-southeast1.firebasedatabase.app/'
        });
        console.log('constructor executed()');
    }

    // find Notification
    public async find(findCondition: any): Promise<Notification[]> {
        return await this.notificationRepository.find(findCondition);
    }

    // find Notification
    public async findOne(findCondition: any): Promise<Notification> {
        return await this.notificationRepository.findOne(findCondition);
    }

    // create Notification
    public async create(searchHistory: Notification): Promise<Notification> {
        return await this.notificationRepository.save(searchHistory);
    }

    // update Notification
    public update(query: any, newValue: any): Promise<any> {
        return this.notificationRepository.updateOne(query, newValue);
    }

    // delete Notification
    public async delete(query: any, options?: any): Promise<any> {
        return await this.notificationRepository.deleteOne(query, options);
    }

    // delete Notification
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.notificationRepository.deleteMany(query, options);
    }

    // aggregate Notification
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.notificationRepository.aggregate(query, options).toArray();
    }

    // select distinct Notification
    public async distinct(key: any, query: any, options?: any): Promise<any> {
        return await this.notificationRepository.distinct(key, query, options);
    }

    // Search Notification
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.notificationRepository.count();
        } else {
            return this.notificationRepository.find(condition);
        }
    }

    public async createNotification(toUserId: string, toUserType: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string, data?: any): Promise<any> {

        const notification: Notification = new Notification();
        notification.isRead = false;
        notification.toUser = new ObjectID(toUserId);
        notification.toUserType = toUserType;
        notification.fromUser = new ObjectID(fromUserId);
        notification.fromUserType = fromUserType;
        notification.title = title;
        notification.link = link;
        notification.type = notificationType;
        notification.deleted = false;
        notification.data = data; 
        
        const token = data;
        const payload = {
            notification:{
                fromUserType,
                title
            }
        };
        Promise.all([await admin.messaging().sendToDevice(token,payload)]);
        return await this.create(notification);
    }
    public async createUserNotification(toUserId: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string,data?:any): Promise<any> {
        const token = data;
        return await this.createNotification(toUserId, USER_TYPE.PAGE, fromUserId, fromUserType, notificationType, title, link,token);
    }
}
