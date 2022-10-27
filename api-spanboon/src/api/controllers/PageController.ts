/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PageService } from '../services/PageService';
import { Page } from '../models/Page';
import { CreatePageRequest } from './requests/CreatePageRequest';
import { UpdatePageRequest } from './requests/UpdatePageRequest';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { PageAccessLevel } from '../models/PageAccessLevel';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { NeedsService } from '../services/NeedsService';
import { PostsService } from '../services/PostsService';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { UserFollow } from '../models/UserFollow';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_ACTION, ENGAGEMENT_CONTENT_TYPE } from '../../constants/UserEngagementAction';
import { UserEngagementService } from '../services/UserEngagementService';
import { Posts } from '../models/Posts';
import { PostsGalleryService } from '../services/PostsGalleryService';
import { PostsCommentService } from '../services/PostsCommentService';
import { FulfillmentService } from '../services/FulfillmentService';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { Asset } from '../models/Asset';
import { FileUtil, ObjectUtil } from '../../utils/Utils';
import { ASSET_SCOPE, ASSET_PATH } from '../../constants/AssetScope';
import { AssetService } from '../services/AssetService';
import { AssetRequest } from './requests/AssetRequest';
import { CreatePageAccessLevelRequest } from './requests/CreatePageAccessLevelRequest';
import { PageAccessLevelResponse } from './responses/PageAccessLevelResponse';
import { User } from '../models/User';
import { UserService } from '../services/UserService';
import moment from 'moment';
import { POST_TYPE } from '../../constants/PostType';
import { PageObjective } from '../models/PageObjective';
import { Needs } from '../models/Needs';
import { MAX_SEARCH_ROWS, PAGE_FOLLOWER_LIMIT_DEFAULT, PAGE_FOLLOWER_OFFSET_DEFAULT } from '../../constants/Constants';
import { PostsGallery } from '../models/PostsGallery';
import { PostsComment } from '../models/PostsComment';
import { Fulfillment } from '../models/Fulfillment';
import { PageSocialAccount } from '../models/PageSocialAccount';
import { CheckUniqueIdRequest } from './requests/CheckUniqueIdRequest';
import { UniqueIdHistoryService } from '../services/UniqueIdHistoryService';
import { UNIQUEID_LOG_ACTION, UNIQUEID_LOG_TYPE } from '../../constants/UniqueIdHistoryAction';
import { UniqueIdHistory } from '../models/UniqueIdHistory';
import { GetFollowersListResponse } from './responses/GetFollowersListResponse';
import { PageCategory } from '../models/PageCategory';
import { PageCategoryService } from '../services/PageCategoryService';
import { PageSocialAccountService } from '../services/PageSocialAccountService';
import { FacebookService } from '../services/FacebookService';
import { TwitterService } from '../services/TwitterService';
import { CheckPageNameRequest } from './requests/CheckPageNameRequest';
import { PageSocialFBBindingRequest } from './requests/PageSocialFBBindingRequest';
import { PageSocialTWBindingRequest } from './requests/PageSocialTWBindingRequest';
import { PROVIDER } from '../../constants/LoginProvider';
import { PageConfigService } from '../services/PageConfigService';
import { ConfigValueRequest } from './requests/ConfigValueRequest';
import { PageConfig } from '../models/PageConfig';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import lodash from 'lodash';
import { StandardItem } from '../models/StandardItem';
import { StandardItemService } from '../services/StandardItemService';
import { FetchSocialPostEnableRequest } from './requests/FetchSocialPostEnableRequest';
import { SocialPostLogsService } from '../services/SocialPostLogsService';
import { SocialPostLogs } from '../models/SocialPostLogs';
import { NotificationService } from '../services/NotificationService';
import { USER_TYPE, NOTIFICATION_TYPE } from '../../constants/NotificationType';
import { DeviceTokenService } from '../services/DeviceToken';
import { PageNotificationService } from '../services/PageNotificationService';

@JsonController('/page')
export class PageController {
    private PAGE_ACCESS_LEVEL_GUEST = 'GUEST';

    constructor(
        private notificationService: NotificationService,
        private pageService: PageService,
        private pageCategoryService: PageCategoryService,
        private pageAccessLevelService: PageAccessLevelService,
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        private postGalleryService: PostsGalleryService,
        private fulfillmentService: FulfillmentService,
        private needsService: NeedsService,
        private pageObjectiveService: PageObjectiveService,
        private userFollowService: UserFollowService,
        private userEngagementService: UserEngagementService,
        private assetService: AssetService,
        private userService: UserService,
        private uniqueIdHistoryService: UniqueIdHistoryService,
        private pageSocialAccountService: PageSocialAccountService,
        private facebookService: FacebookService,
        private twitterService: TwitterService,
        private pageConfigService: PageConfigService,
        private authenService: AuthenticationIdService,
        private stdItemService: StandardItemService,
        private socialPostLogsService: SocialPostLogsService,
        private deviceTokenService: DeviceTokenService,
        private pageNotificationService: PageNotificationService,
    ) { }

    // Find Page API
    /**
     * @api {get} /api/page/:id Find Page API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findPage(@QueryParam('limit') limit: number, @Param('id') pId: string, @Res() res: any, @Req() req: any): Promise<any> {
        let pageStmt: any;
        let pageObjId;
        let result: any;
        let userObjId;
        let isUserFollowStmt;

        try {
            pageObjId = new ObjectID(pId);
            pageStmt = { _id: pageObjId };
        } catch (ex) {
            pageStmt = { pageUsername: pId };
        } finally {
            if (pageObjId === undefined || pageObjId === 'undefined') {
                pageObjId = null;
            }

            pageStmt = { $or: [{ _id: pageObjId }, { pageUsername: pId }] };
        }

        const page: Page = await this.pageService.findOne(pageStmt, { signURL: true });

        if (page !== null && page !== undefined) {
            result = page;

            // search category
            let category = undefined;
            if (page.category !== undefined && page.category !== '') {
                try {
                    category = await this.pageCategoryService.findOne({ _id: new ObjectID(page.category) });
                } catch (err) {
                    console.log(err);
                }
            }

            if (category !== undefined) {
                result.categoryName = category.name;
            } else {
                result.categoryName = page.category;
            }

            const postPageObjId = result.id;
            const userId = req.headers.userid;
            let isUserFollow: UserFollow;

            if (userId !== null && userId !== undefined && userId !== '') {
                userObjId = new ObjectID(userId);

                isUserFollowStmt = { userId: userObjId, subjectId: postPageObjId, subjectType: SUBJECT_TYPE.PAGE };

                isUserFollow = await this.userFollowService.findOne(isUserFollowStmt);
            }

            const userFollowStmt = { where: { subjectId: postPageObjId, subjectType: SUBJECT_TYPE.PAGE } };
            const userFollow: UserFollow[] = await this.userFollowService.find(userFollowStmt);
            result.followers = userFollow.length;

            if (isUserFollow !== null && isUserFollow !== undefined) {
                result.isFollow = true;
            } else {
                result.isFollow = false;
            }

            const postPageIdStmt = { where: { pageId: postPageObjId } };

            const pageObjectives: PageObjective[] = await this.pageObjectiveService.find(postPageIdStmt, { signURL: true });

            if (pageObjectives !== null && pageObjectives !== undefined && pageObjectives.length > 0) {
                result.pageObjectives = pageObjectives;
            } else {
                result.pageObjectives = [];
            }

            if (limit !== null || limit !== undefined || limit <= 0) {
                limit = MAX_SEARCH_ROWS;
            }

            const pageNeedsStmt = [
                { $match: { pageId: postPageObjId } },
                {
                    $lookup: {
                        from: 'Posts',
                        localField: 'post',
                        foreignField: '_id',
                        as: 'postObj'
                    }
                },
                { $match: { 'postObj.type': POST_TYPE.NEEDS, 'postObj.deleted': false } },
                { $sort: { quantity: -1, createdDate: -1 } },
                { $limit: limit }
            ];
            const needs: any[] = await this.needsService.aggregate(pageNeedsStmt);

            if (needs !== null && needs !== undefined && needs.length > 0) {
                const needsResultList: Needs[] = [];
                const needsMap: any = {};

                for (const need of needs) {
                    const customNeeds = need;
                    const standardItemId = need.standardItemId;
                    const customItemId = need.customItemId;

                    if (standardItemId !== null && standardItemId !== undefined && standardItemId !== '') {
                        if (!needsMap[standardItemId]) {
                            const stdItems: StandardItem = await this.stdItemService.findOne({ _id: new ObjectID(standardItemId) });

                            if (customItemId !== null && customItemId !== undefined && customItemId !== '') {
                                customNeeds.name = stdItems.name;
                                customNeeds.unit = stdItems.unit;
                            }

                            needsMap[standardItemId] = customNeeds;
                        } else {
                            const resultNeeds = lodash.find(needsResultList, ['standardItemId', standardItemId]);

                            if (resultNeeds !== null && resultNeeds !== undefined) {
                                resultNeeds.quantity += customNeeds.quantity;
                                continue;
                            }
                        }
                    }

                    const finalNeeds = new Needs();
                    finalNeeds.id = customNeeds._id;
                    finalNeeds.standardItemId = standardItemId;
                    finalNeeds.customItemId = customItemId;
                    finalNeeds.name = customNeeds.name;
                    finalNeeds.quantity = customNeeds.quantity;
                    finalNeeds.unit = customNeeds.unit;
                    finalNeeds.createdDate = customNeeds.createdDate;
                    finalNeeds.pageId = customNeeds.pageId;
                    finalNeeds.post = customNeeds.post;
                    finalNeeds.active = customNeeds.active;
                    finalNeeds.fullfilled = customNeeds.fullfilled;
                    finalNeeds.fulfillQuantity = customNeeds.fulfillQuantity;
                    finalNeeds.pendingQuantity = customNeeds.pendingQuantity;

                    needsResultList.push(finalNeeds);
                }

                result.needs = needsResultList;
            } else {
                result.needs = [];
            }

            /* old code
            const posts: Posts[] = await this.postsService.find({ where: { pageId: postPageObjId, type: POST_TYPE.NEEDS } });

            if (posts !== null && posts !== undefined && posts.length > 0) {
                const postsIdList = [];
                let pageId;

                for (const post of posts) {
                    pageId = post.pageId;
                    postsIdList.push(post.id);
                }

                if (limit !== null || limit !== undefined || limit <= 0) {
                    limit = MAX_SEARCH_ROWS;
                }

                const pageNeedsStmt = [
                    { $match: { pageId, post: { $in: postsIdList } } },
                    {
                        $group: {
                            _id: {
                                $cond: {
                                    if: { $and: [{ $not: { $eq: ['$standardItemId', null] } }, { $eq: ['$customItemId', null] }] },
                                    then: '$standardItemId',
                                    else: {
                                        $cond: [{
                                            $and: [{ $not: { $eq: ['$customItemId', null] } }, { $not: { $eq: ['$standardItemId', null] } }]
                                        }, '$customItemId', '$name']
                                    }
                                }
                            },
                            result: { $mergeObjects: '$$ROOT' },
                            quantity: { $sum: '$quantity' }
                        }
                    },
                    { $replaceRoot: { newRoot: { $mergeObjects: ['$result', '$$ROOT'] } } },
                    { $project: { result: 0 } },
                    { $sort: { quantity: -1, createdDate: -1 } },
                    { $limit: limit }
                ];

                const needs: Needs[] = await this.needsService.aggregateEntity(pageNeedsStmt);

                if (needs !== null && needs !== undefined && needs.length > 0) {
                    result.needs = needs;
                } else {
                    result.needs = [];
                }
            }
            */

            const successResponse = ResponseUtil.getSuccessResponse('Successfully got Page', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {get} /api/page/:id/needs Get Page Needs API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get Page Needs",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/needs
     * @apiErrorExample {json} Unable Get Page Needs
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/needs')
    public async getPageNeeds(@Param('id') pageId: string, @Res() res: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const posts = await this.postsService.find({ where: { pageId: pageObjId } });
            const postList: any[] = [];

            if (posts) {
                posts.forEach((item) => { postList.push(new ObjectID(item.id)); });

                const pageNeeds: Needs[] = await this.needsService.find({ where: { $and: [{ post: { $in: postList } }, { active: true }, { fulfilled: false }] } });

                if (pageNeeds) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Get Page Needs', pageNeeds);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Page Needs Not Found', undefined);
                    return res.status(400).send(errorResponse);
                }
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Page Not Found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page/:id/social/facebook Binding Page Social API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Binding Page Social",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/social/facebook
     * @apiErrorExample {json} Unable Binding Page Social
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/social/facebook')
    @Authorized('user')
    public async bindingPageFacebook(@Param('id') pageId: string, @Body({ validate: true }) socialBinding: PageSocialFBBindingRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userId = new ObjectID(req.user.id);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            // check if page was registed.
            const pageFacebook = await this.pageSocialAccountService.getFacebookPageAccount(pageId);
            if (pageFacebook !== null && pageFacebook !== undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'This page was binding with Facebook Account.' };
                return res.status(400).send(errorUserNameResponse);
            }

            // try to register
            let registPageAccessToken = undefined;
            let pageAccessToken = undefined;
            // search for user Authen
            if (socialBinding.pageAccessToken !== undefined && socialBinding.pageAccessToken !== '') {
                pageAccessToken = socialBinding.pageAccessToken;
            } else {
                // user mode
                const userFBAccount = await this.authenService.findOne({ user: userId, providerName: PROVIDER.FACEBOOK });
                if (userFBAccount !== undefined) {
                    registPageAccessToken = userFBAccount.storedCredentials;
                }
            }

            try {
                if (registPageAccessToken !== undefined) {
                    /*
                    * check accessible and get page token with extended.
                    * {token: string, expires_in: number as a second to expired, type: string as type of token} 
                    */
                    pageAccessToken = await this.facebookService.extendsPageAccountToken(registPageAccessToken, socialBinding.facebookPageId);
                } else if (pageAccessToken !== undefined) {
                    pageAccessToken = await this.facebookService.extendsAccessToken(pageAccessToken);
                }
            } catch (err) {
                return res.status(400).send(err);
            }

            if (pageAccessToken === undefined) {
                const errorResponse: any = { status: 0, message: 'You cannot access the facebook page.' };
                return res.status(400).send(errorResponse);
            }

            const properties = {
                token: pageAccessToken.token,
                type: pageAccessToken.type,
                expires_in: pageAccessToken.expires_in,
                expires: pageAccessToken.expires
            };

            const pageSocialAccount = new PageSocialAccount();
            pageSocialAccount.page = pageObjId;
            pageSocialAccount.properties = properties;
            pageSocialAccount.providerName = PROVIDER.FACEBOOK;
            pageSocialAccount.providerPageId = socialBinding.facebookPageId;
            pageSocialAccount.storedCredentials = pageAccessToken.token;
            pageSocialAccount.providerPageName = socialBinding.facebookPageName;

            await this.pageSocialAccountService.create(pageSocialAccount);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Binding Page Facebook Social.', true));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', false));
        }
    }

    /**
     * @api {post} /api/page/:id/social/twitter Binding Page Social API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Binding Page Social",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/social/twitter
     * @apiErrorExample {json} Unable Binding Page Social
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/social/twitter')
    @Authorized('user')
    public async bindingPageTwitter(@Param('id') pageId: string, @Body({ validate: true }) socialBinding: PageSocialTWBindingRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userId = new ObjectID(req.user.id);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });
        // gonna do 
        if (pageData) {
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            // check if page was registed.
            const pageTwitter = await this.pageSocialAccountService.getTwitterPageAccount(pageId);
            if (pageTwitter !== null && pageTwitter !== undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'This page was binding with Twitter Account.' };
                return res.status(400).send(errorUserNameResponse);
            }

            let twitterUserId = undefined;
            try {
                const validate = await this.twitterService.verifyCredentials(socialBinding.twitterOauthToken, socialBinding.twitterTokenSecret);
                if (validate === null || validate === undefined) {
                    const errorUserNameResponse: any = { status: 0, message: 'Can not verify twitter token.' };
                    return res.status(400).send(errorUserNameResponse);
                }

                twitterUserId = validate.id_str;
            } catch (error) {
                console.log(error);
            }

            if (twitterUserId === undefined || twitterUserId === '') {
                const errorUserNameResponse: any = { status: 0, message: 'Twitter User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            }

            const storedCredentials = 'oauth_token=' + socialBinding.twitterOauthToken + '&oauth_token_secret=' + socialBinding.twitterTokenSecret + '&user_id=' + socialBinding.twitterUserId;
            const properties = {
                userId: socialBinding.twitterUserId,
                oauthToken: socialBinding.twitterOauthToken,
                oauthTokenSecret: socialBinding.twitterTokenSecret
            };

            const pageSocialAccount = new PageSocialAccount();
            pageSocialAccount.page = pageObjId;
            pageSocialAccount.properties = properties;
            pageSocialAccount.providerName = PROVIDER.TWITTER;
            pageSocialAccount.providerPageId = socialBinding.twitterUserId;
            pageSocialAccount.storedCredentials = storedCredentials;
            pageSocialAccount.providerPageName = socialBinding.twitterPageName;

            await this.pageSocialAccountService.create(pageSocialAccount);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Binding Page Social.', true));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', undefined));
        }
    }

    /**
     * @api {Delete} /api/page/:id/social/facebook Unbinding Page Social API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Unbinding Page Social",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/social/facebook
     * @apiErrorExample {json} Unable to Unbinding Page Social
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id/social/facebook')
    @Authorized('user')
    public async unbindingPageFacebook(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userId = new ObjectID(req.user.id);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            const result = await this.pageSocialAccountService.delete({ page: pageData.id, providerName: PROVIDER.FACEBOOK });
            if (!result) {
                const errorResponse: any = { status: 0, message: 'Can not unbind social account.' };
                return res.status(200).send(errorResponse);
            }

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Unbinding Page Facebook Social.', true));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', false));
        }
    }

    /**
     * @api {delete} /api/page/:id/social/twitter UnBinding Page Social API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully UnBinding Page Social",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/social/twitter
     * @apiErrorExample {json} Unable Binding Page Social
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id/social/twitter')
    @Authorized('user')
    public async unbindingPageTwitter(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userId = new ObjectID(req.user.id);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            const result = await this.pageSocialAccountService.delete({ page: pageData.id, providerName: PROVIDER.TWITTER });
            if (!result) {
                const errorResponse: any = { status: 0, message: 'Can not unbind social account.' };
                return res.status(200).send(errorResponse);
            }

            await this.socialPostLogsService.delete({ pagerId: pageObjId });
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Unbinding Page Social.', true));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', false));
        }
    }

    /**
     * @api {Get} /api/page/:id/social/twitter/check Check if Page Social Twitter binding API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Twitter Page Acount found",
     *      "data": true
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/social/twitter/check
     * @apiErrorExample {json} Unable Binding Page Social
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/social/twitter/check')
    @Authorized('user')
    public async getPageTwitterAccount(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userId = new ObjectID(req.user.id);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            // check if page was registed.
            const pageTwitter = await this.pageSocialAccountService.getTwitterPageAccount(pageId);
            if (pageTwitter !== null && pageTwitter !== undefined) {
                const result = this.createCheckSocialBindingObj(pageTwitter, true);
                return res.status(200).send(ResponseUtil.getSuccessResponse('Twitter Page Account found.', result));
            } else {
                const result = {
                    data: false
                };
                return res.status(200).send(ResponseUtil.getSuccessResponse('Twitter Page Account not found.', result));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', undefined));
        }
    }

    /**
     * @api {Get} /api/page/:id/social/facebook/check Check if Page Social Facebook binding API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Facebook Page Acount found",
     *      "data": true
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/social/facebook/check
     * @apiErrorExample {json} Unable Binding Page Social
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/social/facebook/check')
    @Authorized('user')
    public async getPageFacebookAccount(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userId = new ObjectID(req.user.id);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            // check if page was registed.
            const pageFacebook = await this.pageSocialAccountService.getFacebookPageAccount(pageId);
            if (pageFacebook !== null && pageFacebook !== undefined) {
                const result = this.createCheckSocialBindingObj(pageFacebook, true);
                return res.status(200).send(ResponseUtil.getSuccessResponse('Facebook Page Account found.', result));
            } else {
                const result = {
                    data: false
                };
                return res.status(200).send(ResponseUtil.getSuccessResponse('Facebook Page Account not found.', result));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', undefined));
        }
    }

    /**
     * @api {post} /api/page/:id/objective Get Page PageObjective API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get Page PageObjective",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/objective
     * @apiErrorExample {json} Unable Get Page PageObjective
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/objective')
    public async getPageObjective(@Param('id') pageId: string, @Res() res: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const pageData: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (pageData) {
            const postsObjectiveList = await this.postsService.distinct('objective', { distinct: Posts, deleted: false, hidden: false, objective: { $ne: null } });

            const objective: PageObjective[] = await this.pageObjectiveService.find({ where: { _id: { $in: postsObjectiveList } } });

            if (objective) {
                const successResponse = ResponseUtil.getSuccessResponse('Successfully Get Page PageObjective', objective);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Page PageObjective Not Found', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Page Not Found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {get} /api/page/:id/accesslv Find Page API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got PageAccessLV"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/accesslv
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/accesslv')
    @Authorized('user')
    public async getUserPageAccessLevel(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        let result: PageAccessLevelResponse;
        let idStmt: any;
        let page: any;

        try {
            pageObjId = new ObjectID(id);
            idStmt = { where: { _id: pageObjId } };
            page = await this.pageService.findOne(idStmt);
        } catch (ex) {
            page = await this.pageService.findOne({ where: { pageUsername: id } });
        }

        if (page) {
            const userObjId = req.user.id;

            const userAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
            result = userAccLV;
            result.page = {
                id: page.id,
                name: page.name,
                uniqueId: page.uniqueId,
                imageURL: page.imageURL
            };
            result.user = {
                id: userObjId,
                displayName: req.user.displayName
            };

            if (page.ownerUser.equals(userObjId)) {
                result.level = PAGE_ACCESS_LEVEL.OWNER;

                const sResponse = ResponseUtil.getSuccessResponse('Successfully got PageAccessLV', result);
                return res.status(200).send(sResponse);
            }

            const searchFilter = new SearchFilter();
            searchFilter.whereConditions = { user: new ObjectID(userObjId), page: new ObjectID(id) };

            const pageAccessResult: any[] = await this.pageAccessLevelService.search(searchFilter);

            if (pageAccessResult.length >= 1) {
                result.level = pageAccessResult[0].level;
            } else {
                result.level = this.PAGE_ACCESS_LEVEL_GUEST;
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageAccessLV', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {get} /api/page/:id/access Find Page API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got PageAccessLV"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/access
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/access')
    @Authorized('user')
    public async getUserPageAccess(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        const result: PageAccessLevelResponse[] = [];
        let idStmt: any;
        let page: any;

        try {
            pageObjId = new ObjectID(id);
            idStmt = { where: { _id: pageObjId } };
            page = await this.pageService.findOne(idStmt);
        } catch (ex) {
            page = await this.pageService.findOne({ where: { pageUsername: id } });
        }

        if (page) {
            const userObjId = req.user.id;

            let canSeeList = false;

            // only owner & admin & editor & moderator can do this action
            if (page.ownerUser.equals(userObjId)) {
                canSeeList = true;
            }

            const searchFilter = new SearchFilter();
            searchFilter.whereConditions = { user: new ObjectID(userObjId), page: new ObjectID(id) };
            const userPageAccessResult: any[] = await this.pageAccessLevelService.search(searchFilter);
            if (userPageAccessResult.length >= 1) {
                if (userPageAccessResult[0].level === PAGE_ACCESS_LEVEL.ADMIN ||
                    userPageAccessResult[0].level === PAGE_ACCESS_LEVEL.MODERATOR) {
                    canSeeList = true;
                }
            }

            if (!canSeeList) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to get User Page Access List', undefined);
                return res.status(401).send(errorResponse);
            }

            // add in owner if not exist
            // if (page.ownerUser.equals(userObjId)) {
            //     const userAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
            //     userAccLV.page = id;
            //     userAccLV.user = userObjId;
            //     userAccLV.level = PAGE_ACCESS_LEVEL.OWNER;

            //     result.push(userAccLV);
            // }

            const accSearchFilter = new SearchFilter();
            accSearchFilter.whereConditions = { page: new ObjectID(id) };
            const pageAccessResult: any[] = await this.pageAccessLevelService.search(accSearchFilter);

            for (const pg of pageAccessResult) {
                const userAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
                userAccLV.page = {
                    id: page.id,
                    name: page.name,
                    uniqueId: page.uniqueId,
                    imageURL: page.imageURL
                };

                const pguserObjId = new ObjectID(pg.user);
                const userStmt = { where: { _id: pguserObjId } };
                const pguser = await this.userService.findOne(userStmt);

                userAccLV.user = {
                    id: pg.user,
                    displayName: pguser.displayName,
                    imageURL: pguser.imageURL
                };
                userAccLV.level = pg.level;
                userAccLV.id = pg.id;

                result.push(userAccLV);
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageAccessLV', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page/:id/access Add Page Access API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully adding User Page Access"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/access
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/access')
    @Authorized('user')
    public async addUserPageAccess(@Param('id') id: string, @Body({ validate: true }) access: CreatePageAccessLevelRequest, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        let result: PageAccessLevelResponse;
        let idStmt: any;
        let page: any;

        // check user
        let user: User = undefined;
        if (access.user) {
            // check if object id
            try {
                const userObjId = new ObjectID(access.user);
                const userStmt = { where: { _id: userObjId } };
                user = await this.userService.findOne(userStmt);
            } catch (error) {
                console.log(error);
            }

            // check if email
            if (user === undefined) {
                const userStmt = { where: { username: access.user } };
                user = await this.userService.findOne(userStmt);
            }

            // check if uniqueId
            if (user === undefined) {
                const userStmt = { where: { uniqueId: access.user } };
                user = await this.userService.findOne(userStmt);
            }
        }

        if (user === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('User for Access was invalid.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check level
        if (access.level) {
            if (access.level === PAGE_ACCESS_LEVEL.OWNER) {
                const errorResponse = ResponseUtil.getErrorResponse('You does not has permission to add User Page Access.', undefined);
                return res.status(401).send(errorResponse);
            }
            if (access.level !== PAGE_ACCESS_LEVEL.ADMIN &&
                access.level !== PAGE_ACCESS_LEVEL.MODERATOR &&
                access.level !== PAGE_ACCESS_LEVEL.POST_MODERATOR &&
                access.level !== PAGE_ACCESS_LEVEL.FULFILLMENT_MODERATOR &&
                access.level !== PAGE_ACCESS_LEVEL.CHAT_MODERATOR) {
                const errorResponse = ResponseUtil.getErrorResponse('Access Level was invalid.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Access Level was invalid.', undefined);
            return res.status(400).send(errorResponse);
        }

        try {
            pageObjId = new ObjectID(id);
            idStmt = { where: { _id: pageObjId } };
            page = await this.pageService.findOne(idStmt);
        } catch (ex) {
            page = await this.pageService.findOne({ where: { pageUsername: id } });
        }

        if (page) {
            const userObjId = req.user.id;
            let canDoAction = false;

            // only owner & admin can do this action
            if (page.ownerUser.equals(userObjId)) {
                canDoAction = true;
            }

            if (!canDoAction) {
                const searchFilter = new SearchFilter();
                searchFilter.whereConditions = { user: new ObjectID(userObjId), page: new ObjectID(id) };

                const pageAccessResult: any[] = await this.pageAccessLevelService.search(searchFilter);
                if (pageAccessResult.length > 0) {
                    for (const pAccess of pageAccessResult) {
                        if (pAccess.level === PAGE_ACCESS_LEVEL.ADMIN) {
                            canDoAction = true;
                            break;
                        }
                    }
                }
            }

            if (!canDoAction) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to add User Page Access', undefined);
                return res.status(401).send(errorResponse);
            }

            // cannot change owner to any thing
            if (page.ownerUser.equals(user.id)) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to change Access of owner user', undefined);
                return res.status(401).send(errorResponse);
            }

            // check if user access exist
            const usrAccessSearchFilter = new SearchFilter();
            usrAccessSearchFilter.whereConditions = { user: new ObjectID(user.id), page: new ObjectID(id) };

            const userAccessResult: any[] = await this.pageAccessLevelService.search(usrAccessSearchFilter);

            if (userAccessResult.length >= 1) {
                const newLevel = access.level.toUpperCase();
                for (const pageAccessLevel of userAccessResult) {
                    if (pageAccessLevel.level === newLevel) {
                        const duplicateErrorResponse = ResponseUtil.getSuccessResponse('Access Level was duplicated.', pageAccessLevel);
                        return res.status(400).send(duplicateErrorResponse);
                    }
                }
            }

            /* // open this if you want to edit user access if exist
            if (userAccessResult.length >= 1) {
                // edit if exist
                await this.pageAccessLevelService.update({ _id: new ObjectID(userAccessResult[0].id) }, { $set: { level: access.level } });

                const uusrAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
                result = uusrAccLV;
                result.page = {
                    id: page.id,
                    name: page.name,
                    uniqueId: page.uniqueId,
                    imageURL: page.imageURL
                };
                result.user = {
                    id: user.id,
                    displayName: user.displayName
                };

                result.level = access.level;

                const successUpdateResponse = ResponseUtil.getSuccessResponse('Successfully editing User Page Access', result);
                return res.status(200).send(successUpdateResponse);
            }*/

            const pgLV = new PageAccessLevel();
            pgLV.page = pageObjId;
            pgLV.user = user.id;
            pgLV.level = access.level;

            const pageAccessLV = await this.pageAccessLevelService.create(pgLV);

            const userAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
            result = userAccLV;
            result.page = {
                id: page.id,
                name: page.name,
                uniqueId: page.uniqueId,
                imageURL: page.imageURL
            };
            result.user = {
                id: user.id,
                displayName: user.displayName
            };
            result.level = pageAccessLV.level;
            result.id = pageAccessLV.id;

            const successResponse = ResponseUtil.getSuccessResponse('Successfully adding User Page Access', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page/:id/access Delete Page API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully remove User Page Access"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/access
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id/access')
    @Authorized('user')
    public async deleteUserPageAccess(@Param('id') id: string, @Body({ validate: true }) access: CreatePageAccessLevelRequest, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        let idStmt: any;
        let page: any;

        // check user
        let user: User = undefined;
        if (access.user) {
            // check if object id
            try {
                const userObjId = new ObjectID(access.user);
                const userStmt = { where: { _id: userObjId } };
                user = await this.userService.findOne(userStmt);
            } catch (error) {
                console.log(error);
            }

            // check if email
            if (user === undefined) {
                const userStmt = { where: { username: access.user } };
                user = await this.userService.findOne(userStmt);
            }

            // check if uniqueId
            if (user === undefined) {
                const userStmt = { where: { uniqueId: access.user } };
                user = await this.userService.findOne(userStmt);
            }
        }

        if (user === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('User for Access was invalid.', undefined);
            return res.status(400).send(errorResponse);
        }

        // delete all not to check level
        // if (access.level) {
        //     if (access.level === PAGE_ACCESS_LEVEL.OWNER) {
        //         const errorResponse = ResponseUtil.getErrorResponse('You does not has permission to add User Page Access.', undefined);
        //         return res.status(401).send(errorResponse);
        //     }
        //     if (access.level !== PAGE_ACCESS_LEVEL.ADMIN &&
        //         access.level !== PAGE_ACCESS_LEVEL.MODERATOR) {
        //         const errorResponse = ResponseUtil.getErrorResponse('Access Level was invalid.', undefined);
        //         return res.status(400).send(errorResponse);
        //     }
        // } else {
        //     const errorResponse = ResponseUtil.getErrorResponse('Access Level was invalid.', undefined);
        //     return res.status(400).send(errorResponse);
        // }

        try {
            pageObjId = new ObjectID(id);
            idStmt = { where: { _id: pageObjId } };
            page = await this.pageService.findOne(idStmt);
        } catch (ex) {
            page = await this.pageService.findOne({ where: { pageUsername: id } });
        }

        if (page) {
            const userObjId = req.user.id;
            let canDoAction = false;

            // only owner & admin can do this action
            if (page.ownerUser.equals(userObjId)) {
                canDoAction = true;
            }

            if (!canDoAction) {
                const searchFilter = new SearchFilter();
                searchFilter.whereConditions = { user: new ObjectID(userObjId), page: new ObjectID(id) };

                const pageAccessResult: any[] = await this.pageAccessLevelService.search(searchFilter);
                if (pageAccessResult.length > 0) {
                    for (const pAccess of pageAccessResult) {
                        if (pAccess.level === PAGE_ACCESS_LEVEL.ADMIN) {
                            canDoAction = true;
                            break;
                        }
                    }
                }
            }

            if (!canDoAction) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to Delete User Page Access', undefined);
                return res.status(401).send(errorResponse);
            }

            // check if user access exist
            const usrAccessSearchFilter = new SearchFilter();
            usrAccessSearchFilter.whereConditions = { user: new ObjectID(user.id), page: new ObjectID(id) };

            const userAccessResult: any[] = await this.pageAccessLevelService.search(usrAccessSearchFilter);

            if (userAccessResult.length >= 1) {
                for (const userAccess of userAccessResult) {
                    // do not remote owner
                    if (userAccess.level === PAGE_ACCESS_LEVEL.OWNER) {
                        continue;
                    }

                    await this.pageAccessLevelService.delete(userAccess);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to get UserAccess', undefined);
                return res.status(400).send(errorResponse);
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully deleteing User Page Access', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {delete} /api/page/:id/access/:accessid Delete Page API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully remove User Page Access"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/access/:accessid
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id/access/:accessid')
    @Authorized('user')
    public async deleteUserPageAccessById(@Param('id') id: string, @Param('accessid') accessid: string, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        let result: PageAccessLevelResponse;
        let idStmt: any;
        let page: any;

        try {
            pageObjId = new ObjectID(id);
            idStmt = { where: { _id: pageObjId } };
            page = await this.pageService.findOne(idStmt);
        } catch (ex) {
            page = await this.pageService.findOne({ where: { pageUsername: id } });
        }

        if (page) {
            const userObjId = req.user.id;
            let canDoAction = false;

            // only owner & admin can do this action
            if (page.ownerUser.equals(userObjId)) {
                canDoAction = true;
            }

            if (!canDoAction) {
                const searchFilter = new SearchFilter();
                searchFilter.whereConditions = { user: new ObjectID(userObjId), page: new ObjectID(id) };

                const pageAccessResult: any[] = await this.pageAccessLevelService.search(searchFilter);
                if (pageAccessResult.length > 0) {
                    for (const pAccess of pageAccessResult) {
                        if (pAccess.level === PAGE_ACCESS_LEVEL.ADMIN) {
                            canDoAction = true;
                            break;
                        }
                    }
                }
            }

            if (!canDoAction) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to delete User Page Access', undefined);
                return res.status(401).send(errorResponse);
            }

            const deleteUserAccessLV = await this.pageAccessLevelService.findOne({ _id: new ObjectID(accessid), page: new ObjectID(id) });

            if (deleteUserAccessLV) {
                if (deleteUserAccessLV.level === PAGE_ACCESS_LEVEL.OWNER) {
                    const errorResponse = ResponseUtil.getErrorResponse('Unable to delete OWNER User Page Access', undefined);
                    return res.status(401).send(errorResponse);
                }

                // delete if exist
                await this.pageAccessLevelService.delete({ _id: deleteUserAccessLV.id });

                const uusrAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
                result = uusrAccLV;
                result.page = {
                    id: page.id,
                    name: page.name,
                    uniqueId: page.uniqueId,
                    imageURL: page.imageURL
                };
                result.user = {
                    id: deleteUserAccessLV.user,
                };
                result.id = accessid;

                const successUpdateResponse = ResponseUtil.getSuccessResponse('Successfully Delete User Page Access', result);
                return res.status(200).send(successUpdateResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to get User Page Access', undefined);
                return res.status(404).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {put} /api/page/:id/access/:accessid Edit Page Access API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully adding User Page Access"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/access/:accessid
     * @apiErrorExample {json} Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id/access/:accessid')
    @Authorized('user')
    public async editUserPageAccess(@Param('id') id: string, @Param('accessid') accessid: string, @Body({ validate: true }) access: CreatePageAccessLevelRequest, @Res() res: any, @Req() req: any): Promise<any> {
        let pageObjId: ObjectID;
        let result: PageAccessLevelResponse;
        let idStmt: any;
        let page: any;

        // check user
        let user: User = undefined;
        if (access.user) {
            // check if object id
            try {
                const userObjId = new ObjectID(access.user);
                const userStmt = { where: { _id: userObjId } };
                user = await this.userService.findOne(userStmt);
            } catch (error) {
                console.log(error);
            }

            // check if email
            if (user === undefined) {
                const userStmt = { where: { username: access.user } };
                user = await this.userService.findOne(userStmt);
            }

            // check if uniqueId
            if (user === undefined) {
                const userStmt = { where: { uniqueId: access.user } };
                user = await this.userService.findOne(userStmt);
            }
        }

        if (user === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('User for Access was invalid.', undefined);
            return res.status(400).send(errorResponse);
        }

        // check level
        if (access.level) {
            if (access.level === PAGE_ACCESS_LEVEL.OWNER) {
                const errorResponse = ResponseUtil.getErrorResponse('You does not has permission to edit User Page Access.', undefined);
                return res.status(401).send(errorResponse);
            }

            if (access.level !== PAGE_ACCESS_LEVEL.ADMIN &&
                access.level !== PAGE_ACCESS_LEVEL.MODERATOR &&
                access.level !== PAGE_ACCESS_LEVEL.POST_MODERATOR &&
                access.level !== PAGE_ACCESS_LEVEL.FULFILLMENT_MODERATOR &&
                access.level !== PAGE_ACCESS_LEVEL.CHAT_MODERATOR) {
                const errorResponse = ResponseUtil.getErrorResponse('Access Level was invalid.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Access Level was invalid.', undefined);
            return res.status(400).send(errorResponse);
        }

        try {
            pageObjId = new ObjectID(id);
            idStmt = { where: { _id: pageObjId } };
            page = await this.pageService.findOne(idStmt);
        } catch (ex) {
            page = await this.pageService.findOne({ where: { pageUsername: id } });
        }

        if (page) {
            const userObjId = req.user.id;
            let canDoAction = false;

            // only owner & admin can do this action
            if (page.ownerUser.equals(userObjId)) {
                canDoAction = true;
            }

            if (!canDoAction) {
                const searchFilter = new SearchFilter();
                searchFilter.whereConditions = { user: new ObjectID(userObjId), page: new ObjectID(id) };

                const pageAccessResult: any[] = await this.pageAccessLevelService.search(searchFilter);
                if (pageAccessResult.length > 0) {
                    for (const pAccess of pageAccessResult) {
                        if (pAccess.level === PAGE_ACCESS_LEVEL.ADMIN) {
                            canDoAction = true;
                            break;
                        }
                    }
                }
            }

            if (!canDoAction) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to edit User Page Access', undefined);
                return res.status(401).send(errorResponse);
            }

            // cannot change owner to any thing
            if (page.ownerUser.equals(user.id)) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to edit Access of owner user', undefined);
                return res.status(401).send(errorResponse);
            }

            // check if user access exist
            const newLevel = access.level.toUpperCase();
            const usrAccessSearchFilter = new SearchFilter();
            usrAccessSearchFilter.whereConditions = { user: new ObjectID(user.id), page: new ObjectID(id), level: newLevel };

            const userAccessResult: any[] = await this.pageAccessLevelService.search(usrAccessSearchFilter);

            if (userAccessResult.length >= 1) {
                for (const pageAccessLevel of userAccessResult) {
                    if (pageAccessLevel.level === newLevel) {
                        const duplicateErrorResponse = ResponseUtil.getSuccessResponse('Access Level was existed.', pageAccessLevel);
                        return res.status(400).send(duplicateErrorResponse);
                    }
                }
            }

            const editUserAccessLV = await this.pageAccessLevelService.findOne({ _id: new ObjectID(accessid), page: new ObjectID(id) });

            if (editUserAccessLV) {
                // edit if exist
                await this.pageAccessLevelService.update({ _id: editUserAccessLV.id }, { $set: { level: newLevel } });

                const uusrAccLV: PageAccessLevelResponse = new PageAccessLevelResponse();
                result = uusrAccLV;
                result.page = {
                    id: page.id,
                    name: page.name,
                    uniqueId: page.uniqueId,
                    imageURL: page.imageURL
                };
                result.user = {
                    id: user.id,
                    displayName: user.displayName
                };

                result.level = newLevel;
                result.id = accessid;

                const successUpdateResponse = ResponseUtil.getSuccessResponse('Successfully editing User Page Access', result);
                return res.status(200).send(successUpdateResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to get User Page Access', undefined);
                return res.status(404).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page Create Page API
     * @apiGroup Page
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "category" : [
     *          {
     *              "name": "",
     *              "description": ""
     *          }
     *      ]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create Page",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page
     * @apiErrorExample {json} Unable create Page
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized('user')
    public async createPage(@Body({ validate: true }) pages: CreatePageRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageAsset = pages.asset;
        const category = pages.category;
        const data: Page = await this.pageService.findOne({ where: { name: pages.name } });
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('Page is Exists', data);
            return res.status(400).send(errorResponse);
        }

        // check dupicate uniqueId
        if (pages.pageUsername !== undefined && pages.pageUsername !== null && pages.pageUsername !== '') {
            const isContainsUniqueId = await this.userService.isContainsUniqueId(pages.pageUsername);
            if (isContainsUniqueId !== undefined && isContainsUniqueId) {
                const errorResponse = ResponseUtil.getErrorResponse('PageUsername already exists', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        const fileName = userObjId + FileUtil.renameFile();
        let assetCreate: Asset;

        if (Object.keys(pageAsset).length > 0 && pageAsset !== null && pageAsset !== undefined) {
            const imageAsset = new Asset();
            imageAsset.userId = userObjId;
            imageAsset.fileName = fileName + userObjId;
            imageAsset.scope = ASSET_SCOPE.PUBLIC;
            imageAsset.data = pageAsset.data;
            imageAsset.size = pageAsset.size;
            imageAsset.mimeType = pageAsset.mimeType;
            imageAsset.expirationDate = null;
            assetCreate = await this.assetService.create(imageAsset);
        }

        let pageCategory: PageCategory;
        if (category !== null && category !== undefined && category !== '') {
            pageCategory = await this.pageCategoryService.findOne({ _id: new ObjectID(category) });
        }

        const page: Page = new Page();
        page.name = pages.name;
        page.pageUsername = pages.pageUsername;
        page.subTitle = pages.subTitle;
        page.backgroundStory = pages.backgroundStory;
        page.detail = pages.detail;
        page.ownerUser = userObjId;
        page.imageURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        page.s3ImageURL = assetCreate ? assetCreate.s3FilePath : '';
        page.coverURL = '';
        page.coverPosition = pages.coverPosition;
        page.color = pages.color;
        page.backgroundStory = page.backgroundStory;
        page.email = pages.email;
        page.category = (pageCategory !== null && pageCategory !== undefined) ? new ObjectID(pageCategory.id) : null;
        page.isOfficial = false;
        page.banned = false;

        const result: Page = await this.pageService.create(page);

        if (result) {
            const pageObjId = new ObjectID(result.id);
            const pageAcceessLevel = new PageAccessLevel();
            pageAcceessLevel.page = result.id;
            pageAcceessLevel.user = userObjId;
            pageAcceessLevel.level = PAGE_ACCESS_LEVEL.OWNER;
            const pageAccessLevelCreated: PageAccessLevel = await this.pageAccessLevelService.create(pageAcceessLevel);

            if (pageAccessLevelCreated) {
                const engagement = new UserEngagement();
                engagement.clientId = clientId;
                engagement.contentId = pageObjId;
                engagement.contentType = ENGAGEMENT_CONTENT_TYPE.PAGE;
                engagement.ip = ipAddress;
                engagement.userId = userObjId;
                engagement.action = ENGAGEMENT_ACTION.CREATE;

                const engagements: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: pageObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.PAGE, action: ENGAGEMENT_ACTION.CREATE } });
                if (engagements) {
                    engagement.isFirst = false;
                } else {
                    engagement.isFirst = true;
                }

                await this.userEngagementService.create(engagement);
                const successResponse = ResponseUtil.getSuccessResponse('Successfully create Page', result);
                return res.status(200).send(successResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Edit Cover API
    /**
     * @api {get} /api/page/:id/cover Edit Cover API
     * @apiGroup UserProfile
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Edit Cover Successfully",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/cover
     * @apiErrorExample {json} Edit Cover Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/cover')
    @Authorized('user')
    public async editCoverURL(@Body({ validate: true }) assets: AssetRequest, @Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const updatedDate = moment().toDate();
        let assetResult;
        let assetId;
        let newAssetId;
        let pageObjId;
        let pageStmt;
        let newS3CoverURL;

        try {
            pageObjId = new ObjectID(pageId);
            pageStmt = { _id: pageObjId };
        } catch (ex) {
            pageStmt = { pageUsername: pageId };
        } finally {
            pageStmt = { $or: [{ _id: pageObjId }, { pageUsername: pageId }] };
        }

        const page: Page = await this.pageService.findOne(pageStmt);

        const newFileName = userObjId + FileUtil.renameFile() + page.id;
        const assetData = assets.asset.data;
        const assetMimeType = assets.asset.mimeType;
        const assetFileName = newFileName;
        const assetSize = assets.asset.size;
        const assetCoverPosition = assets.coverPosition;

        if (page !== null && page !== undefined) {
            if (page.coverURL !== null && page.coverURL !== undefined && page.coverURL !== '' && typeof (page.coverURL) !== 'undefined') {
                assetId = new ObjectID(page.coverURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId, userId: userObjId };
                const newValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate } };
                await this.assetService.update(assetQuery, newValue);
                newAssetId = assetId;
                assetResult = await this.assetService.findOne({ _id: new ObjectID(newAssetId) });
            } else {
                const asset = new Asset();
                asset.userId = userObjId;
                asset.data = assetData;
                asset.mimeType = assetMimeType;
                asset.fileName = assetFileName;
                asset.size = assetSize;
                asset.scope = ASSET_SCOPE.PUBLIC;
                assetResult = await this.assetService.create(asset);
                newAssetId = assetResult.id;
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('PageId Not Found', undefined);
            return res.status(400).send(errorResponse);
        }

        if (assetResult) {
            newS3CoverURL = assetResult.s3FilePath;

            const coverURLUpdate = await this.pageService.update({ _id: pageObjId }, { $set: { coverURL: ASSET_PATH + newAssetId, coverPosition: assetCoverPosition, updateDate: updatedDate, s3CoverURL: newS3CoverURL } });
            if (coverURLUpdate) {
                const pages: Page = await this.pageService.findOne({ _id: pageObjId });
                const successResponse = ResponseUtil.getSuccessResponse('Edit CoverURL Success', pages);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Edit CoverURL Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Update Asset', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Edit Image API
    /**
     * @api {get} /api/page/:id/image Edit Image API
     * @apiGroup UserProfile
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Edit Image Successfully",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/image
     * @apiErrorExample {json} Edit Image Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/image')
    @Authorized('user')
    public async editImageURL(@Body({ validate: true }) assets: AssetRequest, @Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(pageId);
        const newFileName = userObjId + FileUtil.renameFile() + pageObjId;
        const assetData = assets.asset.data;
        const assetMimeType = assets.asset.mimeType;
        const assetFileName = newFileName;
        const assetSize = assets.asset.size;
        const updatedDate = moment().toDate();
        let assetResult;
        let assetId;
        let newAssetId;
        let newS3AssetURL;

        const page: Page = await this.pageService.findOne({ _id: pageObjId });
        if (page !== null && page !== undefined) {
            if (page.imageURL !== null && page.imageURL !== undefined && page.imageURL !== '' && typeof (page.imageURL) !== 'undefined') {
                assetId = new ObjectID(page.imageURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId, userId: userObjId };
                const newValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate } };
                assetResult = await this.assetService.update(assetQuery, newValue);
                newAssetId = assetId;
                newS3AssetURL = assetResult.s3FilePath;
            } else {
                const asset = new Asset();
                asset.userId = userObjId;
                asset.data = assetData;
                asset.mimeType = assetMimeType;
                asset.fileName = assetFileName;
                asset.size = assetSize;
                asset.scope = ASSET_SCOPE.PUBLIC;
                assetResult = await this.assetService.create(asset);
                newAssetId = assetResult.id;
                newS3AssetURL = assetResult.s3FilePath;
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('PageId Not Found', undefined);
            return res.status(400).send(errorResponse);
        }

        if (assetResult) {
            const imageURLUpdate = await this.pageService.update({ _id: pageObjId }, { $set: { imageURL: ASSET_PATH + newAssetId, updateDate: updatedDate, s3ImageURL: newS3AssetURL } });
            if (imageURLUpdate) {
                const pages = await this.pageService.findOne({ _id: pageObjId });
                const successResponse = ResponseUtil.getSuccessResponse('Edit ImageURL Success', pages);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Edit ImageURL Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Update Asset', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search Page
    /**
     * @api {post} /api/page/search Search Page API
     * @apiGroup Page
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get page search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page/search
     * @apiErrorExample {json} Search Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchPage(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(filter)) {
            return res.status(200).send([]);
        }

        if (filter.whereConditions !== null && filter.whereConditions !== undefined) {
            const ownerUser = filter.whereConditions.ownerUser;
            let ownerUserObjId;

            if (ownerUser !== null && ownerUser !== undefined && ownerUser !== '') {
                ownerUserObjId = new ObjectID(ownerUser);
                filter.whereConditions = { ownerUser: ownerUserObjId };
            }
        } else {
            filter.whereConditions = {};
        }

        const pageLists: any = await this.pageService.search(filter, { signURL: true });

        if (pageLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Page', pageLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Page', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow Page
    /**
     * @api {post} /api/page/:id/follow Follow Page API
     * @apiGroup Page
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow Page Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page/:id/follow
     * @apiErrorExample {json} Search Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followPage(@Param('id') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const pageFollow: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: pageObjId, subjectType: SUBJECT_TYPE.PAGE } });

        const contentType = ENGAGEMENT_CONTENT_TYPE.PAGE;
        let userEngagementAction: UserEngagement;
        let userFollowed: UserFollow[];
        let result = {};
        let userFollowStmt;
        let action;

        // find page
        const page = await this.pageService.findOne({ _id: pageObjId });
        if (page === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Page was not found', undefined);
            return res.status(400).send(errorResponse);
        }

        if (pageFollow) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: pageObjId, subjectType: SUBJECT_TYPE.PAGE });
            if (unfollow) {
                action = ENGAGEMENT_ACTION.UNFOLLOW;

                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = pageObjId;
                userEngagement.contentType = contentType;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = action;

                const engagement: UserEngagement = await this.getPageEnagagement(pageObjId, userObjId, action, contentType);
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                result['isFollow'] = false;

                userFollowStmt = { where: { subjectId: pageObjId, subjectType: SUBJECT_TYPE.PAGE } };
                userFollowed = await this.userFollowService.find(userFollowStmt);
                result['followers'] = userFollowed.length;

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow Page Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow Page Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = pageObjId;
            userFollow.subjectType = SUBJECT_TYPE.PAGE;

            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            if (followCreate) {
                result = followCreate;
                action = ENGAGEMENT_ACTION.FOLLOW;

                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = pageObjId;
                userEngagement.contentType = contentType;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = action;

                const engagement: UserEngagement = await this.getPageEnagagement(pageObjId, userObjId, action, contentType);
                const whoFollowYou = await this.userService.findOne({ _id: userFollow.userId });
                const pageOwnerNoti = await this.userService.findOne({ _id: page.ownerUser });
                // user to page 
                const tokenFCMId = await this.deviceTokenService.find({ userId: pageOwnerNoti.id });
                const notificationFollower = whoFollowYou.displayName + 'กดติดตามเพจ' + page.pageUsername;
                const link = `/profile/${whoFollowYou.displayName}`;
                if (tokenFCMId !== undefined) {
                    for (const tokenFCM of tokenFCMId) {
                        await this.pageNotificationService.notifyToPageUserFcm(
                            followCreate.subjectId,
                            undefined,
                            req.user.id + '',
                            USER_TYPE.PAGE,
                            NOTIFICATION_TYPE.FOLLOW,
                            notificationFollower,
                            link,
                            tokenFCM.Tokens,
                            whoFollowYou.displayName,
                            whoFollowYou.imageURL
                        );
                    }
                }
                else {
                    await this.notificationService.createNotification(
                        followCreate.userId,
                        USER_TYPE.USER,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.FOLLOW,
                        notificationFollower,
                        link,
                    );
                }
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                result['isFollow'] = true;

                userFollowStmt = { where: { subjectId: pageObjId, subjectType: SUBJECT_TYPE.PAGE } };
                userFollowed = await this.userFollowService.find(userFollowStmt);
                result['followers'] = userFollowed.length;

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed Page Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow Page Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    // Update Page API
    /**
     * @api {put} /api/page/:id Update Page API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Page.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:id
     * @apiErrorExample {json} Update Page error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized('user')
    public async updatePage(@Param('id') id: string, @Body({ validate: true }) pages: UpdatePageRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const pageObjId = new ObjectID(id);
            const ownerUsers = new ObjectID(req.user.id);
            const clientId = req.headers['client-id'];
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const findPageQuery = { where: { _id: pageObjId, ownerUser: ownerUsers } };
            const pageUpdate: Page = await this.pageService.findOne(findPageQuery);

            if (!pageUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid Page Id', undefined));
            }

            // check dupicate uniqueId
            if (pages.pageUsername !== undefined && pages.pageUsername !== null && pages.pageUsername !== '') {
                const isContainsUniqueId = await this.userService.isContainsUniqueId(pages.pageUsername, undefined, pageUpdate.pageUsername);
                if (isContainsUniqueId !== undefined && isContainsUniqueId) {
                    const errorResponse = ResponseUtil.getErrorResponse('PageUsername already exists', undefined);
                    return res.status(400).send(errorResponse);
                }
            }

            let pageName = pages.name;
            let pagesUsername = pages.pageUsername;
            let pageSubTitle = pages.subTitle;
            let pageBackgroundStory = pages.backgroundStory;
            // let pageImageAsset = pages.imageAsset;
            // let pageCoverAsset = pages.coverAsset;
            let pageCoverPosition = pages.coverPosition;
            let pageColor = pages.color;
            let pageCategory = pages.category;
            let pageLineId = pages.lineId;
            let pageFacebookURL = pages.facebookURL;
            let pageWebsiteURL = pages.websiteURL;
            let pageMobileNo = pages.mobileNo;
            let pageAddress = pages.address;
            let pageInstagramURL = pages.instagramURL;
            let pageTwitterURL = pages.twitterURL;
            let pageEmail = pages.email;
            const pageAccessLevel = pages.pageAccessLevel;
            // const assetQuery = { userId: ownerUsers };
            // const newFileName = ownerUsers + FileUtil.renameFile + ownerUsers;

            if (pageName === null || pageName === undefined) {
                pageName = pageUpdate.name;
            }

            if (pagesUsername === null || pagesUsername === undefined) {
                pagesUsername = pageUpdate.pageUsername;
            }

            if (pageSubTitle === null || pageSubTitle === undefined) {
                pageSubTitle = pageUpdate.subTitle;
            }

            if (pageBackgroundStory === null || pageBackgroundStory === undefined) {
                pageBackgroundStory = pageUpdate.backgroundStory;
            }

            if (pageLineId === null || pageLineId === undefined) {
                pageLineId = pageUpdate.lineId;
            }

            if (pageFacebookURL === null || pageFacebookURL === undefined) {
                pageFacebookURL = pageUpdate.facebookURL;
            }

            if (pageInstagramURL === null || pageInstagramURL === undefined) {
                pageInstagramURL = pageUpdate.instagramURL;
            }

            if (pageWebsiteURL === null || pageWebsiteURL === undefined) {
                pageWebsiteURL = pageUpdate.websiteURL;
            }

            if (pageMobileNo === null || pageMobileNo === undefined) {
                pageMobileNo = pageUpdate.mobileNo;
            }

            if (pageAddress === null || pageAddress === undefined) {
                pageAddress = pageUpdate.address;
            }

            if (pageTwitterURL === null || pageTwitterURL === undefined) {
                pageTwitterURL = pageUpdate.twitterURL;
            }

            if (pageEmail === null || pageEmail === undefined) {
                pageEmail = pageUpdate.email;
            }

            // let updateImageAsset;
            // let updatedImageAsset;
            // let assetId;
            // const updateAssetQuery = { _id: assetId, userId: ownerUsers };

            // const imageURL = pageUpdate.imageURL;
            // if (pageImageAsset === null || pageImageAsset === undefined) {
            //     pageImageAsset = imageURL;
            // } else {
            //     if (imageURL !== null && imageURL !== undefined && imageURL !== '' && typeof (imageURL) !== 'undefined') {
            //         assetId = new ObjectID(imageURL.split(ASSET_PATH)[1]);

            //         const imageNewValue = {
            //             $set: {
            //                 fileName: newFileName,
            //                 data: pageImageAsset.data,
            //                 mimeType: pageImageAsset.mimeType,
            //                 size: pageImageAsset.size
            //             }
            //         };

            //         updateImageAsset = await this.assetService.update(updateAssetQuery, imageNewValue);
            //     }

            //     if (updateImageAsset) {
            //         updatedImageAsset = await this.assetService.findOne(assetQuery);
            //     }
            // }

            // let updateCoverAsset;
            // let updatedCoverAsset: Asset;
            // const coverURL = pageUpdate.coverURL;
            // if (pageCoverAsset === null || pageCoverAsset === undefined) {
            //     pageCoverAsset = coverURL;
            // } else {
            //     if (coverURL !== null && coverURL !== undefined && coverURL !== '' && typeof (coverURL) !== 'undefined') {
            //         assetId = new ObjectID(imageURL.split(ASSET_PATH)[1]);

            //         const imageNewValue = {
            //             $set: {
            //                 fileName: newFileName,
            //                 data: pageCoverAsset.data,
            //                 mimeType: pageCoverAsset.mimeType,
            //                 size: pageCoverAsset.size
            //             }
            //         };

            //         updateCoverAsset = await this.assetService.update(updateAssetQuery, imageNewValue);
            //     }

            //     if (updateCoverAsset) {
            //         updatedCoverAsset = await this.assetService.findOne(assetQuery);
            //     }
            // }

            if (pageCoverPosition === null || pageCoverPosition === undefined) {
                pageCoverPosition = pageUpdate.coverPosition;
            }

            if (pageColor === null || pageColor === undefined) {
                pageColor = pageUpdate.color;
            }

            if (pageCategory === null || pageCategory === undefined) {
                pageCategory = pageUpdate.category;
            }

            if (pageAccessLevel !== null || pageAccessLevel !== undefined) {
                let level: string;

                switch (pageAccessLevel) {
                    case 0: level = PAGE_ACCESS_LEVEL.ADMIN; break;
                    case 1: level = PAGE_ACCESS_LEVEL.MODERATOR; break;
                    default: level = PAGE_ACCESS_LEVEL.OWNER; break;
                }

                const pageAcceessLevel = new PageAccessLevel();
                pageAcceessLevel.page = pageObjId;
                pageAcceessLevel.user = req.user.id;
                pageAcceessLevel.level = level;
            }

            const updateQuery = { _id: pageObjId, ownerUser: ownerUsers };
            const newValue = {
                $set: {
                    name: pageName,
                    pageUsername: pagesUsername,
                    backgroundStory: pageBackgroundStory,
                    // imageURL: ASSET_PATH + updatedImageAsset.id,
                    // coverURL: ASSET_PATH + updatedCoverAsset.id,
                    // coverPosition: pageCoverPosition,
                    color: pageColor,
                    category: pageCategory,
                    lineId: pageLineId,
                    facebookURL: pageFacebookURL,
                    instagramURL: pageInstagramURL,
                    websiteURL: pageWebsiteURL,
                    mobileNo: pageMobileNo,
                    address: pageAddress,
                    twitterURL: pageTwitterURL,
                    email: pageEmail
                }
            };
            const pageSave = await this.pageService.update(updateQuery, newValue);

            if (pageSave) {
                const engagements: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: pageObjId, contentType: ENGAGEMENT_CONTENT_TYPE.PAGE, userId: ownerUsers, action: ENGAGEMENT_ACTION.EDIT } });
                const engagement = new UserEngagement();
                engagement.clientId = clientId;
                engagement.contentId = pageObjId;
                engagement.contentType = ENGAGEMENT_CONTENT_TYPE.PAGE;
                engagement.ip = ipAddress;
                engagement.userId = ownerUsers;
                engagement.action = ENGAGEMENT_ACTION.EDIT;

                if (engagements) {
                    engagement.isFirst = false;
                } else {
                    engagement.isFirst = true;
                }

                await this.userEngagementService.create(engagement);

                const pageUpdated: Page = await this.pageService.findOne(findPageQuery);
                return res.status(200).send(ResponseUtil.getSuccessResponse('Update Page Successful', pageUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update Page', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/page/:id Delete Page API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/:id
     * @apiErrorExample {json} Delete Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized('user')
    public async deletePage(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(id);
        const ownerUsers = req.user.id;
        const page: Page = await this.pageService.findOne({ where: { _id: pageObjId, ownerUser: ownerUsers } });

        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid Page Id', undefined));
        }

        // check owner access
        if (page.ownerUser + '' !== ownerUsers + '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('Only Owner user that can delete the page.', undefined));
        }

        const pagePostsQuery = { pageId: pageObjId, ownerUser: ownerUsers, deleted: false };
        const pagePosts: Posts = await this.postsService.findOne({ where: pagePostsQuery });

        if (pagePosts) {
            const pagePostsDelete = await this.postsService.update(pagePostsQuery, { $set: { deleted: true } });

            if (pagePostsDelete) {
                const pagePostsObjId = new ObjectID(pagePosts.id);
                const postGalleryQuery = { post: pagePostsObjId };
                const postGallery: PostsGallery = await this.postGalleryService.findOne({ where: postGalleryQuery });
                if (postGallery) {
                    await this.postGalleryService.delete(postGalleryQuery);
                }

                const postsComment: PostsComment[] = await this.postsCommentService.find({ where: { post: pagePostsObjId, user: ownerUsers } });
                if (postsComment) {
                    await this.postsCommentService.delete(postsComment);
                }

                const fulfillment: Fulfillment[] = await this.fulfillmentService.find({ post: pagePostsObjId });
                if (fulfillment) {
                    await this.fulfillmentService.delete(fulfillment);
                }

                const needs: Needs[] = await this.needsService.find({ post: pagePostsObjId });
                if (needs) {
                    await this.needsService.delete(needs);
                }
            }
        }

        const query = { _id: pageObjId, ownerUser: ownerUsers };
        const deletePage = await this.pageService.delete(query);

        if (deletePage) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete Page', pageObjId));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete Page', undefined));
        }
    }

    /**
     * @api {get} /api/page/:id/config Get Page Config API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Get Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/config
     * @apiErrorExample {json} Get Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/config/:name')
    @Authorized('user')
    public async getPageConfig(@Param('id') id: string, @Param('name') name: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(id);
        const page: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
        }

        // check access
        const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
        if (!isUserCanAccess) {
            return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
        }

        const config = await this.pageConfigService.findOne({ name, page: pageObjId });

        if (config) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully to Get Page Config', config));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to Get Page Config', undefined));
        }
    }

    /**
     * @api {post} /api/page/:id/config/:name Create Page Config API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Create Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/config/:name
     * @apiErrorExample {json} Create Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/config/:name')
    @Authorized('user')
    public async createPageConfig(@Param('id') id: string, @Param('name') name: string, @Body({ validate: true }) configValue: ConfigValueRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(id);
        const page: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
        }

        if (configValue.type === undefined || configValue.type === '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('Config type is required.', undefined));
        }

        // check access
        const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
        if (!isUserCanAccess) {
            return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
        }

        const currentConfig = await this.pageConfigService.findOne({ name, page: pageObjId });
        if (currentConfig) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Config is duplicate.', undefined));
        }

        const config = new PageConfig();
        config.page = pageObjId;
        config.name = name;
        config.type = configValue.type;
        config.value = configValue.value;

        const createConfig = await this.pageConfigService.create(config);

        if (createConfig) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Create Page Config', createConfig));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to Create Page Config', undefined));
        }
    }

    @Post('/:id/twitter_fetch_enable')
    @Authorized('user')
    public async twitterFetch(@Param('id') id: string, @Body({ validate: true }) configValue: ConfigValueRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(id);
        const currentDateTime = moment().toDate();
        const authTime = currentDateTime;
        const page = await this.pageSocialAccountService.findOne({ where: { page: pageObjId } });
        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
        }
        // check access
        const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
        if (!isUserCanAccess) {
            return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
        }

        if (page) {
            // providerName: PROVIDER.TWITTER, enable:false, pageId: pageId,lastUpdated:current_time
            // user
            // pageId
            // providerName
            // providerUserId
            // lastSocialPostId
            // properties
            // enable
            // lastUpdated
            const socialPostLogsService = await this.socialPostLogsService.findOne({ pageId: pageObjId });
            if (socialPostLogsService) {
                const query = { pageId: pageObjId };
                const newValue = { $set: { enable: configValue.value } };
                await this.socialPostLogsService.update(query, newValue);
            } else {
                const socialPostLogs = new SocialPostLogs();
                socialPostLogs.user = userId;
                socialPostLogs.pageId = pageObjId;
                socialPostLogs.providerName = PROVIDER.TWITTER;
                socialPostLogs.providerUserId = page.providerPageId;
                socialPostLogs.lastSocialPostId = null;
                socialPostLogs.properties = page.properties;
                socialPostLogs.enable = configValue.value;
                socialPostLogs.lastUpdated = authTime;
                await this.socialPostLogsService.create(socialPostLogs);
            }
        }
        else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page Not Found', false));
        }
        return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully binding Page Twitter Social auto post.', true));
    }

    @Get('/:id/twitter_fetch_enable')
    @Authorized('user')
    public async getTwitterFetch(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(id);
        const page: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
        }

        // check access
        const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
        if (!isUserCanAccess) {
            return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
        }

        const config = await this.socialPostLogsService.findOne({ pageId: pageObjId });
        if (config) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully to Get Page Config', config.enable));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Unable to Get Page Config', false));
        }
    }
    /**
     * @api {put} /api/page/:id/config/:name Edit Page Config API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Edit Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/config/:name
     * @apiErrorExample {json} Edit Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id/config/:name')
    @Authorized('user')
    public async editPageConfig(@Param('id') id: string, @Param('name') name: string, @Body({ validate: true }) configValue: ConfigValueRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(id);
        const page: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
        }

        if (configValue.type === undefined || configValue.type === '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('Config type is required.', undefined));
        }

        // check access
        const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
        if (!isUserCanAccess) {
            return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
        }

        let result = undefined;
        const query = { name, page: pageObjId };
        const currentConfig = await this.pageConfigService.findOne(query);
        if (currentConfig) {
            result = await this.pageConfigService.update(query, {
                $set: {
                    value: configValue.value,
                    type: configValue.type
                }
            });
        } else {
            // create if not exists
            const config = new PageConfig();
            config.page = pageObjId;
            config.name = name;
            config.type = configValue.type;
            config.value = configValue.value;

            result = await this.pageConfigService.create(config);
        }

        if (result) {
            const config = await this.pageConfigService.findOne(query);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully edit Page Config', config));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to edit Page Config', undefined));
        }
    }

    /**
     * @api {delete} /api/page/:id/config/:name Delete Page Config API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/:id/config/:name
     * @apiErrorExample {json} Delete Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id/config/:name')
    @Authorized('user')
    public async deletePageConfig(@Param('id') id: string, @Param('name') name: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(id);
        const page: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

        if (!page) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
        }

        // check access
        const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
        if (!isUserCanAccess) {
            return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
        }

        const query = { name, page: pageObjId };
        const deleteConfig = await this.pageConfigService.delete(query);

        if (deleteConfig) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete Page Config', name));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete Page Config', undefined));
        }
    }

    @Post('/name/check')
    public async checkAllPageName(@Body({ validate: true }) pageName: CheckPageNameRequest, @Res() res: any): Promise<any> {
        const name = pageName.name;

        const pageObj: Page = await this.pageService.findOne({ where: { name } });

        if (pageObj) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('pageUsername is not available.', false));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('pageUsername is available.', true));
        }
    }

    @Post('/uniqueid/check')
    public async checkAllPageUniqueId(@Body({ validate: true }) pages: CheckUniqueIdRequest, @Res() res: any): Promise<any> {
        const pageUsername = pages.pageUsername;

        const checkValid = await this.checkUniqueIdValid(undefined, pageUsername, true);
        if (checkValid.status === 1) {
            return res.status(200).send(checkValid);
        } else {
            return res.status(200).send(checkValid);
        }
    }

    @Post('/:id/uniqueid/check')
    public async checkUniqueId(@Param('id') id: string, @Body({ validate: true }) pages: CheckUniqueIdRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageUsername = pages.pageUsername;

        const checkValid = await this.checkUniqueIdValid(id, pageUsername);
        if (checkValid.status === 1) {
            return res.status(200).send(checkValid);
        } else {
            return res.status(200).send(checkValid);
        }
    }

    @Post('/:id/uniqueid')
    @Authorized('user')
    public async bindingId(@Param('id') id: string, @Body({ validate: true }) pages: CheckUniqueIdRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageUsername = pages.pageUsername;
        const checkValid = await this.checkUniqueIdValid(id, pageUsername);
        const objectId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);

        let bindingIdQuery;
        let bindingIdUpdateQuery;

        const checkPageAccessResult = await this.checkPageAccess(objectId, userId);
        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (checkValid.status === 1 && checkValid.data === true) {
                bindingIdQuery = { _id: objectId };
                bindingIdUpdateQuery = { $set: { pageUsername } };
                const bindingIdResult = await this.pageService.update(bindingIdQuery, bindingIdUpdateQuery);
                if (bindingIdResult) {
                    const logBindindId = new UniqueIdHistory();
                    logBindindId.uniqueId = pageUsername;
                    logBindindId.type = UNIQUEID_LOG_TYPE.PAGE;
                    logBindindId.typeId = new ObjectID(id);
                    logBindindId.user = userId;
                    logBindindId.action = UNIQUEID_LOG_ACTION.BINDING;
                    await this.uniqueIdHistoryService.create(logBindindId);

                    const updatedResult = { id, pageUsername };
                    return res.status(200).send(ResponseUtil.getSuccessResponse('bindingId Sussesfully', updatedResult));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('bindingId Error', undefined));
                }
            } else {
                return res.status(400).send(checkValid);
            }
        }
    }

    @Delete('/:id/uniqueid')
    @Authorized('user')
    public async unbindingId(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const objectId = new ObjectID(id);
        let findPageIdQuery;
        let unBindingIdQuery;
        let unBindingIdUpdateQuery;
        const checkPageAccessResult = await this.checkPageAccess(objectId, userId);
        // console.log(checkPageAccessResult);

        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (id !== null && id !== undefined && id !== '') {
                findPageIdQuery = { where: { _id: objectId } };
                const checkPageId: Page = await this.pageService.findOne(findPageIdQuery);

                if (checkPageId) {
                    const pageUsername = checkPageId.pageUsername;
                    unBindingIdQuery = { _id: objectId };
                    unBindingIdUpdateQuery = { $set: { pageUsername: null } };
                    const bindingIdResult = await this.pageService.update(unBindingIdQuery, unBindingIdUpdateQuery);
                    if (bindingIdResult) {
                        const logBindindId = new UniqueIdHistory();
                        logBindindId.uniqueId = pageUsername;
                        logBindindId.type = UNIQUEID_LOG_TYPE.PAGE;
                        logBindindId.typeId = objectId;
                        logBindindId.user = userId;
                        logBindindId.action = UNIQUEID_LOG_ACTION.UNBINDING;
                        await this.uniqueIdHistoryService.create(logBindindId);
                        const updatedResult = { id, pageUsername };
                        return res.status(200).send(ResponseUtil.getSuccessResponse('unbindingId Sussesfully', updatedResult));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('unbindingId Error', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page not found', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pageId', undefined));
            }
        }
    }

    @Get('/:id/followers')
    public async getFollowerList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Param('id') sId: string, @Res() res: any, @Req() req: any): Promise<any> {
        if (sId !== null && sId !== undefined && sId !== '') {
            const subjectId = new ObjectID(sId);
            const findFollowersMatch = { $match: { subjectId, subjectType: SUBJECT_TYPE.PAGE } };

            if (limit === null || limit === undefined || limit <= 0) {
                limit = PAGE_FOLLOWER_LIMIT_DEFAULT;
            }
            if (offset === null || offset === undefined || offset < 0 || isNaN(offset) === true) {
                offset = PAGE_FOLLOWER_OFFSET_DEFAULT;
            }
            const findFollowersOffset = { $skip: offset };
            const findFollowerLimit = { $limit: limit };
            const findFollowerLookup = {
                $lookup: {
                    from: 'User',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userFollower'
                }
            };
            const getFollowerListStatement = [findFollowersMatch, findFollowersOffset, findFollowerLimit, findFollowerLookup];
            const followerListResult = await this.userFollowService.aggregate(getFollowerListStatement);
            const followerListArray = [];
            let followerRes: GetFollowersListResponse;
            const followerResponse = new GetFollowersListResponse();

            if (followerListResult.length > 0) {
                for (const follower of followerListResult) {
                    for (const followerIn of follower.userFollower) {
                        followerRes = followerResponse;
                        followerRes.id = followerIn._id;
                        followerRes.username = followerIn.username;
                        followerRes.firstname = followerIn.firstname;
                        followerRes.displayName = followerIn.displayName;
                        followerRes.imageURL = followerIn.imageURL;
                        followerListArray.push(followerRes);
                    }
                }
                return res.status(200).send(ResponseUtil.getSuccessResponse('getFollowerList Sussesfully', followerListArray));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Not have data', undefined));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid subjectId', undefined));
        }
    }

    @Post('/:id/enable_fetch_twitter')
    @Authorized('user')
    public async fetchTwitterEnable(@Param('id') id: string, @Body({ validate: true }) twitterParam: FetchSocialPostEnableRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const pageObjId = new ObjectID(id);
            const page: Page = await this.pageService.findOne({ where: { _id: pageObjId } });

            if (!page) {
                return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found', undefined));
            }

            const userId = req.user.id;
            // check if user can access page
            const isUserCanAccess = await this.isUserCanAccessPage(userId, pageObjId);
            if (!isUserCanAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot access the page.', undefined));
            }

            // find authen with twitter
            const twitterAccount = await this.pageSocialAccountService.findOne({ page: pageObjId, providerName: PROVIDER.TWITTER });

            if (twitterAccount === undefined) {
                const errorResponse = ResponseUtil.getSuccessResponse('Twitter account was not binding', undefined);
                return res.status(400).send(errorResponse);
            }

            // find log
            const socialPostLog = await this.socialPostLogsService.findOne({ providerName: PROVIDER.TWITTER, providerUserId: twitterAccount.providerPageId });
            if (socialPostLog !== undefined) {
                // update old
                await this.socialPostLogsService.update({ _id: socialPostLog.id }, { $set: { enable: twitterParam.enable } });
            } else {
                // create new
                const newSocialPostLog = new SocialPostLogs();
                newSocialPostLog.user = userId; // log by user
                newSocialPostLog.lastSocialPostId = undefined;
                newSocialPostLog.providerName = PROVIDER.TWITTER;
                newSocialPostLog.providerUserId = twitterAccount.providerPageId;
                newSocialPostLog.properties = undefined;
                newSocialPostLog.enable = twitterParam.enable;
                newSocialPostLog.lastUpdated = undefined;

                await this.socialPostLogsService.create(newSocialPostLog);
            }

            return res.status(200).send(twitterParam);
        } catch (err) {
            const errorResponse = ResponseUtil.getSuccessResponse('Cannot enable twitter fetch post', err);
            return res.status(400).send(errorResponse);
        }
    }

    private async checkPageAccess(pageId: ObjectID, userId: ObjectID): Promise<any> {
        const pageAccessLevelCheckQuery = { where: { page: pageId, user: userId } };
        const pageAccessLevelResult = await this.pageAccessLevelService.find(pageAccessLevelCheckQuery);

        if (pageAccessLevelResult.length > 0) {
            for (const pageAccess of pageAccessLevelResult) {
                if (pageAccess.level !== PAGE_ACCESS_LEVEL.ADMIN && pageAccess.level !== PAGE_ACCESS_LEVEL.OWNER) {
                    return ResponseUtil.getErrorResponse('Can not access', undefined);
                } else {
                    return ResponseUtil.getSuccessResponse('Can access', pageAccess);
                }
            }
        } else {
            return ResponseUtil.getErrorResponse('Can not unbinding', undefined);
        }
    }

    private async checkUniqueIdValid(id: string, pageUsername: string, ignorePageIdCheck?: boolean): Promise<any> {
        let findPageIdQuery;
        let findOtherPageQuery;

        const pageObjectid = new ObjectID(id);
        findPageIdQuery = { where: { _id: pageObjectid } };
        let checkPageId: Page;

        if (id !== null && id !== undefined && id !== '') {
            checkPageId = await this.pageService.findOne(findPageIdQuery);

            if (!ignorePageIdCheck) {
                if (!checkPageId) {
                    return ResponseUtil.getErrorResponse('Page not found', undefined);
                }
            }
        } else {
            if (!ignorePageIdCheck) {
                return ResponseUtil.getErrorResponse('Invalid pageId', undefined);
            }
        }

        if (pageUsername !== null && pageUsername !== undefined && pageUsername !== '') {
            if (pageUsername.match(/\s/g)) {
                return ResponseUtil.getErrorResponse('Spacebar is not allowed', undefined);
            }
            if (!ignorePageIdCheck) {
                if (checkPageId.pageUsername === pageUsername) {
                    return ResponseUtil.getSuccessResponse('Own pageUsername', true);
                }
            }

            const checkUniqueIdUserQuey = { where: { uniqueId: pageUsername } };
            const checkUniqueIdUser: User = await this.userService.findOne(checkUniqueIdUserQuey);

            findOtherPageQuery = { where: { pageUsername } };
            if (!ignorePageIdCheck) {
                findOtherPageQuery.where._id = { $ne: pageObjectid };
            }

            const checkOtherPage: Page = await this.pageService.findOne(findOtherPageQuery);
            if ((checkOtherPage !== null && checkOtherPage !== undefined) || (checkUniqueIdUser !== null && checkUniqueIdUser !== undefined)) {
                return ResponseUtil.getSuccessResponse('pageUsername is not available.', false);
            } else {
                return ResponseUtil.getSuccessResponse('pageUsername is available', true);
            }
        } else {
            return ResponseUtil.getErrorResponse('pageUsername is required', undefined);
        }
    }

    private async getPageEnagagement(contentId: ObjectID, userId: ObjectID, contentType: string, action: string): Promise<UserEngagement> {
        return await this.userEngagementService.findOne({ where: { contentId, userId, contentType, action } });
    }

    private async isUserCanAccessPage(userId: string, asPageId: string): Promise<boolean> {
        // check accessibility
        const pageAccess = await this.pageAccessLevelService.getUserAccessByPage(userId, asPageId);

        if (pageAccess) {
            let isCanAccess = false;
            for (const access of pageAccess) {
                if (access.level === PAGE_ACCESS_LEVEL.OWNER ||
                    access.level === PAGE_ACCESS_LEVEL.ADMIN ||
                    access.level === PAGE_ACCESS_LEVEL.MODERATOR) {
                    isCanAccess = true;
                    break;
                }
            }

            if (!isCanAccess) {
                return false;
            }
        } else {
            return false;
        }

        return true;
    }

    private createCheckSocialBindingObj(socialAccount: PageSocialAccount, isValid: boolean): any {
        if (socialAccount === undefined) {
            return undefined;
        }

        const result = {
            providerPageId: socialAccount.providerPageId,
            providerPageName: socialAccount.providerPageName,
            data: isValid
        };

        return result;
    }
}
