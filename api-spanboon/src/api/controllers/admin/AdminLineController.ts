/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Res, Post, Req, Authorized, Body } from 'routing-controllers';
import moment from 'moment';
import { UserService } from '../../services/UserService';
import { DeviceTokenService } from '../../services/DeviceToken';
import { AuthenticationIdService } from '../../services/AuthenticationIdService';
import { NotificationService } from '../../services/NotificationService';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { ObjectID } from 'mongodb';
import {
    DEFAULT_PUSH_NOTI_EXPIRATION_MEMBERSHIP,
    PUSH_NOTI_EXPIRATION_MEMBERSHIP,
    DEFAULT_LINE_NEWS_WEEK_OA,
    LINE_NEWS_WEEK_OA
} from '../../../constants/SystemConfig';
import { ConfigService } from '../../services/ConfigService';
import { KaokaiTodaySnapShotService } from '../../services/KaokaiTodaySnapShot';
import { LineNewMovePartyService } from '../../services/LineNewMovePartyService';
import { LineNewMoveParty } from '../../models/LineNewMoveParty';
import { LineRequest } from './requests/LineRequest';
import axios from 'axios';
// import { Model } from 'firebase-admin/lib/machine-learning/machine-learning';

@JsonController('/admin/line')
export class AdminPointController {
    constructor(
        private userService: UserService,
        private deviceTokenService: DeviceTokenService,
        private notificationService: NotificationService,
        private authenticationIdService: AuthenticationIdService,
        private configService: ConfigService,
        private kaokaiTodaySnapShotService: KaokaiTodaySnapShotService,
        private lineNewMovePartyService: LineNewMovePartyService
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
     *      'firstname' : '',
     *      'lastname' : '',
     *      'email' : '',
     *      'citizenId" : "",
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
    public async birthDayNotificaition(
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const headerAdmin = req.headers.admin;
        const adminUser = await this.userService.findOne({ email: headerAdmin });
        if (adminUser === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Admin is not found.', undefined);
            return res.status(400).send(errorResponse);
        }
        const dateFormat = new Date();
        let month: any = dateFormat.getMonth() + 1;
        let day: any = dateFormat.getDate();

        if (day < 10) { day = '0' + day; }
        if (month < 10) { month = '0' + month; }

        const users = await this.userService.aggregate(
            [
                {
                    $match: {
                        dayDate: day.toString(),
                        monthDate: month.toString()
                    }
                }
            ]
        );
        if (users.length > 0) {
            for (const content of users) {
                const tokenDevice = await this.deviceTokenService.find({ userId: new ObjectID(content._id) });
                await this.pushNotificationBirthDay(content, tokenDevice);
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', `${month}-${day}`));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('BirthDay Event is success.', []));

        }
    }

    @Post('/expired')
    public async expiredMembershipNotification(
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const headerAdmin = req.headers.admin;
        const adminUser = await this.userService.findOne({ email: headerAdmin });
        if (adminUser === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Admin is not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        let expireMemberShip = DEFAULT_PUSH_NOTI_EXPIRATION_MEMBERSHIP;
        const expireMemberShipConfig = await this.configService.getConfig(PUSH_NOTI_EXPIRATION_MEMBERSHIP);
        if (expireMemberShipConfig) {
            expireMemberShip = expireMemberShipConfig.value;
        }
        const today = new Date();
        const startDate = moment(today).clone().utcOffset(0).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
        const endDate = moment(today).clone().utcOffset(0).set({ hour: 23, minute: 59, second: 59, millisecond: 59 }).toDate();
        const days = 24 * 60 * 60 * 1000 * expireMemberShip; // one day in milliseconds

        const formatDateStart = startDate.toISOString().slice(0, 10) + ' ' + startDate.toTimeString().slice(0, 8);
        const formatDateEnd = new Date(endDate.getTime() + days).toISOString().slice(0, 10) + ' ' + endDate.toTimeString().slice(0, 8);
        // 2024-09-05 14:53:42

        const authUser = await this.authenticationIdService.aggregate(
            [
                {
                    $match: {
                        providerName: 'MFP',
                        expirationDate: { $gte: formatDateStart, $lte: formatDateEnd }
                    }
                }
            ]
        );
        if (authUser.length > 0) {
            for (const content of authUser) {
                const tokenDevice = await this.deviceTokenService.find({ userId: new ObjectID(content.user) });
                await this.pushNotificationExpiredMembership(content, tokenDevice);
            }
            return res.status(200).send(ResponseUtil.getSuccessResponse('Expired Event is success.', undefined));
        }
    }

    @Post('/vote')
    @Authorized()
    public async voteLine(
        @Body({ validate: true }) lineRequest: LineRequest,
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const tokenLine = process.env.LINE_AUTHORIZATION;
        // api.line.me/v2/bot/message/push
        const lineUsers = await axios.get(
            'https://api.line.me/v2/bot/followers/ids', {
            headers: {
                Authorization: 'Bearer ' + tokenLine
            }
        });
        if (lineUsers.data.userIds.length > 0) {
            // everybody.
            for (const user of lineUsers.data.userIds) {
                const requestBody = {
                    'to': user.toString(),
                    'messages': lineRequest.messages
                };
                await axios.post(
                    'https://api.line.me/v2/bot/message/push',
                    requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json, text/plain, */*',
                        Authorization: 'Bearer ' + tokenLine
                    }
                }).then((respone) => {
                    console.log('respone');
                }).catch((error) => {
                    return res.status(400).send(ResponseUtil.getSuccessResponse(error.response.data.message, undefined));
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
        @Req() req: any): Promise<any> {
        const tokenLine = process.env.LINE_AUTHORIZATION;

        // api.line.me/v2/bot/message/push
        const lineUsers = await axios.get(
            'https://api.line.me/v2/bot/followers/ids', {
            headers: {
                Authorization: 'Bearer ' + tokenLine
            }
        });
        if (lineUsers.data.userIds.length > 0) {
            const requestBody = {
                'to': 'U6a9f92a2c2bea19e096bc14ef83812ba',
                'messages': lineRequest.messages
            };
            await axios.post(
                'https://api.line.me/v2/bot/message/push',
                requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json, text/plain, */*',
                    Authorization: 'Bearer ' + tokenLine
                }
            });
            return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', undefined));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', []));
        }
    }

    @Post('/content/oa')
    public async lineOaKaokaiContent(
        @Res() res: any,
        @Req() req: any
    ): Promise<any> {
        const headerAdmin = req.headers.admin;
        const adminUser = await this.userService.findOne({ email: headerAdmin });
        if (adminUser === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Admin is not found.', undefined);
            return res.status(400).send(errorResponse);
        }
        const objStackIds: any = [];
        const lineOaStack = await this.lineNewMovePartyService.aggregate([]);
        if (lineOaStack.length > 0) {
            for (const line of lineOaStack) {
                line.objIds.map((ids) => objStackIds.push(new ObjectID(ids)));
            }
        }
        const pageLike = await this.configService.getConfig(LINE_NEWS_WEEK_OA);
        let pageLikePoint = DEFAULT_LINE_NEWS_WEEK_OA;
        if (pageLike) {
            pageLikePoint = parseInt(pageLike.value, 10);
        }
        const today = new Date();
        const twoWeeksAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000 * pageLikePoint);
        const kaokaiSnapshot = await this.kaokaiTodaySnapShotService.aggregate(
            [
                {
                    $match: {
                        _id: { $nin: objStackIds },
                        endDateTime: { $lte: today, $gte: twoWeeksAgo }
                    }
                },
                {
                    $sort: {
                        count: -1,
                        sumCount: -1
                    }
                },
                {
                    $limit: 4
                }
            ]
        );
        const content: any = {
            'messages': [
                {
                    'type': 'flex',
                    'altText': 'ข่าวก้าวไกล ที่น่าสนใจในช่วง 2 สัปดาห์ที่ผ่านมา',
                    'contents': {
                        'type': 'bubble',
                        'size': 'mega',
                        'body': {
                            'type': 'box',
                            'layout': 'vertical',
                            'contents': [],
                            'paddingAll': '0px',
                            'width': '100%',
                            'height': '100%'
                        }
                    }
                }
            ]
        };

        if (kaokaiSnapshot.length > 0) {
            const stackIds: any = [];
            for (const [key, kaokai] of Object.entries(kaokaiSnapshot)) {
                stackIds.push(new ObjectID(kaokai._id));
                let kaokaiToday = undefined;
                if (parseInt(key, 10) === 0 && kaokaiSnapshot.length > 0) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents.push(
                        {
                            'type': 'image',
                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                            'size': 'full',
                            'aspectMode': 'cover',
                            'aspectRatio': '1:1',
                            'gravity': 'center'
                        },
                        {
                            'type': 'box',
                            'layout': 'vertical',
                            'contents': [
                                {
                                    'type': 'text',
                                    'text': 'ก้าวไกลทูเดย์',
                                    'color': '#ffffff',
                                    'weight': 'bold',
                                    'size': '34px'
                                }
                            ],
                            'position': 'absolute',
                            'alignItems': 'center',
                            'justifyContent': 'center',
                            'width': '100%',
                            'offsetTop': '30px'
                        },
                        {
                            'type': 'box',
                            'layout': 'vertical',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'maxLines': 3,
                                            'wrap': true
                                        },
                                        {
                                            'type': 'box',
                                            'layout': 'vertical',
                                            'contents': [
                                                {
                                                    'type': 'button',
                                                    'action': {
                                                        'type': 'uri',
                                                        'label': 'อ่านเพิ่มเติม',
                                                        'uri': kaokaiToday + '&openExternalBrowser=1'
                                                    },
                                                    'color': '#F18805',
                                                    'scaling': false,
                                                    'style': 'primary',
                                                    'height': 'sm',
                                                    'adjustMode': 'shrink-to-fit',
                                                    'gravity': 'center',
                                                    'margin': '10px'
                                                }
                                            ],
                                            'position': 'relative'
                                        }
                                    ],
                                    'height': '130px',
                                    'backgroundColor': '#F0F0F0',
                                    'paddingAll': '10px',
                                    'width': '100%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': []
                                }
                            ],
                            'width': '100%',
                            'height': '100%'
                        }
                    );
                }

                if (
                    parseInt(key, 10) === 1 &&
                    kaokaiSnapshot.length > 0 &&
                    content['messages'][0].contents.body.contents.length > 0
                ) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents[2].contents[1].contents.push(
                        {
                            'type': 'box',
                            'layout': 'horizontal',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'horizontal',
                                    'contents': [
                                        {
                                            'type': 'image',
                                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                                            'size': '80px',
                                            'align': 'start',
                                            'aspectMode': 'cover'
                                        }
                                    ],
                                    'paddingAll': '5px',
                                    'cornerRadius': '8px',
                                    'width': '30%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'wrap': true,
                                            'size': '14px',
                                            'align': 'start',
                                            'gravity': 'center',
                                            'maxLines': 3,
                                            'margin': '5px'
                                        }
                                    ]
                                }
                            ],
                            'backgroundColor': '#FFFFFF',
                            'width': '100%',
                            'height': '70px',
                            'cornerRadius': '8px',
                            'action': {
                                'type': 'uri',
                                'label': 'action',
                                'uri': kaokaiToday + '&openExternalBrowser=1',
                            }
                        },
                    );
                }
                if (
                    parseInt(key, 10) === 2 &&
                    kaokaiSnapshot.length > 0 &&
                    content['messages'][0].contents.body.contents.length > 0
                ) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents[2].contents[1].contents.push(
                        {
                            'type': 'box',
                            'layout': 'horizontal',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'horizontal',
                                    'contents': [
                                        {
                                            'type': 'image',
                                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                                            'size': '80px',
                                            'align': 'start',
                                            'aspectMode': 'cover'
                                        }
                                    ],
                                    'paddingAll': '5px',
                                    'cornerRadius': '8px',
                                    'width': '30%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'wrap': true,
                                            'size': '14px',
                                            'align': 'start',
                                            'gravity': 'center',
                                            'maxLines': 3,
                                            'margin': '5px'
                                        }
                                    ]
                                }
                            ],
                            'backgroundColor': '#FFFFFF',
                            'width': '100%',
                            'height': '70px',
                            'cornerRadius': '8px',
                            'action': {
                                'type': 'uri',
                                'label': 'action',
                                'uri': kaokaiToday + '&openExternalBrowser=1',
                            }
                        },
                    );
                }
                if (
                    parseInt(key, 10) === 3 &&
                    kaokaiSnapshot.length > 0 &&
                    content['messages'][0].contents.body.contents.length > 0
                ) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents[2].contents[1].contents.push(
                        {
                            'type': 'box',
                            'layout': 'horizontal',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'horizontal',
                                    'contents': [
                                        {
                                            'type': 'image',
                                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                                            'size': '80px',
                                            'align': 'start',
                                            'aspectMode': 'cover'
                                        }
                                    ],
                                    'paddingAll': '5px',
                                    'cornerRadius': '8px',
                                    'width': '30%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'wrap': true,
                                            'size': '14px',
                                            'align': 'start',
                                            'gravity': 'center',
                                            'maxLines': 3,
                                            'margin': '5px'
                                        }
                                    ]
                                }
                            ],
                            'backgroundColor': '#FFFFFF',
                            'width': '100%',
                            'height': '70px',
                            'cornerRadius': '8px',
                            'action': {
                                'type': 'uri',
                                'label': 'action',
                                'uri': kaokaiToday + '&openExternalBrowser=1',
                            }
                        },
                    );
                }
            }

            const lineNewMoveParty = new LineNewMoveParty();
            lineNewMoveParty.objIds = stackIds;
            const tokenLine = process.env.LINE_AUTHORIZATION;

            const create = await this.lineNewMovePartyService.create(lineNewMoveParty);
            // api.line.me/v2/bot/message/push
            if (create) {
                const lineUsers = await axios.get(
                    'https://api.line.me/v2/bot/followers/ids', {
                    headers: {
                        Authorization: 'Bearer ' + tokenLine
                    }
                });
                // console.log('content',content['messages'][0].contents.body.contents);
                if (lineUsers.data.userIds.length > 0 && content['messages'][0].contents.body.contents.length > 0) {
                    for (const user of lineUsers.data.userIds) {
                        const requestBody = {
                            'to': String(user),
                            'messages': content['messages']
                        };

                        await axios.post(
                            'https://api.line.me/v2/bot/message/push',
                            requestBody, {
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json, text/plain, */*',
                                Authorization: 'Bearer ' + tokenLine
                            }
                        });
                    }
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', undefined));
                }
                return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', undefined));
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', []));
            }
        } else {
            return res.status(400).send(ResponseUtil.getSuccessResponse('Not found the contents.', []));
        }
    }

    @Post('/test/content/oa')
    public async testLineOaKaokaiContent(
        @Res() res: any,
        @Req() req: any
    ): Promise<any> {
        const headerAdmin = req.headers.admin;
        const adminUser = await this.userService.findOne({ email: headerAdmin });
        if (adminUser === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Admin is not found.', undefined);
            return res.status(400).send(errorResponse);
        }
        const objStackIds: any = [];
        const lineOaStack = await this.lineNewMovePartyService.aggregate([]);
        if (lineOaStack.length > 0) {
            for (const line of lineOaStack) {
                line.objIds.map((ids) => objStackIds.push(new ObjectID(ids)));
            }
        }
        const today = new Date();
        const twoWeeksAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000 * 150);
        const kaokaiSnapshot = await this.kaokaiTodaySnapShotService.aggregate(
            [
                {
                    $match: {
                        _id: { $nin: objStackIds },
                        endDateTime: { $lte: today, $gte: twoWeeksAgo }
                    }
                },
                {
                    $sort: {
                        count: -1,
                        sumCount: -1
                    }
                },
                {
                    $limit: 4
                }
            ]
        );
        const content: any = {
            'messages': [
                {
                    'type': 'flex',
                    'altText': 'ข่าวก้าวไกล ที่น่าสนใจในช่วง 2 สัปดาห์ที่ผ่านมา',
                    'contents': {
                        'type': 'bubble',
                        'size': 'mega',
                        'body': {
                            'type': 'box',
                            'layout': 'vertical',
                            'contents': [],
                            'paddingAll': '0px',
                            'width': '100%',
                            'height': '100%'
                        }
                    }
                }
            ]
        };

        if (kaokaiSnapshot.length > 0) {
            const stackIds: any = [];
            for (const [key, kaokai] of Object.entries(kaokaiSnapshot)) {
                stackIds.push(new ObjectID(kaokai._id));
                let kaokaiToday = undefined;
                if (parseInt(key, 10) === 0 && kaokaiSnapshot.length > 0) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents.push(
                        {
                            'type': 'image',
                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                            'size': 'full',
                            'aspectMode': 'cover',
                            'aspectRatio': '1:1',
                            'gravity': 'center'
                        },
                        {
                            'type': 'box',
                            'layout': 'vertical',
                            'contents': [
                                {
                                    'type': 'text',
                                    'text': 'ก้าวไกลทูเดย์',
                                    'color': '#ffffff',
                                    'weight': 'bold',
                                    'size': '34px'
                                }
                            ],
                            'position': 'absolute',
                            'alignItems': 'center',
                            'justifyContent': 'center',
                            'width': '100%',
                            'offsetTop': '30px'
                        },
                        {
                            'type': 'box',
                            'layout': 'vertical',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'maxLines': 3,
                                            'wrap': true
                                        },
                                        {
                                            'type': 'box',
                                            'layout': 'vertical',
                                            'contents': [
                                                {
                                                    'type': 'button',
                                                    'action': {
                                                        'type': 'uri',
                                                        'label': 'อ่านเพิ่มเติม',
                                                        'uri': `${kaokaiToday}`
                                                    },
                                                    'color': '#F18805',
                                                    'scaling': false,
                                                    'style': 'primary',
                                                    'height': 'sm',
                                                    'adjustMode': 'shrink-to-fit',
                                                    'gravity': 'center',
                                                    'margin': '10px'
                                                }
                                            ],
                                            'position': 'relative'
                                        }
                                    ],
                                    'height': '130px',
                                    'backgroundColor': '#F0F0F0',
                                    'paddingAll': '10px',
                                    'width': '100%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': []
                                }
                            ],
                            'width': '100%',
                            'height': '100%'
                        }
                    );
                }

                if (
                    parseInt(key, 10) === 1 &&
                    kaokaiSnapshot.length > 0 &&
                    content['messages'][0].contents.body.contents.length > 0
                ) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents[2].contents[1].contents.push(
                        {
                            'type': 'box',
                            'layout': 'horizontal',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'horizontal',
                                    'contents': [
                                        {
                                            'type': 'image',
                                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                                            'size': '80px',
                                            'align': 'start',
                                            'aspectMode': 'cover'
                                        }
                                    ],
                                    'paddingAll': '5px',
                                    'cornerRadius': '8px',
                                    'width': '30%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'wrap': true,
                                            'size': '14px',
                                            'align': 'start',
                                            'gravity': 'center',
                                            'maxLines': 3,
                                            'margin': '5px'
                                        }
                                    ]
                                }
                            ],
                            'backgroundColor': '#FFFFFF',
                            'width': '100%',
                            'height': '70px',
                            'cornerRadius': '8px',
                            'action': {
                                'type': 'uri',
                                'label': 'action',
                                'uri': kaokaiToday
                            }
                        },
                    );
                }
                if (
                    parseInt(key, 10) === 2 &&
                    kaokaiSnapshot.length > 0 &&
                    content['messages'][0].contents.body.contents.length > 0
                ) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents[2].contents[1].contents.push(
                        {
                            'type': 'box',
                            'layout': 'horizontal',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'horizontal',
                                    'contents': [
                                        {
                                            'type': 'image',
                                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                                            'size': '80px',
                                            'align': 'start',
                                            'aspectMode': 'cover'
                                        }
                                    ],
                                    'paddingAll': '5px',
                                    'cornerRadius': '8px',
                                    'width': '30%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'wrap': true,
                                            'size': '14px',
                                            'align': 'start',
                                            'gravity': 'center',
                                            'maxLines': 3,
                                            'margin': '5px'
                                        }
                                    ]
                                }
                            ],
                            'backgroundColor': '#FFFFFF',
                            'width': '100%',
                            'height': '70px',
                            'cornerRadius': '8px',
                            'action': {
                                'type': 'uri',
                                'label': 'action',
                                'uri': kaokaiToday,
                            }
                        },
                    );
                }
                if (
                    parseInt(key, 10) === 3 &&
                    kaokaiSnapshot.length > 0 &&
                    content['messages'][0].contents.body.contents.length > 0
                ) {
                    let dd: any = kaokaiSnapshot[key].endDateTime.getDate() - 1;
                    let mm = kaokaiSnapshot[key].endDateTime.getMonth() + 1;
                    if (dd < 10) { dd = '0' + dd; }
                    if (mm < 10) { mm = '0' + mm; }
                    kaokaiToday = process.env.APP_HOME + `?date=${kaokaiSnapshot[key].endDateTime.getFullYear()}-${mm}-${dd}`;
                    content['messages'][0].contents.body.contents[2].contents[1].contents.push(
                        {
                            'type': 'box',
                            'layout': 'horizontal',
                            'contents': [
                                {
                                    'type': 'box',
                                    'layout': 'horizontal',
                                    'contents': [
                                        {
                                            'type': 'image',
                                            'url': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].coverPageSignUrl : kaokai.data.majorTrend.contents[0].coverPageSignUrl,
                                            'size': '80px',
                                            'align': 'start',
                                            'aspectMode': 'cover'
                                        }
                                    ],
                                    'paddingAll': '5px',
                                    'cornerRadius': '8px',
                                    'width': '30%'
                                },
                                {
                                    'type': 'box',
                                    'layout': 'vertical',
                                    'contents': [
                                        {
                                            'type': 'text',
                                            'text': kaokai.data.pageRoundRobin.contents[0] !== undefined ? kaokai.data.pageRoundRobin.contents[0].post.title : kaokai.data.majorTrend.contents[0].post.title,
                                            'wrap': true,
                                            'size': '14px',
                                            'align': 'start',
                                            'gravity': 'center',
                                            'maxLines': 3,
                                            'margin': '5px'
                                        }
                                    ]
                                }
                            ],
                            'backgroundColor': '#FFFFFF',
                            'width': '100%',
                            'height': '70px',
                            'cornerRadius': '8px',
                            'action': {
                                'type': 'uri',
                                'label': 'action',
                                'uri': kaokaiToday
                            }
                        },
                    );
                }
            }

            const lineNewMoveParty = new LineNewMoveParty();
            lineNewMoveParty.objIds = stackIds;
            const tokenLine = process.env.LINE_AUTHORIZATION;
            const create = await this.lineNewMovePartyService.create(lineNewMoveParty);
            // api.line.me/v2/bot/message/push
            if (create) {
                const lineUsers = await axios.get(
                    'https://api.line.me/v2/bot/followers/ids', {
                    headers: {
                        Authorization: 'Bearer ' + tokenLine
                    }
                });
                // console.log('content',content['messages'][0].contents.body.contents);
                if (lineUsers.data.userIds.length > 0 && content['messages'][0].contents.body.contents.length > 0) {
                    const requestBody = {
                        'to': 'U589f12b01e4f66d84ac302bb1cbbfb78',
                        'messages': content['messages']
                    };

                    await axios.post(
                        'https://api.line.me/v2/bot/message/push',
                        requestBody, {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json, text/plain, */*',
                            Authorization: 'Bearer ' + tokenLine
                        }
                    });
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', undefined));
                }
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Line Flex message.', []));
            }
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Not found the contents.', []));
        }
    }

    @Post('/migrate/birthday')
    public async migrateBirthDay(
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const headerAdmin = req.headers.admin;
        const adminUser = await this.userService.findOne({ email: headerAdmin });
        if (adminUser === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Admin is not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        const users: any = await this.userService.aggregate([
            {
                $match: {
                    dayDate: null,
                    monthDate: null
                }
            },
            {
                $limit: 20000
            }
        ]);
        if (users.length > 0) {
            for (const content of users) {
                if (content.birthdate !== undefined) {
                    const dateTimeStamp = Date.parse(content.birthdate);
                    const date = new Date(dateTimeStamp);
                    const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds
                    if (typeof (content.birthdate) === 'object') {
                        // year-month-days
                        // 2023-03-11
                        const timeStampMonth = new Date(date.getTime()).toLocaleDateString('th-TH', {
                            month: 'numeric',
                        });

                        // console.log('date.getDate()',date.getDate());
                        let monthObj: any = timeStampMonth;
                        // console.log('monthObj',monthObj);
                        const timeStampDay = new Date(date.getTime() - oneDay).toLocaleDateString('th-TH', {
                            day: 'numeric'
                        });

                        if (parseInt(timeStampDay, 10) === 30) {
                            continue;
                        }

                        if (parseInt(timeStampDay, 10) === 31) {
                            continue;
                        }

                        let dayObj: any = timeStampDay;

                        if (dayObj < 10) { dayObj = '0' + dayObj; }
                        if (monthObj < 10) { monthObj = '0' + monthObj; }

                        const query = {
                            _id: new ObjectID(content._id)
                        };
                        // console.log(' _id: new ObjectID(content._id)', new ObjectID(content._id));

                        const update = {
                            $set: {
                                dayDate: dayObj.toString(),
                                monthDate: monthObj.toString()
                            }
                        };

                        await this.userService.update(query, update);
                    } else {
                        let month: any = date.getMonth() + 1;
                        let day: any = date.getDate();
                        if (day < 10) { day = '0' + day; }
                        if (month < 10) { month = '0' + month; }

                        const query = {
                            _id: new ObjectID(content._id)
                        };
                        // console.log(' _id: new ObjectID(content._id)', new ObjectID(content._id));

                        const update = {
                            $set: {
                                dayDate: day.toString(),
                                monthDate: month.toString()
                            }
                        };

                        await this.userService.update(query, update);
                    }
                } else {
                    continue;
                }
            }
        }

        return res.status(200).send(ResponseUtil.getSuccessResponse('Migrate BirthDay Event is success.', undefined));
    }

    private async pushNotificationExpiredMembership(data: any, token: any): Promise<any> {
        if (token.length > 0) {
            for (const content of token) {
                if (content.token !== undefined && content.token !== null && content.token !== '') {
                    await this.notificationService.pushNotificationMessageExpiredMemberShip(data, content.token);
                } else {
                    continue;
                }
            }
        }
    }

    private async pushNotificationBirthDay(data: any, token: any): Promise<any> {
        if (token.length > 0) {
            for (const content of token) {
                if (content.token !== undefined && content.token !== null && content.token !== '') {
                    await this.notificationService.pushNotificationMessageBirthDay(data, content.token);
                } else {
                    continue;
                }
            }
        }
    }
} 
