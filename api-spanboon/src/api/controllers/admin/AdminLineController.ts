/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Res, Post, Req, Authorized, Body} from 'routing-controllers';
import moment from 'moment';
import { UserService } from '../../services/UserService';
import { DeviceTokenService } from '../../services/DeviceToken';
import { AuthenticationIdService } from '../../services/AuthenticationIdService';
import { NotificationService } from '../../services/NotificationService';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import {
    DEFAULT_PUSH_NOTI_EXPIRATION_MEMBERSHIP,
    PUSH_NOTI_EXPIRATION_MEMBERSHIP
} from '../../../constants/SystemConfig';
import { ConfigService } from '../../services/ConfigService';
import { LineRequest } from './requests/LineRequest';
import axios from 'axios';

@JsonController('/admin/line')
export class AdminPointController {
    constructor(
        private userService: UserService,
        private deviceTokenService:DeviceTokenService,
        private notificationService: NotificationService,
        private authenticationIdService:AuthenticationIdService,
        private configService:ConfigService
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
    
    @Post('/birthday')
    @Authorized()
    public async birthDayNotificaition(
        @Res() res: any, 
        @Req() req: any): Promise<any>{
        const dateFormat = new Date();
        let month:any = dateFormat.getMonth() + 1;
        let day:any = dateFormat.getDate(); 

        if(day<10) { day='0'+day;}
        if(month<10) { month='0'+month;}

        const users = await this.userService.aggregate(
            [
                {
                    $match:{
                        dayDate:day.toString(),
                        monthDate:month.toString()
                    }
                }
            ]
        );
        if(users.length > 0) {
            for(const content of users) {
                const tokenDevice = await this.deviceTokenService.find({userId:new ObjectID(content._id)});
                await this.pushNotificationBirthDay(content,tokenDevice);
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', `${month}-${day}`));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', []));

        }
    }

    @Post('/expired')
    @Authorized()
    public async expiredMembershipNotification(
        @Res() res:any, 
        @Req() req: any): Promise<any>{
        let expireMemberShip = DEFAULT_PUSH_NOTI_EXPIRATION_MEMBERSHIP;
        const expireMemberShipConfig = await this.configService.getConfig(PUSH_NOTI_EXPIRATION_MEMBERSHIP);
        if(expireMemberShipConfig){
            expireMemberShip = expireMemberShipConfig.value;
        }
        const today = new Date();
        const startDate = moment(today).clone().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
        const endDate = moment(today).clone().utcOffset(0).set({ hour: 23, minute: 59, second: 59, millisecond: 59 }).toDate();
        const days = 24 * 60 * 60 * 1000 * expireMemberShip; // one day in milliseconds

        const formatDateStart = startDate.toISOString().slice(0,10) + ' ' + startDate.toTimeString().slice(0, 8);
        const formatDateEnd = new Date(endDate.getTime() + days).toISOString().slice(0,10) + ' ' + endDate.toTimeString().slice(0,8);
        // 2024-09-05 14:53:42

        const authUser = await this.authenticationIdService.aggregate(
            [
                {
                    $match:{
                        providerName:'MFP',
                        expirationDate:{$gte:formatDateStart, $lte:formatDateEnd}
                    }
                }
            ]
        );
        if(authUser.length > 0) {
            for(const content of authUser) {
                const tokenDevice = await this.deviceTokenService.find({userId:new ObjectID(content.user)});
                await this.pushNotificationExpiredMembership(content,tokenDevice);
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('Expired Event is success.', undefined));
        }
    }

    @Post('/vote')
    @Authorized()
    public async voteLine(
        @Body({ validate: true }) lineRequest: LineRequest,
        @Res() res: any, 
        @Req() req: any): Promise<any>{
        const tokenLine = process.env.LINE_AUTHORIZATION;

        // api.line.me/v2/bot/message/push
        const lineUsers = await axios.get(
            'https://api.line.me/v2/bot/followers/ids',{
            headers:{
                Authorization: 'Bearer ' + tokenLine
            }
        });
        if(lineUsers.data.userIds.length > 0) {
            // everybody.
            for(const user of lineUsers.data.userIds){
                const requestBody = {
                    'to': user.toString(),
                    'messages':lineRequest.messages
                };
                await axios.post(
                    'https://api.line.me/v2/bot/message/push',
                    requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json, text/plain, */*',
                        Authorization: 'Bearer ' +  tokenLine
                    }
                });
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', undefined));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', []));
        }
    }

    @Post('/test/vote')
    @Authorized()
    public async testVoteLine(
        @Body({ validate: true }) lineRequest: LineRequest,
        @Res() res: any, 
        @Req() req: any): Promise<any>{
        const tokenLine = process.env.LINE_AUTHORIZATION;

        // api.line.me/v2/bot/message/push
        const lineUsers = await axios.get(
            'https://api.line.me/v2/bot/followers/ids',{
            headers:{
                Authorization: 'Bearer ' + tokenLine
            }
        });
        if(lineUsers.data.userIds.length > 0) {
            const requestBody = {
                'to': 'U6a9f92a2c2bea19e096bc14ef83812ba',
                'messages':lineRequest.messages
            };
            await axios.post(
                'https://api.line.me/v2/bot/message/push',
                requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json, text/plain, */*',
                    Authorization: 'Bearer ' +  tokenLine
                }
            });
            return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', undefined));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', []));
        }
    }

    @Post('/migrate/birthday')
    @Authorized()
    public async migrateBirthDay(
        @Res() res: any, 
        @Req() req:any): Promise<any>{
        const users:any = await this.userService.aggregate([
            {
                $match:{
                    dayDate:null,
                    monthDate:null
                }
            },
            {
                $limit:20000
            }
        ]);
        if(users.length >0){
            for(const content of users) {
                if(content.birthdate !== undefined ) {
                    const dateTimeStamp = Date.parse(content.birthdate);
                    const date = new Date(dateTimeStamp);
                    if(typeof(content.birthdate) === 'object'){
                        console.log('date',date);
                        // year-month-days
                        // 2023-03-11
                        let monthObj:any = date.getMonth() + 1;
                        let dayObj:any = date.getDate(); 
                        
                        if(dayObj<10) { dayObj='0'+dayObj;}
                        if(monthObj<10) { monthObj='0'+monthObj;}

                        const query = {
                            _id: new ObjectID(content._id)
                        };
                        // console.log(' _id: new ObjectID(content._id)', new ObjectID(content._id));
                        
                        const update = {
                        $set:{
                            dayDate:dayObj.toString(),
                            monthDate:monthObj.toString()
                            }
                        };
                        
                        await this.userService.update(query,update);
                    } else {
                        let month:any = date.getMonth() + 1;
                        let day:any = date.getDate(); 
                        if(day<10) { day='0'+day;}
                        if(month<10) { month='0'+month;}

                        const query = {
                            _id: new ObjectID(content._id)
                        };
                        // console.log(' _id: new ObjectID(content._id)', new ObjectID(content._id));
                        
                        const update = {
                        $set:{
                            dayDate:day.toString(),
                            monthDate:month.toString()
                            }
                        };
                        
                        await this.userService.update(query,update);
                    }
                } else {
                    continue;
                }
            }
        }

        return res.status(200).send(ResponseUtil.getSuccessResponse('Migrate BirthDay Event is success.', undefined));

    }

    private async pushNotificationExpiredMembership(data:any, token:any): Promise<any>{
        if(token.length>0){
            for(const content of token) {
                if(content.token !== undefined && content.token !== null && content.token !== '') {
                    await this.notificationService.pushNotificationMessageExpiredMemberShip(data,content.token);
                } else {
                    continue;
                }
            }
        }
    }

    private async pushNotificationBirthDay(data:any, token:any): Promise<any>{
        if(token.length>0){
            for(const content of token) {
                if(content.token !== undefined && content.token !== null && content.token !== ''){
                    await this.notificationService.pushNotificationMessageBirthDay(data,content.token);
                } else {
                    continue;
                }
            }
        }
    }
} 
