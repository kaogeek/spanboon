import { Response } from 'express';
import { Authorized, Body, JsonController, Post, Res } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { UserReportContentService } from '../../services/UserReportContentService';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { ObjectUtil } from '../../../utils/ObjectUtil';
import { DEFAULT_SEARCH_CONFIG_VALUE, SEARCH_CONFIG_NAME } from '../../../constants/SystemConfig';
import { ConfigService } from '../../services/ConfigService';

@JsonController('/admin/user/report')
export class AdminUserReportContentController {

    constructor(
        private userReportContentService: UserReportContentService,
        private configService: ConfigService
    ) { }

    @Post('/search')
    @Authorized()
    public async searchAdminUserReportContent(@Body({ validate: true }) filter: SearchFilter, @Res() res: Response): Promise<any> {
        if (filter === null || filter === undefined || ObjectUtil.isObjectEmpty(filter)) {
            filter = new SearchFilter();
        }

        if (filter.whereConditions === null || filter.whereConditions === undefined) {
            filter.whereConditions = {};
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

        const userReportList: any[] = await this.userReportContentService.aggregate(resultStmt);

        if (userReportList) {
            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Search UserReport', filter.count ? (userReportList.length > 0 ? userReportList[0].count : 0) : userReportList));
        } else {
            return res.status(200).send(ResponseUtil.getSuccessResponse('UserReportContent Not Found', undefined));
        }
    }
}