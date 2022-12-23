import { Request, Response } from 'express';
import { Authorized, Body, JsonController, Post, Req, Res } from 'routing-controllers';
import { UserReportRequest } from './requests/UserReportRequest';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { REPORT_TYPE } from '../../constants/ReportType';
import { UserReportService } from '../services/UserReportService';
import { UserReport } from '../models/UserReport';
import { ObjectID } from 'mongodb';
import { SearchFilter } from './requests/SearchFilterRequest';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { DEFAULT_SEARCH_CONFIG_VALUE, SEARCH_CONFIG_NAME } from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';

@JsonController('/user/report')
export class UserReportController {

    constructor(
        private userReportService: UserReportService,
        private configService: ConfigService
    ) { }

    @Post()
    @Authorized('user')
    public async createUserReport(@Body({ validate: true }) body: UserReportRequest, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const typeId: string = body.typeId;
            const type: string = body.type;
            const topic: string = body.topic;
            const message: string = body.message;
            const reporter: string = req.user['id'];
            const reporterUsername: string = req.user['username'];

            const typeObjId: ObjectID = new ObjectID(typeId);
            const reporterObjId: ObjectID = new ObjectID(reporter);
            const reportStmt: any = { typeId: typeObjId, reporter: reporterObjId };

            if (REPORT_TYPE.USER === type) {
                reportStmt['type'] = REPORT_TYPE.USER;
            } else if (REPORT_TYPE.PAGE === type) {
                reportStmt['type'] = REPORT_TYPE.PAGE;
            } else if (REPORT_TYPE.POST === type) {
                reportStmt['type'] = REPORT_TYPE.POST;
            }

            const reportResult: UserReport[] = await this.userReportService.find(reportStmt);

            if (reportResult !== null && reportResult !== undefined && reportResult.length === 2) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('You already Reported', reportResult));
            } else {
                const userReportCreated: UserReport = await this.createUserReportInfo(typeObjId, type, topic, message, reporterObjId, reporterUsername);

                if (userReportCreated !== null && userReportCreated !== undefined) {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('Create UserReport Success', userReportCreated));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Create UserReport', undefined));
                }
            }
        } catch (error: any) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Create UserReport Error', error));
        }
    }

    @Post('/search')
    @Authorized('user')
    public async searchUserReport(@Body({ validate: true }) filter: SearchFilter, @Req() req: Request, @Res() res: Response): Promise<any> {
        if (filter === null || filter === undefined || ObjectUtil.isObjectEmpty(filter)) {
            filter = new SearchFilter();
        }

        const userId: string = req.user['id'];
        const userObjId: ObjectID = new ObjectID(userId);

        if (filter.whereConditions !== null && filter.whereConditions !== undefined) {
            if (typeof filter.whereConditions === 'object') {
                filter.whereConditions.reporter = userObjId;
            } else if (Array.isArray(filter.whereConditions)) {
                for (const fCon of filter.whereConditions) {
                    if (typeof fCon.whereConditions === 'object') {
                        fCon.whereConditions.reporter = userObjId;
                    }
                }
            }
        } else {
            filter.whereConditions = { reporter: userObjId };
        }

        if (filter.offset === null || filter.offset === undefined) {
            filter.offset = DEFAULT_SEARCH_CONFIG_VALUE.OFFSET;
        }

        if (filter.limit === null || filter.limit === undefined) {
            const limitCfg = await this.configService.getConfig(SEARCH_CONFIG_NAME.LIMIT_CONFIG);
            let limitValue = DEFAULT_SEARCH_CONFIG_VALUE.LIMIT;

            if (limitValue && limitCfg && limitCfg.value) {
                limitValue = +limitCfg.value;

                if (isNaN(limitValue)) {
                    limitValue = DEFAULT_SEARCH_CONFIG_VALUE.LIMIT;
                }
            }

            filter.limit = limitValue;
        }

        const resultStmt: any[] = [];

        if (filter.whereConditions !== null && filter.whereConditions !== undefined && typeof filter.whereConditions === 'object' && Object.keys(filter.whereConditions).length > 0) {
            resultStmt.push({ $match: filter.whereConditions });
        }

        if (filter.orderBy !== null && filter.orderBy !== undefined && typeof filter.orderBy === 'object' && Object.keys(filter.orderBy).length > 0) {
            resultStmt.push({ $sort: filter.orderBy });
        }

        if (filter.offset !== null && filter.offset !== undefined) {
            resultStmt.push({ $skip: filter.offset });
        }

        if (filter.limit !== null && filter.limit !== undefined) {
            resultStmt.push({ $limit: filter.limit });
        }

        resultStmt.push({ $addFields: { id: '$_id' } }, { $project: { _id: 0 } });

        if (filter.count) {
            resultStmt.push({ $count: 'count' });
        }

        const userReportList: any[] = await this.userReportService.aggregate(resultStmt);

        if (userReportList) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Search UserReport', filter.count ? (userReportList.length > 0 ? userReportList[0].count : 0) : userReportList));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Search UserReport', undefined));
        }
    }

    private async createUserReportInfo(typeObjId: ObjectID, type: string, topic: string, message: string, reporterObjId: ObjectID, reporterUsername: string): Promise<UserReport> {
        const userReport: UserReport = new UserReport();
        userReport.typeId = typeObjId;
        userReport.type = type;
        userReport.topic = topic;
        userReport.message = message;
        userReport.reporter = reporterObjId;
        userReport.createdBy = reporterObjId;
        userReport.createdByUsername = reporterUsername;

        return await this.userReportService.create(userReport);
    }
}