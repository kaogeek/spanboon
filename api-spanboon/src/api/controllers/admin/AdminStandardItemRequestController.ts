/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { StandardItemService } from '../../services/StandardItemService';
import { StandardItemRequestService } from '../../services/StandardItemRequestService';
import { StandardItemRequest } from '../../models/StandardItemRequest';
import { StandardItem } from '../../models/StandardItem';
import { ObjectID } from 'mongodb';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { StandardItemReqRequest } from './requests/StandardItemReqRequest';
import { StandardItemReqApproveRequest } from './requests/StandardItemReqApproveRequest';
import { STANDARD_ITEM_STATUS } from '../../../constants/StandardItemStatus';
import moment from 'moment';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { STANDARDITEM_REQUEST_LOG_ACTION, LOG_TYPE } from '../../../constants/LogsAction';

@JsonController('/admin/item_request')
export class AdminStandardItemRequestController {
    constructor(
        private standardItemReqService: StandardItemRequestService,
        private standardItemService: StandardItemService,
        private actionLogService: AdminUserActionLogsService
    ) { }

    // Find Admin StandardItemRequest API
    /**
     * @api {get} /api/admin/item_request/:id Find Admin StandardItemRequest API
     * @apiGroup Admin StandardItemRequest
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully getting StandardItemRequest"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/standarditem/:id
     * @apiErrorExample {json}  error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    @Authorized()
    public async findAdminStandardItemRequest(@Param('id') id: string, @Res() res: any): Promise<any> {
        const objId = new ObjectID(id);

        const item = await this.standardItemReqService.findOne({ where: { _id: objId } });

        if (item) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully getting StandardItem', item);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/item_request Create StandardItem Request API
     * @apiGroup Admin StandardItem
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create StandardItem Request",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_request
     * @apiErrorExample {json} Unable create StandardItem Request
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createStandardItemRequest(@Body({ validate: true }) itemRequest: StandardItemReqRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const data = await this.standardItemService.findOne({ where: { name: itemRequest.name } });

        // search for standard item.
        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const itemReqExist = await this.standardItemReqService.findOne({ where: { name: itemRequest.name, username: req.user.username } });

        // search for standard item req by user.
        if (itemReqExist) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request is Exists', itemReqExist);
            return res.status(400).send(errorResponse);
        }

        const userObjId = new ObjectID(req.user.id);

        const item: StandardItemRequest = new StandardItemRequest();
        item.name = itemRequest.name;
        item.description = itemRequest.description;
        item.username = req.user.username;
        item.userId = userObjId;
        item.status = STANDARD_ITEM_STATUS.PENDING;

        const result = await this.standardItemReqService.create(item);

        if (result) {
            const objId = new ObjectID(result.id);
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = STANDARDITEM_REQUEST_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM_REQUEST;
            adminLogs.ip = ipAddress;
            adminLogs.data = result;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create StandardItem Request', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create StandardItem Request', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update StandardItem API
    /**
     * @api {put} /api/admin/item_request/:id Update StandardItem Request API
     * @apiGroup Admin StandardItem
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated StandardItem Request.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_request/:id
     * @apiErrorExample {json} Update StandardItem Request error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updateStandardItemRequest(@Body({ validate: true }) standardItem: StandardItemReqRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const userObjId = new ObjectID(req.user.id);

        const data = await this.standardItemService.findOne({ where: { name: standardItem.name } });

        // search for standard item.
        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const itemReqExist = await this.standardItemReqService.findOne({ where: { _id: objId } });

        // search for standard item req by user.
        if (itemReqExist) {
            if (itemReqExist.approveUser !== undefined && itemReqExist.approveUser !== null) {
                const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request Has been approve.', itemReqExist);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request is not Exists.', itemReqExist);
            return res.status(400).send(errorResponse);
        }

        const updateQuery = { _id: objId };
        const newValue = { $set: { name: standardItem.name, description: standardItem.description } };
        const result = await this.standardItemReqService.update(updateQuery, newValue);

        if (!result) {
            const errorResponse = ResponseUtil.getErrorResponse('Unable update StandardItem Request', undefined);
            return res.status(400).send(errorResponse);
        } else {
            const updated: StandardItemRequest = await this.standardItemReqService.findOne({ where: { _id: objId } });

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = STANDARDITEM_REQUEST_LOG_ACTION.EDIT;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM_REQUEST;
            adminLogs.ip = ipAddress;
            adminLogs.data = updated;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully update StandardItem Request', updated);
            return res.status(200).send(successResponse);
        }
    }

    /**
     * @api {delete} /api/admin/item_request/:id Delete StandardItem Request API
     * @apiGroup Admin StandardItem Request
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete StandardItem Request.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_request/:id
     * @apiErrorExample {json} Delete StandardItem Request Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deleteStandardItemRequest(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const userObjId = new ObjectID(req.user.id);

        const item = await this.standardItemReqService.findOne({ where: { _id: objId } });

        if (!item) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Not Found', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: objId };
        const deletePage = await this.standardItemReqService.delete(query);

        if (deletePage) {
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = STANDARDITEM_REQUEST_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM_REQUEST;
            adminLogs.ip = ipAddress;
            adminLogs.data = item;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully delete StandardItem', objId);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to delete StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search StandardItem For Admin
    /**
     * @api {post} /api/admin/item_request/search Search StandardItem Request API
     * @apiGroup StandardItem Request API
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
     * @apiSampleRequest /api/admin/item_request/search
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async searchStandardItemRequest(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const standardItemLists: any = await this.standardItemReqService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (!standardItemLists) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem', undefined);
            return res.status(400).send(errorResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem', standardItemLists);
            return res.status(200).send(successResponse);
        }
    }

    /**
     * @api {post} /api/admin/item_request/approve Approve StandardItem Request API
     * @apiGroup Admin StandardItem
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "isApprove" : "boolean",
     *      "description": "string"
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Approve/Upapprove StandardItem Request",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_request
     * @apiErrorExample {json} Unable create StandardItem Request
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/approve')
    @Authorized()
    public async approveStandardItemRequest(@Body({ validate: true }) itemRequest: StandardItemReqApproveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(itemRequest.id);
        const userObjId = new ObjectID(req.user.id);

        const itemReqExist = await this.standardItemReqService.findOne({ where: { _id: objId } });

        // search for standard item req by user.
        if (itemReqExist) {
            if (itemReqExist.approveUser !== undefined && itemReqExist.approveUser !== null) {
                const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request Has been approve.', itemReqExist);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Request is not Exists', itemReqExist);
            return res.status(400).send(errorResponse);
        }

        if (itemRequest.isApprove) {
            const data = await this.standardItemService.findOne({ where: { name: itemReqExist.name } });

            // search for standard item.
            if (data) {
                const errorResponse = ResponseUtil.getErrorResponse('StandardItem is Exists', data);
                return res.status(400).send(errorResponse);
            }

            // create item
            const item: StandardItem = new StandardItem();
            item.name = itemReqExist.name;

            const createResult = await this.standardItemService.create(item);

            if (!createResult) {
                const errorResponse = ResponseUtil.getErrorResponse('Unable create StandardItem', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        const approveStatus = itemRequest.isApprove ? STANDARD_ITEM_STATUS.APPROVE : STANDARD_ITEM_STATUS.UNAPPROVE;

        const updateQuery = { _id: objId };
        const newValue = {
            $set: {
                status: approveStatus,
                approveUser: req.user.username,
                approveDateTime: moment().toDate(),
                approveDescription: itemRequest.description
            }
        };

        const updateResult = await this.standardItemReqService.update(updateQuery, newValue);

        if (updateResult) {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create StandardItem Request', undefined);
            return res.status(400).send(errorResponse);
        } else {
            const updated: StandardItemRequest = await this.standardItemReqService.findOne({ where: { _id: objId } });

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = updated.approveUser ? STANDARDITEM_REQUEST_LOG_ACTION.APPROVE : STANDARDITEM_REQUEST_LOG_ACTION.UNAPPROVE;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM_REQUEST;
            adminLogs.ip = ipAddress;
            adminLogs.data = updated;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create StandardItem Request', updated);
            return res.status(200).send(successResponse);
        }
    }
} 
