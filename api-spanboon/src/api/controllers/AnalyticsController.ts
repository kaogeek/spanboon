/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Res, Post, Body, Req } from 'routing-controllers';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import { UserService } from '../services/UserService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import moment from 'moment';
import { DashBoardRequest } from './requests/DashBoardRequest';
import axios from 'axios';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnalyticsModel } from '../models/AnalyticsModel';

@JsonController('/dashboard')
export class AssetController {

    constructor(
        private userService: UserService,
        private authenticationIdService: AuthenticationIdService,
        private pageService: PageService,
        private analyticsService:AnalyticsService
    ) { }

    @Post('/')
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
                        province: { $in: result['province'] },
                        createdDate: { $gte: startDate, $lte: endDate }
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

    @Post('/users/mfp')
    public async findUsersMFP(@Body({ validate: true }) search: DashBoardRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const startDate: any = new Date(search.createDate);
        const endDate: any = new Date(search.endDate);

        if (startDate.getTime() > endDate.getTime()) {
            const errorResponse = ResponseUtil.getErrorResponse('StartDate > EndDate.', undefined);
            return res.status(400).send(errorResponse);
        }
        const fourHours = 4 * 60 * 60 * 1000; // one day in milliseconds
        const today = new Date();

        const result: any = {
            'mfpUsers': {},
            'followerPage': {},
            'Total_MFP': {},
            'Total_USERS': {}
        };
        const providerName = ['APPLE','EMAIL','FACEBOOK'];
        const memoryRec = await this.analyticsService.aggregate([]);
        let create = undefined;
        const analytics:any = new AnalyticsModel();
        const provinces = await axios.get('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json');
        const stack: any = {
            'province': [],
        };
        const mfpUserId = [];
        let mfpUsers = undefined;
        let findUsersMfpByProvince = undefined;
        let followerPage = undefined;
        let totalUser = undefined;
        let totalMFP = undefined;
        let totalUsersLogin = undefined;

        if(
            memoryRec.length !== 0 &&
            memoryRec !== undefined && 
            today.getTime() >= memoryRec[0].expiredDate.getTime()
        ){
            const deleted = await this.analyticsService.delete({_id: new ObjectID(memoryRec[0]._id)});
            if(deleted){

                if (provinces.data.length > 0) {
                    for (const province of provinces.data) {
                        stack['province'].push(province.province);
                    }
                }
                stack['province'] = stack['province'].filter((item,
                    index) => stack['province'].indexOf(item) === index
                );
                
                mfpUsers = await this.authenticationIdService.aggregate(
                    [
                        {
                            $match: {
                                providerName: 'MFP'
                            }
                        }
                    ]
                );
                if (mfpUsers.length > 0) {
                    for (const mfp of mfpUsers) {
                        mfpUserId.push(new ObjectID(mfp.user));
                    }
                }
        
                findUsersMfpByProvince = await this.userService.aggregate(
                    [
                        {
                            $match: {
                                _id: { $in: mfpUserId },
                                province: { $in: stack['province'] },
                                banned: false,
                                createdDate: { $gte: startDate, $lte: endDate }
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
        
                followerPage = await this.pageService.aggregate(
                    [
                        {
                            $match: {
                                isOfficial: true,
                                banned: false
                            }
                        },
                        {
                            $lookup: {
                                from: 'UserFollow',
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$id', '$subjectId']
                                            }
                                        }
                                    },
                                    {
                                        $match: {
                                            subjectType: 'PAGE'
                                        }
                                    },
                                    {
                                        $count: 'total_follows'
                                    }
                                ],
                                as: 'userFollow'
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                imageURL: 1,
                                coverURL: 1,
                                isOfficial: 1,
                                banned: 1,
                                province: 1,
                                userFollow: 1
                            }
                        },
                        {
                            $sort: {
                                userFollow: -1
                            }
                        },
                        {
                            $unwind: {
                                path: '$userFollow'
                            }
                        },
                        {
                            $limit: 50
                        }
                    ]
                );
        
                totalUser = await this.userService.aggregate(
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
        
                totalMFP = await this.authenticationIdService.aggregate(
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

                totalUsersLogin = await this.authenticationIdService.aggregate(
                    [
                        {
                            $match:{
                                providerName:{$in:providerName}
                            }
                        },
                        {
                            $group:{
                                _id: '$providerName',
                                count:{$sum:1}
                            }
                        }
                    ]
                );

                result['mfpUsers'] = {
                    'label': 'MFP Users',
                    'data': findUsersMfpByProvince
                };
                result['followerPage'] = {
                    'label': 'Follower Page',
                    'data': followerPage,
                };
        
                result['Total_MFP'] = {
                    'label': 'Total users MFP',
                    'data': totalMFP.length > 0 ? totalMFP[0].Total_MFP : []
                };
        
                result['Total_USERS'] = {
                    'label': 'General users',
                    'data': totalUser.length > 0 ? totalUser[0].Total_users: []
                };
                result['Total_Login'] = {
                    'label': 'Total Users Login',
                    'data': totalUsersLogin.length > 0 ? totalUsersLogin[0].loginBy.data: []
                };

                analytics.mfpUsers = result['mfpUsers'];
                analytics.followerPage = result['followerPage'];
                analytics.totalMFP = result['Total_MFP'];
                analytics.totalUSERS = result['Total_USERS'];
                analytics.loginBy = result['TotalPage_Posts'];
                analytics.expiredDate = new Date(today.getTime() + fourHours);
                create = await this.analyticsService.create(analytics);

                result['mfpUsers'] = {
                    'label': 'MFP Users',
                    'data': create.mfpUsers
                };
                result['followerPage'] = {
                    'label': 'Follower Page',
                    'data': create.followerPage,
                };
        
                result['Total_MFP'] = {
                    'label': 'Total users MFP',
                    'data': create !== undefined ? create.totalMFP : []
                };
        
                result['Total_USERS'] = {
                    'label': 'General users',
                    'data': create !== undefined ? create.totalUSERS : []
                };

                result['Total_Login'] = {
                    'label': 'Total users loginBy',
                    'data': create !== undefined ? create.loginB.data : []
                };

                const successResponse = ResponseUtil.getSuccessResponse('DashBoard.', result);
                return res.status(200).send(successResponse);
            }   
        }
        if(memoryRec !== undefined && memoryRec.length >0){
            result['mfpUsers'] = {
                'label': 'MFP Users',
                'data': memoryRec[0].mfpUsers.data
            };
            result['followerPage'] = {
                'label': 'Follower Page',
                'data': memoryRec[0].followerPage.data,
            };
    
            result['Total_MFP'] = {
                'label': 'Total users MFP',
                'data': memoryRec !== undefined ? memoryRec[0].totalMFP.data : []
            };
    
            result['Total_USERS'] = {
                'label': 'General users',
                'data': memoryRec !== undefined ? memoryRec[0].totalUSERS.data : []
            };

            result['Total_Login'] = {
                'label': 'Total users loginBy',
                'data': memoryRec !== undefined ? memoryRec[0].loginBy.data : []
            };

            const successResponse = ResponseUtil.getSuccessResponse('DashBoard.', result);
            return res.status(200).send(successResponse);
        }

        if (provinces.data.length > 0) {
            for (const province of provinces.data) {
                stack['province'].push(province.province);
            }
        }
        stack['province'] = stack['province'].filter((item,
            index) => stack['province'].indexOf(item) === index
        );

        mfpUsers = await this.authenticationIdService.aggregate(
            [
                {
                    $match: {
                        providerName: 'MFP'
                    }
                }
            ]
        );
        if (mfpUsers.length > 0) {
            for (const mfp of mfpUsers) {
                mfpUserId.push(new ObjectID(mfp.user));
            }
        }

        findUsersMfpByProvince = await this.userService.aggregate(
            [
                {
                    $match: {
                        _id: { $in: mfpUserId },
                        province: { $in: stack['province'] },
                        banned: false,
                        createdDate: { $gte: startDate, $lte: endDate }
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

        followerPage = await this.pageService.aggregate(
            [
                {
                    $match: {
                        isOfficial: true,
                        banned: false
                    }
                },
                {
                    $lookup: {
                        from: 'UserFollow',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$subjectId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    subjectType: 'PAGE'
                                }
                            },
                            {
                                $count: 'total_follows'
                            }
                        ],
                        as: 'userFollow'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        imageURL: 1,
                        coverURL: 1,
                        isOfficial: 1,
                        banned: 1,
                        province: 1,
                        userFollow: 1
                    }
                },
                {
                    $sort: {
                        userFollow: -1
                    }
                },
                {
                    $unwind: {
                        path: '$userFollow'
                    }
                },
                {
                    $limit: 50
                }
            ]
        );

        totalUser = await this.userService.aggregate(
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

        totalMFP = await this.authenticationIdService.aggregate(
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

        totalUsersLogin = await this.authenticationIdService.aggregate(
            [
                {
                    $match:{
                        providerName:{$in:providerName}
                    }
                },
                {
                    $group:{
                        _id: '$providerName',
                        count:{$sum:1}
                    }
                }
            ]
        );

        result['mfpUsers'] = {
            'label': 'MFP Users',
            'data': findUsersMfpByProvince
        };
        result['followerPage'] = {
            'label': 'Follower Page',
            'data': followerPage,
        };

        result['Total_MFP'] = {
            'label': 'Total users MFP',
            'data': totalMFP.length > 0 ? totalMFP[0].Total_MFP : []
        };

        result['Total_USERS'] = {
            'label': 'General users',
            'data': totalUser.length > 0 ? totalUser[0].Total_users: []
        };
        result['Total_Login'] = {
            'label': 'Total users loginBy',
            'data': totalUsersLogin.length > 0 ? totalUsersLogin[0].loginBy.data: []
        };
        analytics.mfpUsers = result['mfpUsers'];
        analytics.followerPage = result['followerPage'];
        analytics.totalMFP = result['Total_MFP'];
        analytics.totalUSERS = result['Total_USERS'];
        analytics.loginBy = result['Total_Login'];
        analytics.expiredDate = new Date(today.getTime() + fourHours);
        create = await this.analyticsService.create(analytics);
        if(create){
            if (result) {
                const successResponse = ResponseUtil.getSuccessResponse('DashBoard.', result);
                return res.status(200).send(successResponse);
            } 
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('DashBoard.', []);
            return res.status(200).send(successResponse);
        }
    }

}