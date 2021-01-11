/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Post, Body, Authorized, Req } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { CustomItemService } from '../../services/CustomItemService';
import { CustomItemGroupRequest } from './requests/CustomItemGroupRequest';
import { StandardItemService } from '../../services/StandardItemService';
import { StandardItem } from '../../models/StandardItem';
import { ObjectID } from 'mongodb';
import { NeedsService } from '../../services/NeedsService';
import { StandardItemCategoryService } from '../../services/StandardItemCategoryService';
import { FileUtil } from '../../../utils/Utils';
import { Asset } from '../../../api/models/Asset';
import { ASSET_SCOPE, ASSET_PATH } from '../../../constants/AssetScope';
import { AssetService } from '../../../api/services/AssetService';
import { UserProvideItemsService } from '../../../api/services/UserProvideItemsService';

@JsonController('/admin/customitem')
export class AdminCustomItemController {
    constructor(
        private assetService: AssetService,
        private customItemService: CustomItemService,
        private stdItemCatService: StandardItemCategoryService,
        private stdItemService: StandardItemService,
        private needsService: NeedsService,
        private userProvideItemsService: UserProvideItemsService
    ) { }

    // Search CustomItem
    /**
     * @api {post} /api/admin/customitem/search Search CustomItem API
     * @apiGroup CustomItem
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
     * @apiSampleRequest /api/admin/customitem/search
     * @apiErrorExample {json} Search CustomItem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async searchCustomItem(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        if (filter !== null && filter !== undefined) {
            const whereConditions = filter.whereConditions;

            if (whereConditions !== null && whereConditions !== undefined) {
                const stdItemList: any[] = await this.customItemService.aggregate([
                    {
                        $match: whereConditions
                    },
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
                    }
                ]);

                if (stdItemList !== null && stdItemList !== undefined && stdItemList.length > 0) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Search CustomItem', stdItemList);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('CustomItem Not Found', undefined);
                    return res.status(400).send(errorResponse);
                }
            }
        }
    }

    /**
     * @api {post} /api/admin/customitem Create EmergencyEvent API
     * @apiGroup EmergencyEvent
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
     *      "message": "Successfully create EmergencyEvent",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/customitem
     * @apiErrorExample {json} Unable create EmergencyEvent
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/standard')
    @Authorized()
    public async createStandardItemGroup(@Body({ validate: true }) customItemGroup: CustomItemGroupRequest, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const customGroupName = customItemGroup.name;
            const customItems = customItemGroup.items;
            const customItemDescription = customItemGroup.description;
            const categoryId = customItemGroup.categoryId;
            const assetData = customItemGroup.asset;
            let assetCreate;
            let stdItemCreate;

            if (Array.isArray(customItems)) {
                const itemLists = [];
                customItems.forEach((id) => {
                    itemLists.push(new ObjectID(id));
                });

                const customItemLists = await this.customItemService.find({ where: { _id: { $in: itemLists } } });

                if (customItemLists) {
                    const checkStdItem = await this.stdItemService.findOne({ where: { name: customGroupName } });

                    let stdItemCat;
                    let customItemsGroup;

                    if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
                        const catObjId = new ObjectID(categoryId);
                        stdItemCat = await this.stdItemCatService.findOne({ where: { _id: catObjId } });
                    }

                    if (checkStdItem === null || checkStdItem === undefined) {
                        const fileName = FileUtil.renameFile();

                        if (assetData !== null && assetData !== undefined) {
                            const asset = new Asset();
                            asset.fileName = fileName;
                            asset.scope = ASSET_SCOPE.PUBLIC;
                            asset.data = assetData.data;
                            asset.size = assetData.size;
                            asset.mimeType = assetData.mimeType;
                            asset.expirationDate = null;

                            assetCreate = await this.assetService.create(asset);
                        }

                        const stdItem = new StandardItem();
                        stdItem.name = customGroupName;
                        stdItem.imageURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
                        stdItem.category = stdItemCat ? new ObjectID(stdItemCat.id) : '';

                        stdItemCreate = await this.stdItemService.create(stdItem);

                        if (stdItemCreate) {
                            customItemsGroup = await this.createStdItemFromCustomItems(customItemLists, stdItemCreate.id, customItemDescription);
                        } else {
                            const errorResponse = ResponseUtil.getErrorResponse('Create StandardItem Failed', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    } else {
                        customItemsGroup = await this.createStdItemFromCustomItems(customItemLists, checkStdItem.id, customItemDescription);
                    }

                    if (customItemsGroup !== null || customItemsGroup !== undefined) {
                        const successResponse = ResponseUtil.getSuccessResponse('Group CustomItem Success', customItemsGroup);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getErrorResponse('Group CustomItem Failed', undefined);
                        return res.status(400).send(errorResponse);
                    }
                } else {
                    const successResponse = ResponseUtil.getSuccessResponse('CustomItem Not Found', []);
                    return res.status(200).send(successResponse);
                }
            }
        } catch (eror) {
            const errorResponse = ResponseUtil.getErrorResponse(eror.message, undefined);
            return res.status(400).send(errorResponse);
        }
    }

    private async createStdItemFromCustomItems(customItems: any[], stdItemId: string, description?: string): Promise<any> {
        const stdItemObjId = new ObjectID(stdItemId);
        const customItemsQueryValue = { standardItemId: stdItemObjId };
        const updateValue = { $set: customItemsQueryValue };
        const customItemIdList = [];
        let customItemUpdate;
        let customItemQuery;

        if (customItems !== null && customItems !== undefined && customItems.length > 0) {
            for (const customItem of customItems) {
                customItemIdList.push(new ObjectID(customItem.id));
            }

            customItemQuery = { _id: { $in: customItemIdList } };
            customItemUpdate = await this.customItemService.updateMany(customItemQuery, updateValue);
        } else {
            customItemUpdate = await this.customItemService.updateMany({ customItemQuery }, updateValue);
        }

        if (customItemUpdate !== null && customItemUpdate !== undefined) {
            const findByCustomItemIdStmt = { where: { customItemId: { $in: customItemIdList } } };
            const needs = await this.needsService.find(findByCustomItemIdStmt);
            const userProvideItems = await this.userProvideItemsService.find(findByCustomItemIdStmt);
            let needsUpdate;
            let userProvideItemsUpdate;

            if ((needs !== undefined && needs !== null && needs.length > 0) || (userProvideItems !== undefined && userProvideItems !== null && userProvideItems.length > 0)) {
                const updateStdItemQuery = { customItemId: { $in: customItemIdList } };
                needsUpdate = await this.needsService.updateMany(updateStdItemQuery, updateValue);
                userProvideItemsUpdate = await this.userProvideItemsService.updateMany(updateStdItemQuery, updateValue);
            }

            if ((needsUpdate !== undefined && needsUpdate !== null) || (userProvideItemsUpdate !== undefined && userProvideItemsUpdate !== null)) {
                return await this.customItemService.find(customItemsQueryValue);
            } else {
                throw new Error('Group CustomItem Failed');
            }
        }
    }
} 
