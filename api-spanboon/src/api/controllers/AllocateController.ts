/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Post, Body, QueryParams } from 'routing-controllers';
import { ObjectID } from 'mongodb';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { NeedsService } from '../services/NeedsService';
import { AllocateRequest } from './requests/allocate/AllocateRequest';
import { POST_TYPE } from '../../constants/PostType';
import { AllocateResponse } from './responses/allocate/AllocateResponse';
import { CalculateAllocateQueryparam } from './params/CalculateAllocateQueryparam';
import { Posts } from '../models/Posts';

@JsonController('/allocate')
export class AllocateController {
    constructor(private needsService: NeedsService) { }

    // Create Allocate API
    /**
     * @api {post} /api/allocate Create Allocate API
     * @apiGroup Allocate
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Create Allocate"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/allocate
     * @apiErrorExample {json} Create Allocate error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    public async createAllocate(@Body({ validate: true }) allocate: AllocateRequest, @Res() res: any): Promise<any> {
        console.log('allocate');
    }

    // Calculate Allocate API
    /**
     * @api {post} /api/allocate Calculate Allocate API
     * @apiGroup Allocate
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Calculate Allocate"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/allocate/calculate
     * @apiErrorExample {json} Calculate Allocate error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/calculate')
    public async calculateAllocate(@QueryParams() params: CalculateAllocateQueryparam, @Body({ validate: true }) allocate: AllocateRequest, @Res() res: any): Promise<any> {
        try {
            const pageId = allocate.pageId;
            const postId = allocate.postId;
            const items = allocate.items;

            const result: AllocateResponse[] = await this.allocate(pageId, postId, items, params);

            if (result !== null && result !== undefined && result.length > 0) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Calculate Allocate', result));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Calculate Allocate', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Calculate Allocate Error', error.message));
        }
    }

    private async allocate(pageId: string, postId: string, items: any[], params?: CalculateAllocateQueryparam): Promise<AllocateResponse[]> {
        const stdItemIdList: ObjectID[] = [];
        const customItemIdList: ObjectID[] = [];
        const itemsMap: any = {};
        const result: AllocateResponse[] = [];
        let needsList: any[] = [];
        // let mode;
        // let emergencyEvent;
        // let objective;

        // if (params !== null && params !== undefined) {
        //     mode = params.mode;
        //     emergencyEvent = params.emergencyEvent;
        //     objective = params.objective;
        // }

        if (pageId !== null && pageId !== undefined && pageId !== '') {
            const pageObjId = new ObjectID(pageId);

            if (items !== null && items !== undefined && items.length > 0) {
                for (const item of items) {
                    const stdItemId = item.standardItemId;
                    const customItemId = item.customItemId;
                    const amount = item.amount;

                    if (stdItemId !== null && stdItemId !== undefined && stdItemId !== '') {
                        itemsMap[stdItemId] = { itemId: stdItemId, amount };
                        stdItemIdList.push(new ObjectID(stdItemId));
                    } else if (customItemId !== null && customItemId !== undefined && customItemId !== '') {
                        itemsMap[customItemId] = { itemId: customItemId, amount };
                        customItemIdList.push(new ObjectID(customItemId));
                    }
                }

                if ((stdItemIdList !== null && stdItemIdList !== undefined && stdItemIdList.length > 0) || (customItemIdList !== null && customItemIdList !== undefined && customItemIdList.length > 0)) {
                    needsList = await this.needsService.aggregate([
                        {
                            $match: {
                                pageId: pageObjId,
                                fullfilled: false,
                                $or: [
                                    { standardItemId: { $in: stdItemIdList } },
                                    { customItemId: { $in: customItemIdList } }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                from: 'Posts',
                                localField: 'post',
                                foreignField: '_id',
                                as: 'posts'
                            }
                        },
                        {
                            $unwind: {
                                path: '$posts',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        { $match: { 'posts.type': POST_TYPE.NEEDS } },
                        { $sort: { 'posts.createdDate': 1 } }
                    ]);

                    if (needsList !== null && needsList !== undefined && needsList.length > 0) {
                        for (const needs of needsList) {
                            const stdItemId = needs.standardItemId;
                            const customItemId = needs.customItemId;
                            const stdItemValue = itemsMap[stdItemId];
                            const customItemValue = itemsMap[customItemId];

                            const posts = new Posts();
                            posts.type = needs.posts.type;
                            posts.createdDate = needs.posts.createdDate;
                            posts.title = needs.posts.title;
                            posts.detail = needs.posts.detail;
                            posts.emergencyEventTag = needs.posts.emergencyEventTag;
                            posts.objectiveTag = needs.posts.objectiveTag;

                            const allocateResult: AllocateResponse = new AllocateResponse();
                            allocateResult.postsId = needs.post;
                            allocateResult.needsId = needs._id;
                            allocateResult.itemName = needs.name;
                            allocateResult.quantity = needs.quantity;
                            allocateResult.itemUnit = needs.unit;
                            allocateResult.posts = posts;

                            if (stdItemValue) {
                                allocateResult.amount = needs.fulfillQuantity + stdItemValue.amount;
                            } else if (customItemValue) {
                                allocateResult.amount = needs.fulfillQuantity + customItemValue.amount;
                            }

                            result.push(allocateResult);
                        }
                    }
                }
            }
        }

        return result;
    }
} 
