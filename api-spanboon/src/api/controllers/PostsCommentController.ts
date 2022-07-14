/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PostsCommentService } from '../services/PostsCommentService';
import { PostsComment } from '../models/PostsComment';
import { ObjectID } from 'mongodb';
import { PostsCommentRequest } from './requests/PostsCommentRequest';
import { UserEngagementService } from '../services/UserEngagementService';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_ACTION, ENGAGEMENT_CONTENT_TYPE } from '../../constants/UserEngagementAction';
import { PostsService } from '../services/PostsService';
import { Posts } from '../models/Posts';
import { FileUtil } from '../../utils/Utils';
import { ASSET_PATH, ASSET_SCOPE } from '../../constants/AssetScope';
import { Asset } from '../models/Asset';
import { AssetService } from '../services/AssetService';
import { LIKE_TYPE } from '../../constants/LikeType';
import { UserLike } from '../models/UserLike';
import { UserLikeService } from '../services/UserLikeService';
import { SearchFilter } from './requests/SearchFilterRequest';
import { MAX_SEARCH_ROWS } from '../../constants/Constants';
import { LikeRequest } from './requests/LikeRequest';
import { PostCommentStatusRequest } from './requests/PostCommentStatusRequest';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { S3Service } from '../services/S3Service';
import { NotificationService } from '../services/NotificationService';
import { USER_TYPE,NOTIFICATION_TYPE } from '../../constants/NotificationType';
import { PageNotificationService } from '../services/PageNotificationService';
import { DeviceTokenService } from '../services/DeviceToken';
import { PageService } from '../services/PageService';
import { UserService } from '../services/UserService';
@JsonController('/post')
export class PostsCommentController {
    constructor(
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        private assetService: AssetService,
        private userLikeService: UserLikeService,
        private userEngagementService: UserEngagementService,
        private pageAccessLevelService: PageAccessLevelService,
        private s3Service: S3Service,
        private notificationService: NotificationService,
        private pageNotificationService: PageNotificationService,
        private deviceTokenService:DeviceTokenService,
        private pageService:PageService,
        private userService:UserService
    ) { }

    // PostsComment List API
    /**
     * @api {get} /api/post/:postId/comment PostsComment List API
     * @apiGroup PostsComment
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PostsComment",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/comment
     * @apiErrorExample {json} PostsComment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:postId/comment')
    @Authorized('user')
    public async findPostsComment(@Param('postId') postId: string, @QueryParam('offset') offset: number, @QueryParam('limit') limit: number, @Res() res: any, @Req() req: any): Promise<any> {
        const postPageObjId = new ObjectID(postId);
        if (limit === undefined) {
            limit = MAX_SEARCH_ROWS;
        }
        if (offset === undefined || offset < 0) {
            offset = 0;
        }
 
        const postsComment: PostsComment[] = await this.postsCommentService.find({ where: { $and: [{ post: postPageObjId, deleted: false }] }, take: limit, offset });

        if (postsComment) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PostsComment', postsComment);

            return res.status(200).send(successResponse);
            
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PostsComment', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/post/:postId/comment/tag Add PostsComment HashTag API
     * @apiGroup PostsComment
     * @apiParam (Request body) {String} comment Comment
     * @apiParamExample {json} Input
     * {
     *      "comment" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create PostsComment",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/comment/tag
     * @apiErrorExample {json} Unable create PostsComment
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:postId/comment')
    @Authorized('user')
    public async createPostsComment(@Body({ validate: true }) pcm: PostsCommentRequest, @Param('postId') postId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.user.id;
        const postObjId = new ObjectID(postId);
        const userObjId = new ObjectID(userId);
        const commentAsPage = pcm.commentAsPage;
        const assets = pcm.asset;
        let assetCreate: Asset;

        const posts: Posts = await this.postsService.findOne({ where: { _id: postObjId } });

        if (posts !== null && posts !== undefined) {
            if (assets !== null && assets !== undefined) {
                const newFileName = userId + FileUtil.renameFile() + postId;
                const asset = new Asset();
                asset.userId = userObjId;
                asset.fileName = newFileName;
                asset.scope = ASSET_SCOPE.PUBLIC;
                asset.data = assets.data;
                asset.size = assets.size;
                asset.mimeType = assets.mimeType;
                asset.expirationDate = null;

                assetCreate = await this.assetService.create(asset);
            }

            const postsComment = new PostsComment();
            postsComment.comment = pcm.comment;
            postsComment.mediaURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
            postsComment.post = postObjId;
            postsComment.user = userObjId;
            postsComment.likeCount = 0;
            postsComment.deleted = false;
            postsComment.commentAsPage = (commentAsPage !== null && commentAsPage !== undefined && commentAsPage !== '') ? new ObjectID(commentAsPage) : null;

            const comment: PostsComment = await this.postsCommentService.create(postsComment);
            
            if (comment) 
            {
                const commentCount = posts.commentCount + 1;
                await this.postsService.update({ _id: postObjId }, { $set: { commentCount } });
                const successResponse = ResponseUtil.getSuccessResponse('Create PostsComment Successful', comment);
                const post_who = await this.postsService.findOne({_id:comment.post});
                const pageName = await this.pageService.findOne({_id:ObjectID(commentAsPage)});
                if(comment.commentAsPage !== null)
                {
                    const getPost = await this.postsService.findOne({_id:comment.post});
                    const link = '/post/' + getPost.id;
                    const notification_comment = 'เพจ' + pageName.pageUsername + 'ได้แสดงความคิดเห็นต่อโพสต์ของคุณ';
                    // page to user
                    const tokenFCM_id = await this.deviceTokenService.findOne({userId:getPost.ownerUser});
                    await this.pageNotificationService.notifyToPageUserFcm(
                        postsComment.commentAsPage,
                        undefined,
                        req.user.id + '',
                        USER_TYPE.USER,
                        NOTIFICATION_TYPE.COMMENT,
                        notification_comment,
                        link,
                        tokenFCM_id.Tokens,
                        pageName.name,
                        pageName.imageURL
                        );
                }
                // user to user 
                else
                {
                    // WHO POST USER OR PAGE ?
                    const getPost = await this.postsService.findOne({_id:comment.post});
                    const userName = await this.userService.findOne({_id:postsComment.user});
                    if(post_who.pageId === null)
                    {
                        // USER TO USER
                        const tokenFCM_id = await this.deviceTokenService.findOne({userId:getPost.ownerUser});
                        if(tokenFCM_id !== null || tokenFCM_id !== undefined)
                        {
                            const link = '/post/' + getPost.id;
                            const notification_comment = `${userName.displayName} ได้แสดงความคิดเห็นต่อโพสต์ของคุณ`;
                            await this.notificationService.createNotificationFCM(
                                getPost.ownerUser,
                                USER_TYPE.USER,
                                req.user.id + '',
                                USER_TYPE.USER,
                                NOTIFICATION_TYPE.COMMENT,
                                notification_comment,
                                link,
                                tokenFCM_id.Tokens,
                                userName.displayName,
                                userName.imageURL
                                );
                        }
                        else
                        {
                            const link = '/post/' + getPost.id;
                            const notification_comment = `${userName.displayName} ได้แสดงความคิดเห็นต่อโพสต์ของคุณ`;
                            await this.notificationService.createNotification(
                                getPost.ownerUser,
                                USER_TYPE.USER,
                                req.user.id + '',
                                USER_TYPE.USER,
                                NOTIFICATION_TYPE.COMMENT,
                                notification_comment,
                                link,
                                );
                        }
                    }
                    else
                    {
                        // USER TO PAGE
                        const tokenFCM_id = await this.deviceTokenService.findOne({userId:getPost.ownerUser});
                        const page_post = await this.postsService.findOne({_id:post_who.id});
                        const page = await this.pageService.findOne({_id:page_post.pageId});
                        if(tokenFCM_id !== null || tokenFCM_id !== undefined){
                            const link = '/post/' + getPost.id;
                            const notification_comment = `${userName.displayName} ได้แสดงความคิดเห็นต่อโพสต์ของเพจ ${page.pageUsername}`;
                            await this.notificationService.createNotificationFCM(
                                getPost.ownerUser,
                                USER_TYPE.USER,
                                req.user.id + '',
                                USER_TYPE.PAGE,
                                NOTIFICATION_TYPE.COMMENT,
                                notification_comment,
                                link,
                                tokenFCM_id.Tokens,
                                userName.displayName,
                                userName.imageURL
                                );
                        }
                        else
                        {
                            const link = '/post/' + getPost.id;
                            const notification_comment = `${userName.displayName} ได้แสดงความคิดเห็นต่อโพสต์ของเพจ ${page.pageUsername}`;
                            await this.notificationService.createNotification(
                                getPost.ownerUser,
                                USER_TYPE.USER,
                                req.user.id + '',
                                USER_TYPE.PAGE,
                                NOTIFICATION_TYPE.COMMENT,
                                notification_comment,
                                link,
                                );
                        }
                    }

                }
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Error Create PostsComment', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Posts Not Found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search PostComment
    /**
     * @api {post} /api/post/:id/comment/search Search PostComment API
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
     * @apiSampleRequest /api/post/:id/comment/search
     * @apiErrorExample {json} Search Post Comment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/comment/search')
    public async searchPostComment(@Body({ validate: true }) search: SearchFilter, @Param('id') postsId: string, @Res() res: any, @Req() req: any): Promise<any> {
        if (Object.keys(search).length > 0 && (postsId !== '' && postsId !== null && postsId !== undefined)) {
            const postsObjId = new ObjectID(postsId);
            const postsStmt = { _id: postsObjId };
            const posts: Posts = await this.postsService.findOne(postsStmt);

            if (posts !== null && posts !== undefined) {
                const postPageObjId = new ObjectID(posts.id);
                let limit = search.limit;
                let offset = search.offset;

                if (limit === null || limit === undefined || limit <= 0) {
                    limit = MAX_SEARCH_ROWS;
                }

                if (offset === null || offset === undefined) {
                    offset = 0;
                }

                const postCommentStmt = [
                    { $match: { post: postPageObjId, deleted: false } },
                    { $skip: offset },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: false
                        }
                    },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'commentAsPage',
                            foreignField: '_id',
                            as: 'page'
                        }
                    },
                    {
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $project: { _id: 0, id: '$_id', comment: 1, mediaURL: 1, post: 1, commentAsPage: 1, likeCount: 1, createdDate: 1, 'page._id': 1, 'page.name': 1, 'page.pageUsername': 1, 'page.imageURL': 1, 'page.s3ImageURL': 1, 'page.isOfficial': 1, 'user.id': '$user._id', 'user.imageURL': 1, 'user.displayName': 1 } }
                ];
                const postCommentLists: any[] = await this.postsCommentService.aggregate(postCommentStmt);

                if (postCommentLists !== null && postCommentLists !== undefined && postCommentLists.length > 0) {
                    const commentIdList = [];

                    const pageSignURLMap: any = {};
                    for (const comment of postCommentLists) {
                        const commentId = comment.id;
                        commentIdList.push(new ObjectID(commentId));

                        if (comment.page !== undefined && comment.page.s3ImageURL !== undefined && comment.page.s3ImageURL !== '') {
                            const pageId = comment.page._id;
                            if (pageSignURLMap[pageId] === undefined) {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(comment.page.s3ImageURL);
                                pageSignURLMap[pageId] = signUrl;
                            }
                        }
                    }

                    let userObjId;
                    const uId = req.headers.userid;
                    const userLikeMap: any = {};
                    const likeAsPageMap: any = {};

                    if (uId !== null && uId !== undefined && uId !== '') {
                        userObjId = new ObjectID(uId);

                        const userLike: UserLike[] = await this.userLikeService.find({ userId: userObjId, subjectId: { $in: commentIdList }, subjectType: LIKE_TYPE.POST_COMMENT });
                        if (userLike !== null && userLike !== undefined && userLike.length > 0) {
                            for (const like of userLike) {
                                const subjectId = like.subjectId;
                                const likeAsPage = like.likeAsPage;

                                if (subjectId !== null && subjectId !== undefined && subjectId !== '') {
                                    userLikeMap[subjectId] = like;

                                    if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                                        likeAsPageMap[subjectId] = like;
                                    }
                                }
                            }
                        }
                    }

                    postCommentLists.map((result) => {
                        const commentId = result.id;

                        if (userLikeMap[commentId]) {
                            result.isLike = true;
                        } else {
                            result.isLike = false;
                        }

                        if (likeAsPageMap[commentId]) {
                            result.likeAsPage = true;
                        } else {
                            result.likeAsPage = false;
                        }

                        if (result.page !== undefined) {
                            const pageId = result.page._id;
                            if (pageSignURLMap[pageId]) {
                                result.page.signURL = pageSignURLMap[pageId];
                            }

                            // remove s3ImageURL
                            delete result.page.s3ImageURL;
                        }
                    });

                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Posts Comment', postCommentLists);
                    return res.status(200).send(successResponse);
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('Posts Comment Not Found', []);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Posts Not Found', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Posts Comment', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/post/:postId/comment/status Get PostsComment Status API
     * @apiGroup PostsComment
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Get PostsComment Status.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/comment/status
     * @apiErrorExample {json} Get PostsComment Status Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:postId/comment/status')
    @Authorized('user')
    public async getPostCommentStatus(@Param('postId') postId: string, @Body({ validate: true }) commentStatusReq: PostCommentStatusRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const postsObjId = new ObjectID(postId);
        const commentsArray = commentStatusReq.comments;
        const asPageId = commentStatusReq.asPage;
        let asUserId = new ObjectID(req.user.id);
        let countAsPage = false;

        if (commentsArray === undefined || commentsArray.length <= 0) {
            const errorResponse = ResponseUtil.getErrorResponse('Post Comment is required.', undefined);
            return res.status(400).send(errorResponse);
        }

        // search post
        const post: Posts = await this.postsService.findOne({ where: { _id: postsObjId } });
        if (!post) {
            const errorResponse = ResponseUtil.getErrorResponse('Post was not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (asPageId !== undefined && asPageId !== null) {
            // check accessibility
            const pageAccess = await this.pageAccessLevelService.getUserAccessByPage(req.user.id, asPageId);

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
                    asUserId = new ObjectID(asPageId);
                    countAsPage = true;
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('User can not access page.', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        let postsCommentList: any[] = [];
        // search like
        {
            const postCommentIds = [];
            for (const commentId of commentsArray) {
                postCommentIds.push(new ObjectID(commentId));
            }

            let likeStmt: any = {
                where: {
                    userId: asUserId, subjectId: { $in: postCommentIds }, subjectType: LIKE_TYPE.POST_COMMENT,
                    $or: [
                        { likeAsPage: { $exists: false } },
                        { likeAsPage: null }
                    ]
                }
            };
            if (countAsPage) {
                likeStmt = { where: { likeAsPage: asUserId, subjectId: { $in: postCommentIds }, subjectType: LIKE_TYPE.POST_COMMENT } };
            }

            const countStmt = [
                { $match: likeStmt.where },
                { $project: { postCommentId: '$subjectId', isLike: { $convert: { input: 'true', to: 'bool' } } } }
            ];
            postsCommentList = await this.userLikeService.aggregate(countStmt);
        }

        if (postsCommentList !== null && postsCommentList !== undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully get PostsComment', postsCommentList);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('PostsComment was not found.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/post/:postId/comment/like Like PostsComment API
     * @apiGroup PostsComment
     * @apiParam (Request body) {String} comment Comment
     * @apiParamExample {json} Input
     * {
     *      "comment" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create PostsComment",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/comment/like
     * @apiErrorExample {json} Unable create PostsComment
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:postId/comment/:commentId/like')
    @Authorized('user')
    public async likePostsComment(@Param('postId') postId: string, @Param('commentId') commentId: string, @Body({ validate: true }) like: LikeRequest, @Res() res: any, @Req() req: any): Promise<any> {
        if (postId === '' || postId === null || postId === undefined) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Error', 'PostId is null'));
        }

        if (commentId === '' || commentId === null || commentId === undefined) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Error', 'CommentId is null'));
        }

        const userObjId = new ObjectID(req.user.id);
        const postObjId = new ObjectID(postId);
        const commentObjId = new ObjectID(commentId);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const contentType = ENGAGEMENT_CONTENT_TYPE.POST_COMMENT;
        const likeAsPage = like.likeAsPage;

        let userEngagementAction: UserEngagement;
        let userLiked: UserLike[];
        let result = {};
        let userLikeStmt;
        let action;
        let likeCount;
        let likeAsPageObjId;
        let likeStmt;

        if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
            likeAsPageObjId = new ObjectID(likeAsPage);
            likeStmt = { where: { userId: userObjId, subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT, likeAsPage: likeAsPageObjId } };
        } else {
            likeStmt = { where: { userId: userObjId, subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT } };
        }

        const postCommentLike: UserLike = await this.userLikeService.findOne(likeStmt);
        if (postCommentLike) {
            let deleteLikeStmt;

            if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                deleteLikeStmt = { userId: userObjId, subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT, likeAsPage: likeAsPageObjId };
            } else {
                deleteLikeStmt = { userId: userObjId, subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT };
            }

            const unLike = await this.userLikeService.delete(deleteLikeStmt);
            if (unLike) {
                action = ENGAGEMENT_ACTION.UNLIKE;

                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = commentObjId;
                userEngagement.contentType = contentType;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = action;

                let engagement: UserEngagement;

                if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                    userEngagement.likeAsPage = likeAsPageObjId;

                    engagement = await this.userEngagementService.getEngagement(commentObjId, userObjId, action, contentType, likeAsPageObjId);

                    userLikeStmt = { where: { subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT, likeAsPage: likeAsPageObjId } };
                } else {
                    userEngagement.likeAsPage = null;

                    engagement = await this.userEngagementService.getEngagement(commentObjId, userObjId, action, contentType);

                    userLikeStmt = { where: { subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT } };
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
                    await this.postsCommentService.update({ _id: commentObjId }, { $set: { likeCount } });
                    const unLikedPost = await this.postsCommentService.findOne({ where: { _id: commentObjId, post: postObjId, deleted: false } });
                    result['comment'] = unLikedPost;
                    const successResponse = ResponseUtil.getSuccessResponse('UnLike Post Comment Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('UnLike Post Comment Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userLike = new UserLike();
            userLike.userId = userObjId;
            userLike.subjectId = commentObjId;
            userLike.subjectType = LIKE_TYPE.POST_COMMENT;

            if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                userLike.likeAsPage = likeAsPageObjId;
            } else {
                userLike.likeAsPage = null;
            }

            const likeCreate: UserLike = await this.userLikeService.create(userLike);
            if (likeCreate) {
                result = likeCreate;
                action = ENGAGEMENT_ACTION.LIKE;

                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = commentObjId;
                userEngagement.contentType = contentType;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = action;

                let engagement: UserEngagement;

                if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                    userEngagement.likeAsPage = likeAsPageObjId;

                    engagement = await this.userEngagementService.getEngagement(commentObjId, userObjId, action, contentType, likeAsPageObjId);

                    userLikeStmt = { where: { subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT, likeAsPage: likeAsPageObjId } };
                } else {
                    userEngagement.likeAsPage = null;

                    engagement = await this.userEngagementService.getEngagement(commentObjId, userObjId, action, contentType);

                    userLikeStmt = { where: { subjectId: commentObjId, subjectType: LIKE_TYPE.POST_COMMENT } };
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
                    await this.postsCommentService.update({ _id: commentObjId }, { $set: { likeCount } });
                    const likedPostComment = await this.postsCommentService.findOne({ where: { _id: commentObjId, post: postObjId, deleted: false } });
                    result['comment'] = likedPostComment;
                    const successResponse = ResponseUtil.getSuccessResponse('Like Post Comment Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Like Post Comment Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    // Update PostsComment API
    /**
     * @api {put} /api/post/:postId/comment/:commentId Update PostsComment API
     * @apiGroup PostsComment
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} comment comment
     * @apiParamExample {json} Input
     * {
     *      "comment": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated PostsComment.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/comment/:commentId
     * @apiErrorExample {json} Update PostsComment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:postId/comment/:commentId')
    @Authorized('user')
    public async updatePostsComment(@Body({ validate: true }) postsComment: PostsCommentRequest, @Param('postId') postId: string, @Param('commentId') commentId: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const commentObjId = new ObjectID(commentId);
            const postsObjId = new ObjectID(postId);
            const username = req.user.id;

            const postsCommentData: PostsComment = await this.postsCommentService.findOne({
                $and: [{ _id: commentObjId }, { post: postsObjId }, { user: username }, { deleted: false }]
            });

            if (!postsCommentData) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('You Cannot Edit This PostsCommsnt', undefined));
            }

            const updateQuery = { _id: commentObjId, post: postsObjId, user: username };
            const newValue = { $set: { comment: postsComment.comment } };
            const postsCommentEdit = await this.postsCommentService.update(updateQuery, newValue);

            if (postsCommentEdit) {
                const postsCommentUpdated: PostsComment = await this.postsCommentService.findOne({
                    $and: [{ _id: commentObjId }, { post: postsObjId }, { user: username }, { deleted: false }]
                });

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update PostsComment Successful', postsCommentUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PostsComment', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/post/:postId/comment/:commentId Delete PostsComment API
     * @apiGroup PostsComment
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete PostsComment.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/post/:postId/comment/:commentId
     * @apiErrorExample {json} Delete PostsComment Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:postId/comment/:commentId')
    @Authorized('user')
    public async deletePostsComment(@Param('postId') postId: string, @Param('commentId') commentId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const commentObjId = new ObjectID(commentId);
        const postsObjId = new ObjectID(postId);
        const username = req.user.id;

        const postsCommentData: PostsComment = await this.postsCommentService.findOne({ $and: [{ _id: commentObjId }, { post: postsObjId }, { user: username }, { deleted: false }] });

        if (postsCommentData !== null && postsCommentData !== undefined) {
            const deletePostsComment = await this.postsCommentService.update({ _id: commentObjId, post: postsObjId, user: username }, { $set: { deleted: true } });

            if (deletePostsComment) {
                const posts: Posts = await this.postsService.findOne({ _id: postsObjId });
                console.log('posts >>>> ', posts);
                await this.postsService.update({ _id: postsObjId }, { $set: { commentCount: posts.commentCount - 1 } });

                const successResponse = ResponseUtil.getSuccessResponse('Successfully delete PostsComment', []);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable to delete PostsComment', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('You Cannot Delete This PostsComment', undefined);
            return res.status(400).send(errorResponse);
        }
    }
}
