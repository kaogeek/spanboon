/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { EmergencyEventService } from '../../services/EmergencyEventService';
import { EmergencyEvent } from '../../models/EmergencyEvent';
import { CreateEmergencyEventRequest } from '../requests/CreateEmergencyEventRequest';
import { UpdateEmergencyEventRequest } from '../requests/UpdateEmergencyEventRequest';
import { ObjectID } from 'mongodb';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { FileUtil } from '../../../utils/FileUtil';
import { ASSET_SCOPE, ASSET_PATH } from '../../../constants/AssetScope';
import { Asset } from '../../models/Asset';
import { AssetService } from '../../services/AssetService';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { LOG_TYPE, EMERGENCY_LOG_ACTION } from '../../../constants/LogsAction';
import { HashTagService } from '../../services/HashTagService';
import { HashTag } from '../../models/HashTag';
import moment from 'moment';
import { PostsService } from '../../services/PostsService';

@JsonController('/admin/emergency')
export class EmergencyEventController {
    constructor(
        private emergencyEventService: EmergencyEventService,
        private hashTagService: HashTagService,
        private assetService: AssetService,
        private actionLogService: AdminUserActionLogsService,
        private postsService: PostsService,
    ) { }

    // Find EmergencyEvent API
    /**
     * @api {get} /api/admin/emergency/:id Find EmergencyEvent API
     * @apiGroup EmergencyEvent
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get EmergencyEvent"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/emergency/:id
     * @apiErrorExample {json} EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findEmergencyEvent(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        let emergencyEvent: any;

        try {
            const objId = new ObjectID(id);
            emergencyEvent = await this.emergencyEventService.findOne({ where: { _id: objId } });
        } catch (ex) {
            emergencyEvent = await this.emergencyEventService.findOne({ where: { title: id } });
        }

        if (emergencyEvent) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got EmergencyEvent', emergencyEvent);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got EmergencyEvent', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/emergency Create EmergencyEvent API
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
     * @apiSampleRequest /api/admin/emergency
     * @apiErrorExample {json} Unable create EmergencyEvent
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createEmergencyEvent(@Body({ validate: true }) emergencyEvents: CreateEmergencyEventRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const assets = emergencyEvents.asset;
        const userId = req.user.id;
        const title = emergencyEvents.title;
        const detail = emergencyEvents.detail;
        const emergencyHashTag = emergencyEvents.hashTag;
        const isPin = emergencyEvents.isPin;
        const orderingSequence = emergencyEvents.ordering;
        const fileName = userId + FileUtil.renameFile();
        const today = moment().toDate();
        const data = await this.checkEmergencyDuplicate(title, emergencyHashTag);

        if (data !== null && data !== undefined) {
            if (data.title === title) {
                const errorResponse = ResponseUtil.getErrorResponse('EmergencyEvent Title is Exists', title);
                return res.status(400).send(errorResponse);
            }

            if (data.hashTag === emergencyHashTag) {
                const errorResponse = ResponseUtil.getErrorResponse('EmergencyEvent HashTag is Exists', emergencyHashTag);
                return res.status(400).send(errorResponse);
            }
        }
        if (orderingSequence === 0) {
            return res.status(400).send(ResponseUtil.getErrorResponse('The ordering number must greater than 0 ', undefined));
        }
        if (orderingSequence < 0) {
            return res.status(400).send(ResponseUtil.getErrorResponse('The ordering number must greater than 0 ', undefined));
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

        let hashTag;
        const masterHashTag: HashTag = await this.hashTagService.findOne({ name: emergencyHashTag });

        if (masterHashTag !== null && masterHashTag !== undefined) {
            hashTag = new ObjectID(masterHashTag.id);
        } else {
            const newHashTag: HashTag = new HashTag();
            newHashTag.name = emergencyHashTag;
            newHashTag.lastActiveDate = today;
            newHashTag.count = 0;
            newHashTag.iconURL = '';

            const createHashTag = await this.hashTagService.create(newHashTag);
            hashTag = createHashTag ? new ObjectID(createHashTag.id) : null;
        }

        const emergencyEvent: EmergencyEvent = new EmergencyEvent();
        emergencyEvent.title = title;
        emergencyEvent.detail = detail;
        emergencyEvent.hashTag = hashTag;
        emergencyEvent.isPin = isPin;
        emergencyEvent.isClose = false;
        emergencyEvent.coverPageURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        emergencyEvent.s3CoverPageURL = assetCreate ? assetCreate.s3FilePath : '';
        emergencyEvent.ordering = orderingSequence;

        const CheckOrdering = await this.emergencyEventService.findOne({ ordering: orderingSequence });
        if (CheckOrdering !== undefined) {
            const checkSequences = await this.emergencyEventService.find({$and: [{ ordering: { $gt:orderingSequence} }, { ordering: { $ne: null } }] });
            for(const sequences of checkSequences){
                if(sequences !== undefined && sequences !== null){
                    const queryUpdate = {_id:sequences.id};
                    const newValues = {ordering:sequences.ordering + 1};
                    await this.emergencyEventService.update(queryUpdate,newValues);
                }else{
                    continue;
                }
            }
        }
        const result = await this.emergencyEventService.create(emergencyEvent);

        if (result) {
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.action = EMERGENCY_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.EMERGENCY;
            adminLogs.contentId = new ObjectID(result.id);
            adminLogs.ip = ipAddress;
            adminLogs.data = result;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create EmergencyEvent', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create EmergencyEvent', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search EmergencyEvent
    /**
     * @api {post} /api/admin/emergency/search Search EmergencyEvent API
     * @apiGroup EmergencyEvent
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
     * @apiSampleRequest /api/admin/emergency/search
     * @apiErrorExample {json} Search EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async searchEmergencyEvent(@Body({ validate: true }) filter: SearchFilter, @Res() res: any, @Req() req: any): Promise<any> {
        let objectiveLists = undefined;
        const checkOrdering = await this.emergencyEventService.find({ ordering: { $ne: null } });
        const shiftQuery = checkOrdering.shift();
        if (shiftQuery !== undefined) {
            objectiveLists = await this.emergencyEventService.searchOrdering(filter);
        } else {
            objectiveLists = await this.emergencyEventService.search(filter);
        }

        if (objectiveLists !== null && objectiveLists !== undefined) {
            const hashTagIdList = [];
            const objectiveMap = {};
            const hashTagMap = {};

            for (const objective of objectiveLists) {
                const hashTag = objective.hashTag;
                objectiveMap[hashTag] = objective;
                hashTagIdList.push(hashTag);
            }

            if (hashTagIdList !== null && hashTagIdList !== undefined && hashTagIdList.length > 0) {
                const hashTagList: HashTag[] = await this.hashTagService.find({ _id: { $in: hashTagIdList } });

                for (const tag of hashTagList) {
                    const hashTag = tag.id;
                    const hashTagName = tag.name;

                    if (objectiveMap[hashTag]) {
                        hashTagMap[hashTag] = hashTagName;
                    }
                }
            }

            objectiveLists.map((data) => {
                const hashTag = data.hashTag;

                if (hashTagMap[hashTag]) {
                    data.hashTag = hashTagMap[hashTag];
                }
            });

            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search EmergencyEvent', objectiveLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Search EmergencyEvent', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // editSelectItem 
    // @api {put}
    @Put('/select/:id')
    @Authorized()
    public async updateEmeregencySelectItem(@Body({ validate: true }) emergencyEvents: UpdateEmergencyEventRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const emergencyUpdate: EmergencyEvent = await this.emergencyEventService.findOne({ where: { _id: objId } });
        if (emergencyUpdate) {
            // The ordering cannot be equal >>>>>
            // check if drag is null
            for (const [j, filteredData] of emergencyEvents.filteredData.entries()) {
                const queryValue = { _id: ObjectID(filteredData.id) };
                const newValues = { $set: { ordering: j + 1 } };
                await this.emergencyEventService.update(queryValue, newValues);
            }
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search EmergencyEvent', 'DragAndDrop');
            return res.status(200).send(successResponse);
        } else {
            return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid EmergencyEvent Id', undefined));
        }
    }

    // Update EmergencyEvent API
    /**
     * @api {put} /api/admin/emergency/:id Update EmergencyEvent API
     * @apiGroup EmergencyEvent
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated EmergencyEvent.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/emergency/:id
     * @apiErrorExample {json} Update EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updateEmergencyEvent(@Body({ validate: true }) emergencyEvents: UpdateEmergencyEventRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const emergencyTitle = emergencyEvents.title;
        const emergencyDetail = emergencyEvents.detail;
        const emergencyHashTag = emergencyEvents.hashTag;
        const isClose = emergencyEvents.isClose;
        const isPin = emergencyEvents.isPin;
        const assetData = emergencyEvents.asset;
        const ordering = emergencyEvents.ordering;
        const emergencyUpdate: EmergencyEvent = await this.emergencyEventService.findOne({ where: { _id: objId } });
        if (!emergencyUpdate) {
            return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid EmergencyEvent Id', undefined));
        }

        const emergency: EmergencyEvent = await this.emergencyEventService.findOne({ _id: { $ne: new ObjectID(emergencyUpdate.id) }, $or: [{ title: emergencyTitle }, { hashTag: emergencyHashTag }] });

        if (emergency === null || emergency === undefined) {
            if (ordering === 0) {
                return res.status(400).send(ResponseUtil.getErrorResponse('The ordering number must greater than 0 ', undefined));
            }
            const emergencyCoverPageURL = emergencyUpdate.coverPageURL;
            let assetResult;
            let assetId;
            let newAssetId;
            let coverPageURL;
            let s3CoverPageURL;

            if (assetData !== null && assetData !== undefined) {
                const data = assetData.data;
                const mimeType = assetData.mimeType;
                const size = assetData.size;
                const fileName = FileUtil.renameFile();

                if (emergencyCoverPageURL !== null && emergencyCoverPageURL !== undefined && emergencyCoverPageURL !== '' && typeof (emergencyCoverPageURL) !== 'undefined') {
                    assetId = new ObjectID(emergencyCoverPageURL.split(ASSET_PATH)[1]);
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
                    coverPageURL = assetResult ? ASSET_PATH + newAssetId : '';
                    s3CoverPageURL = assetResult ? assetResult.s3FilePath : '';
                }
            } else {
                coverPageURL = emergencyCoverPageURL;
                s3CoverPageURL = emergencyUpdate.s3CoverPageURL;
            }

            const today = moment().toDate();

            let hashTagObjId;
            let masterHashTag: HashTag;
            let hashTag;

            if (emergencyHashTag !== null && emergencyHashTag !== undefined && emergencyHashTag !== '') {
                hashTagObjId = new ObjectID(hashTagObjId);
                masterHashTag = await this.hashTagService.findOne({ name: emergencyHashTag });
            }

            if (masterHashTag !== null && masterHashTag !== undefined) {
                hashTag = new ObjectID(masterHashTag.id);
            } else {
                const newHashTag: HashTag = new HashTag();
                newHashTag.name = emergencyHashTag;
                newHashTag.lastActiveDate = today;
                newHashTag.count = 0;
                newHashTag.iconURL = '';

                const createHashTag = await this.hashTagService.create(newHashTag);
                hashTag = createHashTag ? new ObjectID(createHashTag.id) : null;
            }
            const updateQuery = { _id: objId };
            const newValue = { $set: { title: emergencyTitle, detail: emergencyDetail, coverPageURL, hashTag, isClose, isPin, s3CoverPageURL } };
            const queryHash = { _id: emergencyUpdate.hashTag };
            const newValuesHashTag = { $set: { name: emergencyHashTag } };

            const hashTagUpdate = await this.hashTagService.update(queryHash, newValuesHashTag);
            if (hashTagUpdate) {
                const queryPost = { emergencyEvent: emergencyUpdate.id };
                const newValuesPost = { $set: { emergencyEventTag: emergencyHashTag } };
                await this.postsService.updateMany(queryPost, newValuesPost);
            }

            const emergencySave = await this.emergencyEventService.update(updateQuery, newValue);
            if (ordering !== undefined) {
                if (ordering < 0) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('The ordering number must greater than 0 ', undefined));
                }
                // check emergencyEvent Higher or Lower
                if (emergencyEvents.ordering !== null) {
                    // insert
                    if (emergencyUpdate.ordering === null) {
                        const queryOrder = { _id: objId };
                        const newValueOrder = { $set: { ordering: emergencyEvents.ordering } };
                        await this.emergencyEventService.update(queryOrder, newValueOrder);
                    }
                    // lower
                    else if (emergencyUpdate.ordering !== null && emergencyUpdate.ordering < emergencyEvents.ordering) {
                        const findOrderingGt = await this.emergencyEventService.find({ $and: [{ ordering: { $gt: emergencyUpdate.ordering, $lte: emergencyEvents.ordering } }, { ordering: { $ne: null } }] });
                        for (const orderingGt of findOrderingGt) {
                            // if higher 
                            if (orderingGt !== undefined && orderingGt !== null) {
                                const queryOrder = { _id: ObjectID(orderingGt.id) };
                                const newValueOrder = { $set: { ordering: orderingGt.ordering - 1 } };
                                await this.emergencyEventService.update(queryOrder, newValueOrder);
                            }
                            else {
                                continue;
                            }
                        }
                        const updateOrdering = { _id: objId };
                        const newValuesOrdering = { $set: { ordering: emergencyEvents.ordering } };
                        await this.emergencyEventService.update(updateOrdering, newValuesOrdering);
                        // higher
                    } else if (emergencyUpdate.ordering !== null && emergencyUpdate.ordering > emergencyEvents.ordering) {
                        const findOrderingGt = await this.emergencyEventService.find({ $and: [{ ordering: { $lt: emergencyUpdate.ordering, $gte: emergencyEvents.ordering } }, { ordering: { $ne: null } }] });
                        for (const orderingGt of findOrderingGt) {
                            // if higher 
                            if (findOrderingGt !== undefined && findOrderingGt !== null) {
                                const queryOrder = { _id: ObjectID(orderingGt.id) };
                                const newValueOrder = { $set: { ordering: orderingGt.ordering + 1 } };
                                await this.emergencyEventService.update(queryOrder, newValueOrder);
                            } else {
                                continue;
                            }
                        }
                        const updateOrdering = { _id: objId };
                        const newValuesOrdering = { $set: { ordering: emergencyEvents.ordering } };
                        await this.emergencyEventService.update(updateOrdering, newValuesOrdering);

                    } else {
                        const queryOrder = { _id: objId };
                        const newValueOrder = { $set: { ordering: emergencyEvents.ordering } };
                        await this.emergencyEventService.update(queryOrder, newValueOrder);
                    }
                } else if (emergencyUpdate.ordering === emergencyEvents.ordering) {
                    const queryEqual = { _id: objId };
                    const newValueEqual = { $set: { ordering: emergencyEvents.ordering } };
                    await this.emergencyEventService.update(queryEqual, newValueEqual);
                } else if (emergencyEvents.ordering === null) {
                    const queryEqual = { _id: objId };
                    const newValueEqual = { $set: { ordering: emergencyEvents.ordering } };
                    await this.emergencyEventService.update(queryEqual, newValueEqual);
                }

            }
            if (emergencySave) {
                const emergencyUpdated: EmergencyEvent = await this.emergencyEventService.findOne({ where: { _id: objId } });
                const userObjId = new ObjectID(req.user.id);

                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = objId;
                adminLogs.action = EMERGENCY_LOG_ACTION.EDIT;
                adminLogs.contentType = LOG_TYPE.EMERGENCY;
                adminLogs.ip = ipAddress;
                adminLogs.data = emergencyUpdated;
                await this.actionLogService.create(adminLogs);

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update EmergencyEvent Successful', emergencyUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update EmergencyEvent', undefined));
            }
        } else {
            if (emergencyTitle === null || emergencyTitle === undefined || emergencyUpdate.title !== emergencyTitle) {
                return res.status(400).send(ResponseUtil.getErrorResponse('EmergencyEvent Ttile is Exists', emergencyTitle));
            }

            if (emergencyHashTag === null || emergencyHashTag === undefined || emergencyUpdate.hashTag !== emergencyHashTag) {
                return res.status(400).send(ResponseUtil.getErrorResponse('EmergencyEvent HashTag is Exists', emergencyHashTag));
            }
        }
    }

    /**
     * @api {delete} /api/admin/emergency/:id Delete EmergencyEvent API
     * @apiGroup EmergencyEvent
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete EmergencyEvent.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/emergency/:id
     * @apiErrorExample {json} Delete EmergencyEvent Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deleteEmergencyEvent(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const emergencyEvent = await this.emergencyEventService.findOne({ where: { _id: objId } });
        const findOrderingGt = await this.emergencyEventService.find({ ordering: { $gt: emergencyEvent.ordering } });
        if (!emergencyEvent) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid EmergencyEvent Id', undefined));
        }

        // remove asset of objective
        if (emergencyEvent.coverPageURL !== undefined && emergencyEvent.coverPageURL !== undefined && emergencyEvent.coverPageURL !== '') {
            const fileId = emergencyEvent.coverPageURL.replace(ASSET_PATH, '');
            const assetQuery = { _id: new ObjectID(fileId) };

            try {
                await this.assetService.delete(assetQuery);
            } catch (error) {
                console.log('Cannot remove asset file: ' + fileId);
            }
        }

        const query = { _id: objId };
        const deleteObjective = await this.emergencyEventService.delete(query);

        if (deleteObjective) {
            for (const orderIng of findOrderingGt) {
                const queryGt = { _id: orderIng.id };
                const newValuesGt = { $set: { ordering: orderIng.ordering - 1 } };
                await this.emergencyEventService.update(queryGt, newValuesGt);
            }
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = EMERGENCY_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.EMERGENCY;
            adminLogs.ip = ipAddress;
            adminLogs.data = emergencyEvent;
            await this.actionLogService.create(adminLogs);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete EmergencyEvent', []));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete EmergencyEvent', undefined));
        }
    }

    private async checkEmergencyDuplicate(title: string, hashTag: string): Promise<EmergencyEvent> {
        const emergencyEvent: EmergencyEvent = await this.emergencyEventService.findOne({ $or: [{ title }, { hashTag }] });
        return (emergencyEvent !== null && emergencyEvent !== undefined) ? emergencyEvent : (null || undefined);
    }
}
