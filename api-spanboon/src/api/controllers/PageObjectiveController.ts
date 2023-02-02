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
import { FulfillmentCaseService } from '../services/FulfillmentCaseService';
import { SocialPostService } from '../services/SocialPostService';
import { UserLikeService } from '../services/UserLikeService';
import { FULFILLMENT_STATUS } from '../../constants/FulfillmentStatus';
import { ObjectiveStartPostProcessor } from '../processors/objective/ObjectiveStartPostProcessor';
import { ObjectiveNeedsProcessor } from '../processors/objective/ObjectiveNeedsProcessor';
import { ObjectiveInfluencerProcessor } from '../processors/objective/ObjectiveInfluencerProcessor';
import { ObjectiveInfluencerFulfillProcessor } from '../processors/objective/ObjectiveInfluencerFulfillProcessor';
import { ObjectiveInfluencerFollowedProcessor } from '../processors/objective/ObjectiveInfluencerFollowedProcessor';
import { ObjectiveLastestProcessor } from '../processors/objective/ObjectiveLastestProcessor';
import { ObjectiveShareProcessor } from '../processors/objective/ObjectiveShareProcessor';
import { ObjectivePostLikedProcessor } from '../processors/objective/ObjectivePostLikedProcessor';
import { DateTimeUtil } from '../../utils/DateTimeUtil';
import { SearchFilter } from './requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';

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
        private fulfillmentCaseService: FulfillmentCaseService,
        private socialPostService: SocialPostService,
        private userLikeService: UserLikeService,
        private s3Service: S3Service
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
        const pageId = new ObjectID(objectives.pageId);
        const title = objectives.title;
        const detail = objectives.detail;
        const name = objectives.hashTag;
        const today = moment().toDate();
        let hashTag;

        const masterHashTag: HashTag = await this.hashTagService.findOne({ name });

        if (masterHashTag !== null && masterHashTag !== undefined) {
            hashTag = new ObjectID(masterHashTag.id);
        } else {
            const newHashTag: HashTag = new HashTag();
            newHashTag.name = name;
            newHashTag.lastActiveDate = today;
            newHashTag.count = 0;
            newHashTag.iconURL = '';

            const createHashTag = await this.hashTagService.create(newHashTag);
            hashTag = createHashTag ? new ObjectID(createHashTag.id) : null;
        }

        const data: PageObjective = await this.pageObjectiveService.findOne({ pageId, $or: [{ title }, { hashTag }] });

        if (data !== null && data !== undefined) {
            if (data.title === title) {
                const errorResponse = ResponseUtil.getErrorResponse('PageObjective is Exists', title);
                return res.status(400).send(errorResponse);
            }

            if (data.hashTag === hashTag) {
                const errorResponse = ResponseUtil.getErrorResponse('PageObjective HashTag is Exists', hashTag);
                return res.status(400).send(errorResponse);
            }
        }

        const fileName = userObjId + FileUtil.renameFile();
        const assets = objectives.asset;
        let assetCreate;

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

        const objective: PageObjective = new PageObjective();
        objective.pageId = pageId;
        objective.title = title;
        objective.detail = detail;
        objective.hashTag = hashTag;
        objective.iconURL = assetCreate ? ASSET_PATH + assetCreate.id : '';
        objective.s3IconURL = assetCreate ? assetCreate.s3FilePath : '';

        const result: any = await this.pageObjectiveService.create(objective);
        if (result) {
            const query = {_id:assetCreate.id};
            const newValues = {$set:{pageObjectiveId:ObjectID(result.id)}};
            await this.assetService.update(query,newValues);
            const newObjectiveHashTag = new ObjectID(result.hashTag);

            const objectiveHashTag: HashTag = await this.hashTagService.findOne({ _id: newObjectiveHashTag });
            result.hashTag = objectiveHashTag.name;

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageObjective', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create PageObjective', undefined);
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
    public async searchObjective(@Body({ validate: true }) search: FindHashTagRequest, @QueryParam('sample') sample: number, @Res() res: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(200).send([]);
        }

        const hashTag = search.hashTag;
        let filter = search.filter;
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
            if (pageId !== null && pageId !== undefined && pageId !== '') {
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
                objectiveLists = await this.pageObjectiveService.search(filter, { signURL: true });
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
        let title = objectives.title;
        let detail = objectives.detail;
        const name = objectives.hashTag;
        const objId = new ObjectID(id);
        const userObjId = new ObjectID(req.user.id);
        const pageId = new ObjectID(objectives.pageId);
        const newFileName = userObjId + FileUtil.renameFile() + objId;
        const assetFileName = newFileName;
        const today = moment().toDate();
        const updatedDate = today;

        let hashTagObjId;
        let masterHashTag: HashTag;
        let hashTag;

        if (name !== null && name !== undefined && name !== '') {
            hashTagObjId = new ObjectID(hashTagObjId);
            masterHashTag = await this.hashTagService.findOne({ name });
        }

        if (masterHashTag !== null && masterHashTag !== undefined) {
            hashTag = new ObjectID(masterHashTag.id);
        } else {
            const newHashTag: HashTag = new HashTag();
            newHashTag.name = name;
            newHashTag.lastActiveDate = today;
            newHashTag.count = 0;
            newHashTag.iconURL = '';

            const createHashTag = await this.hashTagService.create(newHashTag);
            hashTag = createHashTag ? new ObjectID(createHashTag.id) : null;
        }

        const objectiveUpdate: PageObjective = await this.pageObjectiveService.findOne({ where: { _id: objId, pageId, $or: [{ title }, { hashTag }] } });

        if (objectiveUpdate === null || objectiveUpdate === undefined) {
            return res.status(400).send(ResponseUtil.getSuccessResponse('Objective Not Found', undefined));
        }

        if (title === null || title === undefined) {
            title = objectiveUpdate.title;
        }

        if (detail === null || detail === undefined) {
            detail = objectiveUpdate.detail;
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

        const updateQuery = { _id: objId, pageId };
        const newValue = { $set: { title, detail, iconURL, hashTag, s3IconURL } };
        const objectiveSave = await this.pageObjectiveService.update(updateQuery, newValue);

        if (objectiveSave) {
            const objectiveUpdated: PageObjective = await this.pageObjectiveService.findOne({ where: { _id: objId, pageId } });
            return res.status(200).send(ResponseUtil.getSuccessResponse('Update PageObjective Successful', objectiveUpdated));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PageObjective', undefined));
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
    @Delete('/:id')
    @Authorized('user')
    public async deleteObjective(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const objective: PageObjective = await this.pageObjectiveService.findOne({ where: { _id: objId } });

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

        const query = { _id: objId };
        const deleteObjective = await this.pageObjectiveService.delete(query);

        if (deleteObjective) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete PageObjective', []));
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
    public async getPageObjectiveTimeline(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.headers.userid;
        let objective: PageObjective;
        const objId = new ObjectID(id);

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

            const datetimeRange: any[] = DateTimeUtil.generateCurrentMonthRanges(); // [[startdate, enddate], [startdate, enddate]]
            for (const ranges of datetimeRange) {
                if (ranges !== undefined && ranges.length < 2) {
                    continue;
                }
                // influencer section
                const influencerProcessor = new ObjectiveInfluencerProcessor(this.postsCommentService, this.userFollowService);
                influencerProcessor.setData({
                    objectiveId: objId,
                    startDateTime: ranges[0],
                    endDateTime: ranges[1],
                    sampleCount: 4
                });
                const influencerProcsResult = await influencerProcessor.process();
                if (influencerProcsResult !== undefined) {
                    pageObjTimeline.timelines.push(influencerProcsResult);
                }

                // need section
                const needsProcessor = new ObjectiveNeedsProcessor(this.pageObjectiveService, this.postsService);
                needsProcessor.setData({
                    objectiveId: objId,
                    startDateTime: ranges[0],
                    endDateTime: ranges[1]
                });
                const needsProcsResult = await needsProcessor.process();
                if (needsProcsResult !== undefined) {
                    pageObjTimeline.timelines.push(needsProcsResult);
                }

                // share section
                const shareProcessor = new ObjectiveShareProcessor(this.userFollowService, this.socialPostService);
                shareProcessor.setData({
                    objectiveId: objId,
                    startDateTime: ranges[0],
                    endDateTime: ranges[1],
                    sampleCount: 10,
                    userId
                });
                const shareProcsResult = await shareProcessor.process();
                if (shareProcsResult !== undefined) {
                    pageObjTimeline.timelines.push(shareProcsResult);
                }

                // fulfill section
                const fulfillrocessor = new ObjectiveInfluencerFulfillProcessor(this.fulfillmentCaseService, this.userFollowService);
                fulfillrocessor.setData({
                    objectiveId: objId,
                    startDateTime: ranges[0],
                    endDateTime: ranges[1],
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

                // Like section
                const postLikeProcessor = new ObjectivePostLikedProcessor(this.userLikeService);
                postLikeProcessor.setData({
                    objectiveId: objId,
                    sampleCount: 10,
                    userId
                });
                const postLikeProcsResult = await postLikeProcessor.process();
                if (postLikeProcsResult !== undefined) {
                    pageObjTimeline.timelines.push(postLikeProcsResult);
                }
            }

            // current post section
            const lastestPostProcessor = new ObjectiveLastestProcessor(this.postsService, this.s3Service);
            lastestPostProcessor.setData({
                objectiveId: objId,
                limit: 10,
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
