/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Post, Authorized, Body, Res, Req, Put, Param, Delete, Get } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { SearchFilter } from '../requests/SearchFilterRequest';
import { CreateConfigRequest } from './requests/CreateConfigRequest';
import { Config } from '../../models/Config';
import { ConfigService } from '../../services/ConfigService';
import { UpdateConfigRequest } from './requests/UpdateConfigRequest';
import { AdminUserActionLogs } from '../../models/AdminUserActionLogs';
import { CONFIG_LOG_ACTION, LOG_TYPE } from '../../../constants/LogsAction';
import { ObjectID } from 'mongodb';
import { AdminUserActionLogsService } from '../../services/AdminUserActionLogsService';

@JsonController('/admin/config')
export class AdminConfigController {
    constructor(private configService: ConfigService, private actionLogService: AdminUserActionLogsService) { }

    /**
     * @api {post} /api/admin/config/ Create Config API
     * @apiGroup Admin Config
     * @apiParam (Request body) {String} name name *
     * @apiParam (Request body) {String} value value
     * @apiParam (Request body) {String} type type as a value class type such as boolean, string, integer *
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "value" : "",
     *      "type" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New config is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/config/
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/')
    @Authorized()
    public async createConfig(@Body({ validate: true }) config: CreateConfigRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const currentConfig = await this.configService.findOne({ where: { name: config.name } });
        const configName = config.name;
        if(configName === 'kaokaiToday.time.emergencyEvent.date'){
            const dateFormat = new Date();
            const dateReal = dateFormat.setDate(dateFormat.getDate() + parseInt(config.value,10));
            const toDate = new Date(dateReal);

            const userId = new ObjectID(req.user.id);
            const configValueDate: Config = new Config();
            configValueDate.name = config.name;
            configValueDate.value = config.value;
            configValueDate.type = config.type;
            configValueDate.endDateTime = toDate;
            configValueDate.createdByUsername = req.user.username;
            configValueDate.createdBy = userId;
            const emergencyEventDate: Config = await this.configService.create(configValueDate);
            
            if (emergencyEventDate) {
                const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
                const adminLogs = new AdminUserActionLogs();
                adminLogs.userId = userId;
                adminLogs.action = CONFIG_LOG_ACTION.CREATE;
                adminLogs.contentType = LOG_TYPE.CONFIG;
                adminLogs.contentId = new ObjectID(emergencyEventDate.id);
                adminLogs.ip = ipAddress;
                adminLogs.data = emergencyEventDate;
                await this.actionLogService.create(adminLogs);
    
                const successResponse = ResponseUtil.getSuccessResponse('Successfully create config', emergencyEventDate);
                return res.status(200).send(successResponse);
            }
        }
        if (currentConfig) {
            const errorResponse = ResponseUtil.getErrorResponse('Duplicate Config name', currentConfig);
            return res.status(400).send(errorResponse);
        }

        const userObjId = new ObjectID(req.user.id);

        const configValue: Config = new Config();
        configValue.name = config.name;
        configValue.value = config.value;
        configValue.type = config.type;
        configValue.createdByUsername = req.user.username;
        configValue.createdBy = userObjId;

        const data: Config = await this.configService.create(configValue);

        if (data) {
            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.action = CONFIG_LOG_ACTION.CREATE;
            adminLogs.contentType = LOG_TYPE.CONFIG;
            adminLogs.contentId = new ObjectID(data.id);
            adminLogs.ip = ipAddress;
            adminLogs.data = data;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully create config', data);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable create config', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {put} /api/admin/config/:name Edit config API
     * @apiGroup Admin Config
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} name name *
     * @apiParam (Request body) {String} value value
     * @apiParam (Request body) {String} type type as a value class type such as boolean, string, integer *
     * @apiParamExample {json} Input
     * {
     *      "value" : "",
     *      "type" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully edit config.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/config/:name
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/:name')
    @Authorized()
    public async editConfig(@Body({ validate: true }) configReq: UpdateConfigRequest, @Param('name') cfgName: string, @Res() res: any, @Req() req: any): Promise<any> {
        const editConfig: Config = await this.configService.findOne({ where: { name: cfgName } });

        if (!editConfig) {
            const errorResponse = ResponseUtil.getErrorResponse('Invalid config name "' + cfgName + '"', cfgName);
            return res.status(400).send(errorResponse);
        }

        const userObjId = new ObjectID(req.user.id);

        const configSave = await this.configService.update({ name: cfgName }, { $set: { value: configReq.value, type: configReq.type, updateByUsername: req.user.username, modifiedBy: userObjId } });

        if (configSave) {
            const configEdited: Config = await this.configService.findOne({ where: { name: cfgName } });

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.action = CONFIG_LOG_ACTION.EDIT;
            adminLogs.contentType = LOG_TYPE.CONFIG;
            adminLogs.contentId = new ObjectID(configEdited.id);
            adminLogs.ip = ipAddress;
            adminLogs.data = configEdited;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully edit config', configEdited);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable edit config', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {delete} /api/admin/config/:name Delete config API
     * @apiGroup Admin Config
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted config.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/config/:name
     * @apiErrorExample {json} Config Delete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/:name')
    @Authorized()
    public async deleteConfig(@Param('name') cfgName: string, @Res() res: any, @Req() req: any): Promise<any> {
        const config = await this.configService.findOne({ where: { name: cfgName } });

        if (!config) {
            const errorResponse = ResponseUtil.getErrorResponse('invalid config name "' + cfgName + '"', cfgName);
            return res.status(400).send(errorResponse);
        }

        const deleteConfig = await this.configService.delete(config);

        if (deleteConfig) {
            const userObjId = new ObjectID(req.user.id);

            const ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(',')[0];
            const adminLogs = new AdminUserActionLogs();
            adminLogs.userId = userObjId;
            adminLogs.action = CONFIG_LOG_ACTION.DELETE;
            adminLogs.contentType = LOG_TYPE.CONFIG;
            adminLogs.contentId = new ObjectID(config.id);
            adminLogs.ip = ipAddress;
            adminLogs.data = config;
            await this.actionLogService.create(adminLogs);

            const successResponse = ResponseUtil.getSuccessResponse('Successfully delete config', []);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable to delete config', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {get} /api/admin/config/:name Get config API
     * @apiGroup Admin Config
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted config.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/admin/config/:name
     * @apiErrorExample {json} Config Delete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:name')
    @Authorized()
    public async getConfig(@Param('name') cfgName: string, @Res() res: any): Promise<any> {
        const config = await this.configService.findOne({ where: { name: cfgName } });

        if (config) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully finding config', config);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('invalid config name "' + cfgName + '"', cfgName);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * 
     * @api {post} /api/admin/config/search Search config API
     * @apiGroup Admin Config
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} limit limit
     * @apiParam (Request body) {number} offset offset
     * @apiParam (Request body) {String} select select
     * @apiParam (Request body) {String} relation relation
     * @apiParam (Request body) {String} whereConditions whereConditions
     * @apiParam (Request body) {boolean} count count (0=false, 1=true)
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get config search",
     *    "data":{
     *    "name" : "",
     *    "value": "",
     *    "type": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/admin/config/search
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    @Authorized()
    public async configSearch(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const configLists: any = await this.configService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (configLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search config', configLists);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Search config Failed', []);
            return res.status(400).send(errorResponse);
        }
    }
}
