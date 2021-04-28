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

@JsonController('/profile')
export class UserProfileController {
    constructor(
        private userService: UserService,
        private userLikeService: UserLikeService,
        private userFollowService: UserFollowService,
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        private assetService: AssetService
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
        let user: User[];
        let result: any;

        try {
            const uid = new ObjectID(userId);
            user = await this.userService.aggregate(
                [
                    {
                        $match: {
                            _id: uid,
                        }
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
                        $project: { uniqueId: 1, username: 1, email: 1, firstName: 1, lastName: 1, displayName: 1, birthdate: 1, customGender: 1, gender: 1, imageURL: 1, coverURL: 1, coverPosition: 1, provideItems: 1 }
                    }
                ]
            );
        } catch (ex) {
            user = await this.userService.aggregate(
                [
                    {
                        $match: {
                            uniqueId: userId,
                        }
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
                        $project: { uniqueId: 1, username: 1, email: 1, firstName: 1, lastName: 1, displayName: 1, birthdate: 1, customGender: 1, gender: 1, imageURL: 1, coverURL: 1, coverPosition: 1, provideItems: 1 }
                    }
                ]
            );
        }

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

            const userFollowing = await this.userFollowService.find({ where: { userId: usrObjId, subjectType: SUBJECT_TYPE.USER } });
            const userFollower = await this.userFollowService.find({ where: { subjectId: usrObjId, subjectType: SUBJECT_TYPE.USER } });

            result.following = userFollowing.length;
            result.followers = userFollower.length;

            if (isUserFollow !== null && isUserFollow !== undefined) {
                result.isFollow = true;
            } else {
                result.isFollow = false;
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully Get UserProfile', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to Get UserProfile', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search PagePost
    /**
     * @api {post} /api/user/:id/post/search Search PagePost API
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

                if (limit === null || limit === undefined || limit <= 0) {
                    limit = MAX_SEARCH_ROWS;
                }

                if (offset === null || offset === undefined) {
                    offset = 0;
                }

                if (postType !== null && postType !== undefined && postType !== '') {
                    userPostStmt = [
                        { $match: { pageId: null, ownerUser: usrObjId, type: postType, hidden: false, deleted: false, isDraft: false, startDateTime: { $lte: today } } },
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
                        }
                    ];
                } else {
                    userPostStmt = [
                        { $match: { pageId: null, ownerUser: usrObjId, hidden: false, deleted: false, isDraft: false, startDateTime: { $lte: today } } },
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
                        }
                    ];
                }

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

                            const postComments: PostsComment[] = await this.postsCommentService.find({ user: usObjId, post: { $in: postsList } });
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

        const user: User = await this.userService.findOne({ _id: userObjId });
        if (user !== null && user !== undefined) {
            if (user.coverURL !== null && user.coverURL !== undefined && user.coverURL !== '' && typeof (user.coverURL) !== 'undefined') {
                assetId = new ObjectID(user.coverURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId, userId: userObjId };
                const newValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate, expirationDate: null } };
                assetResult = await this.assetService.update(assetQuery, newValue);
                newAssetId = assetId;
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
            const coverURLUpdate = await this.userService.update({ _id: userObjId }, { $set: { coverURL: ASSET_PATH + newAssetId, coverPosition: userCoverPosition } });
            if (coverURLUpdate) {
                let users = await this.userService.findOne({ _id: userObjId });
                users = this.userService.cleanAdminUserField(users);
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

        const user: User = await this.userService.findOne({ _id: userObjId });
        if (user !== null && user !== undefined) {
            if (user.imageURL !== null && user.imageURL !== undefined && user.imageURL !== '' && typeof (user.imageURL) !== 'undefined') {
                assetId = new ObjectID(user.imageURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId, userId: userObjId };
                const newValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate, expirationDate: null } };
                assetResult = await this.assetService.update(assetQuery, newValue);
                newAssetId = assetId;
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
            const imageURLUpdate = await this.userService.update({ _id: userObjId }, { $set: { imageURL: ASSET_PATH + newAssetId } });
            if (imageURLUpdate) {
                let users = await this.userService.findOne({ _id: userObjId });
                users = this.userService.cleanAdminUserField(users);
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

            const updateQuery = { _id: userObjId };
            const newValue = {
                $set: {
                    displayName: userDisplayName,
                    firstName: userFirstName,
                    lastName: userLastName,
                    birthdate: userBirthdate,
                    gender: userGender,
                    customGender: userCustomGender
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
}
