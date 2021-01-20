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
    public async calculateAllocate(@QueryParams() params: CalculateAllocateQueryparam, @Body({ validate: true }) allocates: AllocateRequest[], @Res() res: any): Promise<any> {
        try {
            if (allocates === undefined || allocates.length <= 0) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Calculate Allocate', []));
            }

            const result: any[] = [];
            for (const allocate of allocates) {
                const pageId = allocate.pageId;
                const postId = allocate.postId;
                const items = allocate.items;

                if ((pageId === undefined || pageId === null) && (postId === undefined || postId === null)) {
                    // no match for this case
                    result.push({
                        pageId,
                        postId,
                        items: []
                    });
                }

                const calulated: AllocateResponse[] = await this.allocate(pageId, postId, items, params);
                result.push({
                    pageId,
                    postId,
                    items: calulated
                });
            }

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
        const result: AllocateResponse[] = [];
        let needsList: any[] = [];
        // let mode;
        let emergencyEvent;
        let objective;

        if (params !== null && params !== undefined) {
            // mode = params.mode;
            emergencyEvent = params.emergencyEvent;
            objective = params.objective;
        }

        const standardItemLeftMap: any = {}; // key as standardItemId
        const customItemLeftMap: any = {}; // key as customItemId
        let allItemZeroAmountCount = 0;

        for (const item of items) {
            const stdItemId = item.standardItemId;
            const customItemId = item.customItemId;
            const amount = (item.amount !== null && item.amount !== undefined) ? item.amount : 0;

            if (amount <= 0) {
                allItemZeroAmountCount += 1;
                continue;
            }

            if (stdItemId !== null && stdItemId !== undefined && stdItemId !== '') {
                stdItemIdList.push(new ObjectID(stdItemId));

                // init for all req amount
                if (standardItemLeftMap[stdItemId] === undefined) {
                    standardItemLeftMap[stdItemId] = amount;
                } else {
                    standardItemLeftMap[stdItemId] = standardItemLeftMap[stdItemId] + amount;
                }
            } else if (customItemId !== null && customItemId !== undefined && customItemId !== '') {
                customItemIdList.push(new ObjectID(customItemId));

                if (customItemLeftMap[customItemId] === undefined) {
                    customItemLeftMap[customItemId] = amount;
                } else {
                    customItemLeftMap[customItemId] = customItemLeftMap[customItemId] + amount;
                }
            }
        }

        if (allItemZeroAmountCount === items.length) {
            return [];
        }

        // search need from post
        if (postId !== null && postId !== undefined && postId !== '') {
            const postObjId = new ObjectID(postId);

            if (items !== null && items !== undefined && items.length > 0) {
                const needORStmt: any[] = [];
                if (stdItemIdList.length > 0) {
                    needORStmt.push({ standardItemId: { $in: stdItemIdList } });
                }

                if (customItemIdList.length > 0) {
                    needORStmt.push({ customItemId: { $in: customItemIdList } });
                }

                const matchPost: any = { 'posts.type': POST_TYPE.NEEDS };
                // inject filter
                if (emergencyEvent !== undefined && emergencyEvent !== '') {
                    matchPost['posts.emergencyEvent'] = new ObjectID(emergencyEvent);
                }

                if (objective !== undefined && objective !== '') {
                    matchPost['posts.objective'] = new ObjectID(objective);
                }

                const needsAggStmt = [
                    {
                        $match: {
                            post: postObjId,
                            fullfilled: { $in: [false, null] },
                            $or: needORStmt
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
                    { $match: matchPost },
                    { $sort: { 'posts.createdDate': 1 } }
                ];

                needsList = await this.needsService.aggregate(needsAggStmt);
            }
        }

        if (pageId !== null && pageId !== undefined && pageId !== '') {
            const pageObjId = new ObjectID(pageId);

            if (items !== null && items !== undefined && items.length > 0) {

                const needORStmt: any[] = [];
                if (stdItemIdList.length > 0) {
                    needORStmt.push({ standardItemId: { $in: stdItemIdList } });
                }

                if (customItemIdList.length > 0) {
                    needORStmt.push({ customItemId: { $in: customItemIdList } });
                }

                const matchPost: any = { 'posts.type': POST_TYPE.NEEDS };
                // inject filter
                if (emergencyEvent !== undefined && emergencyEvent !== '') {
                    matchPost['posts.emergencyEvent'] = new ObjectID(emergencyEvent);
                }

                if (objective !== undefined && objective !== '') {
                    matchPost['posts.objective'] = new ObjectID(objective);
                }

                const needsAggStmt = [
                    {
                        $match: {
                            pageId: pageObjId,
                            fullfilled: { $in: [false, null] },
                            $or: needORStmt
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
                    { $match: matchPost },
                    { $sort: { 'posts.createdDate': 1 } }
                ];

                // not search post because we has already search for it;
                if (postId !== null && postId !== undefined && postId !== '') {
                    const postObjId = new ObjectID(postId);
                    needsAggStmt[0]['$match']['post'] = { $ne: postObjId };
                }

                const needResult = await this.needsService.aggregate(needsAggStmt);
                needsList = needsList.concat(needResult);
            }
        }

        // gen need map
        const stdNeedMap: any = {}; // key as a standardItemId, value as needobj[] that sort by date.
        const stdNeedPostMap: any = {}; // key as a postId:standardItemId, needobj[] that sort by date.
        const custNeedMap: any = {}; // key as a customItemId, value as needobj[] that sort by date.
        const custNeedPostMap: any = {}; // key as a postId:customItemId, needobj[] that sort by date.

        if (needsList !== null && needsList !== undefined && needsList.length > 0) {
            for (const needs of needsList) {
                const stdItemId = (needs.standardItemId !== null && needs.standardItemId !== undefined) ? needs.standardItemId + '' : '';
                const customItemId = (needs.customItemId !== null && needs.customItemId !== undefined) ? needs.customItemId + '' : '';

                if (stdItemId !== undefined && stdItemId !== null && stdItemId !== '') {
                    if (stdNeedMap[stdItemId] === undefined) {
                        stdNeedMap[stdItemId] = [];
                    }
                    stdNeedMap[stdItemId].push(needs);

                    if (postId !== null && postId !== undefined && postId !== '') {
                        const key = postId + ':' + stdItemId;
                        if (stdNeedPostMap[key] === undefined) {
                            stdNeedPostMap[key] = [];
                        }
                        stdNeedPostMap[key].push(needs);
                    }

                } else if (customItemId !== undefined && customItemId !== null && customItemId !== '') {
                    if (custNeedMap[customItemId] === undefined) {
                        custNeedMap[customItemId] = [];
                    }
                    custNeedMap[customItemId].push(needs);

                    if (postId !== null && postId !== undefined && postId !== '') {
                        const key = postId + ':' + customItemId;
                        if (custNeedPostMap[key] === undefined) {
                            custNeedPostMap[key] = [];
                        }
                        custNeedPostMap[key].push(needs);
                    }
                }
            }
        }

        const allocateNeedMap: any = {}; // key as needsId, value is allocateItem
        const allocateStdMap: any = {}; // key as stdId, value is allocateItem[]
        const allocateCustMap: any = {}; // key as stdId, value is allocateItem[]

        for (const standardId of Object.keys(standardItemLeftMap)) {
            let amount = standardItemLeftMap[standardId];

            if (amount <= 0) {
                continue;
            }

            let postNeedArray = [];
            if (postId !== null && postId !== undefined && postId !== '') {
                const key = postId + ';' + standardId;
                postNeedArray = stdNeedPostMap[key];
            }

            if (postNeedArray === undefined) {
                postNeedArray = [];
            }

            let generalNeedArray = stdNeedMap[standardId];

            if (generalNeedArray === undefined) {
                generalNeedArray = [];
            }

            // post mode force add
            for (const needs of postNeedArray) {
                if (amount <= 0) {
                    break;
                }

                const needIdString = needs._id + '';
                const allocateRow: AllocateResponse = this.createAllocateResponse(needs, standardId, '', amount, true);
                const allocateAmount = allocateRow.amount;
                const leftAmount = amount - allocateAmount;
                standardItemLeftMap[standardId] = leftAmount;
                amount = leftAmount;

                // cache in map
                allocateNeedMap[needIdString] = allocateRow;

                if (allocateStdMap[standardId] === undefined) {
                    allocateStdMap[standardId] = [];
                }
                allocateStdMap[standardId].push(allocateRow);
            }

            for (const needs of generalNeedArray) {
                if (amount <= 0) {
                    break;
                }

                const needIdString = needs._id + '';
                let allocateRow: AllocateResponse = undefined;

                // cache in map
                if (allocateStdMap[standardId] === undefined) {
                    allocateStdMap[standardId] = [];
                }

                if (allocateNeedMap[needIdString] !== undefined) {
                    // edit old row
                    allocateRow = allocateNeedMap[needIdString];
                    // add in amount
                    this.addAmountAllocateResponse(allocateRow, amount);
                } else {
                    // create new row
                    allocateRow = this.createAllocateResponse(needs, standardId, '', amount);
                    allocateNeedMap[needIdString] = allocateRow;
                    allocateStdMap[standardId].push(allocateRow);
                }

                const allocateAmount = allocateRow.amount;
                const leftAmount = amount - allocateAmount;
                standardItemLeftMap[standardId] = leftAmount;
                amount = leftAmount;
            }
        }

        // customItem mode
        for (const customId of Object.keys(customItemLeftMap)) {
            let amount = customItemLeftMap[customId];

            if (amount <= 0) {
                continue;
            }

            let postNeedArray = [];
            if (postId !== null && postId !== undefined && postId !== '') {
                const key = postId + ';' + customId;
                postNeedArray = custNeedPostMap[key];
            }

            if (postNeedArray === undefined) {
                postNeedArray = [];
            }

            let generalNeedArray = custNeedMap[customId];

            if (generalNeedArray === undefined) {
                generalNeedArray = [];
            }

            // post mode force add
            for (const needs of postNeedArray) {
                if (amount <= 0) {
                    break;
                }

                const needIdString = needs._id + '';
                const allocateRow: AllocateResponse = this.createAllocateResponse(needs, customId, '', amount, true);
                const allocateAmount = allocateRow.amount;
                const leftAmount = amount - allocateAmount;
                customItemLeftMap[customId] = leftAmount;
                amount = leftAmount;

                // cache in map
                allocateNeedMap[needIdString] = allocateRow;

                if (allocateCustMap[customId] === undefined) {
                    allocateCustMap[customId] = [];
                }
                allocateCustMap[customId].push(allocateRow);
            }

            for (const needs of generalNeedArray) {
                if (amount <= 0) {
                    break;
                }

                const needIdString = needs._id + '';
                let allocateRow: AllocateResponse = undefined;

                // cache in map
                if (allocateCustMap[customId] === undefined) {
                    allocateCustMap[customId] = [];
                }

                if (allocateNeedMap[needIdString] !== undefined) {
                    // edit old row
                    allocateRow = allocateNeedMap[needIdString];
                    // add in amount
                    this.addAmountAllocateResponse(allocateRow, amount);
                } else {
                    // create new row
                    allocateRow = this.createAllocateResponse(needs, customId, '', amount);
                    allocateNeedMap[needIdString] = allocateRow;
                    allocateCustMap[customId].push(allocateRow);
                }

                const allocateAmount = allocateRow.amount;
                const leftAmount = amount - allocateAmount;
                customItemLeftMap[customId] = leftAmount;
                amount = leftAmount;
            }
        }

        // if all need is full just add into first needs of each item.
        for (const standardId of Object.keys(standardItemLeftMap)) {
            const amount = standardItemLeftMap[standardId];

            if (amount <= 0) {
                continue;
            }

            if (allocateStdMap[standardId] !== undefined && allocateStdMap[standardId].length > 0) {
                this.addAmountAllocateResponse(allocateStdMap[standardId][0], amount, true);
            }
        }

        for (const needId of Object.keys(allocateNeedMap)) {
            const allocateItem = allocateNeedMap[needId];
            if (allocateItem.amount <= 0) {
                continue;
            }
            result.push(allocateItem);
        }

        return result;
    }

    private createAllocateResponse(needs: any, standardId: string, customItemId: string, allocateAmount: number, forceAdd?: boolean): AllocateResponse {
        const posts = new Posts();
        posts.type = needs.posts.type;
        posts.createdDate = needs.posts.createdDate;
        posts.title = needs.posts.title;
        posts.detail = needs.posts.detail;
        posts.emergencyEventTag = needs.posts.emergencyEventTag;
        posts.objectiveTag = needs.posts.objectiveTag;

        const needQty = needs.quantity;
        const needFulfillQty = (needs.fulfillQuantity !== undefined && needs.fulfillQuantity !== null && !isNaN(needs.fulfillQuantity)) ? needs.fulfillQuantity : 0;
        const leftQty = needQty - needFulfillQty;
        let amount = 0;
        if (leftQty > 0) {
            if (allocateAmount > leftQty) {
                amount = leftQty;
            } else {
                amount = allocateAmount;
            }
        }
        if (forceAdd) {
            amount = allocateAmount;
        }

        const allocateResult: AllocateResponse = new AllocateResponse();
        allocateResult.postsId = needs.post;
        allocateResult.needsId = needs._id;
        allocateResult.standardItemId = standardId;
        allocateResult.customItemId = customItemId;
        allocateResult.itemName = needs.name;
        allocateResult.quantity = needs.quantity;
        allocateResult.itemUnit = needs.unit;
        allocateResult.posts = posts;
        allocateResult.fulfillQuantity = needs.fulfillQuantity; // current fulfill qty
        allocateResult.amount = amount; // allocate qty

        return allocateResult;
    }

    private addAmountAllocateResponse(allocateItem: AllocateResponse, allocateAmount: number, forceAdd?: boolean): AllocateResponse {
        if (allocateItem === undefined || allocateItem === null) {
            return allocateItem;
        }

        const needQty = allocateItem.quantity;
        const needFulfillQty = (allocateItem.fulfillQuantity !== undefined && allocateItem.fulfillQuantity !== null && !isNaN(allocateItem.fulfillQuantity)) ? allocateItem.fulfillQuantity : 0;
        const leftQty = needQty - needFulfillQty;
        let amount = allocateItem.amount;
        if (leftQty > 0) {
            if (allocateAmount > leftQty) {
                amount = amount + leftQty;
            } else {
                amount = amount + allocateAmount;
            }
        }

        if (forceAdd) {
            amount = amount + allocateAmount;
        }

        allocateItem.amount = amount; // allocate qty

        return allocateItem;
    }
} 
