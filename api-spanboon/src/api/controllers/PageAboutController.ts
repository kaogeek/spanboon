/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { Body, JsonController, Post, Res } from 'routing-controllers';
import { ObjectID } from 'mongodb';
import { ResponseUtil } from '../../utils/Utils';
import { PageAboutService } from '../services/PageAboutService';
import { SearchFilter } from './requests/SearchFilterRequest';

@JsonController('/page_about')
export class PageAboutController {
  constructor(private pageAboutService: PageAboutService) { }

  @Post('/search')
  public async search(@Body({ validate: true }) filter: SearchFilter, @Res() res: any): Promise<any> {
    const pageId = new ObjectID(filter.whereConditions.pageId);
    filter.whereConditions = { pageId };
    const searchPageAboutList: any = await this.pageAboutService.search(filter);
    if (searchPageAboutList) {
      const successResponse = ResponseUtil.getSuccessResponse('Successfully Search Page About', searchPageAboutList);
      return res.status(200).send(successResponse);
    } else {
      const errorResponse = ResponseUtil.getErrorResponse('Cannot Search Page About', undefined);
      return res.status(400).send(errorResponse);
    }
  }
}
