/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete, QueryParams } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { NeedsService } from '../services/NeedsService';
import { Needs } from '../models/Needs';
import { CreateNeedsRequest } from './requests/CreateNeedsRequest';
import { UpdateNeedsRequest } from './requests/UpdateNeedsRequest';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import moment from 'moment';
import { StandardItemService } from '../services/StandardItemService';
import { MAX_SEARCH_ROWS } from '../../constants/Constants';
import { LastestNeedsParam } from './params/LastestNeedsParam';
import { LastestNeedsResponse } from './responses/LastestNeedsResponse';
import { SEARCH_TYPE } from '../../constants/SearchType';

@JsonController('/needs')
export class NeedsController {
    constructor(private needsService: NeedsService, private stdItemService: StandardItemService) { }

    // Find Needs API
    /**
     * @api {get} /api/needs/lastest Find Lastest Needs API
     * @apiGroup Needs
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get  Needs"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/needs/lastest
     * @apiErrorExample {json} Needs error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/lastest')
    public async getLastestNeeds(@QueryParams() params: LastestNeedsParam, @Res() res: any): Promise<any> {
        try {
            const limit = params.limit;
            const offset = params.offset;
            const pageId = params.pageId;

            if (pageId !== null && pageId !== undefined && pageId !== '') {
                const lastestNedsStmt: any[] = [
                    { $match: { pageId: new ObjectID(pageId), standardItemId: { $ne: null }, active: true } },
                    {
                        $lookup: {
                            from: 'StandardItem',
                            localField: 'standardItemId',
                            foreignField: '_id',
                            as: 'standardItems'
                        }
                    },
                    {
                        $unwind: {
                            path: '$standardItems',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: 'StandardItemCategory',
                            localField: 'standardItems.category',
                            foreignField: '_id',
                            as: 'itemCategory'
                        }
                    },
                    {
                        $unwind: {
                            path: '$itemCategory',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $group: {
                            _id: '$standardItemId',
                            result: { $mergeObjects: '$$ROOT' },
                        }
                    },
                    { $sort: { 'result.createdDate': -1 } }
                ];

                if (limit === null || limit === undefined || limit === 0) {
                    lastestNedsStmt.push({ $limit: MAX_SEARCH_ROWS });
                } else {
                    lastestNedsStmt.push({ $limit: limit });
                }

                if (offset !== null && offset !== undefined) {
                    lastestNedsStmt.push({ $skip: offset });
                }

                const lastestNeeds: any[] = await this.needsService.aggregate(lastestNedsStmt);

                if (lastestNeeds !== null && lastestNeeds !== undefined && lastestNeeds.length > 0) {
                    const lastestNeedsList = [];

                    for (const needs of lastestNeeds) {
                        const lastestNeedsResponse: LastestNeedsResponse = new LastestNeedsResponse();
                        lastestNeedsResponse.id = needs.result.standardItemId;
                        lastestNeedsResponse.type = SEARCH_TYPE.STANDARDITEM;
                        lastestNeedsResponse.value = {
                            id: needs.result.standardItemId,
                            category: needs.result.itemCategory._id,
                            createdDate: needs.result.createdDate,
                            imageURL: needs.result.standardItems.imageURL,
                            name: needs.result.name,
                            unit: needs.result.unit
                        };

                        lastestNeedsList.push(lastestNeedsResponse);
                    }

                    return res.status(200).send(ResponseUtil.getSuccessResponse('Get Lastest Needs Success', lastestNeedsList));
                } else {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Lastest Needs Not Found', []));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Get Lastest Needs', undefined));
            }
        } catch (error: any) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Get Lastest Needs Error', error.message));
        }
    }

    // Find Needs API
    /**
     * @api {get} /api/needs/:id Find Needs API
     * @apiGroup Needs
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Needs"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/needs/:id
     * @apiErrorExample {json} Needs error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findNeeds(@Param('id') id: string, @Res() res: any): Promise<any> {
        let needs: any;
        let objId: ObjectID;

        try {
            objId = new ObjectID(id);
            needs = await this.needsService.findOne({ _id: objId });
        } catch (ex) {
            needs = await this.needsService.findOne({ title: id });
        } finally {
            needs = await this.needsService.findOne({ $or: [{ _id: objId }, { title: id }] });
        }

        if (needs !== null && needs !== undefined) {
            const standardItemId = needs.standardItemId;

            if (standardItemId !== null && standardItemId !== undefined && standardItemId !== '') {
                const stdItems: any[] = await this.stdItemService.aggregate([
                    { $match: { _id: new ObjectID(standardItemId) } },
                    {
                        $lookup: {
                            from: 'StandardItemCategory',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'itemCategory'
                        }
                    },
                    {
                        $unwind: {
                            path: '$itemCategory',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $project: { category: { id: '$itemCategory._id', name: '$itemCategory.name' } } }
                ]);

                if (stdItems !== null && stdItems !== undefined && stdItems.length > 0) {
                    for (const item of stdItems) {
                        const category = item.category;

                        if (category !== null && category !== undefined && category !== '') {
                            needs.category = category;
                        } else {
                            needs.category = null;
                        }
                    }
                }
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully got Needs', needs);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Needs', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/needs Create Needs API
     * @apiGroup Needs
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
     *      "message": "Successfully create Needs",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/needs
     * @apiErrorExample {json} Unable create Needs
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized('user')
    public async createNeeds(@Body({ validate: true }) need: CreateNeedsRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const data: Needs = await this.needsService.findOne({ where: { name: need.name } });

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('Needs is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const needs: Needs = new Needs();
        needs.name = need.name;
        needs.active = true;
        needs.fullfilled = false;
        needs.quantity = need.quantity;

        const result: Needs = await this.needsService.create(needs);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create Needs', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create Needs', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search Needs
    /**
     * @api {post} /api/needs/search Search Needs API
     * @apiGroup Needs
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get needs search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/needs/search
     * @apiErrorExample {json} Search Needs error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchNeeds(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const needsLists: any = await this.needsService.search(filter);

        if (needsLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Needs', needsLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Needs', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update Needs API
    /**
     * @api {put} /api/needs/:id Update Needs API
     * @apiGroup Needs
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Needs.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/needs/:id
     * @apiErrorExample {json} Update Needs error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized('user')
    public async updateNeeds(@Body({ validate: true }) need: UpdateNeedsRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const objId = new ObjectID(id);

            const needsUpdate: Needs = await this.needsService.findOne({ where: { _id: objId } });

            if (!needsUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid Needs Id', undefined));
            }

            if (need.name === null || need.name === undefined) {
                need.name = needsUpdate.name;
            }

            if (need.active === null || need.active === undefined) {
                need.active = needsUpdate.active;
            }

            if (need.fullfilled === null || need.fullfilled === undefined) {
                need.fullfilled = needsUpdate.fullfilled;
            }

            if (need.quantity === null || need.quantity === undefined) {
                need.quantity = needsUpdate.quantity;
            }

            const updateQuery = { _id: objId };
            const newValue = {
                $set: {
                    name: need.name,
                    active: need.active,
                    fullfilled: need.fullfilled,
                    quantity: need.quantity,
                    updateDate: moment().toDate()
                }
            };

            const needsSave = await this.needsService.update(updateQuery, newValue);

            if (needsSave) {
                const needsUpdated: Needs = await this.needsService.findOne({ where: { _id: objId } });
                return res.status(200).send(ResponseUtil.getSuccessResponse('Update Needs Successful', needsUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update Needs', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/needs/:id Delete Needs API
     * @apiGroup Needs
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete Needs.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/needs/:id
     * @apiErrorExample {json} Delete Needs Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized('user')
    public async deleteNeeds(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const needs = await this.needsService.findOne({ where: { _id: objId } });

        if (!needs) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid Needs Id', undefined));
        }

        const deleteNeeds = await this.needsService.update({ _id: objId }, { $set: { active: false } });

        if (deleteNeeds) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete Needs', []));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete Needs', undefined));
        }
    }
} 
