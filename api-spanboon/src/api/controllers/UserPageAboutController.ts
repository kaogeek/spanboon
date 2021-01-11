/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { Authorized, Body, Delete, JsonController, Param, Post, Put, Req, Res } from 'routing-controllers';
import { PageAboutService } from '../services/PageAboutService';
import { ResponseUtil } from '../../utils/Utils';
import { BulkCreateResquest } from './requests/BulkCreateResquest';
import { ObjectID } from 'mongodb';
import { PageAbout } from '../models/PageAbout';
import { PageAccessLevelService } from '../services/PageAccessLevelService';
import { PAGE_ACCESS_LEVEL } from '../../constants/PageAccessLevel';
import { PageService } from '../services/PageService';
import { BulkUpdateResquest } from './requests/BulkUpdateRequest';
import { BulkDeleteResquest } from './requests/BulkDeleteRequest';
import { PageAboutUpdateRequest } from './requests/PageAboutUpdateRequest';

@JsonController('/page')
export class UserPageAboutController {
    constructor(
        private pageService: PageService,
        private pageAboutService: PageAboutService,
        private pageAccessLevelService: PageAccessLevelService
    ) { }

    @Post('/:id/about')
    @Authorized('user')
    public async bulkCreate(@Param('id') id: string, @Body({ validate: true }) pageAbout: BulkCreateResquest[], @Res() res: any, @Req() req: any): Promise<any> {
        const pageId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);
        const checkPageAccessResult = await this.checkPageAccess(pageId, userId);

        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (id !== null && id !== undefined && id !== '') {
                const pageFind = await this.pageService.find({ where: pageId });
                if (!pageFind) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page note found', undefined));
                }
                const bulkCreateArray = [];
                // const orderingList = [];
                // const duplicateOrderingList = [];
                for (const pageAboutValue of pageAbout) {
                    const pageLabel = pageAboutValue.label;
                    const pageValue = pageAboutValue.value;
                    const pageOrdering = pageAboutValue.ordering;
                    const checkPageAbout = await this.checkPageAbout(pageLabel, pageValue, pageOrdering);
                    if (checkPageAbout.status === 0) {
                        return res.status(400).send(checkPageAbout);
                    } else {
                        // if (orderingList.includes(pageOrdering)) {           
                        //     duplicateOrderingList.push(pageOrdering);
                        // } else {
                        //     orderingList.push(pageOrdering);
                        // }
                        // if (duplicateOrderingList.length > 0) {
                        //     return res.status(400).send(ResponseUtil.getErrorResponse('Duplicate ordering', undefined));
                        // }
                        // if (pageValue.match(/^[\w]*[\w\s]*[\w]+$/g) && pageLabel.match(/^[\w]*[\w\s]*[\w]+$/g)) {
                        const pageAboutCreate = new PageAbout();
                        pageAboutCreate.label = pageLabel;
                        pageAboutCreate.value = pageValue;
                        pageAboutCreate.pageId = pageId;
                        pageAboutCreate.ordering = pageOrdering;
                        const createResult = await this.pageAboutService.create(pageAboutCreate);
                        bulkCreateArray.push(createResult);
                        // }
                        // else {
                        //     return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pattern', undefined));
                        // } 
                    }
                }
                return res.status(200).send(ResponseUtil.getSuccessResponse('bulkCreate Sussesfully', bulkCreateArray));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pageId', undefined));
            }
        }
    }

    @Put('/:id/about')
    @Authorized('user')
    public async bulkUpdate(@Param('id') id: string, @Body({ validate: true }) pageAbout: BulkUpdateResquest[], @Res() res: any, @Req() req: any): Promise<any> {
        const pageId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);
        const checkPageAccessResult = await this.checkPageAccess(pageId, userId);

        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (id !== null && id !== undefined && id !== '') {

                const pageFind = await this.pageService.find({ where: pageId });
                if (!pageFind) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page note found', undefined));
                }
                const bulkUpdateArray = [];

                for (const pageAboutValue of pageAbout) {
                    const pageLabel = pageAboutValue.label;
                    const pageValue = pageAboutValue.value;
                    const pageOrdering = pageAboutValue.ordering;
                    const pageAboutId = new ObjectID(pageAboutValue.id);
                    const checkPageAbout = await this.checkPageAbout(pageLabel, pageValue, pageOrdering);

                    if (checkPageAbout.status === 0) {
                        return res.status(400).send(checkPageAbout);
                    } else {
                        const pageAboutFindQuery = { where: { _id: pageAboutId, pageId } };
                        const pageAboutFindOne = await this.pageAboutService.findOne(pageAboutFindQuery);
                        if (!pageAboutFindOne) {
                            continue;
                        } else {
                            const pageAboutUpdateQuery = { _id: pageAboutId, pageId };
                            const pageAboutUpdate = { $set: { label: pageLabel, value: pageValue, ordering: pageOrdering } };
                            const pageAboutUpdateReusult = await this.pageAboutService.update(pageAboutUpdateQuery, pageAboutUpdate);
                            if (pageAboutUpdateReusult) {
                                bulkUpdateArray.push(pageAboutValue);
                            } else {
                                return res.status(400).send(ResponseUtil.getErrorResponse(`Can not update id : ${pageAboutId}`, undefined));
                            }
                        }
                    }
                }
                return res.status(200).send(ResponseUtil.getSuccessResponse('bulkUpdate Sussesfully', bulkUpdateArray));

            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pageId', undefined));
            }
        }
    }

    @Delete('/:id/about')
    @Authorized('user')
    public async bulkDelete(@Param('id') id: string, @Body({ validate: true }) pageAbout: BulkDeleteResquest[], @Res() res: any, @Req() req: any): Promise<any> {
        const pageId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);
        const checkPageAccessResult = await this.checkPageAccess(pageId, userId);

        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (id !== null && id !== undefined && id !== '') {

                const pageFind = await this.pageService.find({ where: pageId });
                if (!pageFind) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page note found', undefined));
                }

                const bulkDelteArray = [];
                for (const pageAboutValue of pageAbout) {

                    const pageAboutId = new ObjectID(pageAboutValue.id);
                    const pageAboutFindQuery = { where: { _id: pageAboutId, pageId } };
                    const pageAboutFindOne = await this.pageAboutService.findOne(pageAboutFindQuery);

                    if (!pageAboutFindOne) {
                        continue;
                    } else {
                        const pageAboutDeleteQuery = { _id: pageAboutId };
                        const pageAboutDeleteResult = await this.pageAboutService.delete(pageAboutDeleteQuery);
                        if (pageAboutDeleteResult) {
                            bulkDelteArray.push(pageAboutFindOne);
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse(`Can not delete id : ${pageAboutId}`, undefined));
                        }
                    }
                }
                return res.status(200).send(ResponseUtil.getSuccessResponse('bulkDelete Sussesfully', bulkDelteArray));

            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pageId', undefined));
            }
        }
    }
    @Put('/:pageid/about/:id')
    @Authorized('user')
    public async pageaboutUpdate(@Param('pageid') id: string, @Param('id') pageAboutIdParam: string, @Body({ validate: true }) pageAbout: PageAboutUpdateRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const pageId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);

        const checkPageAccessResult = await this.checkPageAccess(pageId, userId);
        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (id !== null && id !== undefined && id !== '') {
                const pageFind = await this.pageService.find({ where: pageId });
                if (!pageFind) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page not found', undefined));
                }

                const pageLabel = pageAbout.label;
                const pageValue = pageAbout.value;
                const pageOrdering = pageAbout.ordering;
                const pageAboutId = new ObjectID(pageAboutIdParam);
                const checkPageAbout = await this.checkPageAbout(pageLabel, pageValue, pageOrdering);

                if (checkPageAbout.status === 0) {
                    return res.status(400).send(checkPageAbout);
                } else {
                    const pageAboutFindQuery = { where: { _id: pageAboutId, pageId } };
                    const pageAboutFindOne = await this.pageAboutService.findOne(pageAboutFindQuery);

                    if (!pageAboutFindOne) {
                        return res.status(400).send(ResponseUtil.getErrorResponse('Can not found PageAboutId', undefined));
                    } else {
                        const pageAboutUpdateQuery = { _id: pageAboutId, pageId };
                        const pageAboutUpdate = { $set: { label: pageLabel, value: pageValue, ordering: pageOrdering } };
                        const pageAboutUpdateResult = await this.pageAboutService.update(pageAboutUpdateQuery, pageAboutUpdate);

                        if (pageAboutUpdateResult) {
                            const pageAboutResponse = { _id: pageAboutId, label: pageLabel, value: pageValue, pageId, ordering: pageOrdering };
                            return res.status(200).send(ResponseUtil.getSuccessResponse('Update PageAbout Sussesfully', pageAboutResponse));
                        } else {
                            return res.status(400).send(ResponseUtil.getErrorResponse(`Can not update id : ${pageAboutId}`, undefined));
                        }
                    }
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pageId', undefined));
            }
        }
    }

    @Delete('/:pageid/about/:id')
    @Authorized('user')
    public async pageAboutUpdate(@Param('pageid') id: string, @Param('id') pageAboutIdParam: string, @Res() res: any, @Req() req: any): Promise<any> {
        const pageId = new ObjectID(id);
        const userId = new ObjectID(req.user.id);

        const checkPageAccessResult = await this.checkPageAccess(pageId, userId);
        if (checkPageAccessResult.status === 0) {
            return res.status(400).send(checkPageAccessResult);
        } else {
            if (id !== null && id !== undefined && id !== '') {
                const pageFind = await this.pageService.find({ where: pageId });
                if (!pageFind) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Page note found', undefined));
                }

                const pageAboutId = new ObjectID(pageAboutIdParam);
                const pageAboutFindQuery = { where: { _id: pageAboutId, pageId } };
                const pageAboutFindOne = await this.pageAboutService.findOne(pageAboutFindQuery);

                if (!pageAboutFindOne) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Can not found PageAboutId', undefined));
                } else {
                    const pageAboutDeleteQuery = { _id: pageAboutId, pageId };
                    const pageAboutDeleteResult = await this.pageAboutService.delete(pageAboutDeleteQuery);

                    if (pageAboutDeleteResult) {
                        return res.status(200).send(ResponseUtil.getSuccessResponse('Delete PageAbout Sussesfully', pageAboutFindOne));
                    } else {
                        return res.status(400).send(ResponseUtil.getErrorResponse(`Can not delete id : ${pageAboutId}`, undefined));
                    }
                }

            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Invalid pageId', undefined));
            }
        }
    }

    private async checkPageAccess(pageId: ObjectID, userId: ObjectID): Promise<any> {
        const pageAccessLevelCheckQuery = { where: { page: pageId, user: userId } };
        const pageAccessLevelResult = await this.pageAccessLevelService.find(pageAccessLevelCheckQuery);

        if (pageAccessLevelResult.length > 0) {
            for (const pageAccess of pageAccessLevelResult) {
                if (pageAccess.level !== PAGE_ACCESS_LEVEL.ADMIN && pageAccess.level !== PAGE_ACCESS_LEVEL.OWNER) {
                    return ResponseUtil.getErrorResponse('Can not access', undefined);
                } else {
                    return ResponseUtil.getSuccessResponse('Can access', pageAccess);
                }
            }
        } else {
            return ResponseUtil.getErrorResponse('Can not access this page', undefined);
        }
    }

    private async checkPageAbout(pageLabel: string, pageValue: string, pageOrdering: number): Promise<any> {
        if (typeof pageLabel !== 'string' || typeof pageValue !== 'string' || typeof pageOrdering !== 'number') {
            return ResponseUtil.getErrorResponse('Invalid datatype', undefined);
        }

        if (pageLabel === null || pageLabel === undefined || pageLabel === '') {
            return ResponseUtil.getErrorResponse('Invalid label', undefined);
        }

        if (pageValue === null || pageValue === undefined || pageValue === '') {
            return ResponseUtil.getErrorResponse('Invalid value', undefined);
        }

        if (pageOrdering === null || pageOrdering === undefined) {
            return ResponseUtil.getErrorResponse('Invalid ordering', undefined);
        }
        return ResponseUtil.getSuccessResponse('SuccessResponse', true);
    }
}
