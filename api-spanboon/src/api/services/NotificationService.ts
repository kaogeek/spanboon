/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { OrmRepository } from 'typeorm-typedi-extensions';
import { Notification } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { USER_TYPE } from '../../constants/NotificationType';
import { ObjectID } from 'mongodb';
import { Service } from 'typedi';
import * as serviceAccount from '../../../firebase.json';
import { ServiceAccount } from 'firebase-admin';
import * as admin from 'firebase-admin';
@Service()
export class NotificationService {

    constructor(
        @OrmRepository() private notificationRepository: NotificationRepository,
    ) {
        console.log('constructor called()');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as ServiceAccount),
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

    // updateMany
    public updateMany(query: any, newValue: any): Promise<any> {
        return this.notificationRepository.updateMany(query, newValue);
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

    public async pushNotificationMessage(data: any, tokenId: any, date: any): Promise<any> {
        const title = 'ก้าวไกลหน้าหนึ่ง';
        let body = String(data.majorTrend.contents[0].post.title);
        if (body.length > 60) {
            body = body.substring(0, 60) + '...';
        }
        const image = data.majorTrend.contents[0].coverPageSignUrl ? data.majorTrend.contents[0].coverPageSignUrl : 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Move_Forward_Party_Logo.svg/180px-Move_Forward_Party_Logo.svg.png';
        const thaiDate = String(date);
        const token = String(tokenId);
        const notificationType = 'TODAY_NEWS';
        const link = process.env.APP_HOME + `?date=${thaiDate}`;
        const payload =
        {
            notification: {
                title,
                body,
                image,
            },
            data: {
                notificationType,
                link
            }
        };
        console.log('token -> inside', token);
        console.log('payload -> ', payload);
        if (String(token) !== undefined) {
            Promise.all([await admin.messaging().sendToDevice(token, payload)]);
        } else {
            return;
        }
    }

    public async sendNotificationFCM(toUserId: string, toUserType: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link: string, data?: any, displayName?: any, image?: any, id?: any, count?: any): Promise<any> {
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
        const token = String(data);
        const toUser = String(toUserId);
        const displayNameFCM = String(displayName);
        const link_noti = String(link);
        const image_url = String(image);
        const count_data = String(count);
        const notification_id = String(id);
        const payload =
        {

            notification: {
                toUser,
                fromUserId,
                title,
                link_noti,
                notificationType,
                displayNameFCM,
                image_url,
                notification_id,
                count_data

            }
        };
        if (String(notification.toUser) !== String(notification.fromUser)) {
            Promise.all([await admin.messaging().sendToDevice(token, payload)]);
        } else {
            return;
        }
    }

    public async createNotificationFCM(toUserId: string, toUserType: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link: string, data?: any, displayName?: any, image?: any, count?: any): Promise<any> {
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

        if (String(notification.toUser) !== String(notification.fromUser)) {
            return await this.create(notification);
        } else {
            return;
        }
    }
    public async createNotification(toUserId: string, toUserType: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string, data?: any, displayName?: any, image?: any): Promise<any> {
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
        if (String(notification.toUser) !== String(notification.fromUser)) {
            return await this.create(notification);
        } else {
            return;
        }
    }

    public async createUserNotificationFCM(toUserId: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string, data?: any, displayName?: any, image?: any, count?: any): Promise<any> {
        const token = data;
        return await this.createNotificationFCM(toUserId, USER_TYPE.PAGE, fromUserId, fromUserType, notificationType, title, link, token, displayName, image);
    }

    public async createUserNotification(toUserId: string, fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string, data?: any): Promise<any> {
        return await this.createNotification(toUserId, USER_TYPE.PAGE, fromUserId, fromUserType, notificationType, title, link);
    }

}
