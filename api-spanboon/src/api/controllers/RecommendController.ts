/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Req, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { RecommendResponse } from './responses/RecommendResponse';
import { UserFollowService } from '../services/UserFollowService';
import { UserEngagementService } from '../services/UserEngagementService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';

@JsonController('/recommend')
export class RecommendController {

    constructor(
        private userFollowService: UserFollowService,
        private userEngagementService: UserEngagementService
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
    public async getRecomend(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Req() req: any, @Res() res: any): Promise<any> {
        const result: RecommendResponse[] = [];
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
            const notPageFollowedFilter: SearchFilter = new SearchFilter();
            notPageFollowedFilter.whereConditions = {};
            const notUserFollowedFilter: SearchFilter = new SearchFilter();
            notUserFollowedFilter.whereConditions = {};

            // search followed user
            const fwhereConditions: any = {
                userId: userObjId
            };

            const followResult: any = await this.userFollowService.search(undefined, undefined, ['subjectId', 'subjectType'], undefined, fwhereConditions, undefined, false);

            const orUserConditions = [];
            const orPageConditions = [];
            for (const followObj of followResult) {
                if (followObj.subjectType === SUBJECT_TYPE.USER) {
                    orUserConditions.push(new ObjectID(followObj.subjectId));
                } else if (followObj.subjectType === SUBJECT_TYPE.PAGE) {
                    orPageConditions.push(new ObjectID(followObj.subjectId));
                }
            }

            // add in filter
            notUserFollowedFilter.whereConditions.userId = userObjId;
            notUserFollowedFilter.whereConditions.contentType = ENGAGEMENT_CONTENT_TYPE.USER;
            notUserFollowedFilter.whereConditions.contentId = {
                $nin: orUserConditions
            };
            notUserFollowedFilter.whereConditions.action = {
                $in: [ENGAGEMENT_ACTION.VIEW, ENGAGEMENT_ACTION.TAG, ENGAGEMENT_ACTION.CLICK, ENGAGEMENT_ACTION.LIKE, ENGAGEMENT_ACTION.SEARCH]
            };

            notPageFollowedFilter.whereConditions.userId = userObjId;
            notPageFollowedFilter.whereConditions.contentType = ENGAGEMENT_CONTENT_TYPE.PAGE;
            notPageFollowedFilter.whereConditions.contentId = {
                $nin: orPageConditions
            };
            notPageFollowedFilter.whereConditions.action = {
                $in: [ENGAGEMENT_ACTION.VIEW, ENGAGEMENT_ACTION.TAG, ENGAGEMENT_ACTION.CLICK, ENGAGEMENT_ACTION.LIKE, ENGAGEMENT_ACTION.SEARCH]
            };

            const userFolEnResult = await this.userEngagementService.search(undefined, undefined, undefined, undefined, notUserFollowedFilter.whereConditions, undefined, false);
            console.log(userFolEnResult);

            const pageFolEnResult = await this.userEngagementService.search(undefined, undefined, undefined, undefined, notPageFollowedFilter.whereConditions, undefined, false);
            console.log(pageFolEnResult);
        } else {
            // guest mode
        }

        const successResponse = ResponseUtil.getSuccessResponse('Successfully get User Page Access', result);
        return res.status(200).send(successResponse);
    }
}