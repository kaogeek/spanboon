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
import { StandardItem } from '../../models/StandardItem';
import { StandardItemRequest } from './requests/StandardItemRequest';
import { ObjectID } from 'mongodb';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { STANDARDITEM_LOG_ACTION, LOG_TYPE } from '../../../constants/LogsAction';
import { StandardItemCategoryService } from '../../services/StandardItemCategoryService';
import { StandardItemCategory } from '../../models/StandardItemCategory';
import { Asset } from '../../../api/models/Asset';
import { FileUtil } from '../../../utils/Utils';
import { ASSET_SCOPE, ASSET_PATH } from '../../../constants/AssetScope';
import { AssetService } from '../../../api/services/AssetService';
import moment from 'moment';

@JsonController('/admin/item')
export class AdminStandardItemController {
    constructor(
        private assetService: AssetService,
        private standardItemService: StandardItemService,
        private stdItemCatService: StandardItemCategoryService,
        private actionLogService: AdminUserActionLogsService
    ) { }

    // Find Admin StandardItem API
    /**
     * @api {get} /api/admin/item/:id Find Admin StandardItem API
     * @apiGroup Admin StandardItem
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Admin StandardItem"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item/:id
     * @apiErrorExample {json}  error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    @Authorized()
    public async findAdminStandardItem(@Param('id') id: string, @Res() res: any): Promise<any> {
        const objId = new ObjectID(id);

        const hashTag = await this.standardItemService.findOne({ where: { _id: objId } });

        if (hashTag) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully getting StandardItem', hashTag);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/item Create StandardItem API
     * @apiGroup Admin StandardItem
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
     *      "message": "Successfully create StandardItem",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item
     * @apiErrorExample {json} Unable create StandardItem
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createStandardItem(@Body({ validate: true }) standardItem: StandardItemRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const category = standardItem.category;
        const assetData = standardItem.asset;
        const data = await this.standardItemService.findOne({ where: { name: standardItem.name } });
        let assetCreate;

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem is Exists', data);
            return res.status(400).send(errorResponse);
        }

        let stdItemCat: StandardItemCategory;

        if (category !== null && category !== undefined && category !== '') {
            const catObjId = new ObjectID(category);
            stdItemCat = await this.stdItemCatService.findOne({ where: { _id: catObjId } });
        }

        const fileName = FileUtil.renameFile();

        if (assetData) {
            const asset = new Asset();
            asset.fileName = fileName;
            asset.scope = ASSET_SCOPE.PUBLIC;
            asset.data = assetData.data;
            asset.size = assetData.size;
            asset.mimeType = assetData.mimeType;
            asset.expirationDate = null;

            assetCreate = await this.assetService.create(asset);
        }

        const item: StandardItem = new StandardItem();
        item.name = standardItem.name;
        item.unit = standardItem.unit;
        item.imageURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        item.category = stdItemCat ? new ObjectID(stdItemCat.id) : '';

        const result = await this.standardItemService.create(item);

        if (result) {
            const objId = new ObjectID(result.id);
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = STANDARDITEM_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM;
            adminLogs.ip = ipAddress;
            adminLogs.data = result;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create StandardItem', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update StandardItem API
    /**
     * @api {put} /api/admin/item/:id Update StandardItem API
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
     *      "message": "Successfully updated StandardItem.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item/:id
     * @apiErrorExample {json} Update StandardItem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updateStandardItem(@Body({ validate: true }) standardItem: StandardItemRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const objId = new ObjectID(id);
            const assetData = standardItem.asset;
            const category = standardItem.category;

            const stdItemUpdate: StandardItem = await this.standardItemService.findOne({ where: { _id: objId } });

            if (!stdItemUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('StandardItem Not Found', stdItemUpdate));
            }

            const stdItemImageURL = stdItemUpdate.imageURL;
            let assetResult;
            let assetId;
            let newAssetId;
            let imageURL;

            if (assetData !== null && assetData !== undefined) {
                const data = assetData.data;
                const mimeType = assetData.mimeType;
                const size = assetData.size;
                const fileName = FileUtil.renameFile();

                if (stdItemImageURL !== null && stdItemImageURL !== undefined && stdItemImageURL !== '' && typeof (stdItemImageURL) !== 'undefined') {
                    assetId = new ObjectID(stdItemImageURL.split(ASSET_PATH)[1]);
                    const assetQuery = { _id: assetId };
                    const newAssetValue = { $set: { data, mimeType, size, fileName } };
                    assetResult = await this.assetService.update(assetQuery, newAssetValue);
                    newAssetId = assetId;
                } else {
                    const asset = new Asset();
                    asset.data = data;
                    asset.mimeType = mimeType;
                    asset.fileName = fileName;
                    asset.size = size;
                    asset.scope = ASSET_SCOPE.PUBLIC;
                    assetResult = await this.assetService.create(asset);
                    newAssetId = assetResult.id;
                }

                if (assetResult) {
                    imageURL = assetResult ? ASSET_PATH + newAssetId : '';
                }
            } else {
                imageURL = stdItemImageURL;
            }

            let stdItemCat: StandardItemCategory;
            let catObjId;
            let changeCategory;

            if (category !== null && category !== undefined && category !== '') {
                catObjId = new ObjectID(category);
                stdItemCat = await this.stdItemCatService.findOne({ where: { _id: catObjId } });
            }

            if (stdItemCat !== null && stdItemCat !== undefined) {
                changeCategory = stdItemCat.id;
            } else {
                changeCategory = catObjId;
            }

            const updateDate = moment().toDate();

            const updateQuery = { _id: objId };
            const newValue = { $set: { name: standardItem.name, unit: standardItem.unit, category: changeCategory, imageURL, updateDate } };

            const itemSave = await this.standardItemService.update(updateQuery, newValue);

            if (itemSave) {
                const pageUpdated: StandardItem = await this.standardItemService.findOne({ where: { _id: objId } });

                const userObjId = new ObjectID(req.user.id);
                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = objId;
                adminLogs.action = STANDARDITEM_LOG_ACTION.EDIT;
                adminLogs.contentType = LOG_TYPE.STANDARDITEM;
                adminLogs.ip = ipAddress;
                adminLogs.data = pageUpdated;
                await this.actionLogService.create(adminLogs);

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update StandardItem Successful', pageUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update StandardItem', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/admin/item/:id Delete StandardItem API
     * @apiGroup Admin StandardItem
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete StandardItem.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/item/:id
     * @apiErrorExample {json} Delete StandardItem Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deleteStandardItem(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);

        const item = await this.standardItemService.findOne({ where: { _id: objId } });

        if (!item) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItem Not Found', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: objId };

        const deleteStandardItem = await this.standardItemService.delete(query);

        if (deleteStandardItem) {
            const userObjId = new ObjectID(req.user.id);
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = STANDARDITEM_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM;
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
     * @api {post} /api/admin/item/search Search StandardItem API
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
     * @apiSampleRequest /api/admin/item/search
     * @apiErrorExample {json} standarditem error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async searchStandardItem(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const standardItemLists: any[] = await this.standardItemService.search(filter);

        if (standardItemLists !== null && standardItemLists !== undefined && standardItemLists.length > 0) {
            const stdItemIdList = [];

            for (const standardItem of standardItemLists) {
                const standardItemId = standardItem.id;

                if (standardItemId !== null && standardItemId !== undefined && standardItemId !== '') {
                    stdItemIdList.push(new ObjectID(standardItemId));
                }
            }

            const stdItemList: any[] = await this.standardItemService.aggregate([
                { $match: { _id: { $in: stdItemIdList } } },
                {
                    $lookup: {
                        from: 'CustomItem',
                        localField: '_id',
                        foreignField: 'standardItemId',
                        as: 'customItems'
                    }
                },
                {
                    $lookup: {
                        from: 'StandardItemCategory',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                }
            ]);

            if (stdItemList !== null && stdItemList !== undefined && stdItemList.length > 0) {
                const successResponse = ResponseUtil.getSuccessResponse('Successfully Search StandardItem', stdItemList);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('StandardItem Not Found', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search StandardItem', undefined);
            return res.status(400).send(errorResponse);
        }
    }
} 
