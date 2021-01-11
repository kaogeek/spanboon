/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Get, Param, Res, Post, Body } from 'routing-controllers';
import { ConfigService } from '../services/ConfigService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { SearchFilter } from './requests/SearchFilterRequest';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { Config } from '../models/Config';

@JsonController('/config')
export class ConfigController {
    constructor(private configService: ConfigService) { }
    /**
     * @api {get} /api/config/:name  Pageuser Find Config API
     * @apiGroup Config
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     *      {
     *      "message": "Successfully get Config Details",
     *      "data":{
     *      "name" : "",
     *      "link" : "",
     *      "logo_url" : ""
     *      }
     *      "status": "1"
     *      }
     * @apiSampleRequest /api/config/:name
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/:name')
    public async configDetails(@Param('name') cfgName: string, @Res() res: any): Promise<any> {
        console.log('cfgName >>>> ', cfgName);
        const config: Config = await this.configService.findOne({ where: { name: cfgName } });

        if (config) {
            const showFields = ['name', 'value', 'type'];
            const parseConfig = ObjectUtil.createNewObjectWithField(config, showFields);
            const successResponse = ResponseUtil.getSuccessResponse('Successfully got config', parseConfig);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Unable got config', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    /**
     * @api {post} /api/config/search Search Config API
     * @apiGroup Config
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
     *    "description": "",
     *     }
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/config/search
     * @apiErrorExample {json} config error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/search')
    public async configSearch(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
        const configLists: any = await this.configService.search(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy, filter.count);

        if (!configLists) {
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search config', []);
            return res.status(200).send(successResponse);
        } else {
            const showFields = ['name', 'value', 'type'];
            const result = [];
            for (const item of configLists) {
                const parseConfig = ObjectUtil.createNewObjectWithField(item, showFields);
                result.push(parseConfig);
            }
            const successResponse = ResponseUtil.getSuccessResponse('Successfully search config', result);
            return res.status(200).send(successResponse);
        }

    }
}
