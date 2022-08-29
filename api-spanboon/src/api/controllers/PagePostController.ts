/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete, QueryParam, QueryParams } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { PageService } from '../services/PageService';
import { PostsService } from '../services/PostsService';
import { PostsCommentService } from '../services/PostsCommentService';
import { PostsGalleryService } from '../services/PostsGalleryService';
import { FulfillmentService } from '../services/FulfillmentService';
import { NeedsService } from '../services/NeedsService';
import { UserEngagementService } from '../services/UserEngagementService';
import { StandardItemService } from '../services/StandardItemService';
import { AssetService } from '../services/AssetService';
import { S3Service } from '../services/S3Service';
import { PagePostRequest } from './requests/PagePostsRequest';
import { Posts } from '../models/Posts';
import { Needs } from '../models/Needs';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { POST_TYPE } from '../../constants/PostType';
import { StandardItem } from '../models/StandardItem';
import { CustomItemService } from '../services/CustomItemService';
import { CustomItem } from '../models/CustomItem';
import { PageUsageHistoryService } from '../services/PageUsageHistoryService';
import { PageUsageHistory } from '../models/PageUsageHistory';
import { SearchPostRequest } from './requests/SearchPostRequest';
import { Page } from '../models/Page';
import { PostsGallery } from '../models/PostsGallery';
import { ASSET_PATH, ASSET_SCOPE } from '../../constants/AssetScope';
import { MAX_SEARCH_ROWS } from '../../constants/Constants';
import { Asset } from '../models/Asset';
import { PostsComment } from '../models/PostsComment';
import { Fulfillment } from '../models/Fulfillment';
import { User } from '../models/User';
import { UserService } from '../services/UserService';
import { FileUtil } from '../../utils/Utils';
import { HashTagService } from '../services/HashTagService';
import { UserLike } from '../models/UserLike';
import { UserLikeService } from '../services/UserLikeService';
import { LIKE_TYPE } from '../../constants/LikeType';
import { PageObjective } from '../models/PageObjective';
import { PageNotificationService } from '../services/PageNotificationService';
import { NotificationService } from '../services/NotificationService';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { HashTag } from '../models/HashTag';
import { USER_TYPE,NOTIFICATION_TYPE } from '../../constants/NotificationType';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { SearchFilter } from './requests/SearchFilterRequest';
import { PageSocialAccountService } from '../services/PageSocialAccountService';
import { PostUtil } from '../../utils/PostUtil';
import { DeviceTokenService } from '../services/DeviceToken';
import { UserFollowService } from '../services/UserFollowService';
@JsonController('/page')
export class PagePostController {
    constructor(
        private pageService: PageService,
        private postsService: PostsService,
        private objectiveService: PageObjectiveService,
        private postsCommentService: PostsCommentService,
        private postGalleryService: PostsGalleryService,
        private fulfillmentService: FulfillmentService,
        private emergencyService: EmergencyEventService,
        private needsService: NeedsService,
        private userService: UserService,
        private userEngagementService: UserEngagementService,
        private standardItemService: StandardItemService,
        private assetService: AssetService,
        private customItemService: CustomItemService,
        private hashTagService: HashTagService,
        private pageUsageHistoryService: PageUsageHistoryService,
        private userLikeService: UserLikeService,
        private pageNotificationService: PageNotificationService,
        private pageAccessLevelService: PageAccessLevelService,
        private notificationService: NotificationService,
        private pageSocialAccountService: PageSocialAccountService,
        private s3Service: S3Service,
        private deviceToken:DeviceTokenService,
        private userFollowService:UserFollowService
    ){}
    // @Get('/test/post')
    // public async test(@Req() req:any):Promise<any>{
    //     return {message:'ok'}
    // }
    // PagePost List API
    /**
     * @api {get} /api/page/:pageId/post/:id PagePost List API
     * @apiGroup PagePost
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PagePost",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post/:id
     * @apiErrorExample {json} PagePost error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/post')
    public async getPagePost(@Param('id') id: string, @QueryParam('offset') offset: number, @QueryParam('limit') limit: number, @Res() res: any): Promise<any> {
        const pageObjId = new ObjectID(id);
        if (offset === null || offset === undefined) {
            offset = 0;
        }

        if (limit === null || limit === undefined || limit <= 0) {
            limit = MAX_SEARCH_ROWS;
        }

        // pagePosts = await this.postsService.find({ where: { $and: [{ pageId: pageObjId }, { hidden: false }, { deleted: false }] } });
        const pagePosts: Posts[] = await this.postsService.aggregate(
            [
                { $match: { pageId: pageObjId, isDraft: false, hidden: false, deleted: false } },
                { $sort: { startDateTime: -1 } },
                { $skip: offset },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'PageObjective',
                        localField: 'objective',
                        foreignField: '_id',
                        as: 'objective'
                    }
                },
                {
                    $unwind: {
                        path: '$objective',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $project: { 'objective._id': 0 } },
                {
                    $lookup: {
                        from: 'PostsGallery',
                        localField: '_id',
                        foreignField: 'post',
                        as: 'gallery'
                    }
                },
                {
                    $lookup: {
                        from: 'User',
                        localField: 'ownerUser',
                        foreignField: '_id',
                        as: 'ownerUser'
                    }
                },
                {
                    $unwind: {
                        path: '$ownerUser',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'Needs',
                        localField: 'pageId',
                        foreignField: 'pageId',
                        as: 'postNeeds'
                    }
                },
                { $addFields: { needs: '$postNeeds' } },
                { $project: { postNeeds: 0 } },
                {
                    $lookup: {
                        from: 'PostsComment',
                        localField: '_id',
                        foreignField: 'post',
                        as: 'comment'
                    }
                },
                {
                    $lookup: {
                        from: 'FulfillmentCase',
                        localField: '_id',
                        foreignField: 'fulfillmentPost',
                        as: 'fulfillmentCase'
                    }
                },
                {
                    $unwind: {
                        path: '$fulfillmentCase',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'SocialPost',
                        localField: '_id',
                        foreignField: 'postId',
                        as: 'socialPosts'
                    }
                },
                {
                    $project: {
                        'ownerUser._id': 0,
                        'ownerUser.username': 0,
                        'ownerUser.password': 0,
                        'ownerUser.coverURL': 0,
                        'ownerUser.coverPosition': 0,
                        'ownerUser.isSubAdmin': 0,
                        'ownerUser.banned': 0,
                        'ownerUser.email': 0,
                        'ownerUser.firstName': 0,
                        'ownerUser.lastName': 0,
                        'ownerUser.birthdate': 0,
                        'ownerUser.isAdmin': 0,
                        'ownerUser.gender': 0,
                        'ownerUser.customGender': 0,
                        'ownerUser.createdDate': 0,
                        'socialPosts': {
                            '_id': 0,
                            'pageId': 0,
                            'postId': 0,
                            'postBy': 0,
                            'postByType': 0
                        }
                    }
                },
                { $addFields: { commentCount: { $size: '$comment' } } }
            ]
        );

        if (pagePosts) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PagePost', pagePosts);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PagePost', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // PagePost List API
    /**
     * @api {get} /api/page/:pageId/post/:id PagePost List API
     * @apiGroup PagePost
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PagePost",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post/:id
     * @apiErrorExample {json} PagePost error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:pageId/post/:postId')
    public async findPagePost(@Param('pageId') pageId: string, @Param('postId') postId: string, @Res() res: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const pagePostsObjId = new ObjectID(postId);
        const posts: Posts[] = await this.postsService.find({ where: { $and: [{ _id: pagePostsObjId }, { pageId: pageObjId }, { isDraft: false }, { hidden: false }, { deleted: false }] } });

        if (posts) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PagePost', posts);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PagePost', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page/:pageId/post Create PagePost API
     * @apiGroup PagePost
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "title": "",
     *      "detail": "",
     *      "hidden": "",
     *      "type": "",
     *      "referenceMode": ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create PagePost",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post
     * @apiErrorExample {json} Unable create PagePost
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:pageId/post')
    @Authorized('user')
    public async createPagePost(@Body({ validate: true }) pagePost: PagePostRequest, @Param('pageId') pageId: string, @QueryParams() options: any, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const userIdList = [];
        const userTags = [];
        const stdItemList = [];
        const objective = pagePost.objective;
        const isPostDraft = pagePost.isDraft;
        const postStory = pagePost.story;
        const postGallery = pagePost.postGallery;
        const coverImage = pagePost.coverImage;
        const postNeeds = pagePost.needs;
        const postHashTag = pagePost.postsHashTags;
        const postUserTag = pagePost.userTags;
        const postEmergencyEvent = pagePost.emergencyEvent;
        const startDateTime = moment(pagePost.startDateTime).toDate();
        const today = moment().toDate();
        let pageData: Page[];
        let pageObjId = null;
        let createResult: any;
        let needNotiTxt = '';
        let isPostTwitter = false;
        let isPostFacebook = false;

        if (options !== undefined) {
            if (options.twitterPost !== undefined && typeof options.twitterPost === 'string') {
                if ('TRUE' === options.twitterPost.toUpperCase()) {
                    isPostTwitter = true;
                }
            }
            if (options.facebookPost !== undefined && typeof options.facebookPost === 'string') {
                if ('TRUE' === options.facebookPost.toUpperCase()) {
                    isPostFacebook = true;
                }
            }
        }

        if (pageId === 'null' || pageId === null || pageId === 'undefined' || pageId === undefined) {
            pageData = await this.pageService.find({ where: { pageId: null, ownerUser: userObjId } });
        } else {
            pageObjId = new ObjectID(pageId);
            pageData = await this.pageService.find({ where: { _id: pageObjId } });

            if (pageData === undefined) {
                return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found.', undefined));
            }

            // Check PageAccess
            const accessLevels = [PAGE_ACCESS_LEVEL.OWNER, PAGE_ACCESS_LEVEL.ADMIN, PAGE_ACCESS_LEVEL.MODERATOR, PAGE_ACCESS_LEVEL.POST_MODERATOR];
            const canAccess: boolean = await this.pageAccessLevelService.isUserHasAccessPage(req.user.id + '', pageId, accessLevels);
            if (!canAccess) {
                return res.status(401).send(ResponseUtil.getErrorResponse('You cannot edit post of this page.', undefined));
            }
        }

        if (postUserTag !== null && postUserTag !== undefined) {
            for (const userTagId of postUserTag) {
                userIdList.push(new ObjectID(userTagId));
            }
        }

        const userIdExists: User[] = await this.userService.find({ _id: { $in: userIdList } });

        if (userIdExists !== null && userIdExists !== undefined && userIdExists.length > 0) {
            for (const user of userIdExists) {
                userTags.push(new ObjectID(user.id));
            }
        }

        let assetResult: Asset;

        if (postStory !== null && postStory !== undefined && postStory !== '') {
            if (coverImage !== null && coverImage !== undefined) {
                const newFileName = userObjId + FileUtil.renameFile();
                const assetData = coverImage.data;
                const assetMimeType = coverImage.mimeType;
                const assetFileName = newFileName;
                const assetSize = coverImage.size;

                const coverImageAsset = new Asset();
                coverImageAsset.userId = userObjId;
                coverImageAsset.data = assetData;
                coverImageAsset.mimeType = assetMimeType;
                coverImageAsset.fileName = assetFileName;
                coverImageAsset.size = assetSize;
                coverImageAsset.expirationDate = null;
                coverImageAsset.scope = ASSET_SCOPE.PUBLIC;
                try {
                    assetResult = await this.assetService.create(coverImageAsset);
                } catch (error) {
                    assetResult = undefined;
                    console.log('Error create coverImage: ', error);
                }
            }

            // find id from story and change expirationDate = null
            if (postStory.story !== undefined && postStory.story !== null && postStory.story !== '') {
                const imageIds = PostUtil.getImageIdsFromStory(postStory.story);
                for (const imgId of imageIds) {
                    try {
                        await this.assetService.update({ _id: new ObjectID(imgId) }, { $set: { expirationDate: null } });
                    } catch (error) {
                        console.log('Error create story Image: ', error);
                    }
                }
            }
        }

        let createdDate: Date;
        let postDateTime: Date;
        let isDraft: boolean;

        if (isPostDraft) {
            createdDate = null;
            postDateTime = null;
            isDraft = true;
        } else {
            if (startDateTime !== null && startDateTime !== undefined) {
                createdDate = startDateTime;
                postDateTime = startDateTime;
            } else {
                createdDate = today;
                postDateTime = today;
            }

            isDraft = false;
        }

        let postDetail = pagePost.detail;

        if (postDetail !== null && postDetail !== undefined && postDetail !== '') {
            postDetail = postDetail.replace(/^\s*[\r\n]/gm, '\n');
        }

        const postPage: Posts = new Posts();
        postPage.title = pagePost.title;
        postPage.detail = postDetail;
        postPage.isDraft = isDraft;
        postPage.hidden = false;
        postPage.type = POST_TYPE.GENERAL;
        postPage.userTags = userTags;
        postPage.coverImage = assetResult ? ASSET_PATH + assetResult.id : '';
        postPage.pinned = false;
        postPage.deleted = false;
        postPage.ownerUser = userObjId;
        postPage.commentCount = 0;
        postPage.repostCount = 0;
        postPage.shareCount = 0;
        postPage.likeCount = 0;
        postPage.viewCount = 0;
        postPage.createdDate = createdDate;
        postPage.startDateTime = postDateTime;
        postPage.story = (postStory !== null && postStory !== undefined) ? postStory : null;
        const masterHashTagMap = {};
        const postMasterHashTagList = [];
        const imageBase64sForTw = [];
        if (postHashTag !== null && postHashTag !== undefined && postHashTag.length > 0) {
            const masterHashTagList: HashTag[] = await this.findMasterHashTag(postHashTag);

            for (const hashTag of masterHashTagList) {
                const id = hashTag.id;
                const name = hashTag.name;
                postMasterHashTagList.push(new ObjectID(id));
                masterHashTagMap[name] = hashTag;
            }

            for (const hashTag of postHashTag) {
                if (masterHashTagMap[hashTag] === undefined) {
                    const newHashTag: HashTag = new HashTag();
                    newHashTag.name = hashTag;
                    newHashTag.lastActiveDate = today;
                    newHashTag.count = 0;
                    newHashTag.iconURL = '';

                    const newMasterHashTag: HashTag = await this.hashTagService.create(newHashTag);

                    if (newMasterHashTag !== null && newMasterHashTag !== undefined) {
                        postMasterHashTagList.push(new ObjectID(newMasterHashTag.id));

                        masterHashTagMap[hashTag] = newMasterHashTag;
                    }
                }
            }
        }

        postPage.postsHashTags = postMasterHashTagList;

        let ht: HashTag;

        if (objective !== null && objective !== undefined && objective !== '') {
            const pageObjectve: PageObjective = await this.objectiveService.findOne({ _id: new ObjectID(objective) });

            if (pageObjectve !== null && pageObjectve !== undefined) {
                postPage.objective = new ObjectID(pageObjectve.id);
                ht = await this.hashTagService.findOne({ _id: new ObjectID(pageObjectve.hashTag) });
                postPage.objectiveTag = (ht !== null && ht !== undefined) ? ht.name : null;
            } else {
                postPage.objective = null;
                postPage.objectiveTag = null;
            }
        }

        if (postEmergencyEvent !== null && postEmergencyEvent !== undefined && postEmergencyEvent !== '') {
            const emergency: EmergencyEvent = await this.emergencyService.findOne({ _id: new ObjectID(postEmergencyEvent) });
            if (emergency !== null && emergency !== undefined) {
                postPage.emergencyEvent = new ObjectID(emergency.id);
                ht = await this.hashTagService.findOne({ _id: new ObjectID(emergency.hashTag) });
                postPage.emergencyEventTag = (ht !== null && ht !== undefined) ? ht.name : null;
            } else {
                postPage.emergencyEvent = null;
                postPage.emergencyEventTag = null;
            }
        }

        // check image gallery before create post
        const assetIdList = [];
        const orderingList = [];
        const duplicateAssetIdList = [];
        const duplicateOrderingList = [];

        if (postGallery !== null && postGallery !== undefined && postGallery.length > 0) {
            for (const item of postGallery) {
                if (assetIdList.includes(item.id)) {
                    // throw error
                    duplicateAssetIdList.push(new ObjectID(item.id));
                } else {
                    assetIdList.push(new ObjectID(item.id));
                }

                if (orderingList.includes(item.asset.ordering)) {
                    // throw error
                    duplicateOrderingList.push(item.asset.ordering);
                } else {
                    orderingList.push(item.asset.ordering);
                }
            }

            if (duplicateAssetIdList.length > 0) {
                const errorResponse = ResponseUtil.getErrorResponse('Asset Id Duplicate', { id: duplicateAssetIdList });
                return res.status(400).send(errorResponse);
            }

            if (duplicateOrderingList.length > 0) {
                const errorResponse = ResponseUtil.getErrorResponse('Ordering Duplicate', { ordering: duplicateOrderingList });
                return res.status(400).send(errorResponse);
            }

            const findAssets: Asset[] = await this.assetService.find({ $and: [{ _id: { $in: assetIdList } }] });

            if (findAssets) {
                for (const asset of findAssets) {
                    if (asset.expirationDate !== undefined && asset.expirationDate !== null) {
                        if (asset.expirationDate < today) {
                            const errorResponse = ResponseUtil.getErrorResponse('File has Expired', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Asset Not Found', undefined);
                return res.status(400).send(errorResponse);
            }
        }
        // end check image gallery
        // create post need notification!!!!
        if (pageData) {
            postPage.pageId = pageObjId;
            postPage.referencePost = null;
            postPage.rootReferencePost = null;
            postPage.visibility = null;
            postPage.ranges = null;
            const createPostPageData: Posts = await this.postsService.create(postPage);
            if (createPostPageData) {
                createResult = createPostPageData;
                const postPageId = new ObjectID(createPostPageData.id);
                const engagement = new UserEngagement();
                engagement.clientId = clientId;
                engagement.contentId = postPageId;
                engagement.contentType = ENGAGEMENT_CONTENT_TYPE.POST;
                engagement.ip = ipAddress;
                engagement.userId = userObjId;
                engagement.action = ENGAGEMENT_ACTION.CREATE;
                engagement.isFirst = true;
                await this.userEngagementService.create(engagement);
                // page to user
                if(createPostPageData.pageId !== null)
                {
                    const page_post = await this.pageService.findOne({_id:createPostPageData.pageId});
                    const notificationText_POST = `มีโพสต์ใหม่จากเพจ ${page_post.name}`;
                    const user_follow = await this.userFollowService.find({subjectType:'PAGE',subjectId:createPostPageData.pageId});
                    for(let i = 0; i<user_follow.length; i++){
                        const tokenFCM_id = await this.deviceToken.find({userId:user_follow[i].userId,token:{$ne:null}});
                        for(let j = 0; j<tokenFCM_id.length; j++){
                            if(tokenFCM_id[j] !== undefined){
                                const link = '/post/' + createPostPageData.id;
                                await this.notificationService.createNotificationFCM(
                                    tokenFCM_id[j].userId,
                                    USER_TYPE.PAGE,
                                    req.user.id+'',
                                    USER_TYPE.USER,
                                    NOTIFICATION_TYPE.POST,
                                    notificationText_POST,
                                    link,
                                    tokenFCM_id[j].Tokens,
                                    page_post.pageUsername,
                                    page_post.imageURL
                                );
                            }
                            else{
                                const link = '/post/' + createPostPageData.id;
                                await this.notificationService.createNotificationFCM(
                                    createPostPageData.pageId,
                                    USER_TYPE.PAGE,
                                    req.user.id+'',
                                    USER_TYPE.USER,
                                    NOTIFICATION_TYPE.POST,
                                    notificationText_POST,
                                    link,
                                    page_post.pageUsername,
                                    page_post.imageURL
                                );
                            }
                        }
                    }

                }
                else
                {   
                    const user_post = await this.userService.findOne({_id:createPostPageData.ownerUser});
                    const notificationText_POST = `มีโพสต์ใหม่จาก ${user_post.displayName}`;

                    // user to user
                    const user_follow = await this.userFollowService.find({subjectType:'USER',subjectId:createPostPageData.ownerUser});
                    for(let i = 0; i<user_follow.length; i++){
                        const tokenFCM_id = await this.deviceToken.find({userId:user_follow[i].userId,token:{$ne:null}});
                        for(let j = 0; j<tokenFCM_id.length; j++){
                            if(tokenFCM_id[j] !== undefined){
                                const link = '/post/'+createPostPageData.id;
                                await this.notificationService.createNotificationFCM(
                                    tokenFCM_id[j].userId,
                                    USER_TYPE.USER,
                                    req.user.id+'',
                                    USER_TYPE.USER,
                                    NOTIFICATION_TYPE.POST,
                                    notificationText_POST,
                                    link,
                                    tokenFCM_id[j].Tokens,
                                    user_post.displayName,
                                    user_post.imageURL
                                );
                            }
                            else{
                                const link = '/post/'+createPostPageData.id;
                                await this.notificationService.createNotification(
                                    tokenFCM_id[j].userId,
                                    USER_TYPE.USER,
                                    req.user.id+'',
                                    USER_TYPE.USER,
                                    NOTIFICATION_TYPE.POST,
                                    notificationText_POST,
                                    link,
                                    user_post.displayName,
                                    user_post.imageURL
                                );
                            }
                        }

                    }
                }
                let needsCreate: Needs;
                const needsCreated: Needs[] = [];
                if (postNeeds !== null && postNeeds !== undefined && postNeeds.length > 0) {
                    let needs: Needs;
                    let stdItems: StandardItem[];

                    if (Array.isArray(postNeeds)) {
                        const needsMap = {};

                        for (const item of postNeeds) {
                            const stdItemId = item.standardItemId;
                            const unit = item.unit;
                            const quantity = item.quantity;
                            const itemName = item.itemName;
                            if (stdItemId === null && stdItemId === undefined && stdItemId === '') {
                                needsMap[stdItemId] = { quantity, unit };
                                stdItemList.push(new ObjectID(stdItemId));
                                if (stdItemList !== null && stdItemList !== undefined && stdItemList.length > 0) {
                                    stdItems = await this.standardItemService.find({ where: { _id: { $in: stdItemList } } });
                                }
                            } else {
                                const customItem = new CustomItem();
                                customItem.name = itemName;
                                customItem.unit = unit;
                                customItem.userId = userObjId;
                                customItem.standardItemId = null;
                                const customCreate = await this.customItemService.create(customItem);
                                needs = new Needs();
                                needs.standardItemId = null;
                                needs.customItemId = new ObjectID(customCreate.id);
                                needs.pageId = pageObjId;
                                needs.name = itemName;
                                needs.active = true;
                                needs.fullfilled = false;
                                needs.quantity = quantity;
                                needs.unit = unit;
                                needs.post = postPageId;
                                needs.description = null;
                                needs.fulfillQuantity = 0;
                                needs.pendingQuantity = 0;
                                needsCreate = await this.needsService.create(needs);
                            }
                        }

                        if (stdItems !== null && stdItems !== undefined && stdItems.length > 0) {
                            for (const stdItem of stdItems) {
                                const stdItemId = stdItem.id;
                                const needsData = needsMap[stdItemId];

                                if (needsData === null && needsData === undefined) {
                                    const quantity = needsData.quantity;
                                    const unit = needsData.unit;
                                    needs = new Needs();
                                    needs.standardItemId = new ObjectID(stdItemId);
                                    needs.customItemId = null;
                                    needs.pageId = pageObjId;
                                    needs.name = stdItem.name;
                                    needs.active = true;
                                    needs.fullfilled = false;
                                    needs.quantity = quantity;
                                    needs.unit = unit;
                                    needs.post = postPageId;
                                    needs.description = null;
                                    needs.fulfillQuantity = 0;
                                    needs.pendingQuantity = 0;

                                    needsCreate = await this.needsService.create(needs);
                                }
                            }
                        }

                        await this.postsService.update({ _id: postPageId, ownerUser: userObjId }, { $set: { type: POST_TYPE.NEEDS } });
                        createResult.type = POST_TYPE.NEEDS;

                        needsCreated.push(needsCreate);
                        if (needsCreated.length > 0) {
                            if (needsCreated.length === 1) {
                                // item only one
                                needNotiTxt = ' กำลังมองหา ' + needsCreated[0].name;
                            } else {
                                // more than 1
                                needNotiTxt = ' กำลังมองหาบางสิ่งบางอย่าง';
                            }
                        }
                    }
                }

                if (postGallery !== null && postGallery !== undefined && postGallery.length > 0) {
                    for (const item of postGallery) {
                        const assetObjId = new ObjectID(item.id);
                        const assetObj = await this.assetService.findOne({ _id: assetObjId });
                        if (assetObj === undefined) {
                            continue;
                        }
                        if (assetObj.data !== undefined && assetObj.data !== null) {
                            if (imageBase64sForTw.length < 4) {
                                imageBase64sForTw.push(assetObj.data);
                            }
                        }

                        const postsGallery = new PostsGallery();
                        postsGallery.post = postPageId;
                        postsGallery.fileId = assetObjId;
                        postsGallery.imageURL = ASSET_PATH + assetObjId;
                        postsGallery.s3ImageURL = assetObj.s3FilePath;
                        postsGallery.ordering = item.asset.ordering;
                        const postsGalleryCreate: PostsGallery = await this.postGalleryService.create(postsGallery);

                        if (postsGalleryCreate) {
                            await this.assetService.update({ _id: assetObjId, userId: userObjId }, { $set: { expirationDate: null } });
                        }
                    }
                }

                if (needsCreated.length > 0) {
                    createResult = { posts: createPostPageData, needs: needsCreated };
                    const pageUsageHistory = new PageUsageHistory();
                    pageUsageHistory.userId = userObjId;
                    pageUsageHistory.contentId = new ObjectID(createPostPageData.id);
                    pageUsageHistory.contentType = POST_TYPE.NEEDS;
                    pageUsageHistory.data = createResult;
                    await this.pageUsageHistoryService.create(pageUsageHistory);
                } else {
                    createResult = { posts: createPostPageData };
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Create PagePost Failed', undefined);
                return res.status(400).send(errorResponse);
            }

            const hashTagList = [];

            if (postHashTag !== null && postHashTag !== undefined && postHashTag.length > 0) {
                for (const hashTag of postHashTag) {
                    const htEngagement = new UserEngagement();
                    htEngagement.clientId = clientId;
                    htEngagement.contentId = new ObjectID(createPostPageData.id);
                    htEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.POST;
                    htEngagement.ip = ipAddress;
                    htEngagement.userId = userObjId;
                    htEngagement.action = ENGAGEMENT_ACTION.TAG;
                    htEngagement.isFirst = true;

                    if (masterHashTagMap[hashTag]) {
                        htEngagement.reference = hashTag;
                        hashTagList.push(hashTag);
                    }

                    await this.userEngagementService.create(htEngagement);
                }

                if (hashTagList !== null && hashTagList !== undefined && hashTagList.length > 0) {
                    await this.hashTagService.update({ name: { $in: hashTagList } }, { $set: { lastActiveDate: today } });
                }
            }

            // update post hastag
            if (createResult !== null && createResult !== undefined && postMasterHashTagList.length > 0) {
                // beware slow becase count all post
                await this.postsService.recalculateHashTagCount(postMasterHashTagList);
            }

            if (createResult !== null && createResult !== undefined) {
                let link = '';

                if (createResult.posts !== undefined && createResult.posts !== null &&
                    createResult.posts.id !== undefined && createResult.posts.id !== null) {
                    link = '/post/' + createResult.posts.id;
                }

                // notify to all userfollow if Post is Needed
                if (createResult.posts !== undefined && createResult.posts.type === POST_TYPE.NEEDS) {
                    const pageObj = (pageData !== undefined && pageData.length > 0) ? pageData[0] : undefined;
                    let notificationText = 'มีคนกำลังต้องการความช่วยเหลือจากคุณ';

                    if (pageObj) {
                        notificationText = '"' + pageObj.name + '"' + needNotiTxt;
                    }

                    await this.pageNotificationService.notifyToUserFollow(pageId, NOTIFICATION_TYPE.NEEDS, notificationText, link);
                }

                // share to social
                {
                    if (createResult.posts !== undefined && createResult.posts !== null &&
                        createResult.posts.id !== undefined && createResult.posts.id !== null) {
                        if (isPostTwitter) {
                            const isValid = await this.pageSocialAccountService.pagePostToTwitter(createResult.posts.id, pageId);
                            createResult.twitterValid = isValid;
                        }

                        if (isPostFacebook) {
                            const isValid = await this.pageSocialAccountService.pagePostToFacebook(createResult.posts.id, pageId);
                            createResult.facebookValid = isValid;
                        }
                    }
                }

                return res.status(200).send(ResponseUtil.getSuccessResponse('Create PagePost Success', createResult));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Create PagePost Failed', undefined));
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Page Not found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page/:pageId/post/:postId/tag Add PagePost HashTag API
     * @apiGroup PagePost
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * [
     *      {
     *          name: ''
     *      },
     *      {
     *          name: ''
     *      }
     * ]
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Create PagePost HashTag",
     *      "data": {}
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post/:postId/tag
     * @apiErrorExample {json} Cannot Create PagePost HashTag
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:pageId/post/:postId/tag')
    @Authorized('user')
    public async addPagePostHashtag(@Body({ validate: true }) pagePostHashTags: any[], @Param('pageId') pageId: string, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const pagePostObjId = new ObjectID(postId);
        const ownerUsers = req.user.id;
        const tagNames = [];
        const postsTags = [];

        pagePostHashTags.forEach((tagName) => {
            if (tagName.startsWith('#')) {
                tagName = tagName.substring(1, tagName.length);
            }

            tagNames.push(tagName);
        });

        const pagePostData = await this.postsService.findOne({ $and: [{ _id: pagePostObjId }, { referencePost: pageObjId }, { ownerUser: ownerUsers }, { postsHashTags: { $in: tagNames } }] });

        pagePostHashTags.filter((result) => {
            if (result.startsWith('#')) {
                result = result.substring(1, result.length);
            }

            postsTags.push(result);
        });

        const updateQuery = { _id: pagePostObjId, referencePost: pageObjId };
        const newValue = { $set: { postsHashTags: postsTags } };
        let addHashTag: any;
        let addPostTagResult: any;

        if (pagePostData) {
            addHashTag = await this.postsService.update(updateQuery, newValue);

            if (addHashTag) {
                addPostTagResult = await this.postsService.findOne({ $and: [{ _id: pagePostObjId }, { referencePost: pageObjId }, { ownerUser: ownerUsers }, { postsHashTags: { $in: postsTags } }] });

                if (addPostTagResult) {
                    const successResponse = ResponseUtil.getSuccessResponse('Add PagePost HashTag Successfully', addPostTagResult);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Error Add PagePost HashTag', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            addHashTag = await this.postsService.update(updateQuery, newValue);

            if (addHashTag) {
                addPostTagResult = await this.postsService.findOne({ $and: [{ _id: pagePostObjId }, { referencePost: pageObjId }, { ownerUser: ownerUsers }, { postsHashTags: { $in: postsTags } }] });

                if (addPostTagResult) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Add PagePost HashTag', addPostTagResult);
                    return res.status(200).send(successResponse);
                }
            }
        }
    }

    // Search PagePost
    /**
     * @api {post} /api/page/:id/post/search Search PagePost API
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
     *    "message": "Successfully get PagePost search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page/:id/post/search
     * @apiErrorExample {json} Search PagePost error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:pageId/post/search')
    public async searchPagePost(@QueryParam('isHideStory') isHideStory: boolean, @Param('pageId') pId: string, @Body({ validate: true }) search: SearchPostRequest, @Res() res: any, @Req() req: any): Promise<any> {
        if (Object.keys(search).length > 0 && (pId !== '' && pId !== null && pId !== undefined)) {
            if (isHideStory === null || isHideStory === undefined) {
                isHideStory = true;
            }

            const postType = search.type;
            let pageObjId;
            let pageStmt;
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

            const page: Page = await this.pageService.findOne(pageStmt);

            if (page !== null && page !== undefined) {
                const postPageObjId = new ObjectID(page.id);
                const today = moment().toDate();
                const whereCondition = search.whereConditions;
                let limit = search.limit;
                let offset = search.offset;
                let postPageStmt;

                if (offset === null || offset === undefined) {
                    offset = 0;
                }

                if (limit === null || limit === undefined || limit <= 0) {
                    limit = MAX_SEARCH_ROWS;
                }

                const matchStmt: any = { pageId: postPageObjId, hidden: false, deleted: false, isDraft: false, startDateTime: { $lte: today } };
                if (postType !== null && postType !== undefined && postType !== '') {
                    matchStmt.type = postType;
                }
                // add some filter
                const ignoreKey = ['pageId', 'hidden', 'deleted', 'isDraft', 'startDateTime'];
                if (whereCondition !== undefined && typeof whereCondition === 'object') {
                    for (const key of Object.keys(whereCondition)) {
                        if (ignoreKey.indexOf(key) >= 0) {
                            continue;
                        }
                        if (key === '_id') {
                            matchStmt[key] = new ObjectID(whereCondition[key]);
                        } else {
                            matchStmt[key] = whereCondition[key];
                        }
                    }
                }

                postPageStmt = [
                    { $match: matchStmt },
                    { $sort: { startDateTime: -1 } },
                    { $skip: offset },
                    { $limit: limit },
                    { // filter only comment that not deleted
                        $lookup: {
                            from: 'PostsComment',
                            let: { 'id': '$_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$id', '$post'] }, 'deleted': false } },
                            ],
                            as: 'comment'
                        }
                    },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'gallery'
                        }
                    },
                    {
                        $lookup: {
                            from: 'Needs',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'needs'
                        }
                    },
                    {
                        $lookup: {
                            from: 'Fulfillment',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'fulfillment'
                        }
                    },
                    {
                        $lookup: {
                            from: 'Fulfillment',
                            localField: '_id',
                            foreignField: 'casePost',
                            as: 'caseFulfillment'
                        }
                    },
                    {
                        $lookup: {
                            from: 'FulfillmentCase',
                            localField: '_id',
                            foreignField: 'fulfillmentPost',
                            as: 'case'
                        }
                    },
                    {
                        $addFields: {
                            requesterId: {
                                '$arrayElemAt': ['$case.requester', 0]
                            },
                            fulfillmentPage: {
                                '$arrayElemAt': ['$case.pageId', 0]
                            },
                            casePostId: {
                                '$arrayElemAt': ['$case.postId', 0]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'Needs',
                            localField: 'casePostId',
                            foreignField: 'post',
                            as: 'caseNeeds'
                        }
                    },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'requesterId',
                            foreignField: '_id',
                            as: 'requester'
                        }
                    },
                    {
                        $unwind: {
                            path: '$requester',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'fulfillmentPage',
                            foreignField: '_id',
                            as: 'fulfillmentPage'
                        }
                    },
                    {
                        $unwind: {
                            path: '$fulfillmentPage',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'SocialPost',
                            localField: '_id',
                            foreignField: 'postId',
                            as: 'socialPosts'
                        }
                    },
                    {
                        $project: {
                            'case': 0,
                            'requesterId': 0,
                            'requester.password': 0,
                            'requester.birthdate': 0,
                            'requester.customGender': 0,
                            'requester.gender': 0,
                            'requester.createdDate': 0,
                            'requester.coverURL': 0,
                            'requester.address': 0,
                            'requester.facebookURL': 0,
                            'requester.instagramURL': 0,
                            'requester.lineId': 0,
                            'requester.mobileNo': 0,
                            'requester.websiteURL': 0,
                            'requester.twitterURL': 0,
                            'fulfillmentPage.subTitle': 0,
                            'fulfillmentPage.backgroundStory': 0,
                            'fulfillmentPage.detail': 0,
                            'fulfillmentPage.ownerUser': 0,
                            'fulfillmentPage.color': 0,
                            'fulfillmentPage.category': 0,
                            'fulfillmentPage.banned': 0,
                            'fulfillmentPage.createdDate': 0,
                            'fulfillmentPage.updateDate': 0,
                            'socialPosts': {
                                '_id': 0,
                                'pageId': 0,
                                'postId': 0,
                                'postBy': 0,
                                'postByType': 0
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'EmergencyEvent',
                            localField: 'emergencyEvent',
                            foreignField: '_id',
                            as: 'emergencyEvent'
                        }
                    },
                    {
                        $unwind: {
                            path: '$emergencyEvent',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            // 'emergencyEvent._id': 0,
                            'emergencyEvent.title': 0,
                            'emergencyEvent.detail': 0,
                            'emergencyEvent.hashTag': 0,
                            'emergencyEvent.coverPageURL': 0,
                            'emergencyEvent.createdDate': 0,
                            'emergencyEvent.isClose': 0,
                            'emergencyEvent.isPin': 0
                        }
                    },
                    {
                        $lookup: {
                            from: 'PageObjective',
                            localField: 'objective',
                            foreignField: '_id',
                            as: 'objective'
                        }
                    },
                    {
                        $unwind: {
                            path: '$objective',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            // 'objective._id': 0,
                            'objective.pageId': 0,
                            'objective.title': 0,
                            'objective.detail': 0,
                            'objective.iconURL': 0,
                            'objective.hashTag': 0,
                            'objective.createdDate': 0
                        }
                    },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'ownerUser',
                            foreignField: '_id',
                            as: 'ownerUser'
                        }
                    },
                    {
                        $unwind: {
                            path: '$ownerUser',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            'ownerUser.username': 0,
                            'ownerUser.password': 0,
                            'ownerUser.coverURL': 0,
                            'ownerUser.coverPosition': 0,
                            'ownerUser.isSubAdmin': 0,
                            'ownerUser.banned': 0,
                            'ownerUser.email': 0,
                            'ownerUser.firstName': 0,
                            'ownerUser.lastName': 0,
                            'ownerUser.birthdate': 0,
                            'ownerUser.isAdmin': 0,
                            'ownerUser.gender': 0,
                            'ownerUser.customGender': 0,
                            'ownerUser.createdDate': 0
                        }
                    },
                    {
                        $lookup: {
                            from: 'HashTag',
                            let: { postTags: { $ifNull: ['$postsHashTags', []] } },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', '$$postTags']
                                        }
                                    }
                                }
                            ],
                            as: 'postsHashTags'
                        }
                    },
                    {
                        $addFields: {
                            hashTags: {
                                $map: {
                                    input: '$postsHashTags',
                                    as: 'hashTags',
                                    in: { name: '$$hashTags.name' }
                                }
                            }
                        }
                    },
                    { $project: { postsHashTags: 0 } }
                ];

                const uId = req.headers.userid;
                const pagePostLists: any[] = await this.postsService.aggregate(postPageStmt);

                if (pagePostLists !== null && pagePostLists !== undefined && pagePostLists.length > 0) {
                    const result: any = {};
                    const postsMap: any = {};
                    const postList = [];
                    const referencePostList = [];

                    for (const posts of pagePostLists) {
                        const postId = posts._id;
                        postList.push(new ObjectID(postId));
                        referencePostList.push(postId);

                        if (posts.gallery !== undefined) {
                            for (const postGallery of posts.gallery) {
                                if (postGallery.s3ImageURL !== undefined && postGallery.s3ImageURL !== '') {
                                    const assetSignURL = await this.assetService.getAssetSignedUrl({ _id: postGallery.fileId });
                                    if (assetSignURL !== undefined) {
                                        postGallery.signURL = assetSignURL.signURL;
                                    }
                                }
                            }
                        }

                        if (posts.s3CoverImage !== undefined && posts.s3CoverImage !== '') {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(posts.s3CoverImage);
                            Object.assign(posts, { coverSignURL: (signUrl ? signUrl : '') });
                        }

                        if (posts.ownerUser !== undefined) {
                            if (posts.ownerUser.s3ImageURL !== undefined && posts.ownerUser.s3ImageURL !== '') {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(posts.ownerUser.s3ImageURL);
                                Object.assign(posts.ownerUser, { signURL: (signUrl ? signUrl : '') });
                            }
                        }
                    }

                    if (referencePostList !== null && referencePostList !== undefined && referencePostList.length > 0) {
                        const postsReference: Posts[] = await this.postsService.find({ referencePost: { $in: referencePostList }, hidden: false, deleted: false, isDraft: false });

                        if (postsReference !== null && postsReference !== undefined && postsReference.length > 0) {
                            for (const posts of postsReference) {
                                const pageId = posts.pageId;
                                const referencePost = posts.referencePost;
                                if (pageId !== null && pageId !== undefined && pageId !== '') {
                                    postsMap[pageId + ':' + referencePost + ':' + posts.postAsPage] = posts;
                                } else {
                                    postsMap[referencePost + ':' + posts.ownerUser] = posts;
                                }
                            }
                        }
                    }

                    let userObjId;
                    const userLikeMap: any = {};
                    const likeAsPageMap: any = {};
                    const postsCommentMap: any = {};

                    if (uId !== null && uId !== undefined && uId !== '') {
                        userObjId = new ObjectID(uId);

                        if (postList !== null && postList !== undefined && postList.length > 0) {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: userObjId, subjectId: { $in: postList }, subjectType: LIKE_TYPE.POST });
                            if (userLikes !== null && userLikes !== undefined && userLikes.length > 0) {
                                for (const like of userLikes) {
                                    const postId = like.subjectId;
                                    const likeAsPage = like.likeAsPage;

                                    if (postId !== null && postId !== undefined && postId !== '') {
                                        if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                                            likeAsPageMap[postId] = like;
                                        } else {
                                            userLikeMap[postId] = like;
                                        }
                                    }
                                }
                            }

                            const postComments: PostsComment[] = await this.postsCommentService.find({ user: userObjId, post: { $in: postList }, deleted: false });
                            if (postComments !== null && postComments !== undefined && postComments.length > 0) {
                                for (const comment of postComments) {
                                    const postId = comment.post;
                                    postsCommentMap[postId] = comment;
                                }
                            }
                        }
                    }

                    pagePostLists.map(async (data) => {
                        const postId = data._id;
                        const postAsPage = data.postAsPage;
                        const story = data.story;
                        let dataKey;

                        if (isHideStory === true) {
                            if (story !== null && story !== undefined) {
                                data.story = {};
                            } else {
                                data.story = null;
                            }
                        }

                        if (postId !== null && postId !== undefined && postId !== '') {
                            if (postAsPage !== null && postAsPage !== undefined && postAsPage !== '') {
                                dataKey = postAsPage + ':' + postId + ':' + uId;
                            } else {
                                dataKey = postId + ':' + uId;
                            }

                            if (dataKey !== null && dataKey !== undefined && dataKey !== '') {
                                if (postsMap[dataKey]) {
                                    data.isRepost = true;
                                } else {
                                    data.isRepost = false;
                                }
                            } else {
                                data.isRepost = false;
                            }

                            if (userLikeMap[postId]) {
                                data.isLike = true;
                            } else {
                                data.isLike = false;
                            }

                            if (likeAsPageMap[postId]) {
                                data.likeAsPage = true;
                            } else {
                                data.likeAsPage = false;
                            }

                            if (postsCommentMap[postId]) {
                                data.isComment = true;
                            } else {
                                data.isComment = false;
                            }
                        } else {
                            data.isRepost = false;
                            data.isLike = false;
                            data.likeAsPage = false;
                            data.isComment = false;
                        }
                    });

                    result.posts = pagePostLists;

                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Page Post', result);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('Page Post Not Found', []);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Page Not Found', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Page Post', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update PagePost API
    /**
     * @api {put} /api/page/:pageId/post/:postId Update PagePost API
     * @apiGroup PagePost
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "title": "",
     *      "detail": "",
     *      "hidden": "",
     *      "type": "",
     *      "referenceMode": ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated PagePost.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post/:postId
     * @apiErrorExample {json} Update PagePost error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:pageId/post/:postId')
    @Authorized('user')
    public async updatePostPage(@Body({ validate: true }) postPages: PagePostRequest, @Param('pageId') pageId: string, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            console.log('ok');
            const pagePostsObjId = new ObjectID(postId);
            const ownerUser = new ObjectID(req.user.id);
            const clientId = req.headers['client-id'];
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const userIdList = [];
            const userTags = [];
            // const stdItemList = [];
            let pageData: Page;
            let pageObjId;
            let title = postPages.title;
            let detail = postPages.detail;
            let type = postPages.type;
            let isDraft = postPages.isDraft;
            let story = postPages.story;
            let coverImage = postPages.coverImage;
            const postGallery = postPages.postGallery;
            const postNeeds = postPages.needs;
            const postHashTag = postPages.postsHashTags;
            const postUserTag = postPages.userTags;
            const postStory = postPages.story;
            const emergencyEvent = postPages.emergencyEvent; // as id string
            const objective = postPages.objective; // as id string
            const today = moment().toDate();
            let startDateTime = postPages.startDateTime;

            // page mode
            let isPageMode = false;
            if (pageId !== undefined && pageId !== '' && pageId !== 'null' && pageId !== null && pageId !== 'undefined') {
                pageObjId = new ObjectID(pageId);
                pageData = await this.pageService.findOne({ _id: pageObjId });
                isPageMode = true;

                if (pageData === undefined) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page was not found.', undefined));
                }

                // Check PageAccess
                const accessLevels = [PAGE_ACCESS_LEVEL.OWNER, PAGE_ACCESS_LEVEL.ADMIN, PAGE_ACCESS_LEVEL.MODERATOR, PAGE_ACCESS_LEVEL.POST_MODERATOR];
                const canAccess: boolean = await this.pageAccessLevelService.isUserHasAccessPage(req.user.id + '', pageId, accessLevels);
                if (!canAccess) {
                    return res.status(401).send(ResponseUtil.getErrorResponse('You cannot edit post of this page.', undefined));
                }
            }

            const post: Posts = await this.postsService.findOne({ $and: [{ _id: pagePostsObjId }, { deleted: false }] });

            if (post === undefined || post === null) {
                return res.status(400).send(ResponseUtil.getErrorResponse('Post was not found', undefined));
            }

            if (!isPageMode) {
                // Check if Post user is own the post
                if (post.ownerUser + '' !== ownerUser + '') {
                    return res.status(401).send(ResponseUtil.getErrorResponse('You cannot edit post of timeline.', undefined));
                }
            }

            if (postUserTag !== null && postUserTag !== undefined) {
                for (const userTagId of postUserTag) {
                    userIdList.push(new ObjectID(userTagId));
                }
            }

            const userIdExists: User[] = await this.userService.find({ _id: { $in: userIdList } });

            if (userIdExists !== null && userIdExists !== undefined && userIdExists.length > 0) {
                for (const user of userIdExists) {
                    userTags.push(new ObjectID(user.id));
                }
            }

            let assetResultUpload: Asset;

            if (postGallery !== undefined && postGallery !== null && postGallery.length > 0) {

                let isCreateAssetGallery = false;
                let postIdGallery;
                const deleteGalleryList = [];
                const UpdateGalleryList = [];
                const createGalleyList = [];

                for (const image of postGallery) {
                    postIdGallery = new ObjectID(image.postId);
                    deleteGalleryList.push(new ObjectID(image.fileId));
                    UpdateGalleryList.push(image);
                }

                // find post have not in image  
                await this.postGalleryService.deleteMany({
                    // where: {
                    $and: [
                        {
                            post: postIdGallery
                        }, {
                            fileId: {
                                $nin: deleteGalleryList
                            }
                        }
                    ]
                    // }
                });

                for (const data of UpdateGalleryList) {
                    // find gallery update ordering
                    const gallery: PostsGallery[] = await this.postGalleryService.find({ where: { _id: new ObjectID(data.id) } });
                    if (gallery.length > 0) {
                        const updateImageQuery = { _id: new ObjectID(data.id) };
                        const newImageValue = {
                            $set: {
                                ordering: data.asset.ordering,
                            }
                        };
                        await this.postGalleryService.update(updateImageQuery, newImageValue);
                    } else {
                        createGalleyList.push(data);
                        isCreateAssetGallery = true;
                    }
                }
                if (isCreateAssetGallery) {
                    for (const image of createGalleyList) {
                        const newFileName = ownerUser + FileUtil.renameFile();
                        const assetData = image.asset.data;
                        const assetMimeType = image.asset.mimeType;
                        const assetFileName = newFileName;
                        const assetSize = image.asset.size;

                        const galleryImageAsset = new Asset();
                        galleryImageAsset.userId = ownerUser;
                        galleryImageAsset.data = assetData;
                        galleryImageAsset.mimeType = assetMimeType;
                        galleryImageAsset.fileName = assetFileName;
                        galleryImageAsset.size = assetSize;
                        galleryImageAsset.expirationDate = null;
                        galleryImageAsset.scope = ASSET_SCOPE.PUBLIC;
                        assetResultUpload = await this.assetService.create(galleryImageAsset);

                        const gallery = new PostsGallery();
                        gallery.fileId = new ObjectID(image.id);
                        gallery.post = post.id;
                        gallery.imageURL = assetResultUpload ? ASSET_PATH + assetResultUpload.id : '';
                        gallery.s3ImageURL = assetResultUpload.s3FilePath;
                        gallery.ordering = image.asset.ordering;
                        await this.postGalleryService.create(gallery);
                    }
                }

            }

            let assetResult: Asset;

            if (postStory !== null && postStory !== undefined && postStory !== '') {
                if (coverImage !== null && coverImage !== undefined) {
                    // check post
                    let isCreateAsset = true;
                    if (post.coverImage !== undefined && post.coverImage !== '') {
                        // search and update
                        const oldCoverImg = await this.assetService.findOne({ _id: post.coverImage, expirationDate: null });
                        if (oldCoverImg !== undefined) {
                            const assetData = coverImage.data;
                            const assetMimeType = coverImage.mimeType;
                            const assetSize = coverImage.size;

                            const updateImageQuery = { _id: oldCoverImg.id };
                            const newImageValue = {
                                $set: {
                                    data: assetData,
                                    mimeType: assetMimeType,
                                    size: assetSize,
                                    expirationDate: null,
                                    scope: ASSET_SCOPE.PUBLIC
                                }
                            };

                            await this.assetService.update(updateImageQuery, newImageValue);
                            assetResult = await this.assetService.find(updateImageQuery);
                            isCreateAsset = false;
                        }
                    }

                    if (isCreateAsset) {
                        const newFileName = ownerUser + FileUtil.renameFile();
                        const assetData = coverImage.data;
                        const assetMimeType = coverImage.mimeType;
                        const assetFileName = newFileName;
                        const assetSize = coverImage.size;

                        const coverImageAsset = new Asset();
                        coverImageAsset.userId = ownerUser;
                        coverImageAsset.data = assetData;
                        coverImageAsset.mimeType = assetMimeType;
                        coverImageAsset.fileName = assetFileName;
                        coverImageAsset.size = assetSize;
                        coverImageAsset.expirationDate = null;
                        coverImageAsset.scope = ASSET_SCOPE.PUBLIC;
                        assetResult = await this.assetService.create(coverImageAsset);
                    }
                }
            }

            const allHashTagsString = [];
            if (post.postsHashTags !== undefined) {
                for (const tagObjId of post.postsHashTags) {
                    allHashTagsString.push(tagObjId + '');
                }
            }

            let postsHashTags: any[] = post.postsHashTags;
            const postMasterHashTagList: any[] = [];
            // if postHashTag is undefined or null postHashTags will use an old value
            if (postHashTag !== null && postHashTag !== undefined && postHashTag.length > 0) {
                const masterHashTagList: HashTag[] = await this.findMasterHashTag(postHashTag);

                for (const hashTag of masterHashTagList) {
                    const id = hashTag.id + '';
                    if (allHashTagsString.indexOf(id) < 0) {
                        allHashTagsString.push(id);
                    }
                    postMasterHashTagList.push(new ObjectID(id));
                }

                postsHashTags = postMasterHashTagList;
            }

            const allHashTags = [];
            for (const hashTagString of allHashTagsString) {
                allHashTags.push(new ObjectID(hashTagString));
            }

            if (title === null || title === undefined) {
                title = post.title;
            }

            if (detail === null || detail === undefined) {
                detail = post.detail;
            }

            if (type === null || type === undefined) {
                type = post.type;
            }

            if (startDateTime === null || startDateTime === undefined) {
                startDateTime = post.startDateTime;
            }

            if (story === null || story === undefined) {
                story = post.story;
            }

            if (coverImage === null || coverImage === undefined) {
                coverImage = post.coverImage;
            }
            coverImage = assetResult ? ASSET_PATH + assetResult.id : '';
            const s3CoverImage = assetResult ? assetResult.s3FilePath : '';

            if (isDraft === null || isDraft === undefined) {
                isDraft = post.isDraft;
            }

            if (!isDraft) {
                startDateTime = post.startDateTime;

                if (startDateTime === undefined || startDateTime === null) {
                    startDateTime = today;
                }
            } else {
                startDateTime = undefined;
            }

            // overide value zone //
            // objective
            let objectiveID: ObjectID;
            let objectiveTag: string;
            if (objective !== undefined && objective !== null && objective !== '') {
                // change objective
                objectiveID = new ObjectID(objective);
                const obj = await this.objectiveService.findOne({ _id: objectiveID });
                if (!obj) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Objective was not found.', undefined));
                }

                let objHashTag = undefined;
                try {
                    objHashTag = await this.hashTagService.findOne({ _id: obj.hashTag });
                } catch (error) {
                    console.log('find objective hashTag error: ', error);
                }

                objectiveTag = objHashTag === undefined ? '' : objHashTag.name;
            }

            // emergencyEvent
            let emergencyEventID: ObjectID;
            let emergencyEventTag: string;
            if (emergencyEvent !== undefined && emergencyEvent !== null && emergencyEvent !== '') {
                // change emergencyEvent
                emergencyEventID = new ObjectID(emergencyEvent);
                const emerEvent = await this.emergencyService.findOne({ _id: emergencyEventID });
                if (!emerEvent) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Emergency Event was not found.', undefined));
                }

                let emerHashTag = undefined;
                try {
                    emerHashTag = await this.hashTagService.findOne({ _id: emerEvent.hashTag });
                } catch (error) {
                    console.log('find emergency hashTag error: ', error);
                }

                emergencyEventTag = emerHashTag === undefined ? '' : emerHashTag.name;
            }

            // need
            const toCreateNeedArry = [];
            const toEditNeedArry = [];
            const toDeleteNeedArry = [];

            // search old need
            const needSearchFilter = new SearchFilter();
            needSearchFilter.whereConditions = {
                pageId: pageObjId,
                post: post.id
            };

            const oldNeeds = await this.needsService.search(needSearchFilter);

            if (postNeeds !== undefined) {
                const oldNeedsStandardItemMap = {}; // standardId as a key
                const oldNeedsCustomItemMap = {}; // customItemId as a key
                const oldNeedsItemMap = {}; // needId as a key
                const oldNeedStandardItemName = [];
                const oldNeedCustomItemName = [];
                const newNeedEditIds = [];

                for (const oldNeed of oldNeeds) {
                    const oldNeedId = oldNeed.id + '';
                    oldNeedsItemMap[oldNeedId] = oldNeed;

                    if (oldNeed.standardItemId !== undefined) {
                        const key = oldNeed.standardItemId + '';
                        oldNeedsStandardItemMap[key] = oldNeed;
                        oldNeedStandardItemName.push(oldNeed.name);
                    } else if (oldNeed.customItemId !== undefined) {
                        const key = oldNeed.customItemId + '';
                        oldNeedsCustomItemMap[key] = oldNeed;
                        oldNeedCustomItemName.push(oldNeed.name);
                    }
                }

                for (const need of postNeeds) {
                    let needId = undefined;
                    if (need._id !== null && need._id !== undefined && need._id !== '') {
                        needId = need._id;
                    }

                    if (need.id !== null && need.id !== undefined && need.id !== '') {
                        needId = need.id;
                    }
                    const standardId = need.standardItemId;
                    const customName = need.itemName;
                    const customUnit = need.unit;
                    const quantity = (need.quantity === undefined ? 1 : need.quantity);

                    if (needId !== undefined && needId !== null && needId !== '') {
                        // edit case
                        // edit only quitity

                        if (oldNeedsItemMap[needId] === undefined) {
                            return res.status(400).send(ResponseUtil.getErrorResponse('Need id "' + needId + '" was not found.', undefined));
                        }

                        const toEdit = oldNeedsItemMap[needId];
                        toEdit.quantity = quantity;

                        toEditNeedArry.push(toEdit);
                        newNeedEditIds.push(needId);
                    } else {
                        // create case
                        if (standardId !== undefined && standardId !== '' && standardId !== null) {
                            // create with standard
                            if (oldNeedsStandardItemMap[standardId] !== undefined) {
                                return res.status(400).send(ResponseUtil.getErrorResponse('Stardard id "' + standardId + '" was Exist.', undefined));
                            }

                            // search Standard Item
                            const item = await this.standardItemService.findOne({ _id: new ObjectID(standardId) });
                            if (!item) {
                                return res.status(400).send(ResponseUtil.getErrorResponse('StandardItem id "' + standardId + '" was not found.', undefined));
                            }

                            const createNeed = new Needs();
                            createNeed.quantity = quantity;
                            createNeed.standardItemId = item.id;
                            createNeed.name = item.name;
                            createNeed.unit = item.unit;
                            createNeed.pageId = pageObjId;
                            createNeed.active = true;
                            createNeed.fullfilled = false;
                            createNeed.post = post.id;
                            createNeed.description = need.description;
                            createNeed.fulfillQuantity = 0;
                            createNeed.pendingQuantity = 0;

                            toCreateNeedArry.push(createNeed);
                        } else {
                            // create with customItem name
                            if (oldNeedCustomItemName.indexOf(customName) >= 0) {
                                return res.status(400).send(ResponseUtil.getErrorResponse('Item name "' + customName + '" was Exist.', undefined));
                            }

                            if (customName === undefined || customName === '') {
                                return res.status(400).send(ResponseUtil.getErrorResponse('Custom Item Name is required.', undefined));
                            }

                            if (customUnit === undefined || customUnit === '') {
                                return res.status(400).send(ResponseUtil.getErrorResponse('Custom Item Unit is required.', undefined));
                            }

                            // create customItem
                            let customItem = new CustomItem();
                            customItem.name = customName;
                            customItem.unit = customUnit;
                            customItem.userId = ownerUser;
                            customItem.standardItemId = null;
                            customItem = await this.customItemService.create(customItem);

                            const createNeed = new Needs();
                            createNeed.quantity = quantity;
                            createNeed.customItemId = customItem.id;
                            createNeed.name = customItem.name;
                            createNeed.unit = customItem.unit;
                            createNeed.pageId = pageObjId;
                            createNeed.active = true;
                            createNeed.fullfilled = false;
                            createNeed.post = post.id;
                            createNeed.description = need.description;
                            createNeed.fulfillQuantity = 0;
                            createNeed.pendingQuantity = 0;

                            toCreateNeedArry.push(createNeed);
                        }
                    }
                }

                // delete case
                for (const oldNeed of oldNeeds) {
                    const oldNeedId = oldNeed.id + '';
                    if (newNeedEditIds.indexOf(oldNeedId) <= -1) {
                        toDeleteNeedArry.push(oldNeedId);
                    }
                }
            } else {
                // clear all need
                for (const oldNeed of oldNeeds) {
                    const oldNeedId = oldNeed.id + '';
                    toDeleteNeedArry.push(oldNeedId);
                }
            }

            // end overide value zone //
            const updateQuery = { _id: pagePostsObjId };
            const newValue = {
                $set: {
                    title, detail, type, startDateTime, story, isDraft, coverImage,
                    objective: objectiveID, objectiveTag, userTags, postsHashTags,
                    emergencyEvent: emergencyEventID, emergencyEventTag, s3CoverImage
                }
            };
            const postPageSave = await this.postsService.update(updateQuery, newValue);

            // update needs
            for (const toDeleteID of toDeleteNeedArry) {
                await this.needsService.delete({ _id: new ObjectID(toDeleteID) });
            }

            for (const toEdit of toEditNeedArry) {
                await this.needsService.update({ _id: new ObjectID(toEdit.id) }, {
                    $set: {
                        quantity: toEdit.quantity
                    }
                });
            }

            for (const toCreate of toCreateNeedArry) {
                await this.needsService.create(toCreate);
            }

            if (postPageSave) {
                const stmt = { contentId: pagePostsObjId, contentType: ENGAGEMENT_CONTENT_TYPE.POST, userObjId: ownerUser, action: ENGAGEMENT_ACTION.EDIT };
                const engagements: UserEngagement = await this.userEngagementService.findOne({ where: stmt });

                const engagement = new UserEngagement();
                engagement.clientId = clientId;
                engagement.contentId = pagePostsObjId;
                engagement.contentType = ENGAGEMENT_CONTENT_TYPE.POST;
                engagement.ip = ipAddress;
                engagement.userId = ownerUser;
                engagement.action = ENGAGEMENT_ACTION.EDIT;

                if (engagements) {
                    engagement.isFirst = false;
                } else {
                    engagement.isFirst = true;
                }

                await this.userEngagementService.create(engagement);

                const pageUpdated: Posts = await this.postsService.findOne({ _id: pagePostsObjId });
                // update post hastag
                try {
                    // beware slow becase count all post
                    if (allHashTags.length > 0) {
                        await this.postsService.recalculateHashTagCount(allHashTags);
                    }
                } catch (error) {
                    console.log(error);
                }

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update PagePost Successful', pageUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PagePost', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/page/:pageId/post/:postId Delete PagePost API
     * @apiGroup PagePost
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete PagePost.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post/:postId
     * @apiErrorExample {json} Delete PagePost Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:pageId/post/:postId')
    @Authorized('user')
    public async deletePagePost(@Param('pageId') pageId: string, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        if (postId === null && postId === undefined && postId === '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('PostId Is Not Null', undefined));
        }

        let postStmt = {};
        let pageObjId;
        const ownerUsers = new ObjectID(req.user.id);
        const pagePostsObjId = new ObjectID(postId);

        if (pageId === 'null' || pageId === null || pageId === 'undefined' || pageId === undefined) {
            postStmt = { $and: [{ pageId: { $eq: null } }, { _id: pagePostsObjId }, { ownerUser: ownerUsers }] };
        } else {
            pageObjId = new ObjectID(pageId);
            postStmt = { $and: [{ pageId: pageObjId }, { _id: pagePostsObjId }, { ownerUser: ownerUsers }] };
        }

        const posts: Posts = await this.postsService.findOne(postStmt);
        const postsQuery = { post: pagePostsObjId };

        if (posts !== null && posts !== undefined) {
            // store deleted hashtag
            const allHashTags = [];
            if (posts.postsHashTags !== undefined) {
                for (const tagObjId of posts.postsHashTags) {
                    allHashTags.push(tagObjId);
                }
            }

            const referencePost = new ObjectID(posts.referencePost);

            const undoRepost: Posts = await this.postsService.update({ referencePost: pagePostsObjId }, { $set: { deleted: true, referencePost: undefined } });

            if (undoRepost !== null && undoRepost !== undefined) {
                const originPost: Posts = await this.postsService.findOne({ _id: referencePost });

                if (originPost !== null && originPost !== undefined) {
                    const repostCount = originPost.repostCount;
                    await this.postsService.update({ _id: referencePost }, { $set: { repostCount: repostCount - 1 } });
                }
            }

            const postGallery: PostsGallery[] = await this.postGalleryService.find(postsQuery);
            if (postGallery !== null && postGallery !== undefined && postGallery.length > 0) {
                await this.postGalleryService.deleteMany(postsQuery);
            }

            const postsComment: PostsComment[] = await this.postsCommentService.find({ where: { post: pagePostsObjId, user: ownerUsers } });
            if (postsComment !== null && postsComment !== undefined && postsComment.length > 0) {
                await this.postsCommentService.deleteMany(postsQuery);
            }

            const fulfillment: Fulfillment[] = await this.fulfillmentService.find(postsQuery);
            if (fulfillment !== null && fulfillment !== undefined && fulfillment.length > 0) {
                await this.fulfillmentService.deleteMany(postsQuery);
            }

            const needs: Needs[] = await this.needsService.find(postsQuery);
            if (needs !== null && needs !== undefined && needs.length > 0) {
                await this.needsService.deleteMany(postsQuery);
            }

            const deleteQuery = { _id: pagePostsObjId, ownerUser: ownerUsers };
            const newValue = { $set: { deleted: true } };
            const deletePagePost = await this.postsService.update(deleteQuery, newValue);

            if (deletePagePost) {
                // update post hastag
                if (allHashTags.length > 0) {
                    try {
                        // beware slow becase count all post
                        await this.postsService.recalculateHashTagCount(allHashTags);
                    } catch (error) {
                        console.log(error);
                    }
                }

                const successResponse = ResponseUtil.getSuccessResponse('Successfully delete PagePost', pagePostsObjId);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to delete PagePost', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Find Post', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {delete} /api/page/:pageId/post/:postId/tag Delete PagePost HashTag API
     * @apiGroup PagePost
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * [
     *      {
     *          name: ''
     *      },
     *      {
     *          name: ''
     *      }
     * ]
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Delete PagePost HashTag",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post/:postId/tag
     * @apiErrorExample {json} Unable Delete PagePost Hashtag
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:pageId/post/:postId/tag')
    @Authorized('user')
    public async deletePagePostHashTag(@Body({ validate: true }) pagePostHashTags: any[], @Param('pageId') pageId: string, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageObjId = new ObjectID(pageId);
        const pagePostsObjId = new ObjectID(postId);
        const ownerUsers = req.user.id;
        const tagNames = [];

        pagePostHashTags.forEach((tagName) => {
            if (tagName.startsWith('#')) {
                tagName = tagName.substring(1, tagName.length);
            }

            tagNames.push(tagName);
        });

        const pagePostsHashTagData: Posts = await this.postsService.findOne({ $and: [{ _id: pagePostsObjId }, { referencePost: pageObjId }, { ownerUser: ownerUsers }, { postsHashTags: { $in: tagNames } }] });

        if (pagePostsHashTagData) {
            if (pagePostsHashTagData.postsHashTags !== undefined || pagePostsHashTagData.postsHashTags !== null) {
                if (Array.isArray(pagePostsHashTagData.postsHashTags)) {
                    const tagNamesResult = pagePostsHashTagData.postsHashTags.filter((result) => {
                        let isTagContain = true;
                        for (const tag of tagNames) {
                            if (tag === result) {
                                isTagContain = false;
                                break;
                            }
                        }

                        return isTagContain;
                    });

                    const updateQuery = { _id: pagePostsObjId, referencePost: pageObjId, ownerUser: ownerUsers };
                    const newValue = { $set: { postsHashTags: tagNamesResult } };

                    const deleteHashTag = await this.postsService.update(updateQuery, newValue);

                    if (deleteHashTag) {
                        const deletePostTagResult: Posts = await this.postsService.findOne({ $and: [{ _id: pagePostsObjId }, { referencePost: pageObjId }, { ownerUser: ownerUsers }, { postsHashTags: { $in: tagNamesResult } }] });

                        if (deletePostTagResult) {
                            const successResponse = ResponseUtil.getSuccessResponse('Successfully Delete PagePost HashTag', deletePostTagResult);
                            return res.status(200).send(successResponse);
                        }
                    } else {
                        const errorResponse = ResponseUtil.getErrorResponse('Cannot Delete PagePost HashTag', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Find PagePost HashTag', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    public async findMasterHashTag(hashTagNameList: string[]): Promise<HashTag[]> {
        return await this.hashTagService.find({ name: { $in: hashTagNameList } });
    }
}
