import 'reflect-metadata';
import { Request, Response } from 'express';
import { Authorized, Body, JsonController, Post, Req, Res } from 'routing-controllers';
import { UserBlockContentService } from '../services/UserBlockContentService';
import { UserBlockContentRequest } from './requests/UserBlockContentRequest';
import { ObjectID } from 'mongodb';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { UserBlockContent } from '../models/UserBlockContent';
import { CONTENT_TYPE } from '../../constants/ContentAction';
import { SearchFilter } from './requests/SearchFilterRequest';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { DEFAULT_SEARCH_CONFIG_VALUE, SEARCH_CONFIG_NAME } from '../../constants/SystemConfig';
import { ConfigService } from '../services/ConfigService';

@JsonController('/user/content')
export class UserBlockContentController {

    constructor(
        private userBlockContentService: UserBlockContentService,
        private configService: ConfigService
    ) { }

    @Post('/block')
    @Authorized('user')
    public async createUserBlockContent(@Body({ required: true }) body: UserBlockContentRequest, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const subjectId: string = body.subjectId;
            const subjectType: string = body.subjectType;
            const userId: string = req.user['id'];
            const username: string = req.user['username'];

            const subjectObjId: ObjectID = new ObjectID(subjectId);
            const userObjId: ObjectID = new ObjectID(userId);

            const originalContent: any = await this.userBlockContentService.findOriginalContent(subjectObjId, subjectType);

            if (originalContent !== null && originalContent !== undefined) {
                const findContentStmt: any = { userId: userObjId, subjectId: subjectObjId };

                if (CONTENT_TYPE.USER === subjectType) {
                    findContentStmt['subjectType'] = CONTENT_TYPE.USER;
                } else if (CONTENT_TYPE.PAGE === subjectType) {
                    findContentStmt['subjectType'] = CONTENT_TYPE.PAGE;
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Support This Report Type', subjectType));
                }

                const userAlreadyBlockedContent: UserBlockContent = await this.userBlockContentService.findCurrentUserBlockContent(userObjId, subjectObjId, subjectType);

                if (userAlreadyBlockedContent !== null && userAlreadyBlockedContent !== undefined) {
                    return res.status(200).send(ResponseUtil.getSuccessResponse('You already Block this content', userAlreadyBlockedContent));
                } else {
                    const userBlockContent: UserBlockContent = new UserBlockContent();
                    userBlockContent.subjectType = subjectType;
                    userBlockContent.subjectId = subjectObjId;
                    userBlockContent.userId = userObjId;
                    userBlockContent.createdBy = userObjId;
                    userBlockContent.createdByUsername = username;

                    const blockContent: UserBlockContent = await this.userBlockContentService.create(userBlockContent);

                    if (blockContent !== null && blockContent !== undefined) {
                        return res.status(200).send(ResponseUtil.getSuccessResponse('Block Content Success', blockContent));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Block Content Failed', undefined));
                    }
                }
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Content Not Found', undefined));
            }
        } catch (error: any) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Block Content Error', error));
        }
    }

    @Post('/unblock')
    @Authorized('user')
    public async removeUserBlockContent(@Body({ required: true }) body: UserBlockContentRequest, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            const subjectId: string = body.subjectId;
            const subjectType: string = body.subjectType;
            const userId: string = req.user['id'];

            const subjectObjId: ObjectID = new ObjectID(subjectId);
            const userObjId: ObjectID = new ObjectID(userId);

            const originalContent: any = await this.userBlockContentService.findOriginalContent(subjectObjId, subjectType);

            if (originalContent !== null && originalContent !== undefined) {
                const findContentStmt: any = { userId: userObjId, subjectId: subjectObjId };

                if (CONTENT_TYPE.USER === subjectType) {
                    findContentStmt['subjectType'] = CONTENT_TYPE.USER;
                } else if (CONTENT_TYPE.PAGE === subjectType) {
                    findContentStmt['subjectType'] = CONTENT_TYPE.PAGE;
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Support This Report Type', subjectType));
                }

                const userAlreadyBlockedContent: UserBlockContent = await this.userBlockContentService.findCurrentUserBlockContent(userObjId, subjectObjId, subjectType);

                if (userAlreadyBlockedContent !== null && userAlreadyBlockedContent !== undefined) {
                    const unblocked = await this.userBlockContentService.delete(findContentStmt);

                    if (unblocked !== null && unblocked !== undefined) {
                        return res.status(200).send(ResponseUtil.getSuccessResponse('Unblock Success', true));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Unblock Failed', undefined));
                    }
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('You already Unblock this content', undefined));
                }
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Content Not Found', undefined));
            }
        } catch (error: any) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Block Content Error', error));
        }
    }

    @Post('/search')
    @Authorized('user')
    public async searchUserBlockContent(@Body({ required: true }) filter: SearchFilter, @Req() req: Request, @Res() res: Response): Promise<any> {
        try {
            if (filter === null || filter === undefined || ObjectUtil.isObjectEmpty(filter)) {
                filter = new SearchFilter();
            }

            const userId: string = req.user['id'];
            const userObjId: ObjectID = new ObjectID(userId);

            if (filter.whereConditions !== null && filter.whereConditions !== undefined) {
                if (typeof filter.whereConditions === 'object') {
                    filter.whereConditions.userId = userObjId;
                } else if (Array.isArray(filter.whereConditions)) {
                    for (const fCon of filter.whereConditions) {
                        if (typeof fCon.whereConditions === 'object') {
                            fCon.whereConditions.userId = userObjId;
                        }
                    }
                }
            } else {
                filter.whereConditions = { userId: userObjId };
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

            console.log('resultStmt >>>>> ', JSON.stringify(resultStmt));

            const userBlockContentList: any[] = await this.userBlockContentService.aggregate(resultStmt);

            if (userBlockContentList !== null && userBlockContentList !== undefined && userBlockContentList.length > 0) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully Search User Block Content', filter.count ? (userBlockContentList.length > 0 ? userBlockContentList[0].count : 0) : userBlockContentList));
            } else {
                return res.status(200).send(ResponseUtil.getSuccessResponse('User Block Content Not Found', []));
            }
        } catch (error: any) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Search User Block Content Error', error));
        }
    }
}