/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserBlockContent } from '../models/UserBlockContent';
import { UserBlockContentRepository } from '../repositories/UserBlockContentRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { UserService } from './UserService';
import { PageService } from './PageService';
import { CONTENT_TYPE } from '../../constants/ContentAction';
import { User } from '../models/User';
import { Page } from '../models/Page';
import { ObjectID } from 'mongodb';

@Service()
export class UserBlockContentService {

    constructor(
        @OrmRepository() private contentBlockRepository: UserBlockContentRepository,
        private userService: UserService,
        private pageService: PageService
    ) { }

    // find UserBlockContent
    public async find(findCondition: any): Promise<UserBlockContent[]> {
        return this.contentBlockRepository.find(findCondition);
    }

    // find UserBlockContent
    public async findOne(findCondition: any): Promise<UserBlockContent> {
        return await this.contentBlockRepository.findOne(findCondition);
    }

    // create UserBlockContent
    public async create(contentBlock: UserBlockContent): Promise<UserBlockContent> {
        return await this.contentBlockRepository.save(contentBlock);
    }

    // update UserBlockContent
    public async update(query: any, newValue: any): Promise<any> {
        return await this.contentBlockRepository.updateOne(query, newValue);
    }

    // delete UserBlockContent
    public async delete(query: any, options?: any): Promise<any> {
        return await this.contentBlockRepository.deleteOne(query, options);
    }

    // aggregate UserBlockContent
    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.contentBlockRepository.aggregate(query, options).toArray();
    }

    // Search UserBlockContent
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.contentBlockRepository.count(whereConditions);
        } else {
            return this.contentBlockRepository.find(condition);
        }
    }

    public findOriginalContent(subjectId: ObjectID, subjectType: string): Promise<any> {
        return new Promise(async (resolve) => {
            if ((subjectId === null || subjectId === undefined || subjectId === '') || (subjectType === null || subjectType === undefined || subjectType === '')) {
                resolve(undefined);
            }

            let user: User = undefined;
            let page: Page = undefined;
            let contentFound = false;

            if (CONTENT_TYPE.USER === subjectType) {
                user = await this.userService.findOne({ _id: subjectId });

                if (user !== null && user !== undefined) {
                    contentFound = true;
                    resolve(user);
                }
            } else if (CONTENT_TYPE.PAGE === subjectType) {
                page = await this.pageService.findOne({ _id: ObjectID(subjectId) });

                if (page !== null && page !== undefined) {
                    contentFound = true;
                    resolve(page);
                }
            } else {
                resolve(undefined);
            }

            if (!contentFound) {
                resolve(undefined);
            }
        });
    }

    public findCurrentUserBlockContent(userId: ObjectID, subjectId: ObjectID, subjectType: string): Promise<UserBlockContent> {
        return new Promise(async (resolve) => {
            if ((subjectId === null || subjectId === undefined || subjectId === '') || (subjectType === null || subjectType === undefined || subjectType === '')) {
                resolve(undefined);
            }

            const originalContent: any = await this.findOriginalContent(subjectId, subjectType);

            if (originalContent !== null && originalContent !== undefined) {
                const userBlockContent: UserBlockContent = await this.findOne({ userId, subjectId });

                if (userBlockContent !== null && userBlockContent !== undefined) {
                    resolve(userBlockContent);
                } else {
                    resolve(undefined);
                }
            } else {
                resolve(undefined);
            }
        });
    }
}
