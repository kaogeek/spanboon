/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Get, Param, Post, Body, Authorized, Req } from 'routing-controllers';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { ObjectID } from 'mongodb';
import { ObjectUtil, ResponseUtil } from '../../utils/Utils';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { HashTagService } from '../services/HashTagService';
import { HashTag } from '../models/HashTag';
import { FindHashTagRequest } from './requests/FindHashTagRequest';
import { UserFollow } from '../models/UserFollow';
import { UserEngagement } from '../models/UserEngagement';
import { UserEngagementService } from '../services/UserEngagementService';
import { UserFollowService } from '../services/UserFollowService';
import { PostsService } from '../services/PostsService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { FULFILLMENT_STATUS } from '../../constants/FulfillmentStatus';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { EmergencyEventTimelineResponse } from './responses/EmergencyEventTimelineResponse';
import { EmergencyStartPostProcessor } from '../processors/emergency/EmergencyStartPostProcessor';

@JsonController('/emergency')
export class EmergencyEventController {
    constructor(private emergencyEventService: EmergencyEventService, private hashTagService: HashTagService, private userFollowService: UserFollowService,
        private userEngagementService: UserEngagementService,private postsService: PostsService) { }

    // Find EmergencyEvent API
    /**
     * @api {get} /api/emergency/:id Find EmergencyEvent API
     * @apiGroup EmergencyEvent
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get EmergencyEvent"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/emergency/:id
     * @apiErrorExample {json} EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id')
    public async findEmergencyEvent(@Param('id') id: string, @Res() res: any): Promise<any> {
        let emergencyEventStmt;
        let objId;

        try {
            objId = new ObjectID(id);
            emergencyEventStmt = { _id: objId };
        } catch (ex) {
            emergencyEventStmt = { title: id };
        } finally {
            emergencyEventStmt = { $or: [{ _id: objId }, { title: id }] };
        }

        const emergencyEvent: EmergencyEvent = await this.emergencyEventService.findOne(emergencyEventStmt);

        if (emergencyEvent) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got EmergencyEvent', emergencyEvent);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got EmergencyEvent', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Search EmergencyEvent
    /**
     * @api {post} /api/emergency/search Search EmergencyEvent API
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
     * @apiSampleRequest /api/emergency/search
     * @apiErrorExample {json} Search EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchEmergencyEvent(@Body({ validate: true }) search: FindHashTagRequest, @Res() res: any): Promise<any> {
        if (ObjectUtil.isObjectEmpty(search)) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Search EmergencyEvent', undefined));
        }

        const filter = search.filter;
        const hashTag = search.hashTag;
        const hashTagIdList = [];
        const hashTagMap = {};

        if (hashTag !== null && hashTag !== undefined && hashTag !== '') {
            filter.whereConditions = { name: { $regex: '.*' + hashTag + '.*', $options: 'si' } };
        } else {
            filter.whereConditions = {};
        }

        const hashTagList: HashTag[] = await this.hashTagService.search(filter);

        if (hashTagList !== null && hashTagList !== undefined && hashTagList.length > 0) {
            for (const masterHashTag of hashTagList) {
                const id = masterHashTag.id;
                hashTagMap[id] = masterHashTag;
                hashTagIdList.push(new ObjectID(id));
            }
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Hashtag Not Found', []);
            return res.status(200).send(successResponse);
        }

        let emergencyLists: EmergencyEvent[];

        if (hashTagIdList !== null && hashTagIdList !== undefined && hashTagIdList.length > 0) {
            emergencyLists = await this.emergencyEventService.find({ hashTag: { $in: hashTagIdList } });
        } else {
            emergencyLists = await this.emergencyEventService.find();
        }

        if (emergencyLists !== null && emergencyLists !== undefined) {
            emergencyLists.map((data) => {
                const hashTagKey = data.hashTag;
                const emergencyHashTag = hashTagMap[hashTagKey];

                if (emergencyHashTag) {
                    const hashTagName = emergencyHashTag.name;
                    data.hashTag = hashTagName;
                }
            });

            const emergencyResult = ObjectUtil.removeDuplicateJSONValue(emergencyLists, data => data.hashTag);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully Search EmergencyEvent', emergencyResult);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getSuccessResponse('EmergencyEvent Not Found', undefined);
            return res.status(200).send(errorResponse);
        }
    }

    // Follow Emergency Event
    /**
     * @api {post} /api/emergency/:id/follow Follow Emergency Event API
     * @apiGroup Emergency Event
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow Emergency Event Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"OBJEV
     *  }
     * @apiSampleRequest /api/emergency/:id/follow
     * @apiErrorExample {json} Follow Emergency Event Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followEmergencyEvent(@Param('id') emergencyEventId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const emergencyEventObjId = new ObjectID(emergencyEventId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const emergencyEventFollow: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: emergencyEventObjId, subjectType: SUBJECT_TYPE.EMERGENCY_EVENT } });
        let userEngagementAction: UserEngagement;

        if (emergencyEventFollow) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: emergencyEventObjId, subjectType: SUBJECT_TYPE.EMERGENCY_EVENT });
            if (unfollow) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = emergencyEventObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.EMERGENCY_EVENT;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.UNFOLLOW;

                const engagement = await this.userEngagementService.findOne({ where: { contentId: emergencyEventObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.EMERGENCY_EVENT, action: ENGAGEMENT_ACTION.UNFOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow Emergency Event Success', undefined);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow Emergency Event Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = emergencyEventObjId;
            userFollow.subjectType = SUBJECT_TYPE.EMERGENCY_EVENT;

            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            if (followCreate) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = emergencyEventObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.EMERGENCY_EVENT;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.FOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: emergencyEventObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.EMERGENCY_EVENT, action: ENGAGEMENT_ACTION.FOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed Emergency Event Success', followCreate);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow Emergency Event Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    // Get EmergencyEvent Timeline API
    /**
     * @api {get} /api/emergency/:id/timeline Get EmergencyEvent timeline API
     * @apiGroup PageObjective
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get EmergencyEvent"
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/emergency/:id/timeline
     * @apiErrorExample {json} EmergencyEvent error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/:id/timeline')
     public async getEmergencyEventTimeline(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        //  const userId = req.headers.userid;
         let emergencyEvent: EmergencyEvent;
         const objId = new ObjectID(id);
 
         emergencyEvent = await this.emergencyEventService.findOne({ where: { _id: objId } });
 
         if (emergencyEvent) {
             // generate timeline
             const followingUsers = await this.userFollowService.sampleUserFollow(objId, SUBJECT_TYPE.EMERGENCY_EVENT, 5);
 
             const emergencyEventTimeline = new EmergencyEventTimelineResponse();
             emergencyEventTimeline.emergencyEvent = emergencyEvent;
             emergencyEventTimeline.followedUser = followingUsers.followers;
             emergencyEventTimeline.followedCount = followingUsers.count;
 
             const pageObjFulfillResult = await this.emergencyEventService.sampleFulfillmentUser(objId, 5, FULFILLMENT_STATUS.CONFIRM);
             emergencyEventTimeline.fulfillmentCount = pageObjFulfillResult.count;
             emergencyEventTimeline.fulfillmentUser = pageObjFulfillResult.fulfillmentUser;
             emergencyEventTimeline.fulfillmentUserCount = pageObjFulfillResult.fulfillmentUserCount;
 
             emergencyEventTimeline.relatedHashTags = await this.emergencyEventService.sampleRelatedHashTags(objId, 5);
             emergencyEventTimeline.needItems = await this.emergencyEventService.sampleNeedsItems(objId, 5);
            //  emergencyEventTimeline.timelines = [];
 
             // fix for first section
            //  const startProcessor = new EmergencyStartPostProcessor(this.emergencyEventService, this.postsService);
            //  startProcessor.setData({
            //      objectiveId: objId
            //  });
            //  const startObjvResult = await startProcessor.process();
            //  if (startObjvResult !== undefined) {
            //      emergencyEventTimeline.timelines.push(startObjvResult);
            //  }
 
             // ! to implement
            //  const datetimeRange: any[] = DateTimeUtil.generateCurrentMonthRanges(); // [[startdate, enddate], [startdate, enddate]]
            //  for (const ranges of datetimeRange) {
            //      if (ranges !== undefined && ranges.length < 2) {
            //          continue;
            //      }
            //      // influencer section
            //      const influencerProcessor = new ObjectiveInfluencerProcessor(this.postsCommentService, this.userFollowService);
            //      influencerProcessor.setData({
            //          objectiveId: objId,
            //          startDateTime: ranges[0],
            //          endDateTime: ranges[1],
            //          sampleCount: 2
            //      });
            //      const influencerProcsResult = await influencerProcessor.process();
            //      if (influencerProcsResult !== undefined) {
            //          emergencyEventTimeline.timelines.push(influencerProcsResult);
            //      }
 
            //      // need section
            //      const needsProcessor = new ObjectiveNeedsProcessor(this.pageObjectiveService, this.postsService);
            //      needsProcessor.setData({
            //          objectiveId: objId,
            //          startDateTime: ranges[0],
            //          endDateTime: ranges[1]
            //      });
            //      const needsProcsResult = await needsProcessor.process();
            //      if (needsProcsResult !== undefined) {
            //          emergencyEventTimeline.timelines.push(needsProcsResult);
            //      }
 
            //      // share section
            //      const shareProcessor = new ObjectiveShareProcessor(this.userFollowService, this.socialPostService);
            //      shareProcessor.setData({
            //          objectiveId: objId,
            //          startDateTime: ranges[0],
            //          endDateTime: ranges[1],
            //          sampleCount: 10,
            //          userId
            //      });
            //      const shareProcsResult = await shareProcessor.process();
            //      if (shareProcsResult !== undefined) {
            //          emergencyEventTimeline.timelines.push(shareProcsResult);
            //      }
 
            //      // fulfill section
            //      const fulfillrocessor = new ObjectiveInfluencerFulfillProcessor(this.fulfillmentCaseService, this.userFollowService);
            //      fulfillrocessor.setData({
            //          objectiveId: objId,
            //          startDateTime: ranges[0],
            //          endDateTime: ranges[1],
            //          sampleCount: 10,
            //          userId
            //      });
            //      const fulfillProcsResult = await fulfillrocessor.process();
            //      if (fulfillProcsResult !== undefined) {
            //          emergencyEventTimeline.timelines.push(fulfillProcsResult);
            //      }
 
            //      // following section
            //      const followingProcessor = new ObjectiveInfluencerFollowedProcessor(this.userFollowService);
            //      followingProcessor.setData({
            //          objectiveId: objId,
            //          sampleCount: 10,
            //          userId
            //      });
            //      const followingProcsResult = await followingProcessor.process();
            //      if (followingProcsResult !== undefined) {
            //          emergencyEventTimeline.timelines.push(followingProcsResult);
            //      }
 
            //      // Like section
            //      const postLikeProcessor = new ObjectivePostLikedProcessor(this.userLikeService);
            //      postLikeProcessor.setData({
            //          objectiveId: objId,
            //          sampleCount: 10,
            //          userId
            //      });
            //      const postLikeProcsResult = await postLikeProcessor.process();
            //      if (postLikeProcsResult !== undefined) {
            //          emergencyEventTimeline.timelines.push(postLikeProcsResult);
            //      }
            //  }
 
            //  // current post section
            //  const lastestPostProcessor = new ObjectiveLastestProcessor(this.postsService);
            //  lastestPostProcessor.setData({
            //      objectiveId: objId,
            //      limit: 4,
            //      userId
            //  });
            //  const lastestProcsResult = await lastestPostProcessor.process();
            //  if (lastestProcsResult !== undefined) {
            //      emergencyEventTimeline.timelines.push(lastestProcsResult);
            //  }
 
             const successResponse = ResponseUtil.getSuccessResponse('Successfully got PageObjective', emergencyEventTimeline);
             return res.status(200).send(successResponse);
         } else {
             const errorResponse = ResponseUtil.getErrorResponse('Unable got PageObjective', undefined);
             return res.status(400).send(errorResponse);
         }
     }
}
