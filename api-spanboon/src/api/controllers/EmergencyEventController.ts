/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body } from 'routing-controllers';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { ObjectID } from 'mongodb';
import { ObjectUtil, ResponseUtil } from '../../utils/Utils';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { HashTagService } from '../services/HashTagService';
import { HashTag } from '../models/HashTag';
import { FindHashTagRequest } from './requests/FindHashTagRequest';

@JsonController('/emergency')
export class EmergencyEventController {
    constructor(private emergencyEventService: EmergencyEventService, private hashTagService: HashTagService) { }

    // Find EmergencyEvent API
    /**
     * @api {get} /api/emergency/:id Find EmergencyEvent API
     * @apiGroup EmergencyEvent
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get EmergencyEvent"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/emergency/:id
     * @apiErrorExample {json} EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findEmergencyEvent(@Param('id') id: string, @Res() res: any): Promise<any> {
        let emergencyEventStmt;
        let objId;

        try {
            objId = new ObjectID(id);
            emergencyEventStmt = { _id: objId };
        } catch (ex) {
            emergencyEventStmt = { title: id };
        } finally {
            emergencyEventStmt = { $or: [{ _id: objId }, { title: id }] };
        }

        const emergencyEvent: EmergencyEvent = await this.emergencyEventService.findOne(emergencyEventStmt);

        if (emergencyEvent) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got EmergencyEvent', emergencyEvent);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got EmergencyEvent', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search EmergencyEvent
    /**
     * @api {post} /api/emergency/search Search EmergencyEvent API
     * @apiGroup EmergencyEvent
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get emergencyEvent search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/emergency/search
     * @apiErrorExample {json} Search EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchEmergencyEvent(@Body({ validate: true }) search: FindHashTagRequest, @Res() res: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Search EmergencyEvent', undefined));
        }

        const filter = search.filter;
        const hashTag = search.hashTag;
        const hashTagIdList = [];
        const hashTagMap = {};

        if (hashTag !== null && hashTag !== undefined && hashTag !== '') {
            filter.whereConditions = { name: { $regex: '.*' + hashTag + '.*', $options: 'si' } };
        } else {
            filter.whereConditions = {};
        }

        const hashTagList: HashTag[] = await this.hashTagService.search(filter);

        if (hashTagList !== null && hashTagList !== undefined && hashTagList.length > 0) {
            for (const masterHashTag of hashTagList) {
                const id = masterHashTag.id;
                hashTagMap[id] = masterHashTag;
                hashTagIdList.push(new ObjectID(id));
            }
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Hashtag Not Found', []);
            return res.status(200).send(successResponse);
        }

        let emergencyLists: EmergencyEvent[];

        if (hashTagIdList !== null && hashTagIdList !== undefined && hashTagIdList.length > 0) {
            emergencyLists = await this.emergencyEventService.find({ hashTag: { $in: hashTagIdList } });
        } else {
            emergencyLists = await this.emergencyEventService.find();
        }

        if (emergencyLists !== null && emergencyLists !== undefined) {
            emergencyLists.map((data) => {
                const hashTagKey = data.hashTag;
                const emergencyHashTag = hashTagMap[hashTagKey];

                if (emergencyHashTag) {
                    const hashTagName = emergencyHashTag.name;
                    data.hashTag = hashTagName;
                }
            });

            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search EmergencyEvent', emergencyLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getSuccessResponse('EmergencyEvent Not Found', undefined);
            return res.status(200).send(errorResponse);
        }
    }
} 
