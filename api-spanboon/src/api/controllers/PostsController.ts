/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Post, Body, Authorized, Param, Req, QueryParam, Delete, Put } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PostsService } from '../services/PostsService';
import { SearchFilter } from './requests/SearchFilterRequest';
import { UserLikeService } from '../services/UserLikeService';
import { UserLike } from '../models/UserLike';
import { LIKE_TYPE } from '../../constants/LikeType';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { ObjectID } from 'mongodb';
import { UserEngagement } from '../models/UserEngagement';
import { UserEngagementService } from '../services/UserEngagementService';
import { Posts } from '../models/Posts';
import { RePostRequest } from './requests/RePostsRequest';
import moment from 'moment';
import { PostsComment } from '../models/PostsComment';
import { PostsCommentService } from '../services/PostsCommentService';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { Needs } from '../models/Needs';
import { NeedsService } from '../services/NeedsService';
import { HashTagService } from '../services/HashTagService';
import { PostNeedsRequest } from './requests/PostNeedsRequest';
import { PageAccessLevel } from '../models/PageAccessLevel';
import { CustomItem } from '../models/CustomItem';
import { CustomItemService } from '../services/CustomItemService';
import { PageService } from '../services/PageService';
import { LikeRequest } from './requests/LikeRequest';
import { NotificationService } from '../services/NotificationService';
import { PageNotificationService } from '../services/PageNotificationService';
import { USER_TYPE, NOTIFICATION_TYPE } from '../../constants/NotificationType';
import { StorySectionProcessor } from '../processors/StorySectionProcessor';
import { EmergencyEventSectionProcessor } from '../processors/EmergencyEventSectionProcessor';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { S3Service } from '../services/S3Service';
import { Page } from '../models/Page';
import { ASSET_CONFIG_NAME, DEFAULT_ASSET_CONFIG_VALUE } from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';
import { AssetService } from '../services/AssetService';
import { PostUtil } from '../../utils/PostUtil';

@JsonController('/post')
export class PostsController {
    constructor(
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        private customItemService: CustomItemService,
        private needsService: NeedsService,
        private userEngagementService: UserEngagementService,
        private userLikeService: UserLikeService,
        private pageService: PageService,
        private pageAccessLevelService: PageAccessLevelService,
        private notificationService: NotificationService,
        private pageNotificationService: PageNotificationService,
        private hashTagService: HashTagService,
        private emergencyEventService: EmergencyEventService,
        private s3Service: S3Service,
        private configService: ConfigService,
        private assetService: AssetService
    ) { }

    // New Post API
    /**
     * @api {get} /api/post/new New PostPage API
     * @apiGroup Post
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get New Post",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/new
     * @apiErrorExample {json} Get New Post Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/new')
    public async getNewPost(@Res() res: any): Promise<any> {
        const search = new SearchFilter();
        search.orderBy = { createdDate: -1 };

        const newPosts = await this.postsService.search(search);

        if (newPosts) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got New Post', newPosts);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got New Post', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Get Count Max Post API
    /**
     * @api {get} /api/post/count/max Get Count Max Post API
     * @apiGroup Post
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Get Count Success",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/count/max
     * @apiErrorExample {json} Get Count Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/count/max')
    public async getCountMax(@Res() res: any): Promise<any> {
        const searchStmt = [
            {
                $group: {
                    _id: null,
                    commentCount: { $max: '$commentCount' },
                    repostCount: { $max: '$repostCount' },
                    shareCount: { $max: '$shareCount' },
                    likeCount: { $max: '$likeCount' },
                    viewCount: { $max: '$viewCount' }
                }
            },
            {
                $project: { _id: 0 }
            }
        ];

        const maxCount = await this.postsService.aggregate(searchStmt);

        if (maxCount) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Get Count Success', maxCount[0]));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Get Count Failed', undefined));
        }
    }

    @Get('/:id/count')
    @Authorized('user')
    public async getAsPagePost(@Param('id') postId: string, @QueryParam('aspage') pageId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const postObjId = new ObjectID(postId);

        const postObj = await this.postsService.findOne({ where: { _id: postObjId } });
        if (postObj) {
            let asUserId = req.user.id;
            let countAsPage = false;
            // check user authen page
            if (pageId !== undefined && pageId !== null && pageId !== '') {
                // check if page exist
                try {
                    const page = await this.pageService.findOne(new ObjectID(pageId));
                    if (page === undefined) {
                        const errorResponse = ResponseUtil.getErrorResponse('Page not found', undefined);
                        return res.status(400).send(errorResponse);
                    }
                } catch (err) {
                    const errorResponse = ResponseUtil.getErrorResponse('Invalid page id.', undefined);
                    return res.status(400).send(errorResponse);
                }

                const pageAccess = await this.pageAccessLevelService.getUserAccessByPage(req.user.id, pageId);

                if (pageAccess) {
                    let isCanSee = false;
                    for (const access of pageAccess) {
                        if (access.level === PAGE_ACCESS_LEVEL.OWNER ||
                            access.level === PAGE_ACCESS_LEVEL.ADMIN ||
                            access.level === PAGE_ACCESS_LEVEL.MODERATOR) {
                            isCanSee = true;
                            break;
                        }
                    }

                    if (!isCanSee) {
                        const errorResponse = ResponseUtil.getErrorResponse('User can not access page.', undefined);
                        return res.status(400).send(errorResponse);
                    } else {
                        asUserId = pageId;
                        countAsPage = true;
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('User can not access page.', undefined);
                    return res.status(400).send(errorResponse);
                }
            }

            const countObj = await this.postsService.getUserPostAction(postId, asUserId, true, true, true, true, true, countAsPage);
            countObj.postId = postId;

            const successResponse = ResponseUtil.getSuccessResponse('Get User Post Action Success', countObj);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Post was not found.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search Post
    /**
     * @api {post} /api/post/search Search Post API
     * @apiGroup Post
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search Post",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/post/search
     * @apiErrorExample {json} Search Post error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchPost(@QueryParam('isHideStory') isHideStory: boolean, @QueryParam('isNeeds') isNeeds: boolean, @Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        const today = moment().toDate();

        if (filter.whereConditions !== undefined) {
            if (typeof filter.whereConditions === 'object') {
                const postId = filter.whereConditions._id;

                if (postId !== null && postId !== undefined && postId !== '') {
                    const postObjId = new ObjectID(postId);
                    filter.whereConditions._id = postObjId;
                }
            }
        } else {
            filter.whereConditions = {};
        }
        // overide to whereCondition to search only not delete post
        filter.whereConditions.hidden = false;
        filter.whereConditions.deleted = false;
        filter.whereConditions.isDraft = false;
        filter.whereConditions.startDateTime = { $lte: today };

        const postLists: any = await this.postsService.search(filter);
        const userLikeMap: any = {};
        const likeAsPageMap: any = {};
        const postsCommentMap: any = {};
        let result = [];

        if (postLists !== null && postLists !== undefined) {
            const postIdList = [];
            const referencePostList = [];
            const postsMap: any = {};

            for (const post of postLists) {
                const referencePost = post.referencePost;
                postIdList.push(new ObjectID(post.id));

                if (referencePost !== '' && referencePost !== null && referencePost !== undefined) {
                    referencePostList.push(new ObjectID(referencePost));
                }
            }

            if (postIdList !== null && postIdList !== undefined && postIdList.length > 0) {
                result = await this.postsService.aggregate([
                    { $match: { _id: { $in: postIdList }, hidden: false, deleted: false, isDraft: false, startDateTime: { $lte: today } } },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
                        }
                    },
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
                                '$arrayElemAt': ['$case.requester', 0],
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
                            'emergencyEvent._id': 0,
                            'emergencyEvent.title': 0,
                            'emergencyEvent.detail': 0,
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
                            'objective._id': 0,
                            'objective.pageId': 0,
                            'objective.title': 0,
                            'objective.detail': 0,
                            'objective.iconURL': 0,
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
                            let: { hashTagId: '$postsHashTags' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', '$$hashTagId']
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
                ]);

                let userObjId;
                const uId = req.headers.userid;

                if (uId !== null && uId !== undefined && uId !== '') {
                    userObjId = new ObjectID(uId);

                    const userLikes: UserLike[] = await this.userLikeService.find({ userId: userObjId, subjectId: { $in: postIdList }, subjectType: LIKE_TYPE.POST });
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

                    const postComments: PostsComment[] = await this.postsCommentService.find({ user: userObjId, post: { $in: postIdList } });
                    if (postComments !== null && postComments !== undefined && postComments.length > 0) {
                        for (const comment of postComments) {
                            const postId = comment.post;
                            postsCommentMap[postId] = comment;
                        }
                    }
                }
            } else {
                result = postLists;
            }

            // s3 sign as config
            const isUploadToS3 = await this._isUploadToS3();

            if (result !== null && result !== undefined) {
                result.map(async(data) => {
                    const postId = data._id;
                    const story = data.story;
                    const ownerUser = data.ownerUser;
                    const postAsPage = data.postAsPage;
                    let dataKey;

                    if (isHideStory === true) {
                        if (story !== null && story !== undefined) {
                            data.story = {};
                        } else {
                            data.story = null;
                        }
                    } else {
                        if (story !== null && story !== undefined && data.story.story !== null && data.story.story !== undefined) {
                            const parseFileLinkStory = await PostUtil.parseImagePostStory(data.story.story, this.assetService, isUploadToS3);
                            data.story.story = parseFileLinkStory;
                        }
                    }

                    if (postId !== null && postId !== undefined && postId !== '') {
                        if (postAsPage !== null && postAsPage !== undefined && postAsPage !== '') {
                            dataKey = postAsPage + ':' + postId + ':' + ownerUser;
                        } else {
                            dataKey = postId + ':' + ownerUser;
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

                return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Search Posts', result));
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Posts Not Found', []));
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Posts', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/post/:postId/repost Share PagePost API
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
     *      "message": "Successfully Shared PagePost",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/repost
     * @apiErrorExample {json} Unable Shared PagePost
     * HTTP/1.1 500 Internal Server Error
     */

    @Post('/:postId/repost')
    @Authorized('user')
    public async rePost(@Body({ validate: true }) rePost: RePostRequest, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageId = rePost.pageId;
        const postAsPage = rePost.postAsPage;
        const detail = rePost.detail;
        const hashTag = rePost.hashTag;
        const postObjId = new ObjectID(postId);
        const userObjId = new ObjectID(req.user.id);
        const postsData: Posts = await this.postsService.findOne({ where: { _id: postObjId } });

        if (postsData) {
            const today = moment().toDate();
            const originalHashTag = postsData.postsHashTags;

            if (hashTag !== null && hashTag !== undefined && hashTag.length > 0) {
                for (const tag of hashTag) {
                    if (!originalHashTag.includes(tag)) {
                        originalHashTag.push(new ObjectID(tag));
                    }
                }
            }

            delete postsData.id;
            const newPostsData: Posts = new Posts();
            newPostsData.title = '';
            newPostsData.type = postsData.type;
            newPostsData.pageId = (pageId !== null && pageId !== undefined && pageId !== '') ? new ObjectID(pageId) : null;
            newPostsData.detail = (detail !== null && detail !== undefined && detail !== '') ? detail : '';
            newPostsData.postsHashTags = (originalHashTag !== null && originalHashTag !== originalHashTag && originalHashTag.length > 0) ? originalHashTag : [];
            newPostsData.coverImage = null;
            newPostsData.deleted = false;
            newPostsData.hidden = false;
            newPostsData.isDraft = false;
            newPostsData.pinned = false;
            newPostsData.ownerUser = userObjId;
            newPostsData.createdDate = today;
            newPostsData.startDateTime = today;
            newPostsData.likeCount = 0;
            newPostsData.viewCount = 0;
            newPostsData.commentCount = 0;
            newPostsData.repostCount = 0;
            newPostsData.shareCount = 0;
            newPostsData.visibility = null;
            newPostsData.ranges = null;
            newPostsData.postAsPage = (postAsPage !== null && postAsPage !== undefined && postAsPage !== '') ? new ObjectID(postAsPage) : null;

            const referencePost = postsData.referencePost;
            const rootReferencePost = postsData.rootReferencePost;

            if ((referencePost !== null && referencePost !== undefined && referencePost !== '') && (rootReferencePost !== null && rootReferencePost !== undefined && rootReferencePost !== '')) {
                newPostsData.rootReferencePost = new ObjectID(rootReferencePost);
                newPostsData.referencePost = postObjId;
            } else {
                newPostsData.referencePost = postObjId;
                newPostsData.rootReferencePost = postObjId;
            }

            const rePostCreate: Posts = await this.postsService.create(newPostsData);

            if (rePostCreate) {
                const repostCount = postsData.repostCount + 1;
                await this.postsService.update({ _id: postObjId }, { $set: { repostCount } });
                const successResponse = ResponseUtil.getSuccessResponse('RePost Success', rePostCreate);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('RePost Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Posts Not found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/post/:postId/repost/undo Undo Repost API
     * @apiGroup PagePost
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Unde Repost Success",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/repost/undo
     * @apiErrorExample {json} Undo Repost Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:postId/repost/undo')
    @Authorized('user')
    public async undoRePost(@Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const postObjId = new ObjectID(postId);

            const postsData: Posts = await this.postsService.findOne({ where: { referencePost: postObjId, $or: [{ detail: null }, { detail: undefined }, { detail: '' }] } });

            if (postsData !== null && postsData !== undefined) {
                const referencePost = new ObjectID(postsData.referencePost);

                const undoRepost: Posts = await this.postsService.update({ referencePost: postObjId }, { $set: { deleted: true, referencePost: undefined } });

                if (undoRepost !== null && undoRepost !== undefined) {
                    const originPost: Posts = await this.postsService.findOne({ _id: referencePost });

                    if (originPost !== null && originPost !== undefined) {
                        const repostCount = originPost.repostCount;
                        await this.postsService.update({ _id: referencePost }, { $set: { repostCount: repostCount - 1 } });
                    }

                    return res.status(200).send(ResponseUtil.getSuccessResponse('Undo Repost Success', undefined));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Undo Repost Failed', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Repost', undefined));
            }
        } catch (err) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Error', err.message));
        }
    }

    // Like Post
    /**
     * @api {post} /api/post/:id/like Like PagePost API
     * @apiGroup Post
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Like PagePost Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/post/:id/like
     * @apiErrorExample {json} Like PagePost error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/like')
    @Authorized('user')
    public async likePagePost(@Param('id') postId: string, @Body({ validate: true }) like: LikeRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const postObjId = new ObjectID(postId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const likeAsPage = like.likeAsPage;
        let likeAsPageObjId;
        let likeStmt;

        if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
            likeAsPageObjId = new ObjectID(likeAsPage);
            likeStmt = { where: { userId: userObjId, subjectId: postObjId, subjectType: LIKE_TYPE.POST, likeAsPage: likeAsPageObjId } };
        } else {
            likeStmt = { where: { userId: userObjId, subjectId: postObjId, subjectType: LIKE_TYPE.POST } };
        }

        // search post
        const postObj: Posts = await this.postsService.findOne({ where: { _id: postObjId, deleted: false } });
        if (!postObj) {
            const errorResponse = ResponseUtil.getErrorResponse('Post not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        const postLike: UserLike = await this.userLikeService.findOne(likeStmt);
        const contentType = ENGAGEMENT_CONTENT_TYPE.POST;

        let userEngagementAction: UserEngagement;
        let userLiked: UserLike[];
        let result = {};
        let userLikeStmt;
        let action;
        let likeCount;

        if (postLike) {
            let deleteLikeStmt;

            if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                deleteLikeStmt = { userId: userObjId, subjectId: postObjId, subjectType: LIKE_TYPE.POST, likeAsPage: likeAsPageObjId };
            } else {
                deleteLikeStmt = { userId: userObjId, subjectId: postObjId, subjectType: LIKE_TYPE.POST };
            }

            const unLike = await this.userLikeService.delete(deleteLikeStmt);
            if (unLike) {
                action = ENGAGEMENT_ACTION.UNLIKE;

                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = postObjId;
                userEngagement.contentType = contentType;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = action;

                let engagement: UserEngagement;

                if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                    userEngagement.likeAsPage = likeAsPageObjId;

                    engagement = await this.userEngagementService.getEngagement(postObjId, userObjId, action, contentType, likeAsPageObjId);

                    userLikeStmt = { where: { subjectId: postObjId, subjectType: LIKE_TYPE.POST, likeAsPage: likeAsPageObjId } };
                } else {
                    userEngagement.likeAsPage = null;

                    engagement = await this.userEngagementService.getEngagement(postObjId, userObjId, action, contentType);

                    userLikeStmt = { where: { subjectId: postObjId, subjectType: LIKE_TYPE.POST } };
                }

                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);
                userLiked = await this.userLikeService.find(userLikeStmt);
                likeCount = userLiked.length;

                result['isLike'] = false;
                result['likeCount'] = likeCount;

                if (userEngagementAction) {
                    await this.postsService.update({ _id: postObjId }, { $set: { likeCount } });
                    const unLikedPost = await this.postsService.findOne({ where: { _id: postObjId } });
                    result['posts'] = unLikedPost;
                    const successResponse = ResponseUtil.getSuccessResponse('UnLike Post Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('UnLike Post Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userLike = new UserLike();
            userLike.userId = userObjId;
            userLike.subjectId = postObjId;
            userLike.subjectType = LIKE_TYPE.POST;

            if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                userLike.likeAsPage = likeAsPageObjId;
            } else {
                userLike.likeAsPage = null;
            }

            const likeCreate: UserLike = await this.userLikeService.create(userLike);
            if (likeCreate) {
                result = likeCreate;
                action = ENGAGEMENT_ACTION.LIKE;

                // noti to owner post
                {
                    let notificationText = req.user.displayName;
                    const link = '/post/' + userLike.subjectId;

                    console.log('postObj >>>> ', postObj);

                    if (postObj.pageId !== undefined && postObj.pageId !== null) {
                        // create noti for page
                        const page: Page = await this.pageService.findOne({ _id: new ObjectID(postObj.pageId) });

                        notificationText += ' กดถูกใจโพสต์ของเพจ ' + page.name;
                        await this.pageNotificationService.notifyToPageUser(postObj.pageId, undefined, req.user.id + '', USER_TYPE.USER, NOTIFICATION_TYPE.LIKE, notificationText, link);
                    } else {
                        // create noti for user
                        notificationText += ' กดถูกใจโพสต์ของคุณ';
                        await this.notificationService.createNotification(postObj.ownerUser + '', USER_TYPE.USER, req.user.id + '', USER_TYPE.USER, NOTIFICATION_TYPE.LIKE, notificationText, link);
                    }
                }

                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = postObjId;
                userEngagement.contentType = contentType;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = action;

                let engagement: UserEngagement;

                if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                    userEngagement.likeAsPage = likeAsPageObjId;

                    engagement = await this.userEngagementService.getEngagement(postObjId, userObjId, action, contentType, likeAsPageObjId);

                    userLikeStmt = { where: { subjectId: postObjId, subjectType: LIKE_TYPE.POST, likeAsPage: likeAsPageObjId } };
                } else {
                    userEngagement.likeAsPage = null;

                    engagement = await this.userEngagementService.getEngagement(postObjId, userObjId, action, contentType);

                    userLikeStmt = { where: { subjectId: postObjId, subjectType: LIKE_TYPE.POST } };
                }

                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);
                userLiked = await this.userLikeService.find(userLikeStmt);
                likeCount = userLiked.length;

                result['isLike'] = true;
                result['likeCount'] = likeCount;

                if (userEngagementAction) {
                    await this.postsService.update({ _id: postObjId }, { $set: { likeCount } });
                    const likedPost = await this.postsService.findOne({ where: { _id: postObjId } });
                    result['posts'] = likedPost;
                    const successResponse = ResponseUtil.getSuccessResponse('Like Post Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Like Post Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    /**
     * @api {post} /api/post/:postId/needs Add PagePost Needs API
     * @apiGroup PagePost
     * @apiParam (Request body) {String[]} needs needs
     * @apiParamExample {json} Input
     * {
     *      "needs": [""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Add PagePost Needs",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/needs
     * @apiErrorExample {json} Unable PagePost Needs
     * HTTP/1.1 500 Internal Server Error
     */

    @Post('/:postId/needs')
    @Authorized('user')
    public async addPostNeeds(@Body({ validate: true }) needsPost: PostNeedsRequest, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.user.id;
        const userObjId = new ObjectID(userId);
        const postObjId = new ObjectID(postId);
        const newNeeds = needsPost.needs;

        const posts: Posts = await this.postsService.findOne({ _id: postObjId });

        if (posts === null && posts === undefined) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Post Not Found', undefined));
        }

        const pageId = posts.pageId;
        const pageObjId = new ObjectID(pageId);

        const checkPageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, pageId);

        if (checkPageAccess === null || checkPageAccess === undefined || checkPageAccess.length <= 0) {
            return res.status(400).send(ResponseUtil.getErrorResponse('You Not Have Permission', undefined));
        } else {
            for (const pageAccess of checkPageAccess) {
                if (pageAccess.level !== PAGE_ACCESS_LEVEL.OWNER && pageAccess.level !== PAGE_ACCESS_LEVEL.ADMIN) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Not Have Permission', undefined));
                }
            }
        }

        const originalNeeds: Needs[] = await this.needsService.find({ pageId: pageObjId, post: postObjId });
        const stdItemNeedsMap = {};
        const customItemNeedsMap = {};

        if (originalNeeds !== null && originalNeeds !== undefined && originalNeeds.length > 0) {
            for (const item of originalNeeds) {
                const stdItemId = item.standardItemId;
                const customItemId = item.customItemId;
                const name = item.name;

                if ((stdItemId !== null || stdItemId !== undefined || stdItemId !== '') && (customItemId === null || customItemId === undefined || customItemId === '')) {
                    stdItemNeedsMap[stdItemId] = item;
                } else if ((stdItemId === null || stdItemId === undefined || stdItemId === '') && (name !== null || name !== undefined || name !== '')) {
                    customItemNeedsMap[name] = item;
                }
            }
        }

        let needsCreate: Needs;

        if (newNeeds !== null && newNeeds !== undefined && newNeeds.length > 0) {
            for (const item of newNeeds) {
                const stdItemId = item.standardItemId;
                const name = item.name;
                const quantity = item.quantity;
                const unit = item.unit;
                let needs: Needs;

                if (stdItemId !== null && stdItemId !== undefined && stdItemId !== '') {
                    if (stdItemNeedsMap[stdItemId] !== undefined) {
                        continue;
                    } else {
                        needs = new Needs();
                        needs.standardItemId = new ObjectID(stdItemId);
                        needs.customItemId = null;
                        needs.pageId = pageObjId;
                        needs.name = name;
                        needs.active = true;
                        needs.fullfilled = false;
                        needs.quantity = quantity;
                        needs.unit = unit;
                        needs.post = postObjId;
                        needs.description = null;
                        needs.fulfillQuantity = 0;
                        needs.pendingQuantity = 0;

                        needsCreate = await this.needsService.create(needs);
                    }
                }

                if (name !== null && name !== undefined && name !== '') {
                    if (customItemNeedsMap[name] !== undefined) {
                        continue;
                    } else {
                        const customItem = new CustomItem();
                        customItem.name = name;
                        customItem.unit = unit;
                        customItem.userId = userObjId;
                        customItem.standardItemId = null;
                        const customCreate = await this.customItemService.create(customItem);

                        needs = new Needs();
                        needs.standardItemId = null;
                        needs.customItemId = new ObjectID(customCreate.id);
                        needs.pageId = pageObjId;
                        needs.name = name;
                        needs.active = true;
                        needs.fullfilled = false;
                        needs.quantity = quantity;
                        needs.unit = unit;
                        needs.post = postObjId;
                        needs.description = null;
                        needs.fulfillQuantity = 0;
                        needs.pendingQuantity = 0;

                        needsCreate = await this.needsService.create(needs);
                    }
                }
            }
        }

        if (needsCreate !== null && needsCreate !== undefined) {
            originalNeeds.push(needsCreate);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Add Needs To Post Success', originalNeeds));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Needs To Post', undefined));
        }
    }

    /**
     * @api {delete} /api/post/:postId/needs Remove PagePost Needs API
     * @apiGroup PagePost
     * @apiParam (Request body) {String[]} needs needs
     * @apiParamExample {json} Input
     * {
     *      "needs": [""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Remove PagePost Needs Successful",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/needs
     * @apiErrorExample {json} Cannot Remove PagePost Needs
     * HTTP/1.1 500 Internal Server Error
     */

    @Delete('/:postId/needs')
    @Authorized('user')
    public async removePostNeeds(@Body({ validate: true }) needsPost: PostNeedsRequest, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.user.id;
        const postObjId = new ObjectID(postId);
        const currentNeeds = needsPost.needs;

        const posts: Posts = await this.postsService.findOne({ _id: postObjId });

        if (posts === null && posts === undefined) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Post Not Found', undefined));
        }

        const pageId = posts.pageId;
        const pageObjId = new ObjectID(pageId);

        const checkPageAccess: PageAccessLevel[] = await this.pageAccessLevelService.getUserAccessByPage(userId, pageId);

        if (checkPageAccess === null || checkPageAccess === undefined || checkPageAccess.length <= 0) {
            return res.status(400).send(ResponseUtil.getErrorResponse('You Not Have Permission', undefined));
        } else {
            for (const pageAccess of checkPageAccess) {
                if (pageAccess.level !== PAGE_ACCESS_LEVEL.OWNER && pageAccess.level !== PAGE_ACCESS_LEVEL.ADMIN) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You Not Have Permission', undefined));
                }
            }
        }

        const needsIdList = [];

        if (currentNeeds !== null && currentNeeds !== undefined && currentNeeds.length > 0) {
            for (const item of currentNeeds) {
                needsIdList.push(new ObjectID(item));
            }

            console.log('needsIdList >>> ', needsIdList);

            const needsQuery = { _id: { $in: needsIdList }, pageId: pageObjId, post: postObjId };

            const needs: Needs[] = await this.needsService.find(needsQuery);

            if (needs !== null && needs !== undefined && needs.length > 0) {
                const removeNeeds = await this.needsService.deleteMany(needsQuery);

                if (removeNeeds) {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Remove Post Needs Success', needs));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Remove Post Needs Failed', undefined));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Needs Not Found', undefined));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Remove Post Needs', undefined));
        }
    }

    /**
     * @api {get} /api/post/:postId/needs Get PagePost Needs API
     * @apiGroup PagePost
     * @apiParam (Request body) {String[]} needs needs
     * @apiParamExample {json} Input
     * {
     *      "needs": [""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Remove PagePost Needs Successful",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/needs
     * @apiErrorExample {json} Cannot Remove PagePost Needs
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/:postId/needs')
    @Authorized('user')
    public async getPostNeeds(@Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const postObjId = new ObjectID(postId);

        const posts: Posts = await this.postsService.findOne({ _id: postObjId });

        if (posts === null && posts === undefined) {
            return res.status(200).send(ResponseUtil.getErrorResponse('Post Not Found', []));
        }

        const pageId = posts.pageId;
        const pageObjId = new ObjectID(pageId);
        const needsQuery = { pageId: pageObjId, post: postObjId };
        const aggregateStmt: any = [
            {
                $match: needsQuery
            },
            {
                $lookup: {
                    from: 'StandardItem',
                    localField: 'standardItemId',
                    foreignField: '_id',
                    as: 'standardItem'
                }
            },
            {
                $unwind: {
                    path: '$standardItem',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'CustomItem',
                    localField: 'customItemId',
                    foreignField: '_id',
                    as: 'customItem'
                }
            },
            {
                $unwind: {
                    path: '$customItem',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $addFields: { id: '$_id' } },
            { $project: { _id: 0 } },
        ];

        const needs: Needs[] = await this.needsService.aggregate(aggregateStmt);

        if (needs) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Get Post Needs Success', needs));
        } else {
            return res.status(200).send(ResponseUtil.getErrorResponse('Get Post Needs Success', []));
        }
    }

    /**
     * @api {get} /api/post/:postId/recommended_story Get PagePost Needs API
     * @apiGroup PagePost
     * @apiParamExample {json} Input
     * {
     *      "needs": [""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Get PagePost Recommended Story Successful",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/recommended_story
     * @apiErrorExample {json} Cannot get PagePost Recommended Story
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/:postId/recommended_story')
    public async getPostRecommendedStory(@Param('postId') postId: string, @QueryParam('offset') offset: number, @QueryParam('limit') limit: number, @Res() res: any): Promise<any> {
        const postObjId = new ObjectID(postId);

        const posts: Posts = await this.postsService.findOne({ _id: postObjId });

        if (posts === null && posts === undefined) {
            return res.status(200).send(ResponseUtil.getErrorResponse('Post Not Found', []));
        }

        let result: any = undefined;
        const data: any = {
            postId
        };
        const config: any = {
            offset,
            limit
        };
        const processor: StorySectionProcessor = new StorySectionProcessor(this.postsService, this.hashTagService, this.s3Service);
        processor.setData(data);
        processor.setConfig(config);
        result = await processor.process();

        if (result) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Get Post Recommended Story Success', result));
        } else {
            return res.status(200).send(ResponseUtil.getErrorResponse('Get Post Recommended Story Success', {}));
        }
    }

    /**
     * @api {get} /api/post/:postId/recommended_hashtag Get PagePost Needs API
     * @apiGroup PagePost
     * @apiParamExample {json} Input
     * {
     *      "needs": [""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Get PagePost Recommended Story Successful",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/recommended_hashtag
     * @apiErrorExample {json} Cannot get PagePost Recommended Story
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/:postId/recommended_hashtag')
    public async getPostRecommendedHashTags(@Param('postId') postId: string, @QueryParam('offset') offset: number, @QueryParam('limit') limit: number, @Res() res: any): Promise<any> {
        const postObjId = new ObjectID(postId);

        const posts: Posts = await this.postsService.findOne({ _id: postObjId });

        if (posts === null && posts === undefined) {
            return res.status(200).send(ResponseUtil.getErrorResponse('Post Not Found', []));
        }

        let result: any = undefined;
        const data: any = {
            postId
        };
        const config: any = {
            offset,
            limit
        };
        const emerProcessor: EmergencyEventSectionProcessor = new EmergencyEventSectionProcessor(this.emergencyEventService, this.postsService, this.s3Service);
        emerProcessor.setData(data);
        emerProcessor.setConfig(config);
        result = await emerProcessor.process();

        if (result) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Get Post HashTag Recommended Story Success', result));
        } else {
            return res.status(200).send(ResponseUtil.getErrorResponse('Get Post HashTag Recommended Story Success', {}));
        }
    }

    private async _isUploadToS3(): Promise<boolean> {
        // s3 upload by cofig
        const assetUploadToS3Cfg = await this.configService.getConfig(ASSET_CONFIG_NAME.S3_STORAGE_UPLOAD);
        let assetUploadToS3 = DEFAULT_ASSET_CONFIG_VALUE.S3_STORAGE_UPLOAD;

        if (assetUploadToS3Cfg && assetUploadToS3Cfg.value) {
            if (typeof assetUploadToS3Cfg.value === 'boolean') {
                assetUploadToS3 = assetUploadToS3Cfg.value;
            } else if (typeof assetUploadToS3Cfg.value === 'string') {
                assetUploadToS3 = (assetUploadToS3Cfg.value.toUpperCase() === 'TRUE');
            }
        }

        return assetUploadToS3;
    }
}
