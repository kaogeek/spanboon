/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Req, Body, Authorized, Put } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { StandardItemRequestService } from '../services/StandardItemRequestService';
import { StandardItemService } from '../services/StandardItemService';
import { StandardItemRequest } from '../models/StandardItemRequest';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { CreateStandardItemRequest } from './requests/CreateStandardItemRequest';
import { STANDARD_ITEM_STATUS } from '../../constants/StandardItemStatus';

@JsonController('/item_request')
export class StandardItemRequestController {
    constructor(
        private standardItemReqService: StandardItemRequestService,
        private standardItemService: StandardItemService
    ) { }

    // Find StandardItemRequest API
    /**
     * @api {get} /api/item_request/:id Find StandardItemRequest API
     * @apiGroup StandardItem
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get StandardItem"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/item_request/:id
     * @apiErrorExample {json} StandardItem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    @Authorized('user')
    public async findStandardReqItem(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);

        const standardItem: StandardItemRequest = await this.standardItemReqService.findOne({ where: { _id: objId, username: req.user.username } });

        if (standardItem) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got StandardItem', standardItem);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Create StandardItemRequest
    /**
     * @api {post} /api/item_request/ Request to Create StandardItem API
     * @apiGroup StandardItem API
     * @apiParam (Request body) {string} name name
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get standarditem search",
     *    "data":{
     *    "name" : "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/item_request/
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized('user')
    public async requestStadardItem(@Body({ validate: true }) itemRequest: CreateStandardItemRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const data: StandardItemRequest = await this.standardItemService.findOne({ where: { name: itemRequest.name } });

        // search for standard item.
        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const itemReqExist: StandardItemRequest = await this.standardItemReqService.findOne({ where: { name: itemRequest.name, username: req.user.username } });

        // search for standard item req by user.
        if (itemReqExist) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request is Exists', itemReqExist);
            return res.status(400).send(errorResponse);
        }

        const item: StandardItemRequest = new StandardItemRequest();
        item.name = itemRequest.name;
        item.description = itemRequest.description;
        item.username = req.user.username;
        item.userId = req.user.id;
        item.status = STANDARD_ITEM_STATUS.PENDING;

        const result: StandardItemRequest = await this.standardItemReqService.create(item);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create StandardItem Request', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create StandardItem Request', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Edit StandardItemRequest
    /**
     * @api {put} /api/item_request/:id Request to Create StandardItem API
     * @apiGroup StandardItem API
     * @apiParam (Request body) {string} name name
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get standarditem search",
     *    "data":{
     *    "name" : "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/item_request/:id
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized('user')
    public async editRequestStadardItem(@Body({ validate: true }) itemRequest: CreateStandardItemRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);

        const data: StandardItemRequest = await this.standardItemService.findOne({ where: { name: itemRequest.name } });

        // search for standard item.
        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const itemReqExist: StandardItemRequest = await this.standardItemReqService.findOne({ where: { _id: objId } });

        // search for standard item req by user.
        if (itemReqExist) {
            if (itemReqExist.approveUser !== undefined && itemReqExist.approveUser !== null) {
                const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request Has been approve.', itemReqExist);
                return res.status(400).send(errorResponse);
            }

            if (itemReqExist.username !== req.username) {
                const errorResponse = ResponseUtil.getErrorResponse('Allow only own request for editing.', itemReqExist);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request is not Exists.', itemReqExist);
            return res.status(400).send(errorResponse);
        }

        const updateQuery = { _id: objId };
        const newValue = {
            $set: {
                name: itemRequest.name,
                description: itemRequest.description
            }
        };

        const result = await this.standardItemReqService.update(updateQuery, newValue);

        if (result) {
            const updated: StandardItemRequest = await this.standardItemReqService.findOne({ where: { _id: objId } });

            const successResponse = ResponseUtil.getSuccessResponse('Successfully update StandardItem Request', updated);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable update StandardItem Request', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search StandardItemRequest
    /**
     * @api {post} /api/item_request/search Search StandardItemRequest API
     * @apiGroup StandardItem API
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get standarditem search",
     *    "data":{
     *      "limit" : "number",
     *      "offset": "number",
     *      "select": "any",
     *      "relation": "any",
     *      "whereConditions": "any",
     *      "orderBy": "any",
     *      "count": "any",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/item_request/search
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized('user')
    public async searchStandardItemRequest(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        // search only owner request
        if (filter.whereConditions !== undefined && filter.whereConditions !== '') {
            filter.whereConditions.username = req.user.username;
        } else {
            filter.whereConditions = { username: req.user.username };
        }
        const standardItemLists: any = await this.standardItemReqService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (standardItemLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem', standardItemLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }
} 
