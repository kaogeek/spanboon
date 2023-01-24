/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Param, Req, Get, Authorized, Post, Body } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { UserService } from '../services/UserService';
import { ObjectID } from 'mongodb';
import { User } from '../models/User';
import { CheckUniqueIdUserRequest } from './requests/CheckUniqueIdUserRequest';
import { Page } from '../models/Page';
import { PageService } from '../services/PageService';

@JsonController('/user')
export class UserAccountController {
    constructor(private userService: UserService, private pageService: PageService) { }

    // Get UserProfile API
    /**
     * @api {get} /api/user/:id/account Get UserAccount
     * @apiGroup UserAccount
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Get UserAccount",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/user/:id/account
     * @apiErrorExample {json} Get UserAccount error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:id/account')
    @Authorized('user')
    public async getUserAccount(@Param('id') userId: string, @Req() req: any, @Res() res: any): Promise<any> {
        let user: User;

        try {
            const uid = new ObjectID(userId);
            user = await this.userService.findOne({ where: { _id: uid } });
        } catch (ex) {
            user = await this.userService.findOne({ where: { username: userId } });
        }

        if (user) {
            user = await this.userService.cleanAdminUserField(user);
            const successResponse = ResponseUtil.getSuccessResponse('Successfully Get UserAccount', user);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to Get UserAccount', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/:id/account/uniqueid/check')
    public async checkUniqueIdUser(@Param('id') id: string, @Body({ validate: true }) user: CheckUniqueIdUserRequest, @Res() res: any): Promise<any> {
        const userId = id;
        const uniqueId = user.uniqueId;
        const checkValid = await this.checkUniqueIdValid(userId, uniqueId);
        if (checkValid.status === 1) {
            return res.status(200).send(checkValid);
        } else {
            return res.status(200).send(checkValid);
        }
    }

    private async checkUniqueIdValid(userId: string, uniqueId: string): Promise<any> {
        if (userId !== null && userId !== undefined && userId !== '') {
            const userObjId = new ObjectID(userId);
            const user: User = await this.userService.findOne({ _id: userObjId });

            if (user !== null && user !== undefined) {
                if (uniqueId !== null && uniqueId !== undefined && uniqueId !== '') {
                    if (uniqueId.match(/\s/g)) {
                        return ResponseUtil.getErrorResponse('Spacebar is not allowed', undefined);
                    }

                    const checkUniqueIdUserQuey = { where: { uniqueId } };
                    const checkUniqueIdUser: User = await this.userService.findOne(checkUniqueIdUserQuey);
                    const checkPageUsernameQuey = { where: { pageUsername: uniqueId } };
                    const checkPageUsername: Page = await this.pageService.findOne(checkPageUsernameQuey);

                    if ((checkUniqueIdUser !== null && checkUniqueIdUser !== undefined) || (checkPageUsername !== null && checkPageUsername !== undefined)) {
                        return ResponseUtil.getErrorResponse('uniqueId can not use', false);
                    } else {
                        return ResponseUtil.getSuccessResponse('uniqueId can use', true);
                    }
                } else {
                    return ResponseUtil.getErrorResponse('UniqueId is required', undefined);
                }
            } else {
                return ResponseUtil.getErrorResponse('User not found', undefined);
            }
        } else {
            return ResponseUtil.getErrorResponse('Invalid userId', undefined);
        }
    }
} 
