/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { FulfillmentService } from '../services/FulfillmentService';
import { Fulfillment } from '../models/Fulfillment';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';

@JsonController('/fulfillment')
export class FulfillmentController {
    constructor(private fulfillmentService: FulfillmentService) { }

    // Find Fulfillment API
    /**
     * @api {get} /api/fulfillment/:id Find Fulfillment API
     * @apiGroup Fulfillment
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Fulfillment"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment/:id
     * @apiErrorExample {json} Fulfillment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findFulfillment(@Param('id') id: string, @Res() res: any): Promise<any> {
        let fulfillmentStmt;
        let objId;

        try {
            objId = new ObjectID(id);
            fulfillmentStmt = { _id: objId };
        } catch (ex) {
            fulfillmentStmt = { title: id };
        } finally {
            fulfillmentStmt = { $or: [{ _id: objId }, { title: id }] };
        }

        const fulfillment: Fulfillment = await this.fulfillmentService.findOne(fulfillmentStmt);

        if (fulfillment) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got Fulfillment', fulfillment);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Fulfillment', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/fulfillment Create Fulfillment API
     * @apiGroup Fulfillment
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "category" : [
     *          {
     *              "name": "",
     *              "description": ""
     *          }
     *      ]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create Fulfillment",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment
     * @apiErrorExample {json} Unable create Fulfillment
     * HTTP/1.1 500 Internal Server Error
     */
    /*
    @Post('/')
    @Authorized('user')
    public async createFulfillment(@Body({ validate: true }) fulfillments: CreateFulfillmentRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const data: Fulfillment = await this.fulfillmentService.findOne({ where: { name: fulfillments.name } });
        const username = req.user.id;

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('Fulfillment is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const fulfillment: Fulfillment = new Fulfillment();
        fulfillment.name = fulfillments.name;
        fulfillment.post = fulfillments.post;
        fulfillment.need = fulfillments.need;
        fulfillment.status = FULFILLMENT_STATUS.PENDING;
        fulfillment.user = username;

        const result: Fulfillment = await this.fulfillmentService.create(fulfillment);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create Fulfillment', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create Fulfillment', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    */

    // Search Fulfillment
    /**
     * @api {post} /api/fulfillment/search Search Fulfillment API
     * @apiGroup Fulfillment
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get fulfillment search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/fulfillment/search
     * @apiErrorExample {json} Search Fulfillment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchFulfillment(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const needsLists: any = await this.fulfillmentService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (needsLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Fulfillment', needsLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Fulfillment', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update Fulfillment API
    /**
     * @api {put} /api/fulfillment/:id Update Fulfillment API
     * @apiGroup Fulfillment
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Fulfillment.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment/:id
     * @apiErrorExample {json} Update Fulfillment error
     * HTTP/1.1 500 Internal Server Error
     */
    /*
    @Put('/:id')
    @Authorized('user')
    public async updateFulfillment(@Body({ validate: true }) fulfillment: UpdateFulfillmentRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const objId = new ObjectID(id);

            const fulfillmentUpdate: Fulfillment = await this.fulfillmentService.findOne({ where: { _id: objId } });

            if (!fulfillmentUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid Fulfillment Id', undefined));
            }

            if (fulfillment.name === null || fulfillment.name === undefined) {
                fulfillment.name = fulfillmentUpdate.name;
            }

            if (fulfillment.status === null || fulfillment.status === undefined) {
                fulfillment.status = fulfillmentUpdate.status;
            }

            if (fulfillment.post === null || fulfillment.post === undefined) {
                fulfillment.post = fulfillmentUpdate.post;
            }

            if (fulfillment.need === null || fulfillment.need === undefined) {
                fulfillment.need = fulfillmentUpdate.need;
            }

            const updateQuery = { _id: objId };
            const newValue = {
                $set: {
                    name: fulfillment.name,
                    status: fulfillment.status,
                    post: fulfillment.post,
                    need: fulfillment.need,
                    updateDate: moment().toDate()
                }
            };

            const fulfillmentSave = await this.fulfillmentService.update(updateQuery, newValue);

            if (fulfillmentSave) {
                const fulfillmentUpdated: Fulfillment = await this.fulfillmentService.findOne({ where: { _id: objId } });
                return res.status(200).send(ResponseUtil.getSuccessResponse('Update Fulfillment Successful', fulfillmentUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update Fulfillment', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }
    */

    /**
     * @api {delete} /api/fulfillment/:id Delete Fulfillment API
     * @apiGroup Fulfillment
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete Fulfillment.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment/:id
     * @apiErrorExample {json} Delete Fulfillment Error
     * HTTP/1.1 500 Internal Server Error
     */
    /*
    @Delete('/:id')
    @Authorized('user')
    public async deleteFulfillment(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const fulfillment: Fulfillment = await this.fulfillmentService.findOne({ where: { _id: objId } });

        if (!fulfillment) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid Fulfillment Id', undefined));
        }

        const query = { _id: objId };
        const deleteFulfillment = await this.fulfillmentService.delete(query);

        if (deleteFulfillment) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete Fulfillment', []));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete Fulfillment', undefined));
        }
    }
    */
} 
