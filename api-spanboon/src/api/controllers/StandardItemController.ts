/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { StandardItemService } from '../services/StandardItemService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { SEARCH_TYPE } from '../../constants/SearchType';
import { StandardItemCategoryService } from '../services/StandardItemCategoryService';
import { StandardItem } from '../models/StandardItem';

@JsonController('/item')
export class StandardItemController {
    constructor(
        private standardItemService: StandardItemService,
        private standardItemCatService: StandardItemCategoryService
    ) { }

    // Find StandardItem API
    /**
     * @api {get} /api/item/:id Find StandardItem API
     * @apiGroup StandardItem
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get StandardItem"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/item/:id
     * @apiErrorExample {json} StandardItem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findStandardItem(@Param('id') id: string, @Res() response: any): Promise<any> {
        const objId = new ObjectID(id);

        const standardItem: StandardItem = await this.standardItemService.findOne({ where: { _id: objId } }, { signURL: true });

        if (standardItem) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got StandardItem', standardItem);
            return response.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got StandardItem', undefined);
            return response.status(400).send(errorResponse);
        }
    }

    // Search StandardItem
    /**
     * @api {post} /api/item/search Search StandardItem API
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
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/item/search
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchStandardItem(@Body({ validate: true }) filter: SearchFilter, @Res() response: any): Promise<any> {
        const standardItemLists: any = await this.standardItemService.search(filter);

        if (standardItemLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem', standardItemLists);
            return response.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem', undefined);
            return response.status(400).send(errorResponse);
        }
    }

    // Search StandardItem
    /**
     * @api {post} /api/item/searchmerge Search StandardItem API
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
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/item/searchmerge
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/searchmerge')
    public async searchMergeStandardItem(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        if (filter === null && filter === undefined) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem', []);
            return res.status(200).send(successResponse);
        }

        const whereConditions = filter.whereConditions;

        if (whereConditions !== null && whereConditions !== undefined) {
            const searchResult = [];
            const keyword = whereConditions.keyword;
            const whereStmt = { name: { $regex: '.*' + keyword + '.*', $options: 'si' } };
            filter.whereConditions = whereStmt;

            const standardItemLists: any = await this.standardItemService.search(filter);

            if (standardItemLists.length > 0) {
                for (const stdItem of standardItemLists) {
                    searchResult.push({ id: stdItem.id, value: stdItem, type: SEARCH_TYPE.STANDARDITEM });
                }
            }

            const standardItemCatLists: any = await this.standardItemCatService.search(filter);

            if (standardItemCatLists.length > 0) {
                for (const stdItemCat of standardItemCatLists) {
                    searchResult.push({ id: stdItemCat.id, value: stdItemCat, type: SEARCH_TYPE.STANDARDITEM_CATEGORY });
                }
            }

            if (searchResult !== null && searchResult !== undefined && searchResult.length > 0) {
                const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem', searchResult);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
}
