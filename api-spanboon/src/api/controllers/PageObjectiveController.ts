/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Req, Authorized, Put, Delete, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { PageObjective } from '../models/PageObjective';
import { CreatePageObjectiveRequest } from './requests/CreatePageObjectiveRequest';
import { UpdatePageObjectiveRequest } from './requests/UpdatePageObjectiveRequest';
import { ObjectID } from 'mongodb';
import { AssetService } from '../services/AssetService';
import { Asset } from '../models/Asset';
import { ASSET_SCOPE, ASSET_PATH } from '../../constants/AssetScope';
import { FileUtil } from '../../utils/FileUtil';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { HashTag } from '../models/HashTag';
import { HashTagService } from '../services/HashTagService';
import moment from 'moment';
import { FindHashTagRequest } from './requests/FindHashTagRequest';
import { PageObjectiveTimelineResponse } from './responses/PageObjectiveTimelineResponse';
import { PageService } from '../services/PageService';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { UserFollow } from '../models/UserFollow';
import { UserEngagementService } from '../services/UserEngagementService';
import { PostsService } from '../services/PostsService';
import { PostsCommentService } from '../services/PostsCommentService';
// import { FulfillmentCaseService } from '../services/FulfillmentCaseService';
import { SocialPostService } from '../services/SocialPostService';
// import { UserLikeService } from '../services/UserLikeService';
import { FULFILLMENT_STATUS } from '../../constants/FulfillmentStatus';
import { ObjectiveStartPostProcessor } from '../processors/objective/ObjectiveStartPostProcessor';
// import { ObjectiveNeedsProcessor } from '../processors/objective/ObjectiveNeedsProcessor';
import { ObjectiveInfluencerProcessor } from '../processors/objective/ObjectiveInfluencerProcessor';
// import { ObjectiveInfluencerFulfillProcessor } from '../processors/objective/ObjectiveInfluencerFulfillProcessor';
// import { ObjectiveInfluencerFollowedProcessor } from '../processors/objective/ObjectiveInfluencerFollowedProcessor';
import { ObjectiveLastestProcessor } from '../processors/objective/ObjectiveLastestProcessor';
import { ObjectiveShareProcessor } from '../processors/objective/ObjectiveShareProcessor';
// import { ObjectivePostLikedProcessor } from '../processors/objective/ObjectivePostLikedProcessor';
import { DateTimeUtil } from '../../utils/DateTimeUtil';
import { SearchFilter } from './requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { JoinObjectiveRequest } from './requests/JoinObjectiveRequest';
import { DeviceTokenService } from '../services/DeviceToken';
import { NotificationService } from '../services/NotificationService';
import { NOTIFICATION_TYPE } from '../../constants/NotificationType';
import { USER_TYPE } from '../../constants/NotificationType';
import { PageNotificationService } from '../services/PageNotificationService';
import { PageObjectiveJoinerService } from '../services/PageObjectiveJoinerService';
@JsonController('/objective')
export class ObjectiveController {
    constructor(
        private pageObjectiveService: PageObjectiveService,
        private hashTagService: HashTagService,
        private assetService: AssetService,
        private pageService: PageService,
        private userFollowService: UserFollowService,
        private userEngagementService: UserEngagementService,
        private postsService: PostsService,
        private postsCommentService: PostsCommentService,
        // private fulfillmentCaseService: FulfillmentCaseService,
        private socialPostService: SocialPostService,
        // private userLikeService: UserLikeService,
        private s3Service: S3Service,
        private deviceTokenService: DeviceTokenService,
        private notificationService: NotificationService,
        private pageNotificationService: PageNotificationService,
        private pageObjectiveJoinerService: PageObjectiveJoinerService
    ) { }

    // Find PageObjective API
    /**
     * @api {get} /api/objective/:id Find PageObjective API
     * @apiGroup PageObjective
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PageObjective"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/objective/:id
     * @apiErrorExample {json} PageObjective error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findObjective(@Param('id') id: string, @Res() res: any): Promise<any> {
        let objective: PageObjective;

        try {
            const objId = new ObjectID(id);
            objective = await this.pageObjectiveService.findOne({ where: { _id: objId } });
        } catch (ex) {
            objective = await this.pageObjectiveService.findOne({ where: { title: id } });
        }

        if (objective) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageObjective', objective);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PageObjective', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/objective Create PageObjective API
     * @apiGroup PageObjective
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
     *      "message": "Successfully create PageObjective",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/objective
     * @apiErrorExample {json} Unable create PageObjective
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized('user')
    public async createObjective(@Body({ validate: true }) objectives: CreatePageObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(objectives.pageId);
        const title = objectives.title;
        const detail = objectives.detail;
        const name = objectives.hashTag;
        const categoryObjIds = objectives.category;
        const today = moment().toDate();
        let hashTag;
        let fileName = undefined;
        let assets = undefined;
        let assetCreate;
        const objective: PageObjective = new PageObjective();
        let result: any;

        // objective public or private 

        /* personal === true meaning objective is public */
        // objective public
        if (objectives.personal === true) {
            const hashTagName = name;
            const masterHashTag: HashTag = await this.hashTagService.findOne({ pageId: pageObjId, name: hashTagName, type: 'OBJECTIVE' });
            if (masterHashTag !== null && masterHashTag !== undefined) {
                hashTag = new ObjectID(masterHashTag.id);
            } else {
                const newHashTag: HashTag = new HashTag();
                newHashTag.name = name;
                newHashTag.lastActiveDate = today;
                newHashTag.count = 0;
                newHashTag.iconURL = '';
                newHashTag.pageId = pageObjId;
                newHashTag.type = 'OBJECTIVE';

                const createHashTag = await this.hashTagService.create(newHashTag);
                hashTag = createHashTag ? new ObjectID(createHashTag.id) : null;
            }

            const hashTagIds = hashTag;
            const titleRequest = title;
            const pageOwnerPublic = await this.pageObjectiveService.findOne({ personal: true, $or: [{ title: titleRequest }, { hashTag: hashTagIds }] });
            const pageObj = await this.pageService.findOne({ _id: pageOwnerPublic.pageId });
            if (pageOwnerPublic !== undefined && pageOwnerPublic.title === title) {
                const generic: any = {};
                generic['id'] = pageOwnerPublic.id;
                generic['title'] = pageOwnerPublic.title;
                generic['pageId'] = pageOwnerPublic.pageId;
                generic['detail'] = pageOwnerPublic.detail;
                generic['hashTag'] = pageOwnerPublic.hashTag;
                generic['iconURL'] = pageOwnerPublic.iconURL;
                generic['s3IconURL'] = pageOwnerPublic.s3IconURL;
                generic['name'] = pageObj.name;
                const errorResponse = ResponseUtil.getErrorResponse('PageObjective is Exists', generic);
                return res.status(400).send(errorResponse);
            }
            if (pageOwnerPublic !== undefined && String(pageOwnerPublic.hashTag) === String(hashTagIds)) {
                const generic: any = {};
                generic['id'] = pageOwnerPublic.id;
                generic['title'] = pageOwnerPublic.title;
                generic['pageId'] = pageOwnerPublic.pageId;
                generic['detail'] = pageOwnerPublic.detail;
                generic['hashTag'] = pageOwnerPublic.hashTag;
                generic['iconURL'] = pageOwnerPublic.iconURL;
                generic['s3IconURL'] = pageOwnerPublic.s3IconURL;
                generic['name'] = pageObj.name;
                const errorResponse = ResponseUtil.getErrorResponse('PageObjective HashTag is Exists', generic);
                return res.status(400).send(errorResponse);
            }

            fileName = userObjId + FileUtil.renameFile();
            assets = objectives.asset;

            if (assets !== null && assets !== undefined) {
                const asset = new Asset();
                asset.userId = userObjId;
                asset.fileName = fileName;
                asset.scope = ASSET_SCOPE.PUBLIC;
                asset.data = assets.data;
                asset.size = assets.size;
                asset.mimeType = assets.mimeType;
                asset.expirationDate = null;

                assetCreate = await this.assetService.create(asset);
            }

            objective.pageId = pageObjId;
            objective.title = title;
            objective.detail = detail;
            objective.hashTag = hashTag;
            objective.category = categoryObjIds;
            objective.personal = objectives.personal;
            objective.iconURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
            objective.s3IconURL = assetCreate ? assetCreate.s3FilePath : '';

            result = await this.pageObjectiveService.create(objective);
            if (result) {
                const query = { _id: assetCreate.id };
                const newValues = { $set: { pageObjectiveId: ObjectID(result.id) } };
                await this.assetService.update(query, newValues);
                const newObjectiveHashTag = new ObjectID(result.hashTag);
                const queryHashTag = { _id: hashTag, pageId: pageObjId, type: 'OBJECTIVE' };
                const newValueHashTag = { $set: { objectiveId: ObjectID(result.id) } };
                await this.hashTagService.update(queryHashTag, newValueHashTag);
                const objectiveHashTag: HashTag = await this.hashTagService.findOne({ _id: newObjectiveHashTag });
                result.hashTag = objectiveHashTag.name;

                const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageObjective', result);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable create PageObjective', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        if (objectives.personal === false) {
            const hashTagName = name;
            const checkhashTagName = await this.hashTagService.findOne({ name: hashTagName, pageId: pageObjId, type: 'OBJECTIVE' });
            if (checkhashTagName !== undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot create Objective because the same HashTag you have one.', undefined);
                return res.status(400).send(errorResponse);
            }
            const newHashTag: HashTag = new HashTag();
            newHashTag.name = name;
            newHashTag.lastActiveDate = today;
            newHashTag.count = 0;
            newHashTag.iconURL = '';
            newHashTag.pageId = pageObjId;
            newHashTag.type = 'OBJECTIVE';

            const createHashTag = await this.hashTagService.create(newHashTag);
            hashTag = createHashTag ? new ObjectID(createHashTag.id) : null;

            fileName = userObjId + FileUtil.renameFile();
            assets = objectives.asset;
            if (assets !== null && assets !== undefined) {
                const asset = new Asset();
                asset.userId = userObjId;
                asset.fileName = fileName;
                asset.scope = ASSET_SCOPE.PUBLIC;
                asset.data = assets.data;
                asset.size = assets.size;
                asset.mimeType = assets.mimeType;
                asset.expirationDate = null;

                assetCreate = await this.assetService.create(asset);
            }

            objective.pageId = pageObjId;
            objective.title = title;
            objective.detail = detail;
            objective.hashTag = hashTag;
            objective.category = categoryObjIds;
            objective.personal = objectives.personal;
            objective.iconURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
            objective.s3IconURL = assetCreate ? assetCreate.s3FilePath : '';

            result = await this.pageObjectiveService.create(objective);
            if (result) {
                const query = { _id: assetCreate.id };
                const newValues = { $set: { pageObjectiveId: ObjectID(result.id) } };
                await this.assetService.update(query, newValues);
                const newObjectiveHashTag = new ObjectID(result.hashTag);

                const objectiveHashTag: HashTag = await this.hashTagService.findOne({ _id: newObjectiveHashTag });
                result.hashTag = objectiveHashTag.name;

                const queryHashTag = { _id: hashTag, pageId: pageObjId, type: 'OBJECTIVE' };
                const newValueHashTag = { $set: { objectiveId: ObjectID(result.id) } };
                await this.hashTagService.update(queryHashTag, newValueHashTag);

                const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageObjective', result);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unable create PageObjective', undefined);
                return res.status(400).send(errorResponse);
            }
        }
        // objective private
        /* 
        fileName = userObjId + FileUtil.renameFile();
        assets = objectives.asset;

        if (assets !== null && assets !== undefined) {
            const asset = new Asset();
            asset.userId = userObjId;
            asset.fileName = fileName;
            asset.scope = ASSET_SCOPE.PUBLIC;
            asset.data = assets.data;
            asset.size = assets.size;
            asset.mimeType = assets.mimeType;
            asset.expirationDate = null;

            assetCreate = await this.assetService.create(asset);
        }

        objective.pageId = pageId;
        objective.title = title;
        objective.detail = detail;
        objective.hashTag = hashTag;
        objective.category = categoryObjIds;
        objective.personal = objectives.personal;
        objective.iconURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        objective.s3IconURL = assetCreate ? assetCreate.s3FilePath : '';

        result = await this.pageObjectiveService.create(objective);
        if (result) {
            const query = { _id: assetCreate.id };
            const newValues = { $set: { pageObjectiveId: ObjectID(result.id) } };
            await this.assetService.update(query, newValues);
            const newObjectiveHashTag = new ObjectID(result.hashTag);

            const objectiveHashTag: HashTag = await this.hashTagService.findOne({ _id: newObjectiveHashTag });
            result.hashTag = objectiveHashTag.name;

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageObjective', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create PageObjective', undefined);
            return res.status(400).send(errorResponse);
        } */
    }

    @Post('/join')
    @Authorized('user')
    public async joinObjective(@Body({ validate: true }) joinObjectiveRequest: JoinObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const objtiveIds = new ObjectID(joinObjectiveRequest.objectiveId);
        const pageObjId = new ObjectID(joinObjectiveRequest.pageId);
        const joinerObjId = new ObjectID(joinObjectiveRequest.joiner);
        const join = joinObjectiveRequest.join;
        const space = ' ';
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const interval_15 = 15;
        const interval_30 = 30;
        const searchObjective = await this.pageObjectiveJoinerService.find({ objectiveId: objtiveIds });
        const checkJoinObjective = await this.pageObjectiveJoinerService.findOne({ objectiveId: objtiveIds, pageId: pageObjId, joiner: joinerObjId });
        const checkPublicObjective = await this.pageObjectiveService.findOne({ _id: objtiveIds });
        const pageOwner = await this.pageService.findOne({ _id: pageObjId });
        const pageJoiner = await this.pageService.findOne({ _id: joinerObjId });
        let notificationText = undefined;
        let link = undefined;

        if (checkJoinObjective !== undefined && checkJoinObjective !== null && checkJoinObjective.join === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been join this objective.', undefined);
            return res.status(400).send(errorResponse);
        }

        // if auto approve 
        if (join === true && checkPublicObjective.personal === true && pageOwner.autoApprove === true) {
            if (pageJoiner && pageOwner.id) {
                const notiOwners = await this.deviceTokenService.find({ userId: pageOwner.ownerUser });
                notificationText = pageJoiner.name + space + 'เข้าร่วมสิ่งที่กำลังทำของเพจคุณ';
                link = `/page/${pageJoiner.id}/`;
                if (searchObjective.length === 0 || searchObjective.length <= 10) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.OBJECTIVE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = true;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 10 && searchObjective.length <= 50 && minutes % interval_15 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = true;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 50 && searchObjective.length <= 300 && minutes % interval_30 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = true;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 300 && searchObjective.length <= 2000 && hours % 2 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = true;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 2000 && hours % 3 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = true;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Error not found page owner objective.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
        // not auto approve
        if (join === true && checkPublicObjective.personal === true) {
            if (pageJoiner && pageOwner.id) {
                const notiOwners = await this.deviceTokenService.find({ userId: pageOwner.ownerUser });
                notificationText = pageJoiner.name + space + 'ขอเข้าร่วมสิ่งที่กำลังทำของเพจคุณ';
                link = `/page/${pageJoiner.id}/`;
                if (searchObjective.length === 0 || searchObjective.length <= 10) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.OBJECTIVE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = false;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 10 && searchObjective.length <= 50 && minutes % interval_15 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = false;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 50 && searchObjective.length <= 300 && minutes % interval_30 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = false;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 300 && searchObjective.length <= 2000 && hours % 2 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = false;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                } else if (searchObjective.length > 2000 && hours % 3 === 0) {
                    await this.pageNotificationService.notifyToPageUserFcm(
                        pageOwner.id + '',
                        undefined,
                        req.user.id + '',
                        USER_TYPE.PAGE,
                        NOTIFICATION_TYPE.LIKE,
                        notificationText,
                        link,
                        pageJoiner.name,
                        pageJoiner.imageURL
                    );
                    for (const notiOwner of notiOwners) {
                        if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                            await this.notificationService.sendNotificationFCM
                                (
                                    pageOwner.id + '',
                                    USER_TYPE.PAGE,
                                    req.user.id + '',
                                    USER_TYPE.PAGE,
                                    NOTIFICATION_TYPE.OBJECTIVE,
                                    notificationText,
                                    link,
                                    notiOwner.Tokens,
                                    pageJoiner.name,
                                    pageJoiner.imageURL
                                );
                        } else {
                            continue;
                        }
                    }
                    const result: any = {};
                    result['objectiveId'] = objtiveIds;
                    result['pageId'] = pageObjId;
                    result['joiner'] = joinerObjId;
                    result['join'] = join;
                    result['approve'] = false;
                    const create = await this.pageObjectiveJoinerService.create(result);
                    if (create) {
                        const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                        return res.status(200).send(successResponse);
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Error not found page owner objective.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create join objective', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/lists')
    @Authorized('user')
    public async searchListObjectiveJoiner(@Body({ validate: true }) joinObjectiveRequest: JoinObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const objtiveIds = new ObjectID(joinObjectiveRequest.objectiveId);
        const pageObjId = new ObjectID(joinObjectiveRequest.pageId);
        if (objtiveIds !== undefined && objtiveIds !== null && pageObjId !== undefined && pageObjId !== null) {
            const searchObjectives = await this.pageObjectiveJoinerService.aggregate(
                [
                    {
                        $match: {
                            objectiveId: objtiveIds,
                            pageId: pageObjId,
                            join: true,
                            approve: false
                        }
                    },
                    {
                        $lookup: {
                            from: 'Page',
                            let: { joiner: '$joiner' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$$joiner', '$_id']
                                        }
                                    }
                                }
                            ],
                            as: 'page'
                        }
                    }
                ]
            );
            if (searchObjectives.length > 0) {
                const successResponse = ResponseUtil.getSuccessResponse('Search lists objective is succesful.', searchObjectives);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot find any lists objective.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to get lists objective', undefined);
            return res.status(400).send(errorResponse);
        }

    }

    @Post('/disjoin')
    @Authorized('user')
    public async disJoinObjective(@Body({ validate: true }) joinObjectiveRequest: JoinObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const objtiveIds = new ObjectID(joinObjectiveRequest.objectiveId);
        const pageObjId = new ObjectID(joinObjectiveRequest.pageId);
        const joinerObjId = new ObjectID(joinObjectiveRequest.joiner);
        const joined = joinObjectiveRequest.join;
        const approved = joinObjectiveRequest.approved;

        const joinObjective = await this.pageObjectiveJoinerService.findOne({ objectiveId: objtiveIds, pageId: pageObjId, joiner: joinerObjId, join: joined, approve: approved });
        if (joinObjective) {
            const query = {
                _id: joinObjective.id,
                objectiveId: joinObjective.objectiveId,
                pageId: joinObjective.pageId,
                joiner: joinObjective.joiner,
            };
            const update = await this.pageObjectiveJoinerService.delete(query);
            const postUpdate = await this.postsService.updateMany(
                { pageId: joinObjective.joiner, objective: joinObjective.objectiveId },
                { $set: { objective: null, objectiveTag: null } }
            );
            if (update && postUpdate) {
                const successResponse = ResponseUtil.getSuccessResponse('Unjoin is successfully.', []);
                return res.status(200).send(successResponse);
            }

        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found objective.', undefined);
            return res.status(400).send(errorResponse);
        }

    }

    @Post('/approve')
    @Authorized('user')
    public async approveObjective(@Body({ validate: true }) joinObjectiveRequest: JoinObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const objtiveIds = new ObjectID(joinObjectiveRequest.objectiveId);
        const pageObjId = new ObjectID(joinObjectiveRequest.pageId);
        const joinerObjId = new ObjectID(joinObjectiveRequest.joiner);
        const approved = joinObjectiveRequest.approved;
        const pageJoiner = await this.pageService.findOne({ _id: joinerObjId });
        const checkPublicObjective = await this.pageObjectiveService.findOne({ _id: objtiveIds, pageId: pageObjId });
        let notificationText = undefined;
        let link = undefined;

        const checkApprove = await this.pageObjectiveJoinerService.findOne({ objectiveId: objtiveIds, pageId: pageObjId, joiner: joinerObjId });

        if (checkApprove !== undefined && checkApprove !== null && checkApprove.approve === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been approved.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (
            approved !== undefined &&
            approved !== null &&
            objtiveIds !== undefined &&
            objtiveIds !== null &&
            pageObjId !== undefined &&
            pageObjId !== null &&
            checkPublicObjective.personal === true
        ) {
            if (approved === true) {
                const notiJoiners = await this.deviceTokenService.find({ user: pageJoiner.ownerUser });
                notificationText = 'คุณได้ถูกอนุมัติเข้าร่วมสิ่งที่กำลังทำ';
                link = `/objective/${objtiveIds}`;
                await this.pageNotificationService.notifyToPageUserFcm(
                    pageJoiner.id + '',
                    undefined,
                    req.user.id + '',
                    USER_TYPE.PAGE,
                    NOTIFICATION_TYPE.OBJECTIVE,
                    notificationText,
                    link,
                    pageJoiner.name,
                    pageJoiner.imageURL
                );
                if (notiJoiners.length > 0) {
                    for (const notiJoiner of notiJoiners) {
                        await this.notificationService.sendNotificationFCM
                            (
                                pageJoiner.id + '',
                                USER_TYPE.PAGE,
                                req.user.id + '',
                                USER_TYPE.PAGE,
                                NOTIFICATION_TYPE.OBJECTIVE,
                                notificationText,
                                link,
                                notiJoiner.Tokens,
                                pageJoiner.name,
                                pageJoiner.imageURL
                            );
                    }
                }
                if (checkApprove) {
                    const query = { objectiveId: objtiveIds, pageId: pageObjId, joiner: joinerObjId, join: joinObjectiveRequest.join };
                    const newValues = { $set: { approve: approved } };
                    const update = await this.pageObjectiveJoinerService.update(query, newValues);
                    if (update) {
                        const successResponse = ResponseUtil.getSuccessResponse('Join objective is sucessful.', newValues);
                        return res.status(200).send(successResponse);
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Approve is not success.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const notiJoiners = await this.deviceTokenService.find({ user: pageJoiner.ownerUser });
                notificationText = 'คุณถูกปฏิเสธการเข้าร่วมสิ่งที่กำลังทำ';
                link = `/objective/${objtiveIds}`;
                await this.pageNotificationService.notifyToPageUserFcm(
                    pageJoiner.id + '',
                    undefined,
                    req.user.id + '',
                    USER_TYPE.PAGE,
                    NOTIFICATION_TYPE.OBJECTIVE,
                    notificationText,
                    link,
                    pageJoiner.name,
                    pageJoiner.imageURL
                );
                if (notiJoiners.length > 0) {
                    for (const notiJoiner of notiJoiners) {
                        await this.notificationService.sendNotificationFCM
                            (
                                pageJoiner.id + '',
                                USER_TYPE.PAGE,
                                req.user.id + '',
                                USER_TYPE.PAGE,
                                NOTIFICATION_TYPE.OBJECTIVE,
                                notificationText,
                                link,
                                notiJoiner.Tokens,
                                pageJoiner.name,
                                pageJoiner.imageURL
                            );
                    }
                }
                const errorResponse = ResponseUtil.getErrorResponse('Reject to join the objective.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    @Post('/search/all')
    @Authorized('user')
    public async searchObjectives(@Body({ validate: true }) search: FindHashTagRequest, @QueryParam('sample') sample: number, @Req() req: any, @Res() res: any): Promise<any> {
        const userObjIds = new ObjectID(req.headers.userid);
        const pageObjIds = await this.pageService.findOne({ ownerUser: userObjIds });
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }

        let filter: any = search.filter;
        if (filter === undefined) {
            filter = new SearchFilter();
        }
        const order = filter.orderBy.createdDate;
        const take = filter.limit;
        const offset = filter.offset;
        if (pageObjIds !== undefined && pageObjIds !== null) {
            const pageObjective = await this.pageObjectiveService.aggregate(
                [
                    {
                        $match: { pageId: pageObjIds.id }
                    },
                    {
                        $lookup: {
                            from: 'PageObjectiveJoiner',
                            let: { pageId: '$pageId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$$pageId', '$pageId']
                                        }
                                    }
                                },
                                {
                                    $match: { join: true, approve: true }
                                },
                                {
                                    $lookup: {
                                        from: 'Page',
                                        let: { joiner: '$joiner' },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $eq: ['$$joiner', '$_id']
                                                    }
                                                }
                                            }
                                        ],
                                        as: 'page'
                                    }
                                }
                            ],
                            as: 'pageObjectiveJoiner'
                        }
                    },
                    {
                        $sort: {
                            createdDate: order
                        }
                    },
                    {
                        $limit: take
                    },
                    {
                        $skip: offset
                    }
                ]
            );
            if (pageObjective.length > 0) {
                const successResponse = ResponseUtil.getSuccessResponse('Successfully Search PageObjective', pageObjective);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Not found objective.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found user.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search PageObjective
    /**
     * @api {post} /api/objective/search Search PageObjective API
     * @apiGroup PageObjective
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get objective search",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/objective/search
     * @apiErrorExample {json} Search PageObjective error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchObjective(@Body({ validate: true }) search: FindHashTagRequest, @QueryParam('sample') sample: number, @Req() req: any, @Res() res: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }

        const hashTag = search.hashTag;
        let filter: any = search.filter;
        const hashTagIdList = [];
        const hashTagMap = {};
        let hashTagList: HashTag[];
        if (filter === undefined) {
            filter = new SearchFilter();
        }

        if (hashTag !== null && hashTag !== undefined && hashTag !== '') {
            hashTagList = await this.hashTagService.find({ name: { $regex: '.*' + hashTag + '.*', $options: 'si' } });
        } else {
            hashTagList = await this.hashTagService.find();
        }

        if (hashTagList.length === 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search PageObjective', []);
            return res.status(200).send(successResponse);
        }
        if (hashTagList !== null && hashTagList !== undefined && hashTagList.length > 0) {
            for (const masterHashTag of hashTagList) {
                const id = masterHashTag.id;
                hashTagMap[id] = masterHashTag;
                hashTagIdList.push(new ObjectID(id));
            }
        }

        let objectiveLists: PageObjective[];

        let aggregateStmt: any[];
        if (sample !== undefined && sample !== null && sample > 0) {
            aggregateStmt = [
                { $match: filter.whereConditions },
                { $sample: { size: sample } }
            ];
            if (filter.orderBy !== undefined) {
                aggregateStmt.push({ $sort: filter.orderBy });
            }
            if (filter.offset !== undefined) {
                aggregateStmt.push({ $skip: filter.offset });
            }
            if (filter.limit !== undefined) {
                aggregateStmt.push({ $limit: filter.limit });
            }
        }

        if (filter.whereConditions !== null && filter.whereConditions !== undefined && Object.keys(filter.whereConditions).length > 0 && typeof filter.whereConditions === 'object') {
            const pageId = filter.whereConditions.pageId;
            let pageObjId;
            if (pageId !== null && pageId !== undefined && pageId !== '' && JSON.stringify(pageId) !== '{}') {
                pageObjId = new ObjectID(filter.whereConditions.pageId);
            }

            if (pageObjId !== null && pageObjId !== undefined) {
                filter.whereConditions.pageId = pageObjId;
            }

            if (hashTagIdList !== null && hashTagIdList !== undefined && hashTagIdList.length > 0) {
                filter.whereConditions.hashTag = { $in: hashTagIdList };
            }

            if (filter.whereConditions.id !== null && filter.whereConditions.id !== undefined && filter.whereConditions.id !== '') {
                filter.whereConditions._id = new ObjectID(filter.whereConditions.id);
                delete filter.whereConditions.id;
            }

            if (filter.whereConditions._id !== null && filter.whereConditions._id !== undefined && filter.whereConditions._id !== '') {
                filter.whereConditions._id = new ObjectID(filter.whereConditions._id);
            }

            if (filter.whereConditions.createdDate !== null && filter.whereConditions.createdDate !== undefined && typeof filter.whereConditions.createdDate === 'object') {
                if (filter.whereConditions.createdDate['$gte'] !== undefined) {
                    filter.whereConditions.createdDate['$gte'] = DateTimeUtil.parseISOStringToDate(filter.whereConditions.createdDate['$gte']);
                }
                if (filter.whereConditions.createdDate['$lte'] !== undefined) {
                    filter.whereConditions.createdDate['$lte'] = DateTimeUtil.parseISOStringToDate(filter.whereConditions.createdDate['$lte']);
                }
            }

            if (aggregateStmt !== undefined && aggregateStmt.length > 0) {
                objectiveLists = await this.pageObjectiveService.aggregateEntity(aggregateStmt, { signURL: true });
            } else {
                objectiveLists = await this.pageObjectiveService.find(filter.whereConditions, { signURL: true });
            }
        } else {
            if (aggregateStmt !== undefined && aggregateStmt.length > 0) {
                objectiveLists = await this.pageObjectiveService.aggregateEntity(aggregateStmt, { signURL: true });
            } else {
                // filter.limit
                // filter.offset
                // filter.orderBy.createdDate
                const order = filter.orderBy.createdDate;
                const take = filter.limit;
                const offset = filter.offset;
                objectiveLists = await this.pageObjectiveService.aggregate(
                    [
                        {
                            $lookup: {
                                from: 'Page',
                                let: { pageId: '$pageId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$pageId', '$_id']
                                            }
                                        },
                                    },
                                    {
                                        $match: {
                                            isOfficial: true
                                        }
                                    }
                                ],
                                as: 'page'
                            }
                        },
                        {
                            $match: { page: { $ne: [] } }
                        },
                        {
                            $sort: {
                                createdDate: order
                            }
                        },
                        {
                            $limit: take
                        },
                        {
                            $skip: offset
                        }
                    ]
                );
                if (objectiveLists) {
                    for (const objective of objectiveLists) {
                        if (objective.s3IconURL && objective.s3IconURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(objective.s3IconURL);
                                Object.assign(objective, { iconSignURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search PageObjective Error: ', error);
                            }
                        }
                    }
                }
            }
        }

        if (objectiveLists !== null && objectiveLists !== undefined && objectiveLists.length > 0) {
            objectiveLists.map((data) => {
                const hashTagKey = data.hashTag;
                const objective = hashTagMap[hashTagKey];

                if (objective) {
                    const hashTagName = objective.name;
                    data.hashTag = hashTagName;
                }
            });

            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search PageObjective', objectiveLists);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search PageObjective', []);
            return res.status(200).send(successResponse);
        }
    }

    @Post('/search/join')
    public async searchJoinObjective(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Req() req: any, @Res() res: any): Promise<any> {
        const offSetNumber: number = offset;
        const limitNumber: number = limit;
        const pageObjIds = new ObjectID(req.body.pageId);

        const pageJoinerObjective: any = await this.pageObjectiveJoinerService.aggregate(
            [
                {
                    $match: {
                        joiner: pageObjIds, join: true, approve: true
                    }
                },
                {
                    $lookup: {
                        from: 'PageObjective',
                        let: { objectiveId: '$objectiveId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$objectiveId', '$_id']
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'HashTag',
                                    let: { hashTag: '$hashTag' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$hashTag', '$_id']
                                                },
                                            },
                                        },
                                    ],
                                    as: 'hashTag'
                                },
                            },
                            {
                                $unwind: {
                                    path: '$hashTag',
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                        ],
                        as: 'pageObjective'
                    }
                },
                {
                    $unwind: {
                        path: '$pageObjective',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $skip: offSetNumber
                },
                {
                    $limit: limitNumber,

                },
            ]
        );
        const resultStack: any = [];
        for (const row of pageJoinerObjective) {
            const result: any = {};
            result['id'] = row.pageObjective._id;
            result['pageId'] = row.pageObjective.pageId;
            result['title'] = row.pageObjective.title;
            result['detail'] = row.pageObjective.detail;
            result['hashTag'] = row.pageObjective.hashTag._id;
            result['hashTagName'] = row.pageObjective.hashTag.name;
            result['iconURL'] = row.pageObjective.iconURL;
            result['s3IconURL'] = row.pageObjective.s3IconURL;
            result['personal'] = row.pageObjective.personal;
            result['joiner'] = row.joiner;
            result['join'] = row.join;
            result['approve'] = row.approve;
            result['createdDate'] = row.pageObjective.createdDate;
            resultStack.push(result);
        }
        if (resultStack.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search PageObjective', resultStack);
            return res.status(200).send(successResponse);
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot find Join PageObjective.', undefined));
        }
    }

    // Update PageObjective API
    /**
     * @api {put} /api/objective/:id Update PageObjective API
     * @apiGroup PageObjective
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated PageObjective.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/objective/:id
     * @apiErrorExample {json} Update PageObjective error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized('user')
    public async updateObjective(@Param('id') id: string, @Body({ validate: true }) objectives: UpdatePageObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        let titleRequest: string = objectives.title;
        let detailRequest: string = objectives.detail;
        const name = objectives.hashTag;
        const objId = new ObjectID(id);
        const userObjId = new ObjectID(req.user.id);
        const pageObjId = new ObjectID(objectives.pageId);
        const category = objectives.category;
        const newFileName = userObjId + FileUtil.renameFile() + objId;
        const assetFileName = newFileName;
        const today = moment().toDate();
        const updatedDate = today;
        let queryHashtag = undefined;
        let newValueHashTag = undefined;
        let updateHashTag = undefined;
        // update objective public or private 
        const checkObjective = await this.pageObjectiveService.findOne({ _id: objId, pageId: pageObjId });
        if (checkObjective.personal === true) {
            // public
            // if hashTagObjective === objectives.hashTag you can edit hashtag
            const hashTagObjective = checkObjective.hashTag;
            const hashTagName: string = name;
            const checkHashTag = await this.hashTagService.find({ name: hashTagName });
            if (checkHashTag.length > 0) {
                return res.status(400).send(ResponseUtil.getErrorResponse('You cannot edit hashtag because your objective is public and the hashTag is duplicate.', undefined));
            }
            if (checkHashTag === undefined) {
                queryHashtag = { _id: hashTagObjective, pageId: pageObjId, objectiveId: objId, type: 'OBJECTIVE' };
                newValueHashTag = { $set: { name: hashTagName } };
                updateHashTag = await this.hashTagService.update(queryHashtag, newValueHashTag);
                if (updateHashTag) {
                    await this.postsService.updateMany({ objective: hashTagObjective }, { $set: { objectiveTag: hashTagName } });
                }

                const hashTagObjIds = hashTagObjective;

                const objectiveUpdate: PageObjective = await this.pageObjectiveService.findOne({ where: { _id: objId, pageId: pageObjId, $or: [{ title: titleRequest }, { hashTag: hashTagObjIds }] } });
                if (objectiveUpdate === null || objectiveUpdate === undefined) {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('Objective Not Found', undefined));
                }
                if (titleRequest === null || titleRequest === undefined) {
                    titleRequest = objectiveUpdate.title;
                }

                if (detailRequest === null || detailRequest === undefined) {
                    detailRequest = objectiveUpdate.detail;
                }

                const objectiveIconURL = objectiveUpdate.iconURL;
                const objectiveAsset = objectives.asset;
                let assetData;
                let assetMimeType;
                let assetSize;
                let assetResult;
                let assetId;
                let newAssetId;
                let iconURL;
                let s3IconURL;

                if (objectiveAsset !== null && objectiveAsset !== undefined) {
                    assetData = objectiveAsset.data;
                    assetMimeType = objectiveAsset.mimeType;
                    assetSize = objectiveAsset.size;

                    if (objectiveIconURL !== null && objectiveIconURL !== undefined) {
                        assetId = new ObjectID(objectiveIconURL.split(ASSET_PATH)[1]);

                        const assetQuery = { _id: assetId, userId: userObjId };
                        const newAssetValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate } };
                        await this.assetService.update(assetQuery, newAssetValue);
                        newAssetId = assetId;
                        assetResult = await this.assetService.findOne({ _id: new ObjectID(newAssetId) });
                    } else {
                        const asset = new Asset();
                        asset.userId = userObjId;
                        asset.data = assetData;
                        asset.mimeType = assetMimeType;
                        asset.fileName = assetFileName;
                        asset.size = assetSize;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        assetResult = await this.assetService.create(asset);
                        newAssetId = assetResult.id;
                    }

                    if (assetResult) {
                        iconURL = assetResult ? ASSET_PATH + newAssetId : '';
                        s3IconURL = assetResult ? assetResult.s3FilePath : '';
                    }
                } else {
                    iconURL = objectiveIconURL;
                    s3IconURL = objectiveUpdate.s3IconURL;
                }
                const updateQuery = { _id: objId, pageId: pageObjId };
                const newValue = { $set: { title: detailRequest, detail: detailRequest, iconURL, hashTag: hashTagObjective, s3IconURL, category, personal: objectives.personal } };
                const objectiveSave = await this.pageObjectiveService.update(updateQuery, newValue);

                if (objectiveSave) {
                    const result: any = {};
                    result['_id'] = objectiveUpdate.id;
                    result['pageId'] = objectiveUpdate.pageId;
                    result['title'] = objectiveUpdate.title;
                    result['detail'] = objectiveUpdate.detail;
                    result['hashTag'] = objectiveUpdate.hashTag;
                    result['hashTagName'] = hashTagName;
                    result['iconURL'] = objectiveUpdate.iconURL;
                    result['s3IconURL'] = objectiveUpdate.s3IconURL;
                    result['personal'] = objectiveUpdate.personal;
                    result['createdDate'] = objectiveUpdate.createdDate;
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Update PageObjective Successful', result));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PageObjective', undefined));
                }
            }
        } else {
            // private
            // ??
            const hashTags: string = name;
            const hashTagName = await this.hashTagService.find({ name: hashTags, pageId: pageObjId, type: 'OBJECTIVE' });
            if (hashTagName.length > 0) {
                return res.status(400).send(ResponseUtil.getErrorResponse('HashTag is duplicate.', undefined));
            } else {
                const hashTagPrivate = checkObjective.hashTag;
                queryHashtag = { _id: hashTagPrivate, pageId: pageObjId, objectiveId: objId, type: 'OBJECTIVE' };
                newValueHashTag = { $set: { name: hashTags } };
                updateHashTag = await this.hashTagService.update(queryHashtag, newValueHashTag);
                if (updateHashTag) {
                    await this.postsService.updateMany({ objective: objId }, { $set: { objectiveTag: hashTags } });
                }
                const hashTagObjIds = hashTagPrivate;

                const objectiveUpdate: PageObjective = await this.pageObjectiveService.findOne({ where: { _id: objId, pageId: pageObjId, $or: [{ title: titleRequest }, { hashTag: hashTagObjIds }] } });
                if (objectiveUpdate === null || objectiveUpdate === undefined) {
                    return res.status(400).send(ResponseUtil.getSuccessResponse('Objective Not Found', undefined));
                }
                if (titleRequest === null || titleRequest === undefined) {
                    titleRequest = objectiveUpdate.title;
                }

                if (detailRequest === null || detailRequest === undefined) {
                    detailRequest = objectiveUpdate.detail;
                }

                const objectiveIconURL = objectiveUpdate.iconURL;
                const objectiveAsset = objectives.asset;
                let assetData;
                let assetMimeType;
                let assetSize;
                let assetResult;
                let assetId;
                let newAssetId;
                let iconURL;
                let s3IconURL;

                if (objectiveAsset !== null && objectiveAsset !== undefined) {
                    assetData = objectiveAsset.data;
                    assetMimeType = objectiveAsset.mimeType;
                    assetSize = objectiveAsset.size;

                    if (objectiveIconURL !== null && objectiveIconURL !== undefined) {
                        assetId = new ObjectID(objectiveIconURL.split(ASSET_PATH)[1]);

                        const assetQuery = { _id: assetId, userId: userObjId };
                        const newAssetValue = { $set: { data: assetData, mimeType: assetMimeType, fileName: assetFileName, size: assetSize, updateDate: updatedDate } };
                        await this.assetService.update(assetQuery, newAssetValue);
                        newAssetId = assetId;
                        assetResult = await this.assetService.findOne({ _id: new ObjectID(newAssetId) });
                    } else {
                        const asset = new Asset();
                        asset.userId = userObjId;
                        asset.data = assetData;
                        asset.mimeType = assetMimeType;
                        asset.fileName = assetFileName;
                        asset.size = assetSize;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        assetResult = await this.assetService.create(asset);
                        newAssetId = assetResult.id;
                    }

                    if (assetResult) {
                        iconURL = assetResult ? ASSET_PATH + newAssetId : '';
                        s3IconURL = assetResult ? assetResult.s3FilePath : '';
                    }
                } else {
                    iconURL = objectiveIconURL;
                    s3IconURL = objectiveUpdate.s3IconURL;
                }
                const updateQuery = { _id: objId, pageId: pageObjId };
                const newValue = { $set: { title: titleRequest, detail: detailRequest, iconURL, hashTag: hashTagObjIds, s3IconURL, category, personal: objectives.personal } };
                const objectiveSave = await this.pageObjectiveService.update(updateQuery, newValue);

                if (objectiveSave) {
                    const result: any = {};
                    result['_id'] = objectiveUpdate.id;
                    result['pageId'] = objectiveUpdate.pageId;
                    result['title'] = objectiveUpdate.title;
                    result['detail'] = objectiveUpdate.detail;
                    result['hashTag'] = objectiveUpdate.hashTag;
                    result['hashTagName'] = hashTagName;
                    result['iconURL'] = objectiveUpdate.iconURL;
                    result['s3IconURL'] = objectiveUpdate.s3IconURL;
                    result['personal'] = objectiveUpdate.personal;
                    result['createdDate'] = objectiveUpdate.createdDate;
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Update PageObjective Successful', result));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PageObjective', undefined));
                }
            }
        }

    }

    // invite objective 
    @Post('/invite')
    @Authorized('user')
    public async inviteObjective(@Body({ validate: true }) joinObjectiveRequest: JoinObjectiveRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const objtiveIds = new ObjectID(joinObjectiveRequest.objectiveId);
        const pageObjId = new ObjectID(joinObjectiveRequest.pageId);
        const joinerObjId = new ObjectID(joinObjectiveRequest.joiner);
        const join = joinObjectiveRequest.join;
        const space = ' ';
        const checkJoinObjective = await this.pageObjectiveJoinerService.findOne({ objectiveId: objtiveIds, pageId: pageObjId, joiner: joinerObjId });
        const checkPublicObjective = await this.pageObjectiveService.findOne({ _id: objtiveIds });
        const pageOwner = await this.pageService.findOne({ _id: pageObjId });
        const pageJoiner = await this.pageService.findOne({ _id: joinerObjId });
        let notificationText = undefined;
        let link = undefined;

        if (checkJoinObjective !== undefined && checkJoinObjective !== null && checkJoinObjective.join === true) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been invite this objective.', undefined);
            return res.status(400).send(errorResponse);
        }
        // not auto approve
        if (join === true && checkPublicObjective.personal === true) {
            if (pageJoiner && pageOwner.id) {
                const notiOwners = await this.deviceTokenService.find({ userId: pageOwner.ownerUser });
                notificationText = pageJoiner.name + space + 'เชิญเข้าร่วมกิจกรรม' + checkPublicObjective.title;
                link = `/page/${pageJoiner.id}/`;
                await this.pageNotificationService.notifyToPageUserFcm(
                    pageOwner.id + '',
                    undefined,
                    req.user.id + '',
                    USER_TYPE.PAGE,
                    NOTIFICATION_TYPE.OBJECTIVE,
                    notificationText,
                    link,
                    pageJoiner.name,
                    pageJoiner.imageURL
                );
                for (const notiOwner of notiOwners) {
                    if (notiOwner.Tokens !== null && notiOwner.Tokens !== undefined && notiOwner.Tokens !== '') {
                        await this.notificationService.sendNotificationFCM
                            (
                                pageOwner.id + '',
                                USER_TYPE.PAGE,
                                req.user.id + '',
                                USER_TYPE.PAGE,
                                NOTIFICATION_TYPE.OBJECTIVE,
                                notificationText,
                                link,
                                notiOwner.Tokens,
                                pageJoiner.name,
                                pageJoiner.imageURL
                            );
                    } else {
                        continue;
                    }
                }
                const result: any = {};
                result['objectiveId'] = objtiveIds;
                result['pageId'] = pageObjId;
                result['joiner'] = joinerObjId;
                result['join'] = join;
                result['approve'] = false;
                const create = await this.pageObjectiveJoinerService.create(result);
                if (create) {
                    const successResponse = ResponseUtil.getSuccessResponse('Send noti is succesful.', []);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Error not found page owner objective.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create join objective', undefined);
            return res.status(400).send(errorResponse);
        }

    }
    /**
     * @api {delete} /api/objective/:id Delete PageObjective API
     * @apiGroup PageObjective
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete PageObjective.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/objective/:id
     * @apiErrorExample {json} Delete PageObjective Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id/:pageId')
    @Authorized('user')
    public async deleteObjective(@Param('pageId') pageId: string, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageIdObj = new ObjectID(pageId);
        const objId = new ObjectID(id);
        const objective: PageObjective = await this.pageObjectiveService.findOne({ where: { _id: objId, pageId: pageIdObj } });
        let query;
        let deleteObjective;
        if (objective === undefined && objective === null) {
            // check join
            const pageJoiner = await this.pageObjectiveJoinerService.findOne({ objectiveId: objId, pageId: pageIdObj });
            if (pageJoiner) {
                query = { _id: objId };
                deleteObjective = await this.pageObjectiveJoinerService.delete(query);
                await this.hashTagService.delete({ _id: pageJoiner.hashTag, type: 'OBJECTIVE' });
                if (deleteObjective) {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete PageObjective', []));
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete PageObjective', undefined));
            }
        }

        if (!objective) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid PageObjective Id', undefined));
        }

        // remove asset of objective
        if (objective.iconURL !== undefined && objective.iconURL !== undefined && objective.iconURL !== '') {
            const fileId = objective.iconURL.replace(ASSET_PATH, '');
            const assetQuery = { _id: new ObjectID(fileId) };

            try {
                await this.assetService.delete(assetQuery);
            } catch (error) {
                console.log('Cannot remove asset file: ' + fileId);
            }
        }

        query = { _id: objId };
        deleteObjective = await this.pageObjectiveService.delete(query);

        if (deleteObjective) {
            const deleteObjectiveJoiner = await this.pageObjectiveJoinerService.deleteMany(query);
            const postObjective = await this.postsService.updateMany({ objective: objId }, { $set: { objective: null, objectiveTag: null } });
            if (deleteObjectiveJoiner && postObjective) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete PageObjective', []));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete PageObjective', undefined));
        }
    }

    // Get PageObjective Timeline API
    /**
     * @api {get} /api/objective/:id/timeline Get PageObjective timeline API
     * @apiGroup PageObjective
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get PageObjective"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/objective/:id/timeline
     * @apiErrorExample {json} PageObjective error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/timeline')
    public async getPageObjectiveTimeline(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.headers.userid;
        let objective: PageObjective;
        const objId = new ObjectID(id);

        if (offset === null || offset === undefined) {
            offset = 0;
        }

        if (limit === null || limit === undefined || limit <= 0) {
            limit = 10;
        }

        try {
            objective = await this.pageObjectiveService.findOne({ where: { _id: objId } });
        } catch (ex) {
            objective = await this.pageObjectiveService.findOne({ where: { title: id } });
        } finally {
            objective = await this.pageObjectiveService.findOne({ $or: [{ _id: objId }, { title: id }] });
        }

        if (objective) {
            // generate timeline
            const page = await this.pageService.findOne({ _id: objective.pageId, banned: false }, { signURL: true });
            const followingUsers = await this.userFollowService.sampleUserFollow(objId, SUBJECT_TYPE.OBJECTIVE, 5);
            let isFollowed = false;
            if (userId !== null && userId !== undefined && userId !== '') {
                const userPageObjFollow = await this.userFollowService.findOne({ userId: new ObjectID(userId), subjectId: objId, subjectType: SUBJECT_TYPE.OBJECTIVE });
                if (userPageObjFollow !== undefined) {
                    isFollowed = true;
                }
            }

            if (objective.s3IconURL !== undefined && objective.s3IconURL !== '') {
                const signUrl = await this.s3Service.getConfigedSignedUrl(objective.s3IconURL);
                Object.assign(objective, { iconSignURL: (signUrl ? signUrl : '') });
                delete objective.s3IconURL;
            }

            const pageObjTimeline = new PageObjectiveTimelineResponse();
            pageObjTimeline.pageObjective = objective;
            pageObjTimeline.page = page;
            pageObjTimeline.followedUser = followingUsers.followers;
            pageObjTimeline.followedCount = followingUsers.count;
            pageObjTimeline.isFollow = isFollowed;

            // add hashTag name to pageObjective
            if (pageObjTimeline.pageObjective !== undefined && pageObjTimeline.pageObjective.hashTag) {
                const hashTag = await this.hashTagService.findOne({ _id: new ObjectID(pageObjTimeline.pageObjective.hashTag + '') });
                if (hashTag !== undefined) {
                    pageObjTimeline.pageObjective.hashTagName = hashTag.name;
                }
            }

            const pageObjFulfillResult = await this.pageObjectiveService.sampleFulfillmentUser(objId, 5, FULFILLMENT_STATUS.CONFIRM);
            pageObjTimeline.fulfillmentCount = pageObjFulfillResult.count;
            pageObjTimeline.fulfillmentUser = pageObjFulfillResult.fulfillmentUser;
            pageObjTimeline.fulfillmentUserCount = pageObjFulfillResult.fulfillmentUserCount;

            pageObjTimeline.relatedHashTags = await this.pageObjectiveService.sampleRelatedHashTags(objId, 5);
            pageObjTimeline.needItems = await this.pageObjectiveService.sampleNeedsItems(objId, 5);
            pageObjTimeline.timelines = [];

            // fix for first section
            const startProcessor = new ObjectiveStartPostProcessor(this.pageObjectiveService, this.postsService, this.s3Service);
            startProcessor.setData({
                objectiveId: objId,
                userId
            });
            const startObjvResult = await startProcessor.process();
            if (startObjvResult !== undefined) {
                pageObjTimeline.timelines.push(startObjvResult);
            }

            // const datetimeRange: any[] = DateTimeUtil.generateCurrentMonthRanges(); // [[startdate, enddate], [startdate, enddate]]
            const monthRange: Date[] = DateTimeUtil.generatePreviousDaysPeriods(new Date(), 30);

            // influencer section
            const influencerProcessor = new ObjectiveInfluencerProcessor(this.postsCommentService, this.userFollowService);
            influencerProcessor.setData({
                objectiveId: objId,
                startDateTime: monthRange[0],
                endDateTime: monthRange[1],
                sampleCount: 4
            });
            const influencerProcsResult = await influencerProcessor.process();
            if (influencerProcsResult !== undefined) {
                pageObjTimeline.timelines.push(influencerProcsResult);
            }

            // need section
            /*
            const needsProcessor = new ObjectiveNeedsProcessor(this.pageObjectiveService, this.postsService);
            needsProcessor.setData({
                objectiveId: objId,
                startDateTime: monthRange[0],
                endDateTime: monthRange[1]
            });
            const needsProcsResult = await needsProcessor.process();
            if (needsProcsResult !== undefined) {
                pageObjTimeline.timelines.push(needsProcsResult);
            }
            */
            // share section
            const shareProcessor = new ObjectiveShareProcessor(this.userFollowService, this.socialPostService);
            shareProcessor.setData({
                objectiveId: objId,
                startDateTime: monthRange[0],
                endDateTime: monthRange[1],
                sampleCount: 10,
                userId
            });
            const shareProcsResult = await shareProcessor.process();
            if (shareProcsResult !== undefined) {
                pageObjTimeline.timelines.push(shareProcsResult);
            }

            // fulfill section
            /* 
            const fulfillrocessor = new ObjectiveInfluencerFulfillProcessor(this.fulfillmentCaseService, this.userFollowService);
            fulfillrocessor.setData({
                objectiveId: objId,
                startDateTime: monthRange[0],
                endDateTime: monthRange[1],
                sampleCount: 10,
                userId
            });
            const fulfillProcsResult = await fulfillrocessor.process();
            if (fulfillProcsResult !== undefined) {
                pageObjTimeline.timelines.push(fulfillProcsResult);
            }

            // following section
            const followingProcessor = new ObjectiveInfluencerFollowedProcessor(this.userFollowService);
            followingProcessor.setData({
                objectiveId: objId,
                sampleCount: 10,
                userId
            });
            const followingProcsResult = await followingProcessor.process();
            if (followingProcsResult !== undefined) {
                pageObjTimeline.timelines.push(followingProcsResult);
            }
            */
            // Like section
            /* 
            const postLikeProcessor = new ObjectivePostLikedProcessor(this.userLikeService);
            postLikeProcessor.setData({
                objectiveId: objId,
                sampleCount: 10,
                userId
            }); 
            const postLikeProcsResult = await postLikeProcessor.process();
            if (postLikeProcsResult !== undefined) {
                pageObjTimeline.timelines.push(postLikeProcsResult);
            } */
            // current post section
            const lastestPostProcessor = new ObjectiveLastestProcessor(this.postsService, this.s3Service);
            lastestPostProcessor.setData({
                objectiveId: objId,
                limit,
                offset,
                userId
            });
            const lastestProcsResult = await lastestPostProcessor.process();
            if (lastestProcsResult !== undefined) {
                pageObjTimeline.timelines.push(lastestProcsResult);
            }

            const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageObjective', pageObjTimeline);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got PageObjective', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow PageObjective
    /**
     * @api {post} /api/objective/:id/follow Follow PageObjective API
     * @apiGroup PageObjective
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow PageObjective Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"OBJEV
     *  }
     * @apiSampleRequest /api/objective/:id/follow
     * @apiErrorExample {json} Follow PageObjective Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followObjective(@Param('id') objectiveId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objectiveObjId = new ObjectID(objectiveId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const objectiveFollow: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: objectiveObjId, subjectType: SUBJECT_TYPE.OBJECTIVE } });
        let userEngagementAction: UserEngagement;

        if (objectiveFollow) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: objectiveObjId, subjectType: SUBJECT_TYPE.OBJECTIVE });
            if (unfollow) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = objectiveObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.OBJECTIVE;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.UNFOLLOW;

                const engagement = await this.userEngagementService.findOne({ where: { contentId: objectiveObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.OBJECTIVE, action: ENGAGEMENT_ACTION.UNFOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow PageObjective Success', undefined);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow PageObjective Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = objectiveObjId;
            userFollow.subjectType = SUBJECT_TYPE.OBJECTIVE;

            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            if (followCreate) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = objectiveObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.OBJECTIVE;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.FOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: objectiveObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.OBJECTIVE, action: ENGAGEMENT_ACTION.FOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed PageObjective Success', followCreate);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow PageObjective Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
}
