/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Authorized, Req } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PageObjectiveCategoryService } from '../services/PageObjectiveCategoryService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { UserFollow } from '../models/UserFollow';
import { UserEngagementService } from '../services/UserEngagementService';
import { PageObjectiveCategory } from '../models/PageObjectiveCategory';

@JsonController('/objective_category')
export class ObjectiveCategoryController {
    constructor(private objectiveCategoryService: PageObjectiveCategoryService, private userFollowService: UserFollowService, private userEngagementService: UserEngagementService) { }

    // Find PageObjective Category API
    /**
     * @api {get} /api/objective_category/:id Find PageObjective Category API
     * @apiGroup PageObjective Category
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PageObjective Category"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/objective_category/:id
     * @apiErrorExample {json} PageObjective Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findObjectiveCategory(@Param('id') id: string, @Res() res: any): Promise<any> {
        const objId = new ObjectID(id);

        const objectiveCat: PageObjectiveCategory = await this.objectiveCategoryService.findOne({ where: { _id: objId } });

        if (objectiveCat) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageObjective Category', objectiveCat);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PageObjective Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search PageObjective Category
    /**
     * @api {post} /api/objective_category/search Search PageObjective Category API
     * @apiGroup PageObjective Category API
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search PageObjective Category",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/objective_category/search
     * @apiErrorExample {json} PageObjective Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchObjectiveCategory(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const objectiveLists: any = await this.objectiveCategoryService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (objectiveLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search PageObjective Category', objectiveLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search PageObjective Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow PageObjective Category
    /**
     * @api {post} /api/objective_category/:id/follow Follow PageObjective Category API
     * @apiGroup StandardItemCategory
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow PageObjective Category Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/objective_category/:id/follow
     * @apiErrorExample {json} Follow PageObjective Category Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followObjectiveCategory(@Param('id') objectiveCatId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objectiveCatObjId = new ObjectID(objectiveCatId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const objectiveCatFollow: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: objectiveCatObjId, subjectType: SUBJECT_TYPE.OBJECTIVE_CATEGORY } });
        let userEngagementAction: UserEngagement;

        if (objectiveCatFollow) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: objectiveCatObjId, subjectType: SUBJECT_TYPE.OBJECTIVE_CATEGORY });
            if (unfollow) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = objectiveCatObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.OBJECTIVE_CATEGORY;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.UNFOLLOW;

                const engagement = await this.userEngagementService.findOne({ where: { contentId: objectiveCatObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.OBJECTIVE_CATEGORY, action: ENGAGEMENT_ACTION.UNFOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow PageObjective Category Success', undefined);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow PageObjective Category Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = objectiveCatObjId;
            userFollow.subjectType = SUBJECT_TYPE.OBJECTIVE_CATEGORY;

            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            if (followCreate) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = objectiveCatObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.OBJECTIVE_CATEGORY;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.FOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: objectiveCatObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.OBJECTIVE_CATEGORY, action: ENGAGEMENT_ACTION.FOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed PageObjective Category Success', followCreate);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow PageObjective Category Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
} 
