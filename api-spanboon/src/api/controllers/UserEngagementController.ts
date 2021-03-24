/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Req, Post, Body } from 'routing-controllers';
import { ObjectID } from 'mongodb';
import { UserEngagementService } from '../services/UserEngagementService';
import { UserEngagementRequest } from './requests/UserEngagementRequest';
import { UserEngagement } from '../models/UserEngagement';
import { ResponseUtil } from '../../utils/ResponseUtil';

@JsonController('/engagement')
export class UserEngagementController {
    constructor(private userEngagementService: UserEngagementService) { }

    // Create UserEngagement API
    /**
     * @api {post} /api/engagement Create UserEngagement API
     * @apiGroup UserEngagement
     * @apiParam (Request body) {String} contentId contentId
     * @apiParam (Request body) {String} contentType contentType
     * @apiParam (Request body) {String} action action
     * @apiParam (Request body) {String} reference reference 
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Create UserEngagement"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/engagement
     * @apiErrorExample {json} UserEngagement error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    public async createEngagement(@Body({ validate: true }) userEngagementBody: UserEngagementRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId =  req.headers.userid;
        const clientId = req.headers['client-id']; 
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0]; 
        const user = await this.userEngagementService.findOne({ where: { contentId:  userEngagementBody.contentId, contentType: userEngagementBody.contentType, action: userEngagementBody.action} });
        let userEngagementAction: UserEngagement;

        const userEngagement = new UserEngagement();
        userEngagement.clientId = clientId;
        userEngagement.ip = ipAddress; 
        userEngagement.userId = userId ? new ObjectID(req.headers.userid) : '';
        userEngagement.contentId = userEngagementBody.contentId;
        userEngagement.contentType = userEngagementBody.contentType;
        userEngagement.action = userEngagementBody.action;
        userEngagement.reference = userEngagementBody.reference; 
       
        if(user){ 
            userEngagement.isFirst = false;
        } else { 
            userEngagement.isFirst = true; 
        } 

        userEngagementAction = await this.userEngagementService.create(userEngagement); 
 
        if (userEngagementAction) {
            const successResponse = ResponseUtil.getSuccessResponse('Create Engagement Success', userEngagementAction);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Create Engagement Failed', undefined);
            return res.status(400).send(errorResponse);
        }  
    }

} 
