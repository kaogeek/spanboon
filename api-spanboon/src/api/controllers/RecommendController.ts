/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Req, QueryParam, QueryParams } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import { UserFollowService } from '../services/UserFollowService';
import { PostsService } from '../services/PostsService';
import { HashTagService } from '../services/HashTagService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { RecommendStoryParam } from './params/RecomendStoryParam';
import { StorySectionProcessor } from '../processors/StorySectionProcessor';
import { UserService } from '../services/UserService';
import { PageService } from '../services/PageService';
import { AssetService } from '../services/AssetService';
import { S3Service } from '../services/S3Service';
import { ImageUtil } from '../../utils/ImageUtil';

@JsonController('/recommend')
export class RecommendController {

    constructor(
        private userFollowService: UserFollowService,
        private postsService: PostsService,
        private hashTagService: HashTagService,
        private userService: UserService,
        private pageService: PageService,
        private assetService: AssetService,
        private s3Service: S3Service
    ) { }

    // Get Recommend API
    /**
     * @api {get} /api/recommend/ Get Recommend API
     * @apiGroup UserAccess
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Recommend"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/recommend
     * @apiErrorExample {json} error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get()
    public async getRecomend(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParams() options: any, @Req() req: any, @Res() res: any): Promise<any> {
        // const result: RecommendResponse[] = [];
        const result: any = [];
        // const randomData: RecommendResponse = new RecommendResponse();
        const userId = req.headers.userid;
        // const clientId = req.headers['client-id'];
        // const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        let userObjId = null;

        if (userId !== null && userId !== undefined && userId !== '') {
            userObjId = new ObjectID(userId);
        }
        // Recommend can be Page or User
        // 1. Score from UserEngagement which is not followed user

        if (userObjId !== null) {
            // user login mode
            // const notPageFollowedFilter: SearchFilter = new SearchFilter();
            // notPageFollowedFilter.whereConditions = {};
            // const notUserFollowedFilter: SearchFilter = new SearchFilter();
            // notUserFollowedFilter.whereConditions = {};

            // search followed user
            const fwhereConditions: any = {
                userId: userObjId,
                banned: false,
                isAdmin: false
            };

            const followResult: any = await this.userFollowService.search(undefined, undefined, ['subjectId', 'subjectType'], undefined, fwhereConditions, undefined, false);
            const orUserConditions = [];
            const orPageConditions = [];

            orUserConditions.push(new ObjectID(userObjId));

            for (const followObj of followResult) {
                if (followObj.subjectType === SUBJECT_TYPE.USER) {
                    orUserConditions.push(new ObjectID(followObj.subjectId));
                }
                if (followObj.subjectType === SUBJECT_TYPE.PAGE) {
                    orPageConditions.push(new ObjectID(followObj.subjectId));
                }
            }

            let isRandomUser = false;
            let isRandomPage = false;

            if (options !== undefined) {
                if (options.isRandomUser !== undefined && typeof options.isRandomUser === 'string') {
                    if ('TRUE' === options.isRandomUser.toUpperCase()) {
                        isRandomUser = true;
                    }
                }
                if (options.isRandomPage !== undefined && typeof options.isRandomPage === 'string') {
                    if ('TRUE' === options.isRandomPage.toUpperCase()) {
                        isRandomPage = true;
                    }
                }
            }

            // random limit  
            const limitData = limit ? limit : 3;
            const randomLimitUser = Math.floor(Math.random() * limitData) + 1;
            const randomLimitPage = limitData - randomLimitUser;
            if (isRandomUser) {
                const stmt = [];
                stmt.push({ $match: { _id: { $nin: orUserConditions } } },
                    { $sample: { size: randomLimitUser } },
                    { $skip: offset ? offset : 0 },
                    {
                        $project: { _id: 1, displayName: 1, imageURL: 1, email: 1, username: 1, uniqueId: 1 },
                    }
                );
                const userFollow = await this.userService.aggregate(stmt);
                for (const user of userFollow) {
                    const signURL = await ImageUtil.generateAssetSignURL(this.assetService, user.imageURL, { prefix: '/file/' });
                    Object.assign(user, { signURL: (signURL ? signURL : '') });
                    Object.assign(user, { type: 'USER' });
                    result.push(user);
                }
            }

            if (isRandomPage) {
                const stmt = [];
                // stmt.push({ $match: { $or: [{ _id: { $nin: orUserConditions } }, { _id: { $nin: orPageConditions } }] } },
                stmt.push({ $match: { _id: { $nin: orPageConditions } } },
                    { $sample: { size: randomLimitPage } },
                    { $skip: offset ? offset : 0 },
                    {
                        $project: { _id: 1, name: 1, imageURL: 1, email: 1, isOfficial: 1, pageUsername: 1, uniqueId: 1 },
                    }
                );
                const pageFollow = await this.pageService.aggregate(stmt);
                for (const page of pageFollow) {
                    const signURL = await ImageUtil.generateAssetSignURL(this.assetService, page.imageURL, { prefix: '/file/' });
                    Object.assign(page, { signURL: (signURL ? signURL : '') });
                    Object.assign(page, { type: 'PAGE' });
                    result.push(page);
                }
            }

            if (!isRandomPage && !isRandomUser) {
                const stmt = [
                    { $match: { $or: [{ $and: [{ _id: { $nin: orUserConditions } }, { _id: { $nin: orPageConditions } }, { isAdmin: false }, { banned: false }] }] } },
                    { $sample: { size: randomLimitUser } },
                    { $skip: offset ? offset : 0 },
                    { $project: { _id: 1, displayName: 1, imageURL: 1, email: 1, username: 1, uniqueId: 1 } }
                ];
                const userFollow = await this.userService.aggregate(stmt);
                for (const data of userFollow) {
                    const signURL = await ImageUtil.generateAssetSignURL(this.assetService, data.imageURL, { prefix: '/file/' });
                    let isFollowed = false;
                    if (userObjId !== null && userObjId !== undefined) {
                        const follow = await this.userFollowService.find({ userId: userObjId, subjectType: SUBJECT_TYPE.USER, subjectId: data._id });
                        isFollowed = (follow !== undefined && follow.length > 0) ? true : false;
                    }

                    Object.assign(data, { signURL: (signURL ? signURL : '') });
                    Object.assign(data, { type: 'USER' });
                    Object.assign(data, { isFollowed });
                    result.push(data);
                }

                const stmtPage = [
                    { $match: { banned: false } },
                    { $sample: { size: randomLimitPage } },
                    { $skip: offset ? offset : 0 },
                    {
                        $project: { _id: 1, name: 1, imageURL: 1, email: 1, isOfficial: 1, pageUsername: 1 },
                    }
                ];
                const pageFollow = await this.pageService.aggregate(stmtPage);
                for (const data of pageFollow) {
                    const signURL = await ImageUtil.generateAssetSignURL(this.assetService, data.imageURL, { prefix: '/file/' });
                    let isFollowed = false;
                    if (userObjId !== null && userObjId !== undefined) {
                        const parseData: any = data;
                        const follow = await this.userFollowService.find({ userId: userObjId, subjectType: SUBJECT_TYPE.PAGE, subjectId: parseData._id });
                        isFollowed = (follow !== undefined && follow.length > 0) ? true : false;
                    }

                    Object.assign(data, { signURL: (signURL ? signURL : '') });
                    Object.assign(data, { type: 'PAGE' });
                    Object.assign(data, { isFollowed });
                    result.push(data);
                }
            }

            // add in filter
            // notUserFollowedFilter.whereConditions.userId = userObjId;
            // notUserFollowedFilter.whereConditions.contentType = ENGAGEMENT_CONTENT_TYPE.USER;
            // notUserFollowedFilter.whereConditions.contentId = {
            //     $nin: orUserConditions
            // };
            // notUserFollowedFilter.whereConditions.action = {
            //     $in: [ENGAGEMENT_ACTION.VIEW, ENGAGEMENT_ACTION.TAG, ENGAGEMENT_ACTION.CLICK, ENGAGEMENT_ACTION.LIKE, ENGAGEMENT_ACTION.SEARCH]
            // };

            // notPageFollowedFilter.whereConditions.userId = userObjId;
            // notPageFollowedFilter.whereConditions.contentType = ENGAGEMENT_CONTENT_TYPE.PAGE;
            // notPageFollowedFilter.whereConditions.contentId = {
            //     $nin: orPageConditions
            // };
            // notPageFollowedFilter.whereConditions.action = {
            //     $in: [ENGAGEMENT_ACTION.VIEW, ENGAGEMENT_ACTION.TAG, ENGAGEMENT_ACTION.CLICK, ENGAGEMENT_ACTION.LIKE, ENGAGEMENT_ACTION.SEARCH]
            // }; 

            // const userFolEnResult = await this.userEngagementService.search(undefined, undefined, undefined, undefined, notUserFollowedFilter.whereConditions, undefined, false);
            // console.log(userFolEnResult);

            // const pageFolEnResult = await this.userEngagementService.search(undefined, undefined, undefined, undefined, notPageFollowedFilter.whereConditions, undefined, false);
            // console.log(pageFolEnResult);
        } else {
            // guest mode   
            const limitData = limit ? limit : 3;
            const randomLimitUser = Math.floor(Math.random() * limitData) + 1;
            const randomLimitPage = limitData - randomLimitUser;

            const stmt = [
                { $match: { $and: [{ isAdmin: false }, { banned: false }, { isAdmin: false }] } },
                { $sample: { size: randomLimitUser } },
                { $skip: offset ? offset : 0 },
                {
                    $project: { _id: 1, displayName: 1, imageURL: 1, email: 1, username: 1, uniqueId: 1 },
                }
            ];
            const userFollow = await this.userService.aggregate(stmt);
            for (const data of userFollow) {
                const signURL = await ImageUtil.generateAssetSignURL(this.assetService, data.imageURL, { prefix: '/file/' });
                Object.assign(data, { signURL: (signURL ? signURL : '') });
                Object.assign(data, { type: 'USER' });
                result.push(data);
            }

            const stmtPage = [
                { $match: { banned: false } },
                { $sample: { size: randomLimitPage } },
                { $skip: offset ? offset : 0 },
                {
                    $project: { _id: 1, name: 1, imageURL: 1, email: 1, isOfficial: 1, pageUsername: 1 },
                }
            ];
            const pageFollow = await this.pageService.aggregate(stmtPage);
            for (const data of pageFollow) {
                const signURL = await ImageUtil.generateAssetSignURL(this.assetService, data.imageURL, { prefix: '/file/' });
                Object.assign(data, { signURL: (signURL ? signURL : '') });
                Object.assign(data, { type: 'PAGE' });
                result.push(data);
            }

        }

        const successResponse = ResponseUtil.getSuccessResponse('Successfully get User Page Access', result);
        return res.status(200).send(successResponse);
    }

    /**
     * @api {get} /api/recommend/story Get Page story API
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
     * @apiSampleRequest /api/recommend/story
     * @apiErrorExample {json} Cannot get PagePost Recommended Story
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/story')
    public async getRecommendedStory(@QueryParams() param: RecommendStoryParam, @Res() res: any): Promise<any> {
        let result: any = undefined;
        const data: any = {
            postId: param.postId,
            pageId: param.pageId,
            hashTag: param.hashTag
        };

        let limit = undefined;
        let offset = undefined;
        if (param.limit !== undefined && param.limit !== null) {
            if (typeof param.limit === 'string') {
                limit = Number(param.limit);
            } else {
                limit = param.limit;
            }
        }
        if (param.offset !== undefined && param.offset !== null) {
            if (typeof param.offset === 'string') {
                offset = Number(param.offset);
            } else {
                offset = param.offset;
            }
        }

        const config: any = {
            limit,
            offset
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
}