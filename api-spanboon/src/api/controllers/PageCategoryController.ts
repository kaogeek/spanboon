/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Authorized, Post, Body, Req } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PageCategoryService } from '../services/PageCategoryService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { UserFollow } from '../models/UserFollow';
import { UserFollowService } from '../services/UserFollowService';
import { UserEngagementService } from '../services/UserEngagementService';
import { CreatePageCategoryRequest } from './requests/CreatePageCategoryRequest';
import { PageCategory } from '../models/PageCategory';

@JsonController('/page_category')
export class PageCategoryController {
    constructor(private pageCategoryService: PageCategoryService, private userFollowService: UserFollowService, private userEngagementService: UserEngagementService) { }

    // Find PageCategory API
    /**
     * @api {get} /api/page_category/:id Find PageCategory API
     * @apiGroup PageCategory
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PageCategory"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page_category/:id
     * @apiErrorExample {json}  error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    @Authorized()
    public async getPageCategory(@Param('id') pageCategoryId: string, @Res() res: any): Promise<any> {
        const pageCategoryObjId = new ObjectID(pageCategoryId);

        const pageCategory: PageCategory = await this.pageCategoryService.findOne({ where: { _id: pageCategoryObjId } });

        if (pageCategory) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageCategory', pageCategory);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PageCategory', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // PageCategory List API
    /**
     * @api {get} /api/page/category/:name PageCategory List API
     * @apiGroup Page Category
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Page Category",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/category
     * @apiErrorExample {json} PageCategory Profile error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:name')
    public async findPageCategory(@Param('name') catName: string, @Res() res: any): Promise<any> {
        const pageCategory: PageCategory = await this.pageCategoryService.findOne({ where: { name: catName } });

        if (pageCategory) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got pageCategory', pageCategory);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got pageCategory', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/page/category Create PageCategory API
     * @apiGroup Page Category
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} description description
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "description" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create PageCategory",
     *      "data":{
     *          "id" : "",
     *          "name" : "",
     *          "description" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/category
     * @apiErrorExample {json} Unable create PageCategory
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    public async createPageCategory(@Body({ validate: true }) pageCategories: CreatePageCategoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const data: PageCategory = await this.pageCategoryService.findOne({ where: { name: pageCategories.name } });

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('PageCategory is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const pageCategory: PageCategory = new PageCategory();
        pageCategory.name = pageCategories.name;
        pageCategory.description = pageCategories.description;

        const result: PageCategory = await this.pageCategoryService.create(pageCategory);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageCategory', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create PageCategory', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search PagePost
    /**
     * @api {post} /api/page_category/search Search PageCategory API
     * @apiGroup PageCategory
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search Page Category",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page_category/post/search
     * @apiErrorExample {json} Search Page Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchPageCategory(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const pageLists: any = await this.pageCategoryService.search(filter);

        if (pageLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Page Category', pageLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Page Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow Page Category
    /**
     * @api {post} /api/page_category/:id/follow Follow Page Category API
     * @apiGroup PageCategory
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Follow Page",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/page_category/:id/follow
     * @apiErrorExample {json} Follow Page Category Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followPageCategory(@Param('id') pageCategoryId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageCategoryObjId = new ObjectID(pageCategoryId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const pageCategoryFollow: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: pageCategoryObjId, subjectType: SUBJECT_TYPE.PAGE_CATEGORY } });
        let userEngagementAction: UserEngagement;

        if (pageCategoryFollow) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: pageCategoryObjId, subjectType: SUBJECT_TYPE.PAGE_CATEGORY });
            if (unfollow) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = pageCategoryObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.PAGE_CATEGORY;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.UNFOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: pageCategoryObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.PAGE_CATEGORY, action: ENGAGEMENT_ACTION.UNFOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }
                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow Page Success', undefined);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow Page Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = pageCategoryObjId;
            userFollow.subjectType = SUBJECT_TYPE.PAGE_CATEGORY;

            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            if (followCreate) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = pageCategoryObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.PAGE_CATEGORY;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.FOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: pageCategoryObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.PAGE_CATEGORY, action: ENGAGEMENT_ACTION.FOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed Page Category Success', followCreate);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow Page Category Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
} 
