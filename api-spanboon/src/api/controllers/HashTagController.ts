/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { HashTagService } from '../services/HashTagService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { PostsService } from '../services/PostsService';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { UserEngagementService } from '../services/UserEngagementService';
import { ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { SearchHashTagRequest } from './requests/SearchHashTagRequest';
import { HashTag } from '../models/HashTag';
import { MAX_SEARCH_ROWS } from '../../constants/Constants';
import moment from 'moment';
import { ConfigService } from '../services/ConfigService';
import { SEARCH_ENGAGEMENT_ACCESSIBLE_DATE, DEFAULT_SEARCH_ENGAGEMENT_ACCESSIBLE_DATE } from '../../constants/SystemConfig';
import { Config } from '../models/Config';
@JsonController('/hashtag')
export class HashTagController {
    constructor(
        private hashTagService: HashTagService,
        private postsService: PostsService,
        private engagementService: UserEngagementService,
        private configService: ConfigService
    ) { }

    // Find HashTag API
    /**
     * @api {get} /api/hashtag/:id Find HashTag API
     * @apiGroup HashTag
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get HashTag"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/hashtag/:id
     * @apiErrorExample {json} HashTag error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findHashTag(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {

        const objId = new ObjectID(id);

        const hashTag: HashTag = await this.hashTagService.findOne({ where: { _id: objId } });

        if (hashTag) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got HashTag', hashTag);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got HashTag', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search HashTag
    /**
     * @api {post} /api/hashtag/search Search HashTag API
     * @apiGroup HashTag
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get hashTag search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/hashtag/search
     * @apiErrorExample {json} hashTag error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchHashTag(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {

        if (ObjectUtil.isObjectEmpty(filter)) {
            return res.status(200).send([]);
        }

        if (filter.whereConditions !== null && filter.whereConditions !== undefined) {
            const name = filter.whereConditions.name;
            if (name !== null && name !== undefined && name !== '') {
                filter.whereConditions.name = { $regex: '.*' + name + '.*', $options: 'si' };
            } else {
                filter.whereConditions = {};
            }
        } else {
            filter.whereConditions = {};
        }

        const hashTagLists: any = await this.hashTagService.search(filter);

        if (hashTagLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search HashTag', hashTagLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search HashTag', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search HashTag In Post
    /**
     * @api {post} /api/hashtag/:id/post/search Search HashTag In Post API
     * @apiGroup HashTag
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get hashTag search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/hashtag/:id/post/search
     * @apiErrorExample {json} hashTag error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/post/search')
    public async searchHashTagInPost(@Body({ validate: true }) filter: SearchFilter, @Param('id') hashTagId: string, @Res() res: any, @Req() req: any): Promise<any> {

        const tagNames = [];
        let hashTagInPosts: HashTag;

        try {
            const hashTagObjId = new ObjectID(hashTagId);
            hashTagInPosts = await this.hashTagService.findOne({ where: { _id: hashTagObjId } });
        } catch (ex) {
            hashTagInPosts = await this.hashTagService.findOne({ where: { name: hashTagId } });
        }

        if (hashTagInPosts) {
            tagNames.push(hashTagInPosts.name);

            filter.whereConditions = { postPageHashTags: { $in: tagNames } };
            const postsList: any = await this.postsService.search(filter);

            if (postsList) {
                const successResponse = ResponseUtil.getSuccessResponse('Successfully Search HashTag In Post', postsList);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot Search HashTag In Post', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    // Search Trend HashTag
    /**
     * @api {post} /api/hashtag/trend Search Trend HashTag API
     * @apiGroup HashTag
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get hashTag search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/hashtag/trend
     * @apiErrorExample {json} hashTag error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/trend')
    public async searchTrendHashTag(@Body({ validate: true }) search: SearchHashTagRequest, @Res() res: any, @Req() req: any): Promise<any> {

        let name;
        let limit;
        let offset;
        const action = ENGAGEMENT_ACTION.TAG;

        if (search !== null && search !== undefined) {
            limit = search.filter.limit;
            offset = search.filter.offset;

            if (search.filter.whereConditions !== null && search.filter.whereConditions !== undefined) {
                name = search.filter.whereConditions.name;
            }
        }

        const uId = req.header.userid;
        const contentIdList = [];
        const hashTagList = [];
        const hashTagNameList = [];

        const hashTagTrends = await this.searchEngagementHashTag(uId, name, limit, offset, action);

        if (hashTagTrends !== null && hashTagTrends !== undefined && hashTagTrends.length > 0) {
            for (const hashTag of hashTagTrends) {
                const contentId = hashTag.contentId;
                const value = hashTag._id;
                const label = '#' + value;
                const type = hashTag.result.action;
                const count = hashTag.count;

                contentIdList.push(new ObjectID(contentId));
                hashTagNameList.push(value);
                hashTagList.push({ value, label, type, count });
            }
        }

        // search more ?
        // let isSearchMore = false;
        // if (limit !== undefined && hashTagList.length < limit) {
        //     isSearchMore = true;
        //     limit = limit - hashTagList.length;
        // }

        // if (isSearchMore) {
        //     let hashTags;

        //     if (hashTagNameList !== null && hashTagNameList !== undefined && hashTagNameList.length > 0) {
        //         hashTags = await this.searchMasterHashTag(name, limit, hashTagNameList);
        //     } else {
        //         hashTags = await this.searchMasterHashTag(name, limit);
        //     }

        //     console.log('hashTags >>>> ', hashTags);

        //     if (hashTags !== null && hashTags !== undefined && hashTags.length > 0) {
        //         for (const hashTag of hashTags) {
        //             const value = hashTag.name;
        //             const label = '#' + value;
        //             const type = ENGAGEMENT_ACTION.TAG;
        //             const count = hashTag.count;
        //             hashTagList.push({ value, label, type, count });
        //         }
        //     }
        // }

        if (hashTagList !== null && hashTagList !== undefined && hashTagList.length > 0) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Search Trend HashTag Success', hashTagList));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Trend HashTag Not Found', []));
        }
    }

    private async searchEngagementHashTag(uId: string, name: string, limit: number, offset: number, action: string): Promise<any> {
        const engStmt: any[] = [];
        const accDate = await this.getAccessibleDateConfig();
        const date: Date = moment().subtract(accDate, 'd').toDate();

        if (uId !== null && uId !== undefined && uId !== '') {
            const userObjId = new ObjectID(uId);
            engStmt.push({ $match: { userId: userObjId, createdDate: { $gte: date }, action } });
        } else {
            engStmt.push({ $match: { action, createdDate: { $gte: date } } });
        }

        if (engStmt !== null && engStmt !== undefined && engStmt.length > 0) {
            engStmt.push(
                { $group: { _id: '$reference', count: { $sum: 1 }, result: { $first: '$$ROOT' } } },
                { $sort: { count: -1 } }
            );
        }

        if (name !== null && name !== undefined && name !== '') {
            engStmt.push({ $match: { _id: { $regex: '.*' + name + '.*', $options: 'si' } } });
        }

        if (offset !== undefined) {
            engStmt.push({ $skip: offset });
        }

        if (limit === 0 || limit === null || limit === undefined) {
            limit = MAX_SEARCH_ROWS;
            engStmt.push({ $limit: limit });
        } else {
            engStmt.push({ $limit: limit });
        }

        return await this.engagementService.aggregate(engStmt);
    }

    // private async searchMasterHashTag(name: string, limit: number, hashTagNameList?: any[]): Promise<any> {
    //     const htStmt: any[] = [];

    //     if (hashTagNameList !== null && hashTagNameList !== undefined && hashTagNameList.length > 0) {
    //         htStmt.push({ $match: { name: { $not: { $in: hashTagNameList } } } });
    //     }

    //     if (name !== null && name !== undefined && name !== '') {
    //         htStmt.push({ $match: { name: { $regex: '.*' + name + '.*', $options: 'si' } } });
    //     }

    //     if ((hashTagNameList !== null && hashTagNameList !== undefined && hashTagNameList.length > 0) && (name !== null && name !== undefined && name !== '')) {
    //         htStmt.push({ $match: { $and: [{ name: { $not: { $in: hashTagNameList } } }, { name: { $regex: '.*' + name + '.*', $options: 'si' } }] } });
    //     }

    //     if (limit === 0 || limit === null || limit === undefined) {
    //         limit = MAX_SEARCH_ROWS;
    //         htStmt.push({ $limit: limit });
    //     } else {
    //         htStmt.push({ $limit: limit });
    //     }

    //     htStmt.push({ $sort: { lastActiveDate: -1 } });

    //     return await this.hashTagService.aggregate(htStmt);
    // }

    private async getAccessibleDateConfig(): Promise<any> {
        let accessibleDate: any = DEFAULT_SEARCH_ENGAGEMENT_ACCESSIBLE_DATE;

        const config: Config = await this.configService.getConfig(SEARCH_ENGAGEMENT_ACCESSIBLE_DATE);
        if (config !== undefined) {
            accessibleDate = config.value;
        }

        return accessibleDate;
    }
}
