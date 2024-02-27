import { JsonController, Res, Post, Body, Req, Authorized } from 'routing-controllers';
// , Put, Delete, Get
// import { VotingEventRequest } from '../requests/VotingEventRequest';
// import { VotingEventService } from '../../services/VotingEventService';
// import { VoteItemService } from '../../services/VoteItemService';
// import { VoteChoiceService } from '../../services/VoteChoiceService';
// import { VotedService } from '../../services/VotedService';
import { AuthenticationIdService } from '../../services/AuthenticationIdService';
// import { UserSupportService } from '../../services/UserSupportService';
import { UserService } from '../../services/UserService';
// import { VotingEventModel } from '../../models/VotingEventModel';
import { ResponseUtil } from '../../../utils/ResponseUtil';
// import { ObjectID } from 'mongodb';
import moment from 'moment';
// import { SearchFilter } from '../requests/SearchFilterRequest';
import { DashBoardRequest } from '../requests/DashBoardRequest';
// import { ObjectUtil } from '../../../utils/ObjectUtil';
// import { ConfigService } from '../../services/ConfigService';
import axios from 'axios';

@JsonController('/admin/dashboard')
export class AdminDashBoardController {
    constructor(
        private userService: UserService,
        private authenticationIdService: AuthenticationIdService
    ) { }

    @Post('/')
    @Authorized()
    public async dashboard(@Body({ validate: true }) search: DashBoardRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const startDate: any = new Date(search.createDate);
        const endDate: any = new Date(search.endDate);

        if (startDate.getTime() > endDate.getTime()) {
            const errorResponse = ResponseUtil.getErrorResponse('StartDate > EndDate.', undefined);
            return res.status(400).send(errorResponse);
        }

        const timestamp = moment(startDate);
        const yearString = timestamp.format('YYYY'); // Output: "months"

        const provinces = await axios.get('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json');
        const users = await this.userService.aggregate(
            [

                {
                    $match: {
                        banned: false,
                        createdDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $sort: {
                        createdDate: 1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        createdDate: 1
                    }
                }
            ]
        );

        const totalMFP = await this.authenticationIdService.aggregate(
            [
                {
                    $match: {
                        providerName: 'MFP'
                    }
                },
                {
                    $count: 'Total_MFP'
                }
            ]
        );

        const result: any = {
            'January': [],
            'February': [],
            'March': [],
            'April': [],
            'May': [],
            'June': [],
            'July': [],
            'August': [],
            'September': [],
            'October': [],
            'November': [],
            'December': [],
            'province': []
        };

        if (users.length > 0) {

            for (const user of users) {
                const parsedTimestamp = moment(user.createdDate);
                const monthString = parsedTimestamp.format('MMMM'); // Output: "months"
                // console.log('monthString',monthString);
                if (String(monthString) === 'January') {
                    // console.log('pass1');
                    result['January'].push(user);
                } else if (String(monthString) === 'February') {
                    result['February'].push(user);
                } else if (String(monthString) === 'March') {
                    result['March'].push(user);
                } else if (String(monthString) === 'April') {
                    result['April'].push(user);
                } else if (String(monthString) === 'May') {
                    result['May'].push(user);
                } else if (String(monthString) === 'June') {
                    result['June'].push(user);
                } else if (String(monthString) === 'July') {
                    result['July'].push(user);
                } else if (String(monthString) === 'August') {
                    result['August'].push(user);
                } else if (String(monthString) === 'September') {
                    result['September'].push(user);
                } else if (String(monthString) === 'October') {
                    result['October'].push(user);
                } else if (String(monthString) === 'November') {
                    result['November'].push(user);
                } else if (String(monthString) === 'December') {
                    result['December'].push(user);
                }
            }
        }
        const totalUser = await this.userService.aggregate(
            [

                {
                    $match: {
                        banned: false,
                    }
                },
                {
                    $count: 'Total_users'
                }
            ]
        );
        result['Year'] = yearString;
        result['Total_users'] = totalUser[0].Total_users;
        result['Total_MFP'] = totalMFP.length > 0 ? totalMFP[0].Total_MFP : [];
        result['January'] = result['January'].length;
        result['February'] = result['February'].length;
        result['March'] = result['March'].length;
        result['April'] = result['April'].length;
        result['May'] = result['May'].length;
        result['June'] = result['June'].length;
        result['July'] = result['July'].length;
        result['August'] = result['August'].length;
        result['September'] = result['September'].length;
        result['October'] = result['October'].length;
        result['November'] = result['November'].length;
        result['December'] = result['December'].length;

        if (provinces.data.length > 0) {
            for (const province of provinces.data) {
                result['province'].push(province.province);
            }
        }
        result['province'] = result['province'].filter((item,
            index) => result['province'].indexOf(item) === index
        );
        const findUsersByProvince = await this.userService.aggregate(
            [
                {
                    $match: {
                        province: { $in: result['province'] }
                    }
                },
                {
                    $group: {
                        _id: '$province',
                        count: { $sum: 1 }
                    }
                }
            ]
        );
        result['province'] = findUsersByProvince;
        if (users.length > 0) {
            const successResponse = ResponseUtil.getSuccessResponse('DashBoard.', result);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('DashBoard.', []);
            return res.status(200).send(successResponse);
        }
    }
}