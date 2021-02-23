/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Get, Param, Res, Post, Body, Req, Delete, Authorized } from 'routing-controllers';
import { AssetService } from '../services/AssetService';
import { ObjectID } from 'mongodb';
import { FileUtil, ResponseUtil } from '../../utils/Utils';
import { Asset } from '../models/Asset';
import { ConfigService } from '../services/ConfigService';
import { ASSET_CONFIG_NAME, DEFAULT_ASSET_CONFIG_VALUE } from '../../constants/SystemConfig';
import { ASSET_SCOPE } from '../../constants/AssetScope';
import moment from 'moment';
import { AssetRequest } from './requests/AssetRequest';

@JsonController('/file')
export class AssetController {

    private IMAGE_ASSET_TYPE: string[] = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];
    private VIDEO_ASSET_TYPE: string[] = ['video/mp4', 'video/quicktime'];

    constructor(private assetService: AssetService, private configService: ConfigService) { }

    // Find Asset API
    /**
     * @api {get} /api/file/:id Find Asset API
     * @apiGroup Asset
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Asset"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/asset/:id
     * @apiErrorExample {json} Asset error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findAsset(@Param('id') id: string, @Res() res: any): Promise<any> {
        const objId = new ObjectID(id);
        const asset: Asset = await this.assetService.findOne({ where: { _id: objId } });

        if (asset) {
            const url = 'data:' + asset.mimeType + ';base64,' + asset.data;
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got Asset', url);
            return res.status(200).set('Cache-Control', 'public').send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Asset', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/file/temp Create Temp File API
     * @apiGroup PagePost
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "title": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create PagePost",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/page/:pageId/post
     * @apiErrorExample {json} Unable create PagePost
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/temp')
    @Authorized('user')
    public async createTempFiles(@Body({ validate: true }) tempFile: AssetRequest, @Res() res: any, @Req() req: any): Promise<any> {
        if (tempFile !== null && tempFile !== undefined) {
            const assetExpTimeCfg = await this.configService.getConfig(ASSET_CONFIG_NAME.EXPIRE_MINUTE);
            let assetExpTime = DEFAULT_ASSET_CONFIG_VALUE.EXPIRE_MINUTE;

            if (assetExpTimeCfg && assetExpTimeCfg.value) {
                assetExpTime = assetExpTimeCfg.value;
            }

            const userId = req.user.id;
            const userObjId = new ObjectID(userId);
            const assets = tempFile.asset;
            const fileName = FileUtil.renameFile();

            const asset = new Asset();
            asset.userId = userObjId;
            asset.scope = ASSET_SCOPE.PUBLIC;
            asset.data = assets.data;
            asset.fileName = fileName;
            asset.mimeType = assets.mimeType;
            asset.size = assets.size;

            if (assets.expirationDate !== null && assets.expirationDate !== undefined) {
                asset.expirationDate = moment().add(assetExpTime, 'minutes').toDate();
            } else {
                asset.expirationDate = assets.expirationDate;
            }

            const assetCreate: Asset = await this.assetService.create(asset);

            if (assetCreate) {
                const successResponse = ResponseUtil.getSuccessResponse('Create Asset Success', assetCreate);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Create Asset Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    /**
     * @api {delete} /api/fulfillment/:id Delete Fulfillment API
     * @apiGroup Fulfillment
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete Fulfillment.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/fulfillment/:id
     * @apiErrorExample {json} Delete Fulfillment Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/temp')
    public async deleteTempFiles(@Res() res: any): Promise<any> {
        const today = moment().toDate();

        const assets: Asset[] = await this.assetService.find({ $and: [{ expirationDate: { $ne: null } }, { expirationDate: { $lt: today } }] });
        const tempDeleted = [];

        if (assets) {
            for (const asset of assets) {
                const assetObjId = new ObjectID(asset.id);
                const query = { _id: assetObjId };
                const tempDelete = await this.assetService.delete(query);
                tempDeleted.push(tempDelete);
            }
            if (tempDeleted.length > 0) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Delete Temp Success', assets));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Delete Temp Failed', undefined));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Temp Not Found', undefined));
        }
    }

    // decode base64 to image API
    /**
     * @api {get} /api/file/:id/image  Resize Image On The Fly
     * @apiGroup Get Image File API
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "message": "Successfully resize image",
     *      "status": "1"
     *    }
     *    @apiSampleRequest /api/media/image-resize
     * @apiErrorExample {json} media error
     *    HTTP/1.1 500 Internal Server Error
     *    {
     *        "message": "Unable to resize the image",
     *        "status": 0,
     *    }
     */
    @Get('/:id/image')
    public async image_resize(@Param('id') id: string, @Res() response: any): Promise<any> {
        const imgId = new ObjectID(id);
        const asset: Asset = await this.assetService.findOne({ where: { _id: imgId } });

        if (asset) {
            if (this.IMAGE_ASSET_TYPE.indexOf(asset.mimeType) < 0 && this.VIDEO_ASSET_TYPE.indexOf(asset.mimeType) < 0) {
                const errorResponse = ResponseUtil.getErrorResponse('Only allow jpg/jpeg/png/gif format image!', undefined);
                return response.status(400).send(errorResponse);
            }

            return response.status(200).set('Content-Type', asset.mimeType).set('Cache-Control', 'public').send(Buffer.from(asset.data, 'base64'));
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got Asset', undefined);
            return response.status(400).send(errorResponse);
        }
    }
}