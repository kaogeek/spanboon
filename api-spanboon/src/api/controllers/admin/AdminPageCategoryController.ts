
/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Param, Post, Body, Req, Authorized, Put, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { PageCategoryService } from '../../services/PageCategoryService';
import { PageCategory } from '../../models/PageCategory';
import { PageCategoryRequest } from './requests/PageCategoryRequest';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { Asset } from '../../models/Asset';
import { FileUtil } from '../../../utils/FileUtil';
import { AssetService } from '../../services/AssetService';
import { ASSET_PATH, ASSET_SCOPE } from '../../../constants/AssetScope';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { LOG_TYPE, PAGE_CATEGORY_LOG_ACTION } from '../../../constants/LogsAction';

@JsonController('/admin/page_category')
export class AdminPageCategoryController {
    constructor(private pageCategoryService: PageCategoryService, private assetService: AssetService, private actionLogService: AdminUserActionLogsService) { }

    /**
     * @api {post} /api/admin/page_category Create PageCategory API
     * @apiGroup Admin PageCategory
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} description description
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "description" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Create PageCategory",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/page_category
     * @apiErrorExample {json} Unable Create PageCategory
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createPageCategory(@Body({ validate: true }) pageCategories: PageCategoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageCatetoryAsset = pageCategories.asset;
        const userId = req.user.id;
        const fileName = userId + FileUtil.renameFile();
        const data = await this.pageCategoryService.findOne({ where: { name: pageCategories.name } });

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('PageCategory is Exists', data);
            return res.status(400).send(errorResponse);
        }

        let assetCreate: Asset;

        if (pageCatetoryAsset !== null && pageCatetoryAsset !== undefined) {
            const asset = new Asset();
            asset.scope = ASSET_SCOPE.PUBLIC;
            asset.userId = new ObjectID(userId);
            asset.fileName = fileName;
            asset.mimeType = pageCatetoryAsset.mimeType;
            asset.data = pageCatetoryAsset.data;
            asset.size = pageCatetoryAsset.size;
            asset.expirationDate = null;
            assetCreate = await this.assetService.create(asset);
        }

        const pageCategory: PageCategory = new PageCategory();
        pageCategory.name = pageCategories.name;
        pageCategory.description = pageCategories.description;
        pageCategory.iconURL = assetCreate ? ASSET_PATH + assetCreate.id : '';

        const result = await this.pageCategoryService.create(pageCategory);

        if (result) {
            const userObjId = new ObjectID(req.user.id);
            const pageCatObjId = new ObjectID(result.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = pageCatObjId;
            adminLogs.action = PAGE_CATEGORY_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.PAGE_CATEGORY;
            adminLogs.ip = ipAddress;
            adminLogs.data = result;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageCategory', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create PageCategory', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update PageCategory API
    /**
     * @api {put} /api/admin/page_category/:id Update PageCategory API
     * @apiGroup Admin PageCategory
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated PageCategory.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/page_category/:id
     * @apiErrorExample {json} Update PageCategory error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updatePageCategory(@Body({ validate: true }) pageCategories: PageCategoryRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const objId = new ObjectID(id);
            const assetData = pageCategories.asset;

            const pageCategoryUpdate: PageCategory = await this.pageCategoryService.findOne({ where: { _id: objId } });

            if (!pageCategoryUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid PageCategory Id', pageCategoryUpdate));
            }

            if (pageCategories.name === null || pageCategories.name === undefined) {
                pageCategories.name = pageCategoryUpdate.name;
            }

            if (pageCategories.description === null || pageCategories.description === undefined) {
                pageCategories.description = pageCategoryUpdate.description;
            }

            const pageCatIconURL = pageCategoryUpdate.iconURL;
            let assetResult;
            let assetId;
            let newAssetId;
            let iconURL;
            let newS3IconURL;

            if (assetData !== null && assetData !== undefined) {
                const data = assetData.data;
                const mimeType = assetData.mimeType;
                const size = assetData.size;
                const fileName = FileUtil.renameFile();

                if (pageCatIconURL !== null && pageCatIconURL !== undefined && pageCatIconURL !== '' && typeof (pageCatIconURL) !== 'undefined') {
                    assetId = new ObjectID(pageCatIconURL.split(ASSET_PATH)[1]);
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
                    iconURL = assetResult ? ASSET_PATH + newAssetId : '';
                    newS3IconURL = assetResult ? assetResult.s3FilePath : '';
                }
            } else {
                iconURL = pageCatIconURL;
                newS3IconURL = pageCategoryUpdate.s3IconURL;
            }

            const updateQuery = { _id: objId };
            const newValue = { $set: { name: pageCategories.name, description: pageCategories.description, iconURL, lastActiveDate: moment().toDate(), s3IconURL: newS3IconURL } };
            const pageCategorySave = await this.pageCategoryService.update(updateQuery, newValue);

            if (pageCategorySave) {
                const pageCategoryUpdated: PageCategory = await this.pageCategoryService.findOne({ where: { _id: objId } });
                const userObjId = new ObjectID(req.user.id);
                const pageCatObjId = new ObjectID(objId);

                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = pageCatObjId;
                adminLogs.action = PAGE_CATEGORY_LOG_ACTION.EDIT;
                adminLogs.contentType = LOG_TYPE.PAGE_CATEGORY;
                adminLogs.ip = ipAddress;
                adminLogs.data = pageCategoryUpdated;
                await this.actionLogService.create(adminLogs);

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update PageCategory Successful', pageCategoryUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PageCategory', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/admin/page_category/:id Delete PageCategory API
     * @apiGroup Admin PageCategory
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete PageCategory.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/page_category/:id
     * @apiErrorExample {json} Delete PageCategory Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deletePageCategory(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);

        const pageCategory = await this.pageCategoryService.findOne({ where: { _id: objId } });

        if (!pageCategory) {
            const errorResponse = ResponseUtil.getErrorResponse('Invalid PageCategory Id', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: objId };

        const deletePageCategory = await this.pageCategoryService.delete(query);

        if (!deletePageCategory) {
            const userObjId = new ObjectID(req.user.id);
            const pageCatObjId = new ObjectID(objId);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = pageCatObjId;
            adminLogs.action = PAGE_CATEGORY_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.PAGE_CATEGORY;
            adminLogs.ip = ipAddress;
            adminLogs.data = pageCategory;
            await this.actionLogService.create(adminLogs);

            const errorResponse = ResponseUtil.getErrorResponse('Unable to delete PageCategory', undefined);
            return res.status(400).send(errorResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully delete PageCategory', []);
            return res.status(200).send(successResponse);
        }
    }
}
