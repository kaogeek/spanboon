/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Body, Req, Post, Authorized, Param, Put, Get, QueryParam, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { UserService } from '../services/UserService';
import { ObjectID } from 'mongodb';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { UserEngagement } from '../models/UserEngagement';
import { ENGAGEMENT_CONTENT_TYPE, ENGAGEMENT_ACTION } from '../../constants/UserEngagementAction';
import { UserFollow } from '../models/UserFollow';
import { UserFollowService } from '../services/UserFollowService';
import { UserEngagementService } from '../services/UserEngagementService';
import { StandardItemService } from '../services/StandardItemService';
import { UserProvideItems } from '../models/UserProvideItems';
import { UserProvideItemsService } from '../services/UserProvideItemsService';
import { CreateUserProvideItemRequest } from './requests/CreateUserProvideItemsRequest';
import { StandardItem } from '../models/StandardItem';
import { CustomItem } from '../models/CustomItem';
import { CustomItemService } from '../services/CustomItemService';
import { UserTagRequest } from './requests/UserTagRequest';
import { AuthenticationId } from '../models/AuthenticationId';
import { CheckUniqueIdUserRequest } from './requests/CheckUniqueIdUserRequest';
import { GetUserLoginDataResponse } from './responses/getUserLoginDataResponse';
import { CheckUserUniqueIdRequest } from './requests/checkUserUniqueIdRequest';
import { UNIQUEID_LOG_ACTION, UNIQUEID_LOG_TYPE } from '../../constants/UniqueIdHistoryAction';
import { UniqueIdHistory } from '../models/UniqueIdHistory';
import { UniqueIdHistoryService } from '../services/UniqueIdHistoryService';
import { Page } from '../models/Page';
import { User } from '../models/User';
import { PageService } from '../services/PageService';
import { UserConfigService } from '../services/UserConfigService';
import moment from 'moment';
import { UserConfig } from '../models/UserConfig';
import { ConfigValueRequest } from './requests/ConfigValueRequest';
import { FetchSocialPostEnableRequest } from './requests/FetchSocialPostEnableRequest';
import { SocialPostLogsService } from '../services/SocialPostLogsService';
import { PROVIDER } from '../../constants/LoginProvider';
import { SocialPostLogs } from '../models/SocialPostLogs';
import { NotificationService } from '../services/NotificationService';
import { USER_TYPE,NOTIFICATION_TYPE } from '../../constants/NotificationType';
import { DeviceTokenService } from '../services/DeviceToken';
@JsonController('/user')
export class UserController {
    constructor(
        private pageService: PageService,
        private userService: UserService,
        private authenticationIdService: AuthenticationIdService,
        private userFollowService: UserFollowService,
        private userEngagementService: UserEngagementService,
        private standardItemService: StandardItemService,
        private userProvideItemsService: UserProvideItemsService,
        private customItemService: CustomItemService,
        private uniqueIdHistoryService: UniqueIdHistoryService,
        private userConfigService: UserConfigService, 
        private socialPostLogsService: SocialPostLogsService,
        private notificationService: NotificationService,
        private deviceTokenService:DeviceTokenService,
    ) { }

    // Logout API
    /**
     * @api {post} /api/user/logout Log Out API
     * @apiGroup User
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully logout",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user/logout
     * @apiErrorExample {json} Logout error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/logout')
    @Authorized('user')
    public async logout(@QueryParam('mode') mode: string, @Res() res: any, @Req() req: any): Promise<any> {
        const uid = new ObjectID(req.user.id);
        const tokenFCM = String(req.body.tokenFCM);
        let logoutAll = false;
        if (mode !== undefined) {
            mode = mode.toLocaleLowerCase();
        }

        if (mode === 'all') {
            logoutAll = true;
        }

        if (logoutAll) {
            const authenIds: AuthenticationId[] = await this.authenticationIdService.find({ where: { user: uid } });
            if (!authenIds) {
                const errorResponse: any = { status: 0, message: 'Invalid token' };
                return res.status(400).send(errorResponse);
            }

            const successResult = [];
            const currentDateTime = moment().toDate();
            for (const authenId of authenIds) {
                const updateExpireToken = await this.authenticationIdService.update({ _id: authenId.id }, { $set: { expirationDate: currentDateTime } });
                if (updateExpireToken) {
                    successResult.push(authenId.id);
                }
            }

            if (successResult.length > 0) {
                const successResponse: any = { status: 1, message: 'Successfully Logout' };
                return res.status(200).send(successResponse);
            } else {
                const deleteErrorResponse: any = { status: 0, message: 'No account was detact to logout' };
                return res.status(400).send(deleteErrorResponse);
            }
        } else {
            const authenId: AuthenticationId = await this.authenticationIdService.findOne({ where: { user: uid } });
            const deleteFCM = await this.deviceTokenService.find({userId:uid,token:tokenFCM});
            if (!authenId) {
                const errorResponse: any = { status: 0, message: 'Invalid token' };
                return res.status(400).send(errorResponse);
            }
            else if(deleteFCM !== null){
                for(let i = 0 ; i<deleteFCM.length; i++){
                    await this.deviceTokenService.delete({userId:uid,token:deleteFCM[i].Tokens});
                }
            }
            else if(deleteFCM === null){
                const deleteNull = await this.deviceTokenService.find({userId:uid});
                for(let i = 0; i<deleteNull.length; i++){
                    await this.deviceTokenService.delete({userId:deleteNull[i].id});
                }
            }
            const currentDateTime = moment().toDate();
            const updateExpireToken = await this.authenticationIdService.update({ _id: authenId.id }, { $set: { expirationDate: currentDateTime } });
            if (updateExpireToken) {
                const successResponse: any = { status: 1, message: 'Successfully Logout' };
                return res.status(200).send(successResponse);
            } else {
                const deleteErrorResponse: any = { status: 0, message: 'Cannot delete accesstoken' };
                return res.status(400).send(deleteErrorResponse);
            }
        }
    }

    // PagePost List API
    /**
     * @api {get} /api/user User List API
     * @apiGroup PagePost
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get Users",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user
     * @apiErrorExample {json} Get Users Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/tag')
    @Authorized('user')
    public async tagUsers(@Body({ validate: true }) user: UserTagRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const name = user.name;
        const userObjId = new ObjectID(req.user.id);
        const subjectIdList = [];
        let query;

        const userTag: UserFollow[] = await this.userFollowService.find({ userId: userObjId, subjectType: SUBJECT_TYPE.USER });

        for (const tag of userTag) {
            subjectIdList.push(new ObjectID(tag.subjectId));
        }

        if (name === '') {
            query = { _id: { $in: subjectIdList } };
        } else {
            const exp = { $regex: '/*' + name + '.*', $options: 'si' };
            query = { _id: { $in: subjectIdList }, $or: [{ displayName: exp }, { firstName: exp }, { lastName: exp }] };
        }

        let users = await this.userService.find(query);

        if (users.length > 0) {
            users = this.userService.cleanTagUserField(users);
            // const successResponse = ResponseUtil.getSuccessResponse('User Founded', users);
            return res.status(200).send(users);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('User Not Found', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Follow User
    /**
     * @api {post} /api/user/:id/follow Follow User API
     * @apiGroup User
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow User Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/user/:id/follow
     * @apiErrorExample {json} Follow User error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/follow')
    @Authorized('user')
    public async followUser(@Param('id') userId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const followUserObjId = new ObjectID(userId);
        const userObjId = new ObjectID(req.user.id);
        const clientId = req.headers['client-id'];
        const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
        const userFollowObj: UserFollow = await this.userFollowService.findOne({ where: { userId: userObjId, subjectId: followUserObjId, subjectType: SUBJECT_TYPE.USER } });
        let userEngagementAction: UserEngagement;
        let userFollower: UserFollow[];
        let result = {};
        let userFollowerStmt;

        // find page
        const user = await this.userService.findOne({ _id: userObjId });
        if (user === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('User was not found', undefined);
            return res.status(400).send(errorResponse);
        }

        if (userFollowObj) {
            const unfollow = await this.userFollowService.delete({ userId: userObjId, subjectId: followUserObjId, subjectType: SUBJECT_TYPE.USER });
            if (unfollow) {
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = followUserObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.USER;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.UNFOLLOW;

                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: followUserObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.USER, action: ENGAGEMENT_ACTION.UNFOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                result['isFollow'] = false;

                userFollowerStmt = { subjectId: followUserObjId, subjectType: SUBJECT_TYPE.USER };
                userFollower = await this.userFollowService.find(userFollowerStmt);
                result['followers'] = userFollower.length;

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Unfollow User Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Unfollow User Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const userFollow = new UserFollow();
            userFollow.userId = userObjId;
            userFollow.subjectId = followUserObjId;
            userFollow.subjectType = SUBJECT_TYPE.USER;
            const followCreate: UserFollow = await this.userFollowService.create(userFollow);
            // follow notification 
            if (followCreate) {
                result = followCreate;
                const userEngagement = new UserEngagement();
                userEngagement.clientId = clientId;
                userEngagement.contentId = followUserObjId;
                userEngagement.contentType = ENGAGEMENT_CONTENT_TYPE.USER;
                userEngagement.ip = ipAddress;
                userEngagement.userId = userObjId;
                userEngagement.action = ENGAGEMENT_ACTION.FOLLOW;
                const who_follow_you = await this.userService.findOne({_id:userFollow.userId});
                const deviceToken = await this.deviceTokenService.find({userId:userFollow.subjectId});
                const notification_follower = who_follow_you.displayName+'กดติดตามคุณ';
                const link = `/profile/${who_follow_you.displayName}`;
                for(let r = 0; r<deviceToken.length; r++){
                    if(deviceToken[r].Tokens !== null){
                        await this.notificationService.createNotificationFCM(
                            followCreate.subjectId,
                            USER_TYPE.USER,
                            req.user.id+ '',
                            USER_TYPE.USER,
                            NOTIFICATION_TYPE.FOLLOW,
                            notification_follower,
                            link,
                            deviceToken[r].Tokens,
                            who_follow_you.displayName,
                            who_follow_you.imageURL
                        );
                    }
                    else {
                        await this.notificationService.createNotification(
                            followCreate.subjectId,
                            USER_TYPE.USER,
                            req.user.id+ '',
                            USER_TYPE.USER,
                            NOTIFICATION_TYPE.FOLLOW,
                            notification_follower,
                            link,
                            who_follow_you.displayName,
                            who_follow_you.imageURL
                        );
                    }
                    // else{
                        // const userUpdate = {userId:followCreate.subjectId};
                        // const TokenFCM = {$set:{token:req.body.token}};
                        // const updateToken = await this.deviceTokenService.updateToken(userUpdate,TokenFCM);
                        // if(updateToken){
                            // await this.notificationService.createNotificationFCM(
                                // followCreate.subjectId,
                                // USER_TYPE.USER,
                                // req.user.id+ '',
                                // USER_TYPE.USER,
                                // NOTIFICATION_TYPE.FOLLOW,
                                // notification_follower,
                                // link,
                                // deviceToken[r].Tokens,
                                // who_follow_you.displayName,
                                // who_follow_you.imageURL
                            // );
                        // }
                    // }
                }
                // USER TO USER
                const engagement: UserEngagement = await this.userEngagementService.findOne({ where: { contentId: followUserObjId, userId: userObjId, contentType: ENGAGEMENT_CONTENT_TYPE.USER, action: ENGAGEMENT_ACTION.FOLLOW } });
                if (engagement) {
                    userEngagement.isFirst = false;
                } else {
                    userEngagement.isFirst = true;
                }

                userEngagementAction = await this.userEngagementService.create(userEngagement);

                result['isFollow'] = true;

                userFollowerStmt = { subjectId: followUserObjId, subjectType: SUBJECT_TYPE.USER };
                userFollower = await this.userFollowService.find(userFollowerStmt);
                result['followers'] = userFollower.length;

                if (userEngagementAction) {
                    const successResponse = ResponseUtil.getSuccessResponse('Followed User Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Follow User Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    /**
     * @api {get} /api/user/config/:name Get User Config API
     * @apiGroup User
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Get User Config.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/user/config/:name
     * @apiErrorExample {json} Get User Config Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/config/:name')
    @Authorized('user')
    public async getPageConfig(@Param('name') name: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const config = await this.userConfigService.findOne({ name, user: userId });

        if (config) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully to Get User Config', config));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to Get User Config', undefined));
        }
    }

    /**
     * @api {post} /api/user/config/:name Create User Config API
     * @apiGroup User
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Create User Config.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/user/config/:name
     * @apiErrorExample {json} Create User Config Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/config/:name')
    @Authorized('user')
    public async createPageConfig(@Param('name') name: string, @Body({ validate: true }) configValue: ConfigValueRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);

        if (configValue.type === undefined || configValue.type === '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('Config type is required.', undefined));
        }

        const currentConfig = await this.userConfigService.findOne({ name, user: userId });
        if (currentConfig) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Config is duplicate.', undefined));
        }

        const config = new UserConfig();
        config.user = userId;
        config.name = name;
        config.type = configValue.type;
        config.value = configValue.value;

        const createConfig = await this.userConfigService.create(config);

        if (createConfig) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Create User Config', createConfig));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to Create User Config', undefined));
        }
    }

    /**
     * @api {put} /api/user/config/:name Edit Page Config API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Edit Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/user/config/:name
     * @apiErrorExample {json} Edit Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/config/:name')
    @Authorized('user')
    public async editPageConfig(@Param('name') name: string, @Body({ validate: true }) configValue: ConfigValueRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);

        if (configValue.type === undefined || configValue.type === '') {
            return res.status(400).send(ResponseUtil.getErrorResponse('Config type is required.', undefined));
        }

        let result = undefined;
        const query = { name, user: userId };
        const currentConfig = await this.userConfigService.findOne(query);
        if (currentConfig) {
            result = await this.userConfigService.update(query, {
                $set: {
                    value: configValue.value,
                    type: configValue.type
                }
            });
        } else {
            // create if not exist.
            const config = new UserConfig();
            config.user = userId;
            config.name = name;
            config.type = configValue.type;
            config.value = configValue.value;

            result = await this.userConfigService.create(config);
        }

        if (result) {
            const config = await this.userConfigService.findOne(query);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully edit User Config', config));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to edit User Config', undefined));
        }
    }

    /**
     * @api {delete} /api/user/config/:name Delete Page Config API
     * @apiGroup Page
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete Page.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/user/config/:name
     * @apiErrorExample {json} Delete Page Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/config/:name')
    @Authorized('user')
    public async deletePageConfig(@Param('name') name: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);

        const query = { name, user: userId };
        const deleteConfig = await this.userConfigService.delete(query);

        if (deleteConfig) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete User Config', name));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete User Config', undefined));
        }
    }

    /**
     * @api {post} /api/user/item Create UserProvideItems API
     * @apiGroup UserProvideItems
     * @apiParam (Request body) {String[]} standardItemId standardItemId
     * @apiParamExample {json} Input
     * {
     *      ["","",....,""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create UserProvideItems",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user/item
     * @apiErrorExample {json} Unable create UserProvideItems
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/item')
    @Authorized('user')
    public async createUserProvideItems(@Body({ validate: true }) standardItems: CreateUserProvideItemRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = req.user.id;
        const userObjId = new ObjectID(userId);
        const items = standardItems.items;
        const stdItemList = [];
        const provideItemCreatedList: UserProvideItems[] = [];
        let provideItemCreate: UserProvideItems;

        if (items !== null && items !== undefined && items.length > 0) {
            let provideItems: UserProvideItems;
            let stdItems: StandardItem[];

            if (Array.isArray(items)) {
                const provideItemsMap = {};

                for (const item of items) {
                    const stdItemId = item._id;
                    const unit = item.unit;
                    const quantity = item.quantity;
                    const itemName = item.name;

                    if (stdItemId !== null && stdItemId !== undefined && stdItemId !== '') {
                        provideItemsMap[stdItemId] = { quantity, unit };
                        stdItemList.push(new ObjectID(stdItemId));

                        if (stdItemList !== null && stdItemList !== undefined && stdItemList.length > 0) {
                            stdItems = await this.standardItemService.find({ where: { _id: { $in: stdItemList } } });
                        }
                    } else {
                        const customItem = new CustomItem();
                        customItem.name = itemName;
                        customItem.unit = unit;
                        customItem.userId = userObjId;
                        customItem.standardItemId = null;
                        const customCreate = await this.customItemService.create(customItem);

                        provideItems = new UserProvideItems();
                        provideItems.user = userObjId;
                        provideItems.customItemId = new ObjectID(customCreate.id);
                        provideItems.itemName = customCreate.name;
                        provideItems.quantity = quantity;
                        provideItems.unit = unit;
                        provideItems.standardItemId = null;
                        provideItems.active = true;

                        provideItemCreate = await this.userProvideItemsService.create(provideItems);

                        provideItemCreatedList.push(provideItemCreate);
                    }
                }

                if (stdItems !== null && stdItems !== undefined && stdItems.length > 0) {
                    for (const item of stdItems) {
                        const stdItemId = item.id;
                        const provideItemsData = provideItemsMap[stdItemId];

                        if (provideItemsData !== null && provideItemsData !== undefined) {
                            const quantity = provideItemsData.quantity;
                            const unit = provideItemsData.unit;

                            provideItems = new UserProvideItems();
                            provideItems.user = userObjId;
                            provideItems.itemName = item.name;
                            provideItems.customItemId = null;
                            provideItems.standardItemId = new ObjectID(stdItemId);
                            provideItems.active = true;
                            provideItems.quantity = quantity;
                            provideItems.unit = unit;

                            provideItemCreate = await this.userProvideItemsService.create(provideItems);

                            provideItemCreatedList.push(provideItemCreate);
                        }
                    }
                }

                if (provideItemCreatedList !== null && provideItemCreatedList !== undefined && provideItemCreatedList.length > 0) {
                    const successResponse = ResponseUtil.getSuccessResponse('Successfully Create UserProvideItems', provideItemCreatedList);
                    return res.status(200).send(successResponse);
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Unable Create UserProvideItems', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('StandardItems Not Found', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Please Input StandardItems', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {put} /api/user/:id/item Update UserProvideItems API
     * @apiGroup UserProvideItems
     * @apiParam (Request body) {String[]} standardItemId standardItemId
     * @apiParamExample {json} Input
     * {
     *      ["","",....,""]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Update UserProvideItems",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user/:id/item
     * @apiErrorExample {json} Unable Update UserProvideItems
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/item')
    @Authorized('user')
    public async updateUserProvideItems(@Body({ validate: true }) standardItems: any[], @Res() res: any, @Req() req: any): Promise<any> {
        // const userObjId = new ObjectID(userId);
        // const oldItemIdList = [];
        // const newItemIdList = [];
        // const newItemIdMap = new Map();
        // let itemMatchList = [];

        // newItemIdMap = standardItems.map((key) => {
        //     return key;
        // });

        // for (const item of standardItems) {
        //     newItemIdMap.set(new ObjectID(item.oldItems), new ObjectID(item.updateItems));
        // }

        // const itemData = await this.standardItemService.find({ $and: [{ _id: { $in: newItemIdList } }] });

        // itemMatchList = newItemIdList.filter((item) => {
        //     let isItemContain = false;
        //     const itemObjId = JSON.stringify(item);

        //     for (const result of newItemIdMap) {
        //         const resultItemObjId = JSON.stringify(result);

        //         if (resultItemObjId === itemObjId) {
        //             isItemContain = true;
        //         } else {
        //             isItemContain = false;
        //             break;
        //         }
        //     }

        //     return !isItemContain;
        // });

        // const provideItemsData = await this.userProvideItemsService.find({ $and: [{ item: { $in: itemMatchList } }] });

        // const successResponse = ResponseUtil.getSuccessResponse('Successfully Update UserProvideItems', provideItemsData);
        // return res.status(200).send(successResponse);

        if (standardItems) {
            // standardItems.updateItems.forEach((item) => {
            //     const itemObjId = new ObjectID(item);
            //     newItemIdList.push(itemObjId);
            // });

            // const itemData = await this.standardItemService.find({ $and: [{ _id: { $in: newItemIdList } }] });

            // if (itemData.length > 0) {
            //     const provideItemsData = await this.userProvideItemsService.find({ where: { user: userObjId, item: { $in: stdItemIdList } } });

            //     itemMatchList = stdItemIdList.filter((item) => {
            //         let isItemContain = false;
            //         const itemObjId = JSON.stringify(item);

            //         for (const result of provideItemsData) {
            //             const resultItemObjId = JSON.stringify(result.item);

            //             if (resultItemObjId === itemObjId) {
            //                 isItemContain = true;
            //             } else {
            //                 isItemContain = false;

            //                 console.log('isItemContain >>> ', isItemContain);
            //                 break;
            //             }
            //         }

            //         return !isItemContain;
            //     });

            //     const successResponse = ResponseUtil.getSuccessResponse('Successfully Update UserProvideItems', itemMatchList);
            //     return res.status(200).send(successResponse);

            //     // if (itemMatchList.length > 0) {
            //     //     for (const item of itemMatchList) {
            //     //         const updateQuery = { _id: userObjId };
            //     //         const newValue = { $set: { item: new ObjectID(item) } };
            //     //         const result = await this.userProvideItemsService.update(updateQuery, newValue);

            //     //         if (result) {
            //     //             const updatedProvideItemsData = await this.userProvideItemsService.find({ where: { user: userObjId, item: { $in: stdItemIdList } } });

            //     //             if (updatedProvideItemsData) {
            //     //                 const successResponse = ResponseUtil.getSuccessResponse('Successfully Update UserProvideItems', updatedProvideItemsData);
            //     //                 return res.status(200).send(successResponse);
            //     //             } else {
            //     //                 const errorResponse = ResponseUtil.getErrorResponse('Update UserProvideItems Error', undefined);
            //     //                 return res.status(400).send(errorResponse);
            //     //             }
            //     //         } else {
            //     //             const errorResponse = ResponseUtil.getErrorResponse('Cannot Update UserProvideItems', undefined);
            //     //             return res.status(400).send(errorResponse);
            //     //         }
            //     //     }
            //     // } else {
            //     //     const errorResponse = ResponseUtil.getErrorResponse('User Has ProvideItems', undefined);
            //     //     return res.status(400).send(errorResponse);
            //     // }
            // } else {
            //     const errorResponse = ResponseUtil.getErrorResponse('StandardItems Not Found', undefined);
            //     return res.status(400).send(errorResponse);
            // }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Please Input StandardItems', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/uniqueid/check')
    public async checkUniqueIdUser(@Body({ validate: true }) user: CheckUniqueIdUserRequest, @Res() res: any): Promise<any> {
        const uniqueId = user.uniqueId;

        const checkValid = await this.checkUniqueIdValid(uniqueId);
        if (checkValid.status === 1) {
            return res.status(200).send(checkValid);
        } else {
            return res.status(200).send(checkValid);
        }
    }

    @Get('/:id')
    @Authorized('user')
    public async getLoginUser(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        if (id !== null && id !== undefined && id !== '') {
            const userId = new ObjectID(id);
            const userIdFindQuery = { where: { _id: userId } };
            const userIdFindOne = await this.userService.findOne(userIdFindQuery);
            if (userIdFindOne) {

                const getUserIdResponse = new GetUserLoginDataResponse();
                let userIdFindOneResult: GetUserLoginDataResponse;
                userIdFindOneResult = getUserIdResponse;
                userIdFindOneResult.id = userIdFindOne.id;
                userIdFindOneResult.username = userIdFindOne.username;
                userIdFindOneResult.uniqueId = userIdFindOne.uniqueId;
                userIdFindOneResult.imageURL = userIdFindOne.imageURL;
                userIdFindOneResult.firstName = userIdFindOne.firstName;
                userIdFindOneResult.displayName = userIdFindOne.displayName;
                return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully get userData', userIdFindOneResult));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Can not find this userId', undefined));
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid userId', undefined));
        }
    }

    @Post('/:id/uniqueid')
    @Authorized('user')
    public async bindingId(@Param('id') id: string, @Body({ validate: true }) pages: CheckUserUniqueIdRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const uniqueId = pages.userName;
        const checkValid = await this.checkUniqueIdValid(id);
        const objectId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);

        let bindingIdQuery;
        let bindingIdUpdateQuery;

        const checkPageAccessResult = await this.checkPageAccess(objectId, userId);
        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (checkValid.status === 1 && checkValid.data === true) {
                bindingIdQuery = { _id: objectId };
                bindingIdUpdateQuery = { $set: { uniqueId } };
                const bindingIdResult = await this.userService.update(bindingIdQuery, bindingIdUpdateQuery);
                if (bindingIdResult) {
                    const logBindindId = new UniqueIdHistory();
                    logBindindId.uniqueId = uniqueId;
                    logBindindId.type = UNIQUEID_LOG_TYPE.USER;
                    logBindindId.typeId = new ObjectID(id);
                    logBindindId.user = userId;
                    logBindindId.action = UNIQUEID_LOG_ACTION.BINDING;
                    await this.uniqueIdHistoryService.create(logBindindId);

                    const updatedResult = { id, uniqueId };
                    return res.status(200).send(ResponseUtil.getSuccessResponse('bindingId Sussesfully', updatedResult));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('bindingId Error', undefined));
                }
            } else {
                return res.status(400).send(checkValid);
            }
        }
    }

    /**
     * @api {post} /api/user/:id/enable_fetch_twitter Follow User API
     * @apiGroup User
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Follow User Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/user/:id/enable_fetch_twitter
     * @apiErrorExample {json} Enable fetch Twitter's post
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/enable_fetch_twitter')
    @Authorized('user')
    public async fetchTwitterEnable(@Body({ validate: true }) twitterParam: FetchSocialPostEnableRequest, @Res() res: any, @Req() req: any): Promise<any> {
            try {
                const userId = req.user.id;
                // find authen with twitter
                const twitterAccount = await this.authenticationIdService.findOne({ providerName: PROVIDER.TWITTER, user: userId });
    
                if (twitterAccount === undefined) {
                    const errorResponse = ResponseUtil.getSuccessResponse('Twitter account was not binding', undefined);
                    return res.status(400).send(errorResponse);
                }
    
                // find log
                const socialPostLog = await this.socialPostLogsService.findOne({ providerName: PROVIDER.TWITTER, providerUserId: twitterAccount.providerUserId });
                if (socialPostLog !== undefined) {
                    // update old
                    await this.socialPostLogsService.update({ _id: socialPostLog.id }, { $set: { enable: twitterParam.enable } });
                } else {
                    // create new
                    const newSocialPostLog = new SocialPostLogs();
                    newSocialPostLog.user = userId; // log by user
                    newSocialPostLog.lastSocialPostId = undefined;
                    newSocialPostLog.providerName = PROVIDER.TWITTER;
                    newSocialPostLog.providerUserId = twitterAccount.providerUserId;
                    newSocialPostLog.properties = undefined;
                    newSocialPostLog.enable = twitterParam.enable;
                    newSocialPostLog.lastUpdated = undefined;
    
                    await this.socialPostLogsService.create(newSocialPostLog);
                }
    
                return res.status(200).send(twitterParam);
            } catch (err) {
                const errorResponse = ResponseUtil.getSuccessResponse('Cannot enable twitter fetch post', err);
                return res.status(400).send(errorResponse);
            }
        }

    private async checkPageAccess(objectId: ObjectID, userId: ObjectID): Promise<any> {
        // const pageAccessLevelCheckQuery = { where: { page: pageId, user: userId } };
        // const pageAccessLevelResult = await this.pageAccessLevelService.find(pageAccessLevelCheckQuery);

        // if (pageAccessLevelResult.length > 0) {
        //     for (const pageAccess of pageAccessLevelResult) {
        //         if (pageAccess.level !== PAGE_ACCESS_LEVEL.ADMIN && pageAccess.level !== PAGE_ACCESS_LEVEL.OWNER) {
        //             return ResponseUtil.getErrorResponse('Can not access', undefined);
        //         } else {
        //             return ResponseUtil.getSuccessResponse('Can access', pageAccess);
        //         }
        //     }
        // } else {
        //     return ResponseUtil.getErrorResponse('Can not unbinding', undefined);
        // }
    }

    private async checkUniqueIdValid(uniqueId: string): Promise<any> {
        if (uniqueId !== null && uniqueId !== undefined && uniqueId !== '') {
            if (uniqueId.match(/\s/g)) {
                return ResponseUtil.getErrorResponse('Spacebar is not allowed', undefined);
            }

            const checkUniqueIdUserQuey = { uniqueId: new RegExp('^' + uniqueId + '$', 'i') };
            const checkUniqueIdUser: User = await this.userService.findOne(checkUniqueIdUserQuey);

            const checkPageUsernameQuey = { pageUsername: new RegExp('^' + uniqueId + '$', 'i') };
            const checkPageUsername: Page = await this.pageService.findOne(checkPageUsernameQuey);

            if ((checkUniqueIdUser !== null && checkUniqueIdUser !== undefined) || (checkPageUsername !== null && checkPageUsername !== undefined)) {
                return ResponseUtil.getErrorResponse('uniqueId can not use', false);
            } else {
                return ResponseUtil.getSuccessResponse('uniqueId can use', true);
            }
        } else {
            return ResponseUtil.getErrorResponse('UniqueId is required', undefined);
        }
    }
}
