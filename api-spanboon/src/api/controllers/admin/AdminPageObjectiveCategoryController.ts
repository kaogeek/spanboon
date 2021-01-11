/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Param, Post, Body, Authorized, Req, Put, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { PageObjectiveCategoryService } from '../../services/PageObjectiveCategoryService';
import { ObjectID } from 'mongodb';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { CreateObjectiveCategoryRequest } from './requests/CreateObjectiveCategoryRequest';
import { PageObjectiveCategory } from '../../models/PageObjectiveCategory';
import { UpdateObjectiveCategoryRequest } from './requests/UpdateObjectiveCategoryRequest';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { LOG_TYPE, PAGE_OBJECTIVE_CATEGORY_LOG_ACTION } from '../../../constants/LogsAction';

@JsonController('/admin/objective_category')
export class AdminPageObjectiveCategoryController {
    constructor(private objectiveCategoryService: PageObjectiveCategoryService, private actionLogService: AdminUserActionLogsService) { }

    // Search PageObjective Category
    /**
     * @api {post} /api/admin/objective_category/search Search PageObjective Category API
     * @apiGroup PageObjective Category API
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully Search PageObjective Category",
     *    "data":{
     *    "name" : "",
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/objective_category/search
     * @apiErrorExample {json} PageObjective Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async searchObjectiveCategory(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const objectiveCatLists: any = await this.objectiveCategoryService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (objectiveCatLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search PageObjective Category', objectiveCatLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot search PageObjective Category', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/admin/objective_category Create PageObjectiveCategory API
     * @apiGroup PageObjectiveCategory
     * @apiParam (Request body) {String} name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "description": ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create PageObjectiveCategory",
     *      "data": "{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/objective_category
     * @apiErrorExample {json} Unable create PageObjectiveCategory
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createObjectiveCategory(@Body({ validate: true }) objectiveCat: CreateObjectiveCategoryRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const data = await this.objectiveCategoryService.findOne({ where: { name: objectiveCat.name } });

        if (data) {
            const errorResponse = ResponseUtil.getErrorResponse('PageObjectiveCategory is Exists', data);
            return res.status(400).send(errorResponse);
        }

        const objectiveCats: PageObjectiveCategory = new PageObjectiveCategory();
        objectiveCats.name = objectiveCat.name;
        objectiveCats.description = objectiveCat.description;
        objectiveCats.active = true;

        const result = await this.objectiveCategoryService.create(objectiveCats);

        if (result) {
            const userObjId = new ObjectID(req.user.id);
            const pageObjectiveCatId = new ObjectID(result.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = pageObjectiveCatId;
            adminLogs.action = PAGE_OBJECTIVE_CATEGORY_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.PAGE_OBJECTIVE_CATEGORY;
            adminLogs.ip = ipAddress;
            adminLogs.data = result;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create PageObjectiveCategory', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create PageObjectiveCategory', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    // Update PageObjectiveCategory API
    /**
     * @api {put} /api/admin/objective_category/:id Update PageObjectiveCategory API
     * @apiGroup PageObjectiveCategory
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} title name name
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated PageObjectiveCategory.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/objective_category/:id
     * @apiErrorExample {json} Update PageObjectiveCategory error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:id')
    @Authorized()
    public async updateObjectiveCategory(@Body({ validate: true }) objectiveCat: UpdateObjectiveCategoryRequest, @Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        try {
            const objId = new ObjectID(id);
            const objectiveCatUpdate: PageObjectiveCategory = await this.objectiveCategoryService.findOne({ where: { _id: objId } });

            if (!objectiveCatUpdate) {
                return res.status(400).send(ResponseUtil.getSuccessResponse('Invalid PageObjectiveCategory Id', undefined));
            }

            if (objectiveCat.name === null || objectiveCat.name === undefined) {
                objectiveCat.name = objectiveCatUpdate.name;
            }

            if (objectiveCat.description === null || objectiveCat.description === undefined) {
                objectiveCat.description = objectiveCatUpdate.description;
            }

            const updateQuery = { _id: objId };
            const newValue = { $set: { name: objectiveCat.name, description: objectiveCat.description } };
            const objectiveCatSave = await this.objectiveCategoryService.update(updateQuery, newValue);

            if (objectiveCatSave) {
                const objectiveCatUpdated: PageObjectiveCategory = await this.objectiveCategoryService.findOne({ where: { _id: objId } });
                const userObjId = new ObjectID(req.user.id);

                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userObjId;
                adminLogs.contentId = objId;
                adminLogs.action = PAGE_OBJECTIVE_CATEGORY_LOG_ACTION.EDIT;
                adminLogs.contentType = LOG_TYPE.PAGE_OBJECTIVE_CATEGORY;
                adminLogs.ip = ipAddress;
                adminLogs.data = objectiveCatUpdated;
                await this.actionLogService.create(adminLogs);

                return res.status(200).send(ResponseUtil.getSuccessResponse('Update PageObjectiveCategory Successful', objectiveCatUpdated));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Update PageObjectiveCategory', undefined));
            }
        } catch (error) {
            return res.status(400).send(error);
        }
    }

    /**
     * @api {delete} /api/admin/objective_category/:id Delete PageObjectiveCategory API
     * @apiGroup PageObjectiveCategory
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Delete PageObjectiveCategory.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/objective_category/:id
     * @apiErrorExample {json} Delete PageObjectiveCategory Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:id')
    @Authorized()
    public async deleteObjectiveCategory(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const objId = new ObjectID(id);
        const objectiveCats = await this.objectiveCategoryService.findOne({ where: { _id: objId, active: true } });

        if (!objectiveCats) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid PageObjectiveCategory Id', undefined));
        }

        const deleteObjectiveCat = await this.objectiveCategoryService.update({ _id: objId }, { $set: { active: false } });

        if (deleteObjectiveCat) {
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.contentId = objId;
            adminLogs.action = PAGE_OBJECTIVE_CATEGORY_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.PAGE_OBJECTIVE_CATEGORY;
            adminLogs.ip = ipAddress;
            adminLogs.data = objectiveCats;
            await this.actionLogService.create(adminLogs);

            return res.status(200).send(ResponseUtil.getSuccessResponse('Successfully delete PageObjectiveCategory', []));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Unable to delete PageObjectiveCategory', undefined));
        }
    }
} 
