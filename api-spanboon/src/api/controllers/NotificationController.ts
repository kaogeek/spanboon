import { JsonController, Res, Get, Post, Req } from 'routing-controllers';
import moment from 'moment';
import { UserService } from '../services/UserService';
import { DeviceTokenService } from '../services/DeviceToken';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import { NotificationService } from '../services/NotificationService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import {
    DEFAULT_PUSH_NOTI_EXPIRATION_MEMBERSHIP,
    PUSH_NOTI_EXPIRATION_MEMBERSHIP
} from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';

// startVoteDatetime
@JsonController('/notification')
export class NotificationController {
    constructor(
        private userService: UserService,
        private deviceTokenService:DeviceTokenService,
        private notificationService: NotificationService,
        private authenticationIdService:AuthenticationIdService,
        private configService:ConfigService
    ) { }

    @Post('/test/birthday')
    public async birthDayNotificationTest(@Res() res: any, @Req() req: any): Promise<any> {
        const testNoti = await this.userService.findOne({email:req.body.email});
        const tokenDevice = await this.deviceTokenService.find({userId:testNoti.id});
        if(tokenDevice.length > 0) {
            for(const content of tokenDevice) {
                if(content.token !== undefined && content.token !== '') {
                    await this.notificationService.pushNotificationMessageBirthDay(testNoti,content.token);
                } else {
                    continue;
                }
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', undefined));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', []));
        }
    }

    @Get('/test/expire/member')
    public async expiredMemberShipTest(@Res() res: any, @Req() req: any): Promise<any>{
        const authUser = await this.authenticationIdService.find({providerName:'MFP'});
        if(authUser.length > 0) {
            for(const content of authUser) {
                const tokenDevice = await this.deviceTokenService.find({userId:content.user});
                if(tokenDevice.length >0) {
                    await this.pushNotificationExpiredMembersiph(content,tokenDevice.token);
                } else {
                    continue;
                }
            }
        }
        // const tokenDevice = await this.deviceTokenService.find({userId:authUser.user});
    }

    @Post('/migrate/birthday')
    public async migrateBirthDay(@Res() res: any, @Req() req:any): Promise<any>{
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
                    const days = date.getDate();
                    const month = date.getMonth();
                    const query = {
                        _id: new ObjectID(content._id)
                    };
                    // console.log(' _id: new ObjectID(content._id)', new ObjectID(content._id));
                    
                    const update = {$set:{
                        dayDate:days,
                        monthDate: month
                    }};
                    
                    await this.userService.update(query,update);
                } else {
                    continue;
                }
            }
        }

        return res.status(200).send(ResponseUtil.getSuccessResponse('Migrate BirthDay Event is success.', undefined));

    }

    @Post('/expired/membership')
    public async expiredMembershipNotification(@Res() res:any, @Req() req: any): Promise<any>{
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
                await this.pushNotificationExpiredMembersiph(content,tokenDevice);
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('Expired Event is success.', undefined));
        }
    }

    @Post('/birthday')
    public async birthDayNotificaition(@Res() res: any, @Req() req: any): Promise<any>{
        const dateFormat = new Date();
        const dateReal = new Date(dateFormat.setDate(dateFormat.getDate() + 1));
        const today = moment(dateReal).clone().utcOffset(0).set({ hour: 24, minute: 0, second: 0, millisecond: 0 }).toDate();
        const month = today.getMonth();
        const day = today.getDate();

        const users = await this.userService.aggregate(
            [
                {
                    $match:{
                        dayDate:day,
                        monthDate:month
                    }
                }
            ]
        );
        if(users.length > 0) {
            for(const content of users) {
                const tokenDevice = await this.deviceTokenService.find({userId:new ObjectID(content._id)});
                await this.pushNotificationBirthDay(content,tokenDevice);
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', today));
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

    private async pushNotificationExpiredMembersiph(data:any, token:any): Promise<any>{
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
}
