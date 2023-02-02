/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { AssetService } from './AssetService';
import { AuthenticationIdService } from './AuthenticationIdService';
import { ForgotPasswordActivateCodeService } from './ForgotPasswordActivateCodeService';
import { NotificationService } from './NotificationService';
import { PageService } from './PageService';
import { UserService } from './UserService';
import { FulfillmentService } from './FulfillmentService';
import { FulfillmentCaseService } from './FulfillmentCaseService';
import { UserLikeService } from './UserLikeService';
import { UserEngagementService } from './UserEngagementService';
import { UserConfigService } from './UserConfigService';
// import { UserBlockContentService } from './UserBlockContentService';
import { UniqueIdHistoryService } from './UniqueIdHistoryService';
import { StandardItemRequestService } from './StandardItemRequestService';
import { SocialPostLogsService } from './SocialPostLogsService';
import { SocialPostService } from './SocialPostService';
import { SearchHistoryService } from './SearchHistoryService';
import { PostsService } from './PostsService';
import { PostsGalleryService } from './PostsGalleryService';
import { PostsCommentService } from './PostsCommentService';
import { PageUsageHistoryService } from './PageUsageHistoryService';
import { PageSocialAccountService } from './PageSocialAccountService';
import { PageObjectiveService } from './PageObjectiveService';
import { PageConfigService } from './PageConfigService';
import { PageAccessLevelService } from './PageAccessLevelService';
import { ObjectID } from 'mongodb';

@Service()
export class DeleteUserService {

    constructor(
        private assetService: AssetService,
        private authenticationIdService: AuthenticationIdService,
        private forgotPasswordActivateCodeService: ForgotPasswordActivateCodeService,
        private notificationService: NotificationService,
        private pageService: PageService,
        private userService: UserService,
        private fulfillmentService: FulfillmentService,
        private userLikeService: UserLikeService,
        private userEngagementService: UserEngagementService,
        private userConfigService: UserConfigService,
        // private userBlockContentService:UserBlockContentService,
        private uniqueIdHistoryService: UniqueIdHistoryService,
        private standardItemRequestService: StandardItemRequestService,
        private socialPostLogsService: SocialPostLogsService,
        private socialPostService: SocialPostService,
        private searchHistoryService: SearchHistoryService,
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        private pageUsageHistoryService: PageUsageHistoryService,
        private pageSocialAccountService: PageSocialAccountService,
        private fulfillmentCaseService: FulfillmentCaseService,
        private pageObjectiveService: PageObjectiveService,
        private pageConfigService: PageConfigService,
        private postsGalleryService: PostsGalleryService,
        private pageAccessLevelService: PageAccessLevelService

    ) {
    }

    public deleteUser(userObjId: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const findAssetOwn = await this.assetService.findOne({ userId: userObjId });
            if (findAssetOwn !== undefined) {
                await this.assetService.deleteMany({ userId: userObjId });
            }
            const findAuthenOwn = await this.authenticationIdService.findOne({ user: userObjId });
            if (findAuthenOwn !== undefined) {
                await this.authenticationIdService.deleteMany({ user: userObjId });
            }
            const forgetPasswordOwn = await this.forgotPasswordActivateCodeService.findOne({ userId: userObjId });
            if (forgetPasswordOwn !== undefined) {
                await this.forgotPasswordActivateCodeService.deleteMany({ userId: userObjId });
            }
            const notifiOwn = await this.notificationService.findOne({ fromUser: userObjId });
            if (notifiOwn !== undefined) {
                await this.notificationService.deleteMany({ fromUser: userObjId });
            }
            const findFulfillmentOwn = await this.fulfillmentService.findOne({ user: userObjId });
            if (findFulfillmentOwn !== undefined) {
                await this.fulfillmentService.deleteMany({ user: userObjId });
            }
            const userLikeOwn = await this.userLikeService.findOne({ userId: userObjId });
            if (userLikeOwn !== undefined) {
                await this.userLikeService.deleteMany({ userId: userObjId });
            }
            const userEngagementOwn = await this.userEngagementService.findOne({ userId: userObjId });
            if (userEngagementOwn !== undefined) {
                await this.userEngagementService.deleteMany({ userId: userObjId });
            }
            const userConfigOwn = await this.userConfigService.findOne({ user: userObjId });
            if (userConfigOwn !== undefined) {
                await this.userConfigService.deleteMany({ user: userObjId });
            }
            /* 
            const userBlockOwn = await this.userBlockContentService.findOne({userId:userObjId});
            if(userBlockOwn !== undefined){
                await this.userBlockContentService.delete({userId:userObjId});
            } */
            const uniqueOwn = await this.uniqueIdHistoryService.findOne({ user: userObjId });
            if (uniqueOwn !== undefined) {
                await this.uniqueIdHistoryService.deleteMany({ user: userObjId });
            }
            const standardItemOwn = await this.standardItemRequestService.findOne({ user: userObjId });
            if (standardItemOwn !== undefined) {
                await this.standardItemRequestService.deleteMany({ user: userObjId });
            }

            const socialPostLogsOwn = await this.socialPostLogsService.findOne({ user: userObjId });
            if (socialPostLogsOwn !== undefined) {
                await this.socialPostLogsService.deleteMany({ user: userObjId });
            }
            const findAccessLevel1St = await this.pageAccessLevelService.findOne({ user: ObjectID(userObjId) });
            if(findAccessLevel1St.level === 'OWNER'){
                const postOwn = await this.postsService.findOne({ ownerUser: userObjId });
                if (postOwn !== undefined) {
                    await this.postsService.deleteMany({ ownerUser: userObjId });
                }
                const postCommentOwn = await this.postsCommentService.findOne({ user: userObjId });
                if (postCommentOwn !== undefined) {
                    await this.postsCommentService.deleteMany({ user: userObjId });
                }
            }
            const pageUsageOwn = await this.pageUsageHistoryService.findOne({ userId: userObjId });
            if (pageUsageOwn !== undefined) {
                await this.pageUsageHistoryService.deleteMany({ userId: userObjId });
            }
            const findOwnerLevel1St = await this.pageAccessLevelService.findOne({page:findAccessLevel1St.page,level:'OWNER'});
            // delete

            if (findAccessLevel1St !== undefined && findAccessLevel1St.level === 'OWNER') {
                const findPageOwn_1 = await this.pageService.findOne({ ownerUser: ObjectID(findAccessLevel1St.user) });
                const postOwn_1 = await this.postsService.findOne({ pageId: findAccessLevel1St.page });
                if (postOwn_1 !== undefined) {
                    await this.postsGalleryService.deleteMany({ pageId: findAccessLevel1St.page });
                }
                const searchHistoryOwn = await this.searchHistoryService.findOne({ userId: userObjId });
                if (searchHistoryOwn !== undefined) {
                    await this.searchHistoryService.deleteMany({ resultId: findAccessLevel1St.page });
                }
                const pageConfigOwn = await this.pageConfigService.findOne({ page: findAccessLevel1St.page });
                if (pageConfigOwn !== undefined) {
                    await this.pageConfigService.deleteMany({ page: findAccessLevel1St.page });
                }
                const pageObjectiveOwn = await this.pageObjectiveService.findOne({ pageId: findAccessLevel1St.page });
                if (pageObjectiveOwn !== undefined) {
                    await this.pageObjectiveService.deleteMany({ pageId: findAccessLevel1St.page });
                }
                const pageFulfillmentOwn = await this.fulfillmentCaseService.findOne({ pageId: findAccessLevel1St.page });
                if (pageFulfillmentOwn !== undefined) {
                    await this.fulfillmentCaseService.deleteMany({ pageId: findAccessLevel1St.page });
                }
                const pageSocialAccOwn = await this.pageSocialAccountService.findOne({ page: findAccessLevel1St.page });
                if (pageSocialAccOwn !== undefined) {
                    await this.pageSocialAccountService.deleteMany({ ownerPage: userObjId });
                }
                const socialPostOwn = await this.socialPostService.findOne({ pageId: findAccessLevel1St.page });
                if (socialPostOwn !== undefined) {
                    await this.socialPostService.deleteMany({ pageId: findAccessLevel1St.page });
                }
                if (findPageOwn_1 !== undefined) {
                    await this.pageAccessLevelService.deleteMany({ page: findAccessLevel1St.page });
                }
                if (findPageOwn_1 !== undefined) {
                    await this.pageService.deleteMany({ _id: findAccessLevel1St.page });
                }
            } else if (findAccessLevel1St !== undefined && findAccessLevel1St.level !== 'OWNER') {
                const query = {pageId:ObjectID(findAccessLevel1St.page)};
                const newValues = {$set:{ownerUser:ObjectID(findOwnerLevel1St.user)}};
                const updatePermission = await this.postsService.updateMany(query,newValues);
                if(updatePermission){
                    await this.pageAccessLevelService.delete({ page: findAccessLevel1St.page, level: findAccessLevel1St.level, user: ObjectID(userObjId) });
                }

            }
            // deleteOne User
            const userOwn = await this.userService.findOne({ _id: userObjId });
            if (userOwn) {
                await this.userService.delete({ _id: userObjId });
                resolve(userOwn.id);
            } else {
                reject(undefined);
            }
        });
    }
}