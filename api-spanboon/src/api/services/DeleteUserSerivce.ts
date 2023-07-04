/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { AssetService } from './AssetService';
import { AuthenticationIdService } from './AuthenticationIdService';
// import { ForgotPasswordActivateCodeService } from './ForgotPasswordActivateCodeService';
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
import { PostsCommentService } from './PostsCommentService';
import { PageUsageHistoryService } from './PageUsageHistoryService';
import { PageSocialAccountService } from './PageSocialAccountService';
import { PageObjectiveService } from './PageObjectiveService';
import { PageConfigService } from './PageConfigService';
import { PageAccessLevelService } from './PageAccessLevelService';
import { ObjectID } from 'mongodb';
import { PostsGalleryService } from './PostsGalleryService';
import { UserFollowService } from './UserFollowService';
import { UserReportContentService } from './UserReportContentService';
// import { ChatMessageService } from './ChatMessageService';
// import { ChatRoomService } from './ChatRoomService';
import { CustomItemService } from './CustomItemService';
import { DeviceTokenService } from './DeviceToken';
import { FulfillmentAllocateStatementService } from './FulfillmentAllocateStatementService';
import { HidePostService } from './HidePostService';
import { IsReadPostService } from './IsReadPostService';
import { NeedsService } from './NeedsService';
import { OtpService } from './OtpService';
import { UserBlockContentService } from './UserBlockContentService';
@Service()
export class DeleteUserService {

    constructor(
        private assetService: AssetService,
        private authenticationIdService: AuthenticationIdService,
        // private forgotPasswordActivateCodeService: ForgotPasswordActivateCodeService,
        private notificationService: NotificationService,
        private pageService: PageService,
        private userService: UserService,
        private fulfillmentService: FulfillmentService,
        private userLikeService: UserLikeService,
        private userEngagementService: UserEngagementService,
        private userConfigService: UserConfigService,
        private userBlockContentService: UserBlockContentService,
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
        private pageAccessLevelService: PageAccessLevelService,
        private postsGalleryService: PostsGalleryService,
        private userFollowService: UserFollowService,
        private userReportContentService: UserReportContentService,
        // private chatMessageService:ChatMessageService,
        // private chatRoomService:ChatRoomService,
        private customItemService: CustomItemService,
        private deviceTokenService: DeviceTokenService,
        private fulfillmentAllocateStatementService: FulfillmentAllocateStatementService,
        private hidePostService: HidePostService,
        private isReadPostService: IsReadPostService,
        private needsService: NeedsService,
        private otpService: OtpService

    ) {
    }

    public async deleteUserPageAccessOwn(user: string): Promise<any> {
        // delete authen user
        const objIds = new ObjectID(user);
        const authen = await this.authenticationIdService.findOne({ user: objIds });
        if (authen) {
            await this.authenticationIdService.deleteMany({ _id: authen.id });
        }

        // delete page && delete post
        // group letter page post
        const page = await this.pageService.findOne({ ownerUser: objIds });
        const postPage = await this.postsService.findOne({ pageId: page.id });
        if (page) {
            await this.pageService.deleteMany({ _id: page.id });
            await this.postsService.deleteMany({ pageId: page.id, ownerUser: page.ownerUser });
            await this.postsCommentService.deleteMany({ commentAsPage: page.id });
            await this.postsCommentService.deleteMany({ user: page.ownerUser });
            await this.postsGalleryService.deleteMany({ post: postPage.id });
            await this.pageConfigService.deleteMany({ page: page.id });
            await this.pageObjectiveService.deleteMany({ pageId: page.id });
            await this.pageSocialAccountService.deleteMany({ page: page.id });
            await this.pageUsageHistoryService.deleteMany({ userId: objIds });
            await this.pageAccessLevelService.deleteMany({ user: objIds });
            // socialpost can find pageId and postId
            await this.socialPostService.deleteMany({ pageId: page.id, postId: postPage.id });
            await this.socialPostLogsService.deleteMany({ pageId: page.id });
            await this.userLikeService.deleteMany({ likeAsPage: page.id });

            // fulfillment
            await this.fulfillmentService.deleteMany({ pageId: page.id });
            await this.fulfillmentAllocateStatementService.deleteMany({ postId: postPage.id });
            await this.fulfillmentCaseService.deleteMany({ pageId: page.id });

            // group N

            await this.needsService.deleteMany({ pageId: page.id });
            await this.notificationService.deleteMany({ toUser: objIds });
            await this.notificationService.deleteMany({ fromUser: objIds });

        }

        // group letter S 
        const search = await this.searchHistoryService.findOne({ userId: objIds });
        if (search) {
            await this.searchHistoryService.deleteMany({ userId: objIds });
            await this.standardItemRequestService.deleteMany({ user: objIds });
        }

        // group letter c
        await this.customItemService.deleteMany({ userId: objIds });
        await this.deviceTokenService.deleteMany({ userId: objIds });

        // group U
        const userObjs = await this.userService.findOne({ _id: objIds });
        if (userObjs) {
            await this.uniqueIdHistoryService.deleteMany({ user: objIds });
            await this.userConfigService.deleteMany({ user: objIds });
            await this.userEngagementService.deleteMany({ userId: objIds });
            await this.userFollowService.deleteMany({ userId: objIds });
            await this.userLikeService.deleteMany({ likeAsPage: page.id });
            await this.userLikeService.deleteMany({ userId: objIds });
            await this.userReportContentService.deleteMany({ reporter: objIds });
            await this.hidePostService.delete({ userId: objIds });
            await this.isReadPostService.delete({ userId: objIds });
            await this.userBlockContentService.deleteMany({ userId: objIds });
            // asset
            await this.otpService.deleteMany({ userId: objIds });
            await this.assetService.deleteMany({ userId: objIds });
            await this.userService.delete({ _id: objIds });
        }

        return userObjs.id;
    }

    public async deleteUserNoPage(user: string): Promise<any> {
        const objIds = new ObjectID(user);

        // check admin 
        const pageAccess = await this.pageAccessLevelService.find({ user: objIds, level: 'ADMIN' });
        if (pageAccess.length > 0 && pageAccess !== undefined && pageAccess !== null) {
            for (let i = 0; i < pageAccess.length; i++) {
                const pageOwner = await this.pageAccessLevelService.findOne({ page: pageAccess[i].page, level: 'OWNER' });
                const deletePageAccessAdmin = await this.pageAccessLevelService.deleteMany({ user: objIds, level: 'ADMIN' });
                // update post
                if (pageOwner && deletePageAccessAdmin) {
                    const query = { pageId: pageOwner.page, ownerUser: objIds };
                    const newValues = { $set: { ownerUser: pageOwner.user } };
                    await this.postsService.updateMany(query, newValues);
                }
                // update comment 
                const queryComment = { commnetAsPage: pageOwner.page, ownerUser: objIds };
                const newValueComment = { $set: { user: pageOwner.user } };
                await this.postsCommentService.updateMany(queryComment, newValueComment);
            }
        }

        // group letter c
        const findCustomItem = await this.customItemService.findOne({ userId: objIds });
        if (findCustomItem !== undefined && findCustomItem !== null) {
            await this.customItemService.deleteMany({ userId: objIds });
        }
        const findDeviceToken = await this.deviceTokenService.findOne({ userId: objIds });
        if (findDeviceToken !== undefined && findDeviceToken !== null) {
            await this.deviceTokenService.deleteMany({ userId: objIds });
        }

        // group Po
        const postPage = await this.postsService.findOne({ ownerUser: objIds });
        if (postPage !== undefined && postPage !== null) {
            await this.postsService.deleteMany({ _id: postPage.id });
            const findPostComments = await this.postsCommentService.findOne({ user: objIds });
            if (findPostComments !== undefined && findPostComments !== null) {
                await this.postsCommentService.deleteMany({ user: objIds });
            }
            const findPostGallerService = await this.postsGalleryService.findOne({ post: postPage.id });
            if (findPostGallerService !== undefined && findPostGallerService !== null) {
                await this.postsGalleryService.deleteMany({ post: postPage.id });
            }
        }

        // group S
        const findSearchHistory = await this.searchHistoryService.findOne({ userId: objIds });
        if (findSearchHistory) {
            await this.searchHistoryService.deleteMany({ userId: objIds });
        }

        const socialPostLogs = await this.socialPostLogsService.findOne({ user: objIds });
        if (socialPostLogs) {
            await this.socialPostLogsService.deleteMany({ user: objIds });
        }
        const findStandardItem = await this.standardItemRequestService.findOne({ user: objIds });
        if (findStandardItem !== undefined && findStandardItem !== null) {
            await this.standardItemRequestService.deleteMany({ user: objIds });
        }

        // group U

        // group F
        const findfulfillMent = await this.fulfillmentService.findOne({ user: objIds });
        if (findfulfillMent !== undefined && findfulfillMent !== null) {
            await this.fulfillmentService.deleteMany({ user: objIds });
        }

        const findFulfillCase = await this.fulfillmentCaseService.findOne({ requester: objIds });
        if (findFulfillCase !== undefined && findFulfillCase !== null) {
            await this.fulfillmentCaseService.deleteMany({ requester: objIds });
        }

        const userObjs = await this.userService.findOne({ _id: objIds });
        if (userObjs) {
            await this.userService.delete({ _id: objIds });
        }
        const findUniquieHistory = await this.uniqueIdHistoryService.findOne({ user: objIds });
        if (findUniquieHistory !== undefined && findUniquieHistory !== null) {
            await this.uniqueIdHistoryService.deleteMany({ user: objIds });
        }

        const findUserBlockContent = await this.userBlockContentService.findOne({ userId: objIds });
        if (findUserBlockContent !== undefined && findUserBlockContent !== null) {
            await this.userBlockContentService.deleteMany({ userId: objIds });
        }

        const findUserEngagement = await this.userEngagementService.findOne({ userId: objIds });
        if (findUserEngagement !== undefined && findUserEngagement !== null) {
            await this.userEngagementService.deleteMany({ userId: objIds });
        }

        const findUserFollow = await this.userFollowService.findOne({ userId: objIds });
        if (findUserFollow !== undefined && findUserFollow !== null) {
            await this.userFollowService.deleteMany({ userId: objIds });
        }

        const findUserLike = await this.userLikeService.findOne({ userId: objIds });
        if (findUserLike !== undefined && findUserLike !== null) {
            await this.userLikeService.deleteMany({ userId: objIds });
        }
        const findUserReport = await this.userReportContentService.findOne({ reporter: objIds });
        if (findUserReport !== undefined && findUserReport !== null) {
            await this.userReportContentService.deleteMany({ reporter: objIds });
        }

        // asset
        const findAssets = await this.assetService.findOne({ userId: objIds });
        if (findAssets !== undefined && findAssets !== null) {
            await this.assetService.deleteMany({ userId: objIds });
        }
        const authen = await this.authenticationIdService.findOne({ user: objIds });
        if (authen !== undefined && authen !== null) {
            await this.authenticationIdService.deleteMany({ user: objIds });
        }

        return authen.user;
    }
}