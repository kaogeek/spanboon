/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Post, Body, Req, Authorized, Param } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { UserService } from '../../services/UserService';
import { User } from '../../models/User';
import { CreateUserRequest } from '../requests/CreateUserRequest';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { BanRequest } from './requests/BanRequest';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { USER_LOG_ACTION, LOG_TYPE } from '../../../constants/LogsAction';
import { FileUtil } from '../../../utils/Utils';
import { Asset } from '../../../api/models/Asset';
import { ASSET_SCOPE, ASSET_PATH } from '../../../constants/AssetScope';
import { AssetService } from '../../../api/services/AssetService';

@JsonController('/admin/user')
export class AdminUserController {
    constructor(
        private userService: UserService,
        private actionLogService: AdminUserActionLogsService,
        private assetService: AssetService
    ) { }

    /**
     * @api {post} /api/admin/user/register Create User
     * @apiGroup Admin API
     * @apiParam (Request body) {String} firstName firstName
     * @apiParam (Request body) {String} lastName lastName
     * @apiParam (Request body) {String} email email
     * @apiParam (Request body) {String} citizenId citizenId
     * @apiParam (Request body) {number} gender gender
     * @apiParamExample {json} Input
     * {
     *      "firstname" : "",
     *      "lastname" : "",
     *      "email" : "",
     *      "citizenId" : "",
     *      "gender" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create User",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/user/register
     * @apiErrorExample {json} Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/register')
    @Authorized()
    public async createUser(@Body({ validate: true }) users: CreateUserRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userPassword = await User.hashPassword(users.password);
        const assets = users.asset;

        const user: User = new User();
        user.username = users.email;
        user.password = userPassword;
        user.email = users.email;
        user.firstName = users.firstName;
        user.lastName = users.lastName;
        user.citizenId = users.citizenId;
        user.gender = users.gender;
        user.imageURL = '';
        user.coverURL = '';
        user.coverPosition = 0;
        user.isAdmin = true;
        user.isSubAdmin = true;

        const data = await this.userService.findOne({ where: { username: users.email } });

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('User is Exists', data);
            return res.status(400).send(errorResponse);
        }

        let result = await this.userService.create(user);

        if (result) {
            const userId = result.id;
            const userObjId = new ObjectID(userId);

            if (assets !== null && assets !== undefined) {
                const asset = new Asset();
                const fileName = userId + FileUtil.renameFile();
                asset.userId = userObjId;
                asset.scope = ASSET_SCOPE.PUBLIC;
                asset.data = assets.data;
                asset.mimeType = assets.mimeType;
                asset.size = assets.size;
                asset.fileName = fileName;

                const assetCreate = await this.assetService.create(asset);
                const imagePath = assetCreate ? ASSET_PATH + assetCreate.id : '';
                if (assetCreate) {
                    await this.userService.update({ _id: userObjId }, { $set: { imageURL: imagePath } });
                }
            }

            const updatedUser = await this.userService.findOne({ where: { _id: userObjId } });

            result = this.userService.cleanAdminUserField(updatedUser);

            const objId = new ObjectID(result.id);
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = USER_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.USER;
            adminLogs.ip = ipAddress;
            adminLogs.data = result;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create Admin User', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create Admin User', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/user/:id/ban Ban Page API
     * @apiGroup Admin API
     * @apiParamExample {json} Input
     * {
     *      "id" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Ban User Success",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/user/:id/ban
     * @apiErrorExample {json} Ban User Failed
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/:id/ban')
    @Authorized()
    public async banUser(@Body({ validate: true }) ban: BanRequest, @Param('id') userId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(userId);
        const username = req.user.username;
        const userBanned = ban.banned;
        const data: User = await this.userService.findOne({ where: { _id: userObjId } });

        if (!data) {
            const errorResponse = ResponseUtil.getErrorResponse('User Not Found', data);
            return res.status(400).send(errorResponse);
        }

        if (data.banned === userBanned) {
            if (userBanned) {
                const errorResponse = ResponseUtil.getErrorResponse('This User Already Banned', undefined);
                return res.status(400).send(errorResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('This User Already Unbanned', undefined);
                return res.status(400).send(errorResponse);
            }
        } else {
            const query = { _id: userObjId };
            const newValue = { $set: { banned: userBanned, updateDate: moment().toDate(), updateByUsername: username } };
            const result = await this.userService.update(query, newValue);

            if (result) {
                let userResult = await this.userService.findOne(query);
                const objId = new ObjectID(userResult.id);
                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = objId;
                adminLogs.action = userResult.banned ? USER_LOG_ACTION.BAN : USER_LOG_ACTION.UNBAN;
                adminLogs.contentType = LOG_TYPE.PAGE;
                adminLogs.ip = ipAddress;
                userResult = await this.userService.cleanAdminUserField(userResult);
                adminLogs.data = userResult;
                await this.actionLogService.create(adminLogs);

                const successResponse = ResponseUtil.getSuccessResponse('Ban/Unban User Success', userResult);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Ban/Unban User Failed', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    // Search Page
    /**
     * @api {post} /api/admin/user/search Search Page API
     * @apiGroup Admin API
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Search User Success",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/user/search
     * @apiErrorExample {json} Search User error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async searchUsers(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        let userLists: any = await this.userService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (userLists) {
            userLists = await this.userService.cleanAdminField(userLists);
            const successResponse = ResponseUtil.getSuccessResponse('Search User Success', userLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Search User Failed', undefined);
            return res.status(400).send(errorResponse);
        }
    }
} 
