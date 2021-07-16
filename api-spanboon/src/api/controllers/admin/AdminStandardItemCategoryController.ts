/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Param, Post, Body, Authorized, Req, Put, Delete, Get } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { StandardItemCategoryService } from '../../services/StandardItemCategoryService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { CreateStandardItemCategoryRequest } from './requests/CreateStandardItemCategoryRequest';
import { StandardItemCategory } from '../../models/StandardItemCategory';
import { UpdateStandardItemCategoryRequest } from './requests/UpdateStandardItemCategoryRequest';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { LOG_TYPE, STANDARDITEM_CATEGORY_LOG_ACTION } from '../../../constants/LogsAction';
import { FileUtil } from '../../../utils/Utils';
import { Asset } from '../../../api/models/Asset';
import { ASSET_SCOPE, ASSET_PATH } from '../../../constants/AssetScope';
import { AssetService } from '../../../api/services/AssetService';
import { ValidateStandardItemCategoryRequest } from './requests/ValidateStandardItemCategoryRequest';

@JsonController('/admin/item_category')
export class AdminStandardItemCategoryController {
    constructor(
        private assetService: AssetService,
        private standardItemCategoryService: StandardItemCategoryService,
        private actionLogService: AdminUserActionLogsService
    ) { }

    // Search StandardItem Category
    /**
     * @api {get} /api/admin/item_category/:id Search StandardItem Category API
     * @apiGroup StandardItem Category API
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search StandardItem Category",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/item_category/:id
     * @apiErrorExample {json} StandardItem Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findStandardItemCategory(@Param('id') stdItemCatId: string, @Res() res: any): Promise<any> {
        const stdItemCatObjId = new ObjectID(stdItemCatId);
        const stdItemCatQuery = [
            { $match: { _id: stdItemCatObjId } },
            {
                $graphLookup: {
                    from: 'StandardItemCategory',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'parent',
                    maxDepth: 0,
                    as: 'children'
                }
            }
        ];
        const standardItemLists: any = await this.standardItemCategoryService.aggregate(stdItemCatQuery);

        if (standardItemLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem Category', standardItemLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search StandardItem Category
    /**
     * @api {post} /api/admin/item_category/search Search StandardItem Category API
     * @apiGroup StandardItem Category API
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search StandardItem Category",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/item_category/search
     * @apiErrorExample {json} StandardItem Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchStandardItemCategory(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const standardItemLists: any = await this.standardItemCategoryService.search(filter);

        if (standardItemLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search StandardItem Category', standardItemLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search StandardItem Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/item_category Create StandardItemCategory API
     * @apiGroup StandardItemCategory
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "description": ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create StandardItemCategory",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_category
     * @apiErrorExample {json} Unable create StandardItemCategory
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createStandardItemCategory(@Body({ validate: true }) stdItemCat: CreateStandardItemCategoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        let assetCreate;
        const assetData = stdItemCat.asset;
        const stdItemCatCreate = await this.standardItemCategoryService.findOne({ where: { name: stdItemCat.name } });

        if (stdItemCatCreate) {
            const errorResponse = ResponseUtil.getErrorResponse('StandardItemCategory is Exists', stdItemCatCreate);
            return res.status(400).send(errorResponse);
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

        const parents = stdItemCat.parent;
        let parent;

        if (parents !== null && parents !== undefined && parents !== '') {
            const newParent: StandardItemCategory = await this.checkValid(parents);

            if (newParent !== null && newParent !== undefined) {
                parent = new ObjectID(newParent.id);
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Add This Item Into Parent', undefined));
            }
        }

        const stdItemCats: StandardItemCategory = new StandardItemCategory();
        stdItemCats.name = stdItemCat.name;
        stdItemCats.imageURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        stdItemCats.description = stdItemCat.description;
        stdItemCats.parent = parent;

        const result = await this.standardItemCategoryService.create(stdItemCats);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create StandardItemCategory', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create StandardItemCategory', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/item_category Create StandardItemCategory API
     * @apiGroup StandardItemCategory
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "description": ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create StandardItemCategory",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_category
     * @apiErrorExample {json} Unable create StandardItemCategory
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/validate')
    @Authorized()
    public async validateStandardItemCategory(@Body({ validate: true }) validate: ValidateStandardItemCategoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const catItem = validate.item;
        const catParent = validate.parent;

        return await this.standardItemCatValidate(catItem, catParent);
    }

    // Update StandardItemCategory API
    /**
     * @api {put} /api/admin/item_category/:id Update StandardItemCategory API
     * @apiGroup StandardItemCategory
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated StandardItemCategory.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_category/:id
     * @apiErrorExample {json} Update StandardItemCategory error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updateStandardItemCategory(@Body({ validate: true }) stdItemCat: UpdateStandardItemCategoryRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const objId = new ObjectID(id);
            const assetData = stdItemCat.asset;
            const stdItemCatUpdate: StandardItemCategory = await this.checkValid(id);

            if (!stdItemCatUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid StandardItemCategory Id', undefined));
            }

            const item = stdItemCatUpdate.id;
            const parentId = stdItemCat.parent;
            let checkParentValid;

            if (parentId !== '' && parentId !== null && parentId !== undefined) {
                checkParentValid = await this.checkValid(parentId);
            }

            if (checkParentValid) {
                if (stdItemCat.name === null || stdItemCat.name === undefined) {
                    stdItemCat.name = stdItemCatUpdate.name;
                }

                if (stdItemCat.description === null || stdItemCat.description === undefined) {
                    stdItemCat.description = stdItemCatUpdate.description;
                }
            }

            const stdItemCatImageURL = stdItemCatUpdate.imageURL;
            let assetResult;
            let assetId;
            let newAssetId;
            let imageURL;
            let newS3ImageURL;

            if (assetData !== null && assetData !== undefined) {
                const data = assetData.data;
                const mimeType = assetData.mimeType;
                const size = assetData.size;
                const fileName = FileUtil.renameFile();

                if (stdItemCatImageURL !== null && stdItemCatImageURL !== undefined && stdItemCatImageURL !== '' && typeof (stdItemCatImageURL) !== 'undefined') {
                    assetId = new ObjectID(stdItemCatImageURL.split(ASSET_PATH)[1]);
                    const assetQuery = { _id: assetId };
                    const newAssetValue = { $set: { data, mimeType, size, fileName } };
                    await this.assetService.update(assetQuery, newAssetValue);
                    newAssetId = assetId;
                    assetResult = await this.assetService.findOne({ _id: new ObjectID(newAssetId) });
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
                    newS3ImageURL = assetResult ? assetResult.s3FilePath : '';
                }
            } else {
                imageURL = stdItemCatImageURL;
                newS3ImageURL = stdItemCatUpdate.s3ImageURL;
            }

            const isValid = await this.standardItemCatValidate(item, parentId);
            const updateQuery = { _id: objId };
            let newValue;

            if (isValid) {
                newValue = { $set: { name: stdItemCat.name, description: stdItemCat.description, parent: new ObjectID(parentId), imageURL, s3ImageURL: newS3ImageURL } };
            } else {
                newValue = { $set: { name: stdItemCat.name, description: stdItemCat.description, parent: '', imageURL } };
            }

            const stdItemCatSave = await this.standardItemCategoryService.update(updateQuery, newValue);

            if (stdItemCatSave) {
                const stdItemCatUpdated: StandardItemCategory = await this.standardItemCategoryService.findOne({ where: { _id: objId } });
                const userObjId = new ObjectID(req.user.id);

                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = objId;
                adminLogs.action = STANDARDITEM_CATEGORY_LOG_ACTION.EDIT;
                adminLogs.contentType = LOG_TYPE.STANDARDITEM_CATEGORY;
                adminLogs.ip = ipAddress;
                adminLogs.data = stdItemCatUpdated;
                await this.actionLogService.create(adminLogs);

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update StandardItemCategory Successful', stdItemCatUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update StandardItemCategory', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/admin/item_category/:id Delete StandardItemCategory API
     * @apiGroup StandardItemCategory
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete StandardItemCategory.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/item_category/:id
     * @apiErrorExample {json} Delete StandardItemCategory Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deleteStandardItemCategory(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<boolean> {
        const objId = new ObjectID(id);
        const stdItemCats = await this.standardItemCategoryService.findOne({ where: { _id: objId } });

        if (!stdItemCats) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid StandardItemCategory Id', undefined));
        }

        const deleteStdItemCat = await this.standardItemCategoryService.delete({ _id: objId });

        if (deleteStdItemCat) {
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = STANDARDITEM_CATEGORY_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.STANDARDITEM_CATEGORY;
            adminLogs.ip = ipAddress;
            adminLogs.data = stdItemCats;
            await this.actionLogService.create(adminLogs);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete StandardItemCategory', []));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete StandardItemCategory', undefined));
        }
    }

    private async checkValid(id: string): Promise<any> {
        let objId;
        let validStmt;

        try {
            objId = new ObjectID(id);
            validStmt = { _id: objId };
        } catch (ex) {
            validStmt = { name: id };
        } finally {
            validStmt = { $or: [{ _id: objId }, { name: id }] };
        }

        return await this.standardItemCategoryService.findOne(validStmt);
    }

    private async standardItemCatValidate(item: string, parent: string): Promise<any> {
        const catItem = JSON.stringify(item);
        const catParent = JSON.stringify(parent);
        const checkValid = await this.checkValid(parent);

        if (checkValid !== null && checkValid !== undefined) {
            if (catItem === catParent) {
                return false;
            }

            const stdItemCatObjId = new ObjectID(item);
            const stdItemCatQuery = [
                { $match: { _id: stdItemCatObjId } },
                {
                    $graphLookup: {
                        from: 'StandardItemCategory',
                        startWith: '$_id',
                        connectFromField: '_id',
                        connectToField: 'parent',
                        as: 'children'
                    }
                }
            ];

            const standardItemCatList: any[] = await this.standardItemCategoryService.aggregate(stdItemCatQuery);

            if (standardItemCatList) {
                const children = standardItemCatList[0].children;
                const parents = [];

                for (const child of children) {
                    parents.push(JSON.stringify(child._id));
                }

                if (parents.includes(catParent)) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return false;
        }
    }
} 
