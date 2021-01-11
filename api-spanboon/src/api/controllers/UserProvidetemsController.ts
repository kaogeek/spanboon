/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { UserProvideItemsService } from '../services/UserProvideItemsService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { UserProvideItems } from '../models/UserProvideItems';

@JsonController('/user')
export class UserProvidetemsController {
    constructor(private userProvideItemsService: UserProvideItemsService) { }

    // Find UserProvideItems API
    /**
     * @api {get} /api/user/:id/item Find UserProvideItems API
     * @apiGroup UserProvideItems
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get UserProvideItems"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user/:id/item
     * @apiErrorExample {json} UserProvideItems error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/item')
    public async findAllUserProvideItems(@Param('id') userId: string, @Res() res: any): Promise<any> {
        const userObjId = new ObjectID(userId);

        const userProvideItems: UserProvideItems[] = await this.userProvideItemsService.find({ where: { user: userObjId } });

        if (userProvideItems) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got UserProvideItems', userProvideItems);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got UserProvideItems', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Find UserProvideItems API
    /**
     * @api {get} /api/user/:id/item Find UserProvideItems API
     * @apiGroup UserProvideItems
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get UserProvideItems"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user/:id/item
     * @apiErrorExample {json} UserProvideItems error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/item/:provideId')
    public async findUserProvideItems(@Param('id') userId: string, @Param('provideId') provideId: string, @Res() res: any): Promise<any> {
        const userObjId = new ObjectID(userId);
        const provideObjId = new ObjectID(provideId);

        const userProvideItems: UserProvideItems = await this.userProvideItemsService.findOne({ where: { _id: provideObjId, user: userObjId } });

        if (userProvideItems) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got UserProvideItems', userProvideItems);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got UserProvideItems', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search UserProvideItems
    /**
     * @api {post} /api/item/search Search UserProvideItems API
     * @apiGroup UserProvideItems
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get userProvideItems search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/user/:id/item/search
     * @apiErrorExample {json} userProvideItems error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/item/search')
    public async searchUserProvideItems(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const userProvideItemsList: any = await this.userProvideItemsService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (userProvideItemsList) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search UserProvideItems', userProvideItemsList);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search UserProvideItems', undefined);
            return res.status(400).send(errorResponse);
        }
    }
} 
