/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { HashTagService } from '../../services/HashTagService';
import { HashTag } from '../../models/HashTag';
import { CreateHashTagRequest } from './requests/CreateHashTagRequest';
import { UpdateHashTagRequest } from './requests/UpdateHashTagRequest';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { Asset } from '../../../api/models/Asset';
import { FileUtil } from '../../../utils/FileUtil';
import { ASSET_SCOPE, ASSET_PATH } from '../../../constants/AssetScope';
import { AssetService } from '../../../api/services/AssetService';

@JsonController('/admin/hashtag')
export class AdminHashTagController {
    constructor(private hashTagService: HashTagService, private assetService: AssetService) { }

    // Find Admin HashTag API
    /**
     * @api {get} /api/admin/hashTag/:id Find Admin HashTag API
     * @apiGroup Admin HashTag
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Admin HashTag"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/hashTag/:id
     * @apiErrorExample {json}  error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    @Authorized()
    public async findAdminHashTag(@Param('id') id: string, @Res() res: any): Promise<any> {
        const objId = new ObjectID(id);

        const hashTag = await this.hashTagService.findOne({ where: { _id: objId } });

        if (hashTag) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got HashTag', hashTag);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got HashTag', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/hashTag Create HashTag API
     * @apiGroup Admin HashTag
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create HashTag",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/hashTag
     * @apiErrorExample {json} Unable create HashTag
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createHashTag(@Body({ validate: true }) hashTags: CreateHashTagRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const assets = hashTags.asset;
        const userId = req.user.id;
        const fileName = userId + FileUtil.renameFile();
        const data = await this.hashTagService.findOne({ where: { name: hashTags.name } });

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('HashTag is Exists', data);
            return res.status(400).send(errorResponse);
        }

        let assetCreate: Asset;

        if (assets !== null && assets !== undefined && assets !== '') {
            const asset: Asset = new Asset();
            asset.scope = ASSET_SCOPE.PUBLIC;
            asset.userId = new ObjectID(userId);
            asset.fileName = fileName;
            asset.data = assets.data;
            asset.mimeType = assets.mimeType;
            asset.size = assets.size;
            asset.expirationDate = null;

            assetCreate = await this.assetService.create(asset);
        }

        const hashTag: HashTag = new HashTag();
        hashTag.name = hashTags.name;
        hashTag.iconURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        hashTag.lastActiveDate = moment().toDate();

        const result = await this.hashTagService.create(hashTag);

        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully create HashTag', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create HashTag', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search HashTag
    /**
     * @api {post} /api/admin/hashtag/search Search HashTag API
     * @apiGroup HashTag
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get hashTag search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/hashtag/search
     * @apiErrorExample {json} hashTag error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async searchHashTag(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const hashTagLists: any = await this.hashTagService.search(filter);

        if (hashTagLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Search HashTag Success', hashTagLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Search HashTag Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update HashTag API
    /**
     * @api {put} /api/admin/hashTag/:id Update HashTag API
     * @apiGroup Admin HashTag
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated HashTag.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/hashTag/:id
     * @apiErrorExample {json} Update HashTag error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updateHashTag(@Body({ validate: true }) hashTags: UpdateHashTagRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const userObjId = new ObjectID(req.user.id);
        const assets = hashTags.asset;

        const hashTagUpdate: HashTag = await this.hashTagService.findOne({ where: { _id: objId } });

        if (!hashTagUpdate) {
            return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid HashTag Id', undefined));
        }

        if (hashTags.name === null && hashTags.name === undefined && hashTags.name === '') {
            hashTags.name = hashTagUpdate.name;
        }

        const updateQuery = { _id: objId };
        const newValue = { $set: { name: hashTags.name, lastActiveDate: moment().toDate() } };
        const hashTagSave = await this.hashTagService.update(updateQuery, newValue);

        if (hashTagSave) {
            if (hashTagUpdate.iconURL !== null && hashTagUpdate.iconURL !== undefined && hashTagUpdate.iconURL !== '') {
                const assetId = new ObjectID(hashTagUpdate.iconURL.split(ASSET_PATH)[1]);
                const asset: Asset = await this.assetService.findOne({ _id: assetId });

                if (asset) {
                    if (assets.data === null && assets.data === undefined && assets.data === '') {
                        assets.data = asset.data;
                    }

                    if (assets.mimeType === null && assets.mimeType === undefined && assets.mimeType === '') {
                        assets.mimeType = asset.mimeType;
                    }

                    if (assets.size === null && assets.size === undefined && assets.size === '') {
                        assets.size = asset.size;
                    }

                    if (assets.fileName === null && assets.fileName === undefined && assets.fileName === '') {
                        assets.fileName = asset.fileName;
                    }

                    const assetFileName = assetId + FileUtil.renameFile() + userObjId;
                    const updateAssetQuery = { _id: assetId, userId: userObjId };
                    const newAssetValue = { $set: { data: assets.data, mimeType: assets.mimeType, size: assets.size, fileName: assetFileName } };
                    await this.assetService.update(updateAssetQuery, newAssetValue);
                }
            }

            const hashTagUpdated: HashTag = await this.hashTagService.findOne({ where: { _id: objId } });
            return res.status(200).send(ResponseUtil.getSuccessResponse('Update HashTag Successful', hashTagUpdated));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update HashTag', undefined));
        }
    }

    /**
     * @api {delete} /api/admin/hashtag/:id Delete HashTag API
     * @apiGroup Admin HashTag
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete HashTag.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/hashtag/:id
     * @apiErrorExample {json} Delete HashTag Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deleteHashTag(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);

        const hashTag = await this.hashTagService.findOne({ where: { _id: objId } });

        if (!hashTag) {
            const errorResponse = ResponseUtil.getErrorResponse('Invalid HashTag Id', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = { _id: objId };
        const deleteHashTag = await this.hashTagService.delete(query);

        if (deleteHashTag) {
            if (hashTag.iconURL !== null && hashTag.iconURL !== undefined && hashTag.iconURL !== '') {
                const assetId = new ObjectID(hashTag.iconURL.split(ASSET_PATH)[1]);
                const assetQuery = { _id: assetId };
                const asset: Asset = await this.assetService.findOne(assetQuery);

                if (asset) {
                    await this.assetService.delete(assetQuery);
                }
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully delete HashTag', []);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to delete HashTag', undefined);
            return res.status(400).send(errorResponse);
        }
    }
} 
