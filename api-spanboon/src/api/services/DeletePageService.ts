/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { PageService } from './PageService';
import { PageAboutService } from './PageAboutService';
import { PageAccessLevelService } from './PageAccessLevelService';
import { PageConfigService } from './PageConfigService';
import { PageSocialAccountService } from './PageSocialAccountService';
import { PostsService } from './PostsService';
import { PostsCommentService } from './PostsCommentService';
import { SocialPostLogsService } from './SocialPostLogsService';
import { SocialPostService } from './SocialPostService';
import { PageObjectiveService } from './PageObjectiveService';
import { FulfillmentCaseService } from './FulfillmentCaseService';
import { NeedsService } from './NeedsService';
import { UserLikeService } from './UserLikeService';
import { PageObjectiveJoinerService } from './PageObjectiveJoinerService';
@Service()
export class DeletePageService {

    constructor(
        private pageService: PageService,
        private pageAboutService: PageAboutService,
        private pageAccessLevelService: PageAccessLevelService,
        private pageConfigService: PageConfigService,
        private pageSocialAccountService: PageSocialAccountService,
        private postsService: PostsService,
        private socialPostLogsService: SocialPostLogsService,
        private socialPostService: SocialPostService,
        private pageObjectiveService: PageObjectiveService,
        private fulfillmentCaseService: FulfillmentCaseService,
        private needsService: NeedsService,
        private postsCommentService: PostsCommentService,
        private userLikeService: UserLikeService,
        private pageObjectiveJoinerService: PageObjectiveJoinerService
    ) {
    }

    // create Device token and find the user who is login !!!!!
    // Posts
    // SocialPostLogs
    // SocialPost
    // PageSocialAccount
    // PageAccessLevel
    // PageAbout
    // Needs
    // FulfillmentCase
    // PageConfig
    // PageObjective

    public deletePage(pageId: string, User: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const Query = await this.pageService.aggregate([
                { $match: { '_id': pageId, 'ownerUser': User } },
                { $lookup: { from: 'Posts', localField: '_id', foreignField: 'pageId', as: 'Posts' } },
                { $unwind: { path: '$Posts', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PostsComment', localField: '_id', foreignField: 'commentAsPage', as: 'PostsComment' } },
                { $unwind: { path: '$PostComment', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'UserLike', localField: '_id', foreignField: 'likeAsPage', as: 'UserLike' } },
                { $unwind: { path: '$UserLike', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'SocialPostLogs', localField: '_id', foreignField: 'pageId', as: 'SocialPostLogs' } },
                { $unwind: { path: '$SocialPostLogs', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'SocialPost', localField: '_id', foreignField: 'pageId', as: 'SocialPost' } },
                { $unwind: { path: '$SocialPost', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PageSocialAccount', localField: '_id', foreignField: 'page', as: 'PageSocialAccount' } },
                { $unwind: { path: '$PageSocialAccount', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PageAccessLevel', localField: 'ownerUser', foreignField: 'user', as: 'PageAccessLevel' } },
                { $unwind: { path: '$PageAccessLevel', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PageAbout', localField: '_id', foreignField: 'pageId', as: 'PageAbout' } },
                { $unwind: { path: '$PageAbout', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'Needs', localField: '_id', foreignField: 'pageId', as: 'Needs' } },
                { $unwind: { path: '$Needs', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'FulfillmentCase', localField: '_id', foreignField: 'pageId', as: 'FulfillmentCase' } },
                { $unwind: { path: '$FulfillmentCase', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PageConfig', localField: '_id', foreignField: 'page', as: 'PageConfig' } },
                { $unwind: { path: '$PageConfig', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PageObjective', localField: '_id', foreignField: 'pageId', as: 'PageObjective' } },
                { $unwind: { path: '$PageObjective', preserveNullAndEmptyArrays: true } },
                { $lookup: { from: 'PageObjectiveJoiner', localField: '_id', foreignField: 'pageId', as: 'PageObjectiveJoiner' } },
                { $unwind: { path: '$PageObjectiveJoiner', preserveNullAndEmptyArrays: true } },
                { $limit: 1 },
            ]);
            const pageObjId = [];
            for (const pageData of Query) {
                pageObjId.push(pageData);
            }
            for (const page of pageObjId) {
                const findPageObjective = await this.pageObjectiveService.findOne({ pageId: page._id });
                if (findPageObjective !== undefined) {
                    await this.pageObjectiveService.deleteMany({ pageId: page._id });
                }

                const findPageJoinerObjective = await this.pageObjectiveJoinerService.findOne({ pageId: page._id });
                if (findPageJoinerObjective !== undefined) {
                    await this.pageObjectiveJoinerService.deleteMany({ pageId: page._id });
                }

                const findPageConfig = await this.pageConfigService.findOne({ page: page._id });
                if (findPageConfig !== undefined) {
                    await this.pageConfigService.deleteMany({ page: page._id });
                }
                const findFulfillmentPage = await this.fulfillmentCaseService.findOne({ pageId: page._id });
                if (findFulfillmentPage !== undefined) {
                    await this.fulfillmentCaseService.deleteMany({ pageId: page._id });
                }
                const findNeedsPage = await this.needsService.findOne({ pageId: page._id });
                if (findNeedsPage !== undefined) {
                    await this.needsService.deleteMany({ pageId: page._id });
                }
                const findPageAbout = await this.pageAboutService.findOne({ pageId: page._id });
                if (findPageAbout !== undefined) {
                    await this.pageAboutService.deleteMany({ pageId: page._id });
                }
                const findPageAccess = await this.pageAccessLevelService.findOne({ page: page._id, level: 'OWNER' });
                if (findPageAccess !== undefined) {
                    await this.pageAccessLevelService.deleteMany({ page: page._id });
                }
                const findPageSocialAcc = await this.pageSocialAccountService.findOne({ page: page._id });
                if (findPageSocialAcc !== undefined) {
                    await this.pageSocialAccountService.deleteMany({ page: page._id });
                }
                const findSocialPost = await this.socialPostService.findOne({ pageId: page._id });
                if (findSocialPost !== undefined) {
                    await this.socialPostService.deleteMany({ pageId: page._id });
                }
                const findSocialPostLog = await this.socialPostLogsService.findOne({ pageId: page._id });
                if (findSocialPostLog !== undefined) {
                    await this.socialPostLogsService.deleteMany({ pageId: page._id });
                }
                const findPostsComment = await this.postsCommentService.findOne({ commentAsPage: page._id });
                if (findPostsComment !== undefined) {
                    await this.postsCommentService.deleteMany({ commentAsPage: page._id });
                }
                const findLikePage = await this.userLikeService.findOne({ likeAsPage: page._id });
                if (findLikePage !== undefined) {
                    await this.userLikeService.deleteMany({ likeAsPage: page._id });
                }
                const findPostPage = await this.postsService.findOne({ pageId: page._id });
                if (findPostPage !== undefined) {
                    await this.postsService.deleteMany({ pageId: page._id });

                }
                const findPage = await this.pageService.findOne({ _id: page._id });
                if (findPage !== undefined) {
                    await this.pageService.delete({ _id: page._id });
                }
            }
            resolve(pageObjId[0]);
            reject(undefined);
        });
    }
}
