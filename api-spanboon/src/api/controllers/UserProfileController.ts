/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Param, Req, Get, Authorized, Put, Body, Post, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { UserService } from '../services/UserService';
import { ObjectID } from 'mongodb';
import { LIKE_TYPE } from '../../constants/LikeType';
import { UpdateUserProfileRequest } from './requests/UpdateUserProfileRequest';
import { BindingUserMFP } from './requests/BindingUserMFPRequest';
import { User } from '../models/User';
import { AssetRequest } from './requests/AssetRequest';
import { AssetService } from '../services/AssetService';
import { Asset } from '../models/Asset';
import { ASSET_PATH, ASSET_SCOPE } from '../../constants/AssetScope';
import { FileUtil } from '../../utils/FileUtil';
import moment from 'moment';
import { PostsService } from '../services/PostsService';
import { SearchPostRequest } from './requests/SearchPostRequest';
import { UserFollowService } from '../services/UserFollowService';
import { Posts } from '../models/Posts';
import { MAX_SEARCH_ROWS } from '../../constants/Constants';
import { UserLike } from '../models/UserLike';
import { UserLikeService } from '../services/UserLikeService';
import { PostsComment } from '../models/PostsComment';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { PostsCommentService } from '../services/PostsCommentService';
import { AuthenticationId } from '../models/AuthenticationId';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import { HidePostService } from '../services/HidePostService';
import jwt from 'jsonwebtoken';
import { PROVIDER } from '../../constants/LoginProvider';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import qs from 'qs';
import { PointStatementModel } from '../models/PointStatementModel';
import { PointStatementService } from '../services/PointStatementService';
import { AccumulateService } from '../services/AccumulateService';
import { AccumulateModel } from '../models/AccumulatePointModel';
@JsonController('/profile')
export class UserProfileController {
    constructor(
        private authenIdService: AuthenticationIdService,
        private userService: UserService,
        private userLikeService: UserLikeService,
        private userFollowService: UserFollowService,
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        private assetService: AssetService,
        private hidePostService: HidePostService,
        private accumulateService:AccumulateService,
        private pointStatementService:PointStatementService
    ) { }

    // Get UserProfile API
    /**
     * @api {get} /api/profile Get UserPageProfile
     * @apiGroup UserProfile
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get UserPageProfile",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/profile
     * @apiErrorExample {json} Logout error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async getUserPageProfile(@Param('id') userId: string, @Req() req: any, @Res() res: any): Promise<any> {
        let result: any;
        let userObjId: ObjectID;
        let userStmt: any;

        try {
            userObjId = new ObjectID(userId);
            userStmt = { _id: userObjId };
        } catch (ex) {
            userStmt = { uniqueId: userId };
        } finally {
            if (userObjId === undefined || userObjId === 'undefined') {
                userObjId = null;
            }

            userStmt = { $or: [{ _id: userObjId }, { uniqueId: userId }] };
        }

        const user: User[] = await this.userService.aggregate(
            [
                {
                    $match: userStmt
                },
                {
                    $lookup: {
                        from: 'UserProvideItems',
                        localField: '_id',
                        foreignField: 'user',
                        as: 'provideItems'
                    }
                },
                {
                    $project: {
                        uniqueId: 1,
                        firstName: 1,
                        lastName: 1,
                        displayName: 1,
                        birthdate: 1,
                        customGender: 1,
                        gender: 1,
                        imageURL: 1,
                        coverURL: 1,
                        coverPosition: 1,
                        provideItems: 1,
                        membership: 1
                    }
                }
            ]
        );

        if (user !== null && user !== undefined && user.length > 0) {
            result = await this.userService.cleanAdminUserField(user[0]);

            const uid = result.id;
            const usrObjId = new ObjectID(uid);
            const userFollowId = req.headers.userid;
            let userFollowObjId;
            let isUserFollow;
            let isUserFollowStmt;

            if (userFollowId !== null && userFollowId !== undefined && userFollowId !== '') {
                userFollowObjId = new ObjectID(userFollowId);

                isUserFollowStmt = { userId: userFollowObjId, subjectId: usrObjId, subjectType: SUBJECT_TYPE.USER };

                isUserFollow = await this.userFollowService.findOne(isUserFollowStmt);
            }

            const userAuthList: AuthenticationId[] = await this.authenIdService.find({ where: { user: usrObjId } });
            const userFollowing = await this.userFollowService.find({ where: { userId: usrObjId, subjectType: SUBJECT_TYPE.USER } });
            const userFollower = await this.userFollowService.find({ where: { subjectId: usrObjId, subjectType: SUBJECT_TYPE.USER } });
            const authProviderList: string[] = [];
            let mfpProvider = undefined;
            if (userAuthList !== null && userAuthList !== undefined && userAuthList.length > 0) {
                for (const userAuth of userAuthList) {
                    if (userAuth.providerName !== undefined && userAuth.providerName === 'MFP') {
                        mfpProvider = userAuth;
                    }
                    authProviderList.push(userAuth.providerName);
                }
            }
            const requestBody = {
                'grant_type': process.env.GRANT_TYPE,
                'client_id': process.env.CLIENT_ID,
                'client_secret': process.env.CLIENT_SECRET,
                'scope': process.env.SCOPE
            };
            const formattedData = qs.stringify(requestBody);

            const responseMFP = await axios.post(
                process.env.APP_MFP_API_OAUTH,
                formattedData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json'
                }
            });
            const tokenCredential = responseMFP.data.access_token;
            let getMembershipById = undefined;
            if (mfpProvider !== undefined) {
                getMembershipById = await axios.get(
                    process.env.API_MFP_GET_ID + mfpProvider.providerUserId,
                    {
                        headers: {
                            Authorization: `Bearer ${tokenCredential}`
                        }
                    }
                );
            }
            result.authUser = authProviderList;
            result.following = userFollowing.length;
            result.followers = userFollower.length;
            result.mfpUser = {
                memberNumber: getMembershipById? getMembershipById.data.data.serial : undefined,
                expiredAt: getMembershipById ? getMembershipById.data.data.expired_at : undefined,
                firstName: getMembershipById ? getMembershipById.data.data.first_name : undefined,
                lastName: getMembershipById ? getMembershipById.data.data.last_name : undefined,
                state: getMembershipById ? getMembershipById.data.data.state : undefined,
                membership_type: getMembershipById ? getMembershipById.data.data.membership_type : undefined,
                identification: getMembershipById ? getMembershipById.data.data.identification_number.slice(0, getMembershipById.data.data.identification_number.length - 4) + 'XXXX' : undefined,
                mobile: getMembershipById ? getMembershipById.data.data.mobile_number.slice(0, getMembershipById.data.data.mobile_number.length - 4) + 'XXXX' : undefined,
            };

            if (isUserFollow !== null && isUserFollow !== undefined) {
                result.isFollow = true;
            } else {
                result.isFollow = false;
            }

            const accumulatePoint = await this.accumulateService.findOne({userId:userObjId});
            result.accumulatePoint = accumulatePoint !== undefined ? accumulatePoint.accumulatePoint : undefined;
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Get UserProfile', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to Get UserProfile', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search PagePost
    /**
     * @api {post} /api/profile/:id/post/search Search PagePost API
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
     * @apiSampleRequest /api/user/:id/post/search
     * @apiErrorExample {json} Search PagePost error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:uId/post/search')
    public async searchUserPost(@QueryParam('isHideStory') isHideStory: boolean, @Param('uId') uId: string, @Body({ validate: true }) search: SearchPostRequest, @Res() res: any, @Req() req: any): Promise<any> {
        if (Object.keys(search).length > 0 && (uId !== '' && uId !== null && uId !== undefined)) {
            if (isHideStory === null || isHideStory === undefined) {
                isHideStory = true;
            }
            let objIdsUser = undefined;
            if (req.headers.userid !== undefined && req.headers.userid !== null && req.headers.userid !== '') {
                objIdsUser = new ObjectID(req.headers.userid);
            }
            const postType = search.type;
            let userObjId;
            const result: any = {};
            let userStmt;
            let userPostStmt;

            try {
                userObjId = new ObjectID(uId);
                userStmt = { _id: userObjId };
            } catch (ex) {
                userStmt = { uniqueId: uId };
            } finally {
                if (userObjId === undefined || userObjId === 'undefined') {
                    userObjId = null;
                }

                userStmt = { $or: [{ _id: userObjId }, { uniqueId: uId }] };
            }

            const user: User = await this.userService.findOne(userStmt);

            if (user !== null && user !== undefined) {
                const usrObjId = new ObjectID(user.id);
                const today = moment().toDate();
                let limit = search.limit;
                let offset = search.offset;
                const postIds = [];
                if (objIdsUser) {
                    const hidePost = await this.hidePostService.find({ userId: objIdsUser });
                    if (hidePost.length > 0) {
                        for (let j = 0; j < hidePost.length; j++) {
                            const postId = hidePost[j].postId;
                            if (postId !== undefined && postId !== null && postId.length > 0) {
                                postIds.push(...postId.map(id => new ObjectID(id)));
                            }
                        }
                    }
                }

                if (limit === null || limit === undefined || limit <= 0) {
                    limit = MAX_SEARCH_ROWS;
                }

                if (offset === null || offset === undefined) {
                    offset = 0;
                }
                let postStmtN: any = undefined;
                if (postType !== null && postType !== undefined && postType !== '') {
                    postStmtN = { pageId: null, ownerUser: usrObjId, type: postType, hidden: false, deleted: false, isDraft: false, startDateTime: { $lte: today } };
                } else {
                    postStmtN = { pageId: null, ownerUser: usrObjId, hidden: false, deleted: false, isDraft: false, startDateTime: { $lte: today } };
                }
                if (postIds.length > 0) {
                    postStmtN._id = { $nin: postIds };
                }
                userPostStmt = [
                    { $match: postStmtN },
                    { $sort: { startDateTime: -1 } },
                    { $skip: offset },
                    { $limit: limit },
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
                            from: 'EmergencyEvent',
                            localField: 'emergencyEvent',
                            foreignField: '_id',
                            as: 'emergencyEvent'
                        },
                    },
                    {
                        $unwind: {
                            path: '$emergencyEvent',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ];

                const userPostLists: any[] = await this.postsService.aggregate(userPostStmt);

                if (userPostLists !== null && userPostLists !== undefined && userPostLists.length > 0) {
                    const postsList = [];
                    const referencePostList = [];
                    const postsMap: any = {};

                    for (const post of userPostLists) {
                        const referencePost = post.referencePost;
                        postsList.push(new ObjectID(post._id));

                        if (referencePost !== '' && referencePost !== null && referencePost !== undefined) {
                            referencePostList.push(new ObjectID(referencePost));
                        }
                    }

                    const postIdList: any[] = [];

                    if (referencePostList !== null && referencePostList !== undefined && referencePostList.length > 0) {
                        const postsReference: Posts[] = await this.postsService.find({ _id: { $in: referencePostList }, hidden: false, deleted: false, isDraft: false });

                        if (postsReference !== null && postsReference !== undefined && postsReference.length > 0) {
                            for (const posts of postsReference) {
                                const pageId = posts.pageId;
                                const postId = posts.id;
                                const ownerUser = posts.ownerUser;
                                postIdList.push(new ObjectID(postId));

                                if (pageId !== null && pageId !== undefined && pageId !== '') {
                                    postsMap[pageId + ':' + postId + ':' + ownerUser] = posts;
                                } else {
                                    postsMap[postId + ':' + ownerUser] = posts;
                                }
                            }
                        }
                    }

                    const usrId = req.headers.userid;
                    const userLikeMap: any = {};
                    const likeAsPageMap: any = {};
                    const postsCommentMap: any = {};
                    let usObjId;

                    if (usrId !== null && usrId !== undefined && usrId !== '') {
                        usObjId = new ObjectID(usrId);

                        if (postsList !== null && postsList !== undefined && postsList.length > 0) {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: usObjId, subjectId: { $in: postsList }, subjectType: LIKE_TYPE.POST });
                            if (userLikes !== null && userLikes !== undefined && userLikes.length > 0) {
                                for (const like of userLikes) {
                                    const postId = like.subjectId;
                                    const likeAsPage = like.likeAsPage;

                                    if (postId !== null && postId !== undefined && postId !== '') {
                                        userLikeMap[postId] = like;

                                        if (likeAsPage !== null && likeAsPage !== undefined && likeAsPage !== '') {
                                            likeAsPageMap[postId] = like;
                                        }
                                    }
                                }
                            }

                            const postComments: PostsComment[] = await this.postsCommentService.find({ user: usObjId, post: { $in: postsList }, deleted: false });
                            if (postComments !== null && postComments !== undefined && postComments.length > 0) {
                                for (const comment of postComments) {
                                    const postId = comment.post;
                                    postsCommentMap[postId] = comment;
                                }
                            }
                        }
                    }

                    userPostLists.map(async (data) => {
                        const postId = data._id;
                        const pageId = data.pageId;
                        const story = data.story;
                        const ownerUser = data.ownerUser;
                        let dataKey;

                        if (isHideStory === true) {
                            if (story !== null && story !== undefined) {
                                data.story = {};
                            } else {
                                data.story = null;
                            }
                        }

                        if (postId !== null && postId !== undefined && postId !== '') {
                            if (pageId !== null && pageId !== undefined && pageId !== '') {
                                dataKey = pageId + ':' + postId + ':' + ownerUser;
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

                    result.posts = userPostLists;

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

    // Edit Cover API
    /**
     * @api {get} /api/profile/cover Edit Cover API
     * @apiGroup UserProfile
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Edit Cover Successfully",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/profile/cover
     * @apiErrorExample {json} Edit Cover Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/cover')
    @Authorized('user')
    public async editCoverURL(@Body({ validate: true }) assets: AssetRequest, @Param('id') userId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(userId);
        const newFileName = userObjId + FileUtil.renameFile();
        const assetData = assets.asset.data;
        const assetMimeType = assets.asset.mimeType;
        const assetFileName = newFileName;
        const assetSize = assets.asset.size;
        const userCoverPosition = assets.coverPosition;
        const updatedDate = moment().toDate();
        let assetResult: Asset;
        let assetId;
        let newAssetId;
        let newS3CoverURL;

        const user: User = await this.userService.findOne({ _id: userObjId });
        if (user !== null && user !== undefined) {
            if (user.coverURL !== null && user.coverURL !== undefined && user.coverURL !== '' && typeof (user.coverURL) !== 'undefined') {
                assetId = new ObjectID(user.coverURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId, userId: userObjId };
                const newValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate, expirationDate: null } };
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
                asset.expirationDate = null;
                assetResult = await this.assetService.create(asset);
                newAssetId = assetResult.id;
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('UserId Not Found', undefined);
            return res.status(400).send(errorResponse);
        }

        if (assetResult) {
            newS3CoverURL = assetResult.s3FilePath;

            const coverURLUpdate = await this.userService.update({ _id: userObjId }, { $set: { coverURL: ASSET_PATH + newAssetId, coverPosition: userCoverPosition, s3CoverURL: newS3CoverURL } });
            if (coverURLUpdate) {
                let users = await this.userService.findOne({ _id: userObjId });
                users = await this.userService.cleanAdminUserField(users);
                const successResponse = ResponseUtil.getSuccessResponse('Edit CoverURL Success', users);
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
     * @api {get} /api/image/cover Edit Image API
     * @apiGroup UserProfile
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Edit Image Successfully",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/image/cover
     * @apiErrorExample {json} Edit Image Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/image')
    @Authorized('user')
    public async editImageURL(@Body({ validate: true }) assets: AssetRequest, @Param('id') userId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const newFileName = userObjId + FileUtil.renameFile();
        const assetData = assets.asset.data;
        const assetMimeType = assets.asset.mimeType;
        const assetFileName = newFileName;
        const assetSize = assets.asset.size;
        const updatedDate = moment().toDate();
        let assetResult;
        let assetId;
        let newAssetId;
        let newS3ImageURL;

        const user: User = await this.userService.findOne({ _id: userObjId });
        if (user !== null && user !== undefined) {
            if (user.imageURL !== null && user.imageURL !== undefined && user.imageURL !== '' && typeof (user.imageURL) !== 'undefined') {
                assetId = new ObjectID(user.imageURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId, userId: userObjId };
                const newValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate, expirationDate: null } };
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
                asset.expirationDate = null;
                asset.scope = ASSET_SCOPE.PUBLIC;
                assetResult = await this.assetService.create(asset);
                newAssetId = assetResult.id;
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('UserId Not Found', undefined);
            return res.status(400).send(errorResponse);
        }

        if (assetResult) {
            newS3ImageURL = assetResult.s3FilePath;
            const imageURLUpdate = await this.userService.update({ _id: userObjId }, { $set: { imageURL: ASSET_PATH + newAssetId, s3ImageURL: newS3ImageURL } });
            if (imageURLUpdate) {
                let users = await this.userService.findOne({ _id: userObjId });
                users = await this.userService.cleanAdminUserField(users);
                const successResponse = ResponseUtil.getSuccessResponse('Edit ImageURL Success', users);
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

    @Post('/:id')
    @Authorized('user')
    public async bindingUserMFPProcess(@Param('id') id: string, @Body({ validate: true }) users: UpdateUserProfileRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userObj = new ObjectID(id);
        const tokenSecret = users.token;
        const membership = users.membership;
        const mode = req.headers.mode;

        if (membership === true) {
            const token = await jwt.sign({
                redirect_uri: process.env.WEB_MFP_REDIRECT_URI,
                uid: userObj + '.' + tokenSecret + '.' + mode,
            }, process.env.CLIENT_SECRET, { algorithm: 'HS256' });
            if (token) {
                const successResponseMFP = ResponseUtil.getSuccessResponse('Grant Client Credential MFP is successful.', token);
                return res.status(200).send(successResponseMFP);
            } else {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'axios error.' };
                return res.status(400).send(errorUserNameResponse);
            }
        } else {
            // delete mfp authentication
            const query = { _id: userObj };
            const newValue = { $set: { membership: false } };
            const update = await this.userService.update(query, newValue);
            if (update) {
                const deleteAuthen = await this.authenIdService.aggregate({ user: userObj, providerName: PROVIDER.MFP });
                if (deleteAuthen) {
                    const successResponseMFP = ResponseUtil.getSuccessResponse('Binding MFP is successful.', undefined);
                    return res.status(200).send(successResponseMFP);
                }
            }
        }
    }

    @Post('/:id/binding')
    @Authorized('user')
    public async bindingUserMFP(@Param('id') id: string, @Body({ validate: true }) bindingUser: BindingUserMFP, @Res() res: any, @Req() req: any): Promise<any> {
        const userObject = bindingUser;
        const userObjId = new ObjectID(id);
        let authIdCreate: AuthenticationId;
        // PENDING_PAYMENT 400
        if (userObject.membership.state === 'PENDING_PAYMENT' && userObject.membership.membership_type === 'UNKNOWN') {
            return res.status(400).send(ResponseUtil.getErrorResponse('PENDING_PAYMENT', undefined));
        }
        // PENDING_APPROVAL 400
        if (userObject.membership.state === 'PENDING_APPROVAL') {
            return res.status(400).send(ResponseUtil.getErrorResponse('PENDING_APPROVAL', undefined));
        }
        // REJECTED 400
        if (userObject.membership.state === 'REJECTED') {
            return res.status(400).send(ResponseUtil.getErrorResponse('REJECTED', undefined));
        }
        // PROFILE_RECHECKED 400
        if (userObject.membership.state === 'PROFILE_RECHECKED') {
            return res.status(400).send(ResponseUtil.getErrorResponse('PROFILE_RECHECKED', undefined));
        }
        if (userObject.membership.state === 'ARCHIVED') {
            return res.status(400).send(ResponseUtil.getErrorResponse('ARCHIVED', undefined));

        }
        if (userObject.membership.state === 'APPROVED'
            &&
            (userObject.membership.membership_type === 'MEMBERSHIP_YEARLY' ||
                userObject.membership.membership_type === 'MEMBERSHIP_PERMANENT')) {

            const user = await this.userService.findOne({ _id: userObjId });
            if (user) {
                // check authentication MFP Is existing ?
                const encryptIdentification = await bcrypt.hash(userObject.membership.identification_number, 10);
                const checkAuthentication = await this.authenIdService.findOne({ providerUserId: userObject.membership.id, providerName: PROVIDER.MFP });
                if (checkAuthentication !== undefined && checkAuthentication !== null) {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('You have binded this user.', undefined));

                }
                // import * as bcrypt from 'bcrypt';

                const authenId = new AuthenticationId();
                authenId.user = user.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = userObject.membership.id;
                authenId.providerName = PROVIDER.MFP;
                authenId.properties = userObject.membership;
                authenId.expirationDate = userObject.membership.expired_at;
                authenId.expirationDate_law_expired = userObject.membership.law_expired_at;
                authenId.identificationNumber = encryptIdentification;
                authenId.mobileNumber = userObject.membership.mobile_number;
                authenId.membershipState = userObject.membership.state;
                authenId.membershipType = userObject.membership.membership_type;
                authenId.membership = true;
                authIdCreate = await this.authenIdService.create(authenId);
                if (authIdCreate) {
                    // pointFunction
                    const checkSpam = await this.pointStatementService.findOne(
                        {
                            title: 'REGISTER_MEMBERSHIP_MFP',
                            userId:userObjId,
                            type:'BINDING_MEMBERSHIP'
                        }
                    );
                    if(checkSpam === undefined) {
                        await this.getPointFunction(userObjId);
                    }
                    // update status user membership = true
                    const query = { _id: userObjId };
                    const newValues = { $set: { membership: true } };
                    const update = await this.userService.update(query, newValues);
                    if (update) {
                        const successResponseMFP = ResponseUtil.getSuccessResponse('Binding User Is Successful.', 'APPROVED');
                        return res.status(200).send(successResponseMFP);
                    } else {
                        return res.status(400).send(ResponseUtil.getSuccessResponse('Cannot Update Status Membership User.', undefined));
                    }
                }
            } else {
                return res.status(400).send(ResponseUtil.getSuccessResponse('User Not Found', undefined));
            }
        }
        else {
            return res.status(400).send(ResponseUtil.getErrorResponse('User Not Found', undefined));
        }
    }

    // Update User Profile API
    /**
     * @api {put} /api/profile/:id Update User Profile API
     * @apiGroup UserProfile
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} displayName
     * @apiParam (Request body) {String} firstName
     * @apiParam (Request body) {String} lastName
     * @apiParam (Request body) {Date} birthdate
     * @apiParam (Request body) {Number} gender
     * @apiParam (Request body) {String} customGender
     * @apiParamExample {json} Input
     * {
     *      "displayName" : "",
     *      "firstName" : "",
     *      "lastName" : "",
     *      "birthdate" : "",
     *      "gender" : "",
     *      "customGender" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Update UserProfile Successful",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/profile/:id
     * @apiErrorExample {json} Cannot Update UserProfile
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized('user')
    public async updateUserProfile(@Param('id') id: string, @Body({ validate: true }) users: UpdateUserProfileRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const userObjId = new ObjectID(id);
            const findUserQuery = { where: { _id: userObjId } };
            const findUser: User = await this.userService.findOne(findUserQuery);

            if (!findUser) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('User Not Found', undefined));
            }

            let userDisplayName = users.displayName;
            let userFirstName = users.firstName;
            let userLastName = users.lastName;
            let userBirthdate = users.birthdate;
            let userGender = users.gender;
            let userCustomGender = users.customGender;
            let userProvince = users.province;
            let userMembership = users.membership;
            if (userDisplayName === null || userDisplayName === undefined) {
                userDisplayName = findUser.displayName;
            }

            if (userFirstName === null || userFirstName === undefined) {
                userFirstName = findUser.firstName;
            }

            if (userLastName === null || userLastName === undefined) {
                userLastName = findUser.lastName;
            }

            if (userBirthdate === null || userBirthdate === undefined) {
                userBirthdate = findUser.birthdate;
            }

            if (userGender === null || userGender === undefined) {
                userGender = findUser.gender;
            }

            if (userCustomGender === null || userCustomGender === undefined) {
                userCustomGender = findUser.customGender;
            }
            if (userProvince === null || userProvince === undefined) {
                userProvince = findUser.province;
            }
            // check authen
            // mode MFP membership
            if (userMembership === null || userMembership === undefined) {
                userMembership = findUser.membership;
                // create authentication 

            }
            const updateQuery = { _id: userObjId };
            const newValue = {
                $set: {
                    displayName: userDisplayName,
                    firstName: userFirstName,
                    lastName: userLastName,
                    birthdate: userBirthdate,
                    gender: userGender,
                    customGender: userCustomGender,
                    province: userProvince,
                    membership: userMembership
                }
            };

            const userUpdate = await this.userService.update(updateQuery, newValue);

            if (userUpdate) {
                let userUpdated: User = await this.userService.findOne(findUserQuery);
                userUpdated = await this.userService.cleanAdminUserField(userUpdated);
                return res.status(200).send(ResponseUtil.getSuccessResponse('Update UserProfile Successful', userUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update UserProfile', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    private async getPointFunction(userObjId:string): Promise<any>{
        const productModel = new PointStatementModel();
        productModel.title = `REGISTER_MEMBERSHIP_MFP`;
        productModel.detail = null;
        productModel.point = 100;
        productModel.type = 'BINDING_MEMBERSHIP';
        productModel.userId = new ObjectID(userObjId);
        productModel.postId = null;
        productModel.pointEventId = null;
        productModel.productId = null;
        productModel.todayNewsId = null;
        const createPointStatement = await this.pointStatementService.create(productModel);
        if(createPointStatement) {
            const accumulateCreate = await this.accumulateService.findOne({userId:new ObjectID(userObjId)});
            if(accumulateCreate === undefined) {
                const accumulateModel = new AccumulateModel();
                accumulateModel.userId = new ObjectID(userObjId);
                accumulateModel.accumulatePoint = createPointStatement.point;
                accumulateModel.usedPoint = 0;
                await this.accumulateService.create(accumulateModel);
            } 
            await this.accumulateService.update(
                {userId:new ObjectID(userObjId)},
                {$set:{accumulatePoint:accumulateCreate.accumulatePoint + 20}}
            );
        }
    }
}
