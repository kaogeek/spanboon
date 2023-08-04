import { NotificationService } from './NotificationService';
import { PageService } from './PageService';
import { UserFollowService } from './UserFollowService';
import { PageAccessLevelService } from './PageAccessLevelService';
import { Notification } from '../models/Notification';
import { Page } from '../models/Page';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { USER_TYPE } from '../../constants/NotificationType';
import { ObjectID } from 'mongodb';
import { Service } from 'typedi';
@Service()
export class PageNotificationService {

    constructor(
        private notificationService: NotificationService,
        private userFollowService: UserFollowService,
        private pageService: PageService,
        private pageAccessLevelService: PageAccessLevelService
    ) { }

    public async notifyToUserFollow(pageId: string, notificationType: string, title: string, link?: string): Promise<Notification[]> {
        // check pageId
        const page: Page = await this.pageService.findOne({ where: { _id: new ObjectID(pageId), banned: false } });

        if (page === undefined) {
            return [];
        }

        // search all user follow
        const whereConditions = {
            subjectId: page.id,
            subjectType: SUBJECT_TYPE.PAGE
        };
        const userfollowList = await this.userFollowService.search(null, null, ['userId'], null, whereConditions, null, false);

        const result: Notification[] = [];
        if (userfollowList) {
            for (const userObjId of userfollowList) {
                const notification = await this.notificationService.createUserNotification(userObjId.userId + '', page.id + '', USER_TYPE.PAGE, notificationType, title, link);
                result.push(notification);
            }
        }

        return result;
    }

    public async notifyToPageUserObjective(
        toPageId: string,
        pageLevel?: string[],
        fromUserId?: string,
        fromUserType?: string,
        notificationType?: string,
        title?: string,
        link?: string,
        displayName?: any,
        image?: any,
        count?: any,
        mode?: any): Promise<any> {
        // check pageId
        const page: Page = await this.pageService.findOne({ where: { _id: new ObjectID(toPageId), banned: false } });
        if (page === undefined) {
            return [];
        }
        const checkMode = mode;
        const pageAccess = await this.pageAccessLevelService.getAllPageUserAccess(toPageId, pageLevel);
        const result: Notification[] = [];
        if (pageAccess) {
            const addedUesr = [];
            for (const userAccess of pageAccess) {
                const userId = userAccess.user + '';
                const pageId = userAccess.page + '';

                if (addedUesr.indexOf(userId) >= 0) {
                    continue;
                }
                const notification = await this.notificationService.createUserNotificationObjective(
                    userId,
                    fromUserId,
                    fromUserType,
                    notificationType,
                    title,
                    link,
                    displayName,
                    image,
                    count,
                    checkMode,
                    pageId,

                );
                result.push(notification);

                addedUesr.push(userId);
            }
        }
        return result;
    }

    public async notifyToPageUserFcm(toPageId: string, pageLevel: string[], fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string, displayName?: any, image?: any, count?: any): Promise<any> {
        // check pageId
        const page: Page = await this.pageService.findOne({ where: { _id: new ObjectID(toPageId), banned: false } });
        if (page === undefined) {
            return [];
        }
        const pageAccess = await this.pageAccessLevelService.getAllPageUserAccess(toPageId, pageLevel);
        const result: Notification[] = [];
        if (pageAccess) {
            const addedUesr = [];
            for (const userAccess of pageAccess) {
                const userId = userAccess.user + '';

                if (addedUesr.indexOf(userId) >= 0) {
                    continue;
                }
                const notification = await this.notificationService.createUserNotificationFCM(
                    userId,
                    fromUserId,
                    fromUserType,
                    notificationType,
                    title,
                    link,
                    displayName,
                    image,
                    count,
                    notificationType,
                    undefined,
                );
                result.push(notification);

                addedUesr.push(userId);
            }
        }
        return result;
    }
    public async notifyToPageUser(toPageId: string, pageLevel: string[], fromUserId: string, fromUserType: string, notificationType: string, title: string, link?: string, data?: any, displayName?: any): Promise<any> {
        // check pageId
        const page: Page = await this.pageService.findOne({ where: { _id: new ObjectID(toPageId), banned: false } });

        if (page === undefined) {
            return [];
        }
        const pageAccess = await this.pageAccessLevelService.getAllPageUserAccess(toPageId, pageLevel);

        const result: Notification[] = [];
        if (pageAccess) {
            const addedUesr = [];
            for (const userAccess of pageAccess) {
                const userId = userAccess.user + '';

                if (addedUesr.indexOf(userId) >= 0) {
                    continue;
                }
                const notification = await this.notificationService.createUserNotification(
                    userId,
                    fromUserId,
                    fromUserType,
                    notificationType,
                    title,
                    link,
                    displayName
                );

                result.push(notification);

                addedUesr.push(userId);
            }
        }

        return result;
    }
}