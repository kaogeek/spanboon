/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Authorized, Req, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { StandardItemCategoryService } from '../services/StandardItemCategoryService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { UserFollow } from '../models/UserFollow';
import { UserEngagementService } from '../services/UserEngagementService';
import { StandardItemService } from '../services/StandardItemService';
import { SEARCH_TYPE } from '../../constants/SearchType';
import { NeedsService } from '../services/NeedsService';
import { StandardItemCategory } from '../models/StandardItemCategory';
import { StandardItem } from '../models/StandardItem';

@JsonController('/item_category')
export class StandardItemCategoryController {
    constructor(
        private standardItemService: StandardItemService,
        private standardItemCategoryService: StandardItemCategoryService,
        private needsService: NeedsService,
        private userFollowService: UserFollowService,
        private userEngagementService: UserEngagementService
    ) { }

    // Find StandardItem Category API
    /**
     * @api {get} /api/item_category/:id Find StandardItem Category API
     * @apiGroup StandardItem Category
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get StandardItem Category"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/item_category/:id
     * @apiErrorExample {json} StandardItem Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findStandardItemCategory(@Param('id') id: string, @Res() res: any): Promise<any> {
        const objId = new ObjectID(id);

        const stdItemCat: StandardItemCategory = await this.standardItemCategoryService.findOne({ where: { _id: objId } });

        if (stdItemCat) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got StandardItem Category', stdItemCat);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got StandardItem Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search StandardItem Category
    /**
     * @api {post} /api/item_category/search Search StandardItem Category API
     * @apiGroup StandardItem Category API
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search StandardItem Category",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/item_category/search
     * @apiErrorExample {json} StandardItem Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchStandardItemCategory(@QueryParam('isTrend') isTrend: boolean, @QueryParam('pageId') pageId: string, @Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        let standardItemLists;

        if (isTrend) {
            if (pageId !== null && pageId !== undefined && pageId !== '') {
                const pageObjId = new ObjectID(pageId);

                standardItemLists = await this.needsService.aggregate([
                    {
                        $match: { pageId: pageObjId }
                    },
                    {
                        $lookup: {
                            from: 'StandardItem',
                            localField: 'standardItemId',
                            foreignField: '_id',
                            as: 'standardItems'
                        }
                    },
                    {
                        $lookup: {
                            from: 'StandardItemCategory',
                            localField: 'standardItems.category',
                            foreignField: '_id',
                            as: 'categories'
                        }
                    },
                    { $unwind: '$categories' },
                    {
                        $group: {
                            _id: '$categories.name',
                            result: { $first: '$categories' },
                            count: { $sum: 1 },
                        }
                    },
                    { $sort: { count: -1 } },
                    { $replaceRoot: { newRoot: '$result' } }
                ]);
            }
        } else {
            standardItemLists = await this.standardItemCategoryService.search(filter);
        }

        if (standardItemLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem Category', standardItemLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow StandardItem Category
    /**
     * @api {post} /api/item_category/:id/follow Follow StandardItem Category API
     * @apiGroup StandardItemCategory
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow StandardItem Category Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page/search
     * @apiErrorExample {json} Follow StandardItem Category Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/item')
    public async findStandardItemFolderAndItem(@Param('id') stdItemCatId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const stdItemCatObjId = new ObjectID(stdItemCatId);
        const stdItemCatLists: StandardItemCategory[] = await this.standardItemCategoryService.find({ where: { parent: stdItemCatObjId } });
        const search: any = {};
        const searchResults = [];
        const searchStmt = [];
        let stdItemHasCatStmt = {};

        if (stdItemCatLists.length > 0) {
            for (const stdItemCat of stdItemCatLists) {
                searchResults.push({ id: stdItemCat.id, value: stdItemCat, type: SEARCH_TYPE.STANDARDITEM_CATEGORY });
                searchStmt.push(new ObjectID(stdItemCat.id));
                stdItemHasCatStmt = { category: stdItemCatObjId };
            }
        } else {
            searchStmt.push(stdItemCatObjId);
            stdItemHasCatStmt = { category: { $in: searchStmt } };
        }

        if (searchStmt !== null && searchStmt !== undefined && searchStmt.length > 0) {
            const stdItemHasCat: StandardItem[] = await this.standardItemService.find(stdItemHasCatStmt);
            if (stdItemHasCat.length > 0) {
                for (const stdItem of stdItemHasCat) {
                    searchResults.push({ id: stdItem.id, value: stdItem, type: SEARCH_TYPE.STANDARDITEM });
                }
            }
        }

        search.result = searchResults;

        if (search !== null && search !== undefined && Object.keys(search).length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Get Folder and Item Success', search);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Get Folder and Item Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow StandardItem Category
    /**
     * @api {post} /api/item_category/:id/follow Follow StandardItem Category API
     * @apiGroup StandardItemCategory
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow StandardItem Category Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page/search
     * @apiErrorExample {json} Follow StandardItem Category Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followStandardItemCategory(@Param('id') stdItemCatId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const stdItemCatObjId = new ObjectID(stdItemCatId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const stdItemFollow: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: stdItemCatObjId, subjectType: SUBJECT_TYPE.STANDARDITEM_CATEGORY } });
        let userEngagementAction: UserEngagement;

        if (stdItemFollow) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: stdItemCatObjId, subjectType: SUBJECT_TYPE.STANDARDITEM_CATEGORY });
            if (unfollow) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = stdItemCatObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.STANDARDITEM_CATGORY;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.UNFOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: stdItemCatObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.STANDARDITEM_CATGORY, action: ENGAGEMENT_ACTION.UNFOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow StandardItem Category Success', undefined);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow StandardItem Category Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = stdItemCatObjId;
            userFollow.subjectType = SUBJECT_TYPE.STANDARDITEM_CATEGORY;

            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            if (followCreate) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = stdItemCatObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.STANDARDITEM_CATGORY;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.FOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: stdItemCatObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.STANDARDITEM_CATGORY, action: ENGAGEMENT_ACTION.FOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed StandardItem Category Success', followCreate);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow StandardItem Category Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
} 
