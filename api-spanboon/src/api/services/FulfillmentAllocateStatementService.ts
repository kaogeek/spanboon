/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FulfillmentAllocateStatement } from '../models/FulfillmentAllocateStatement';
import { FulfillmentAllocateStatementRepository } from '../repositories/FulfillmentAllocateStatementRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { Needs } from '../models/Needs';
import { NeedsService } from '../services/NeedsService';
import { FulfillmentRequestService } from '../services/FulfillmentRequestService';
import { ObjectID } from 'typeorm';

@Service()
export class FulfillmentAllocateStatementService {

    constructor(@OrmRepository() private fulfillmentAllocateStmtRepository: FulfillmentAllocateStatementRepository,
        private needsService: NeedsService, private fulfillmentRequestService: FulfillmentRequestService) { }

    // find FulfillmentAllocateStatement
    public find(findCondition?: any): Promise<FulfillmentAllocateStatement[]> {
        return this.fulfillmentAllocateStmtRepository.find(findCondition);
    }

    // find FulfillmentAllocateStatement
    public findOne(findCondition: any): Promise<FulfillmentAllocateStatement> {
        return this.fulfillmentAllocateStmtRepository.findOne(findCondition);
    }

    // aggregate FulfillmentAllocateStatement
    public aggregate(findCondition: any, options?: any): Promise<FulfillmentAllocateStatement[]> {
        return this.fulfillmentAllocateStmtRepository.aggregate(findCondition, options).toArray();
    }

    // create FulfillmentAllocateStatement
    public async create(objective: FulfillmentAllocateStatement): Promise<FulfillmentAllocateStatement> {
        return await this.fulfillmentAllocateStmtRepository.save(objective);
    }

    // update FulfillmentAllocateStatement
    public async update(query: any, newValue: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.updateOne(query, newValue, options);
    }

    // update FulfillmentAllocateStatement
    public async updateMany(query: any, newValue: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.updateMany(query, newValue, options);
    }

    // delete FulfillmentAllocateStatement
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.deleteOne(query, options);
    }

    // delete FulfillmentAllocateStatement
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.deleteMany(query, options);
    }

    // Search FulfillmentAllocateStatement
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.fulfillmentAllocateStmtRepository.count();
        } else {
            return this.fulfillmentAllocateStmtRepository.find(condition);
        }
    }

    public async createFulfillmentAllocateStatement(statement: FulfillmentAllocateStatement): Promise<FulfillmentAllocateStatement> {
        // create allocate and +/- need
        if (statement === undefined || statement === null) {
            return Promise.reject('Statement was required.');
        }

        if (statement.needsId === undefined || statement.needsId === null || statement.needsId === '') {
            return Promise.reject('Statement needsId was required.');
        }

        if (statement.fulfillmentRequest === undefined || statement.fulfillmentRequest === null || statement.fulfillmentRequest === '') {
            return Promise.reject('fulfillmentRequest was required.');
        }

        if (statement.amount === undefined || statement.amount === null || statement.amount === 0) {
            return Promise.reject('amount must not be 0.');
        }

        // find need
        const need: Needs = await this.needsService.findOne({ _id: statement.needsId });
        if (need === undefined) {
            return Promise.reject('Need was not found.');
        }
        statement.postId = need.post;
        statement.deleted = false;

        // find fulfillmentRequest
        const ffReq = await this.fulfillmentRequestService.findOne({ _id: statement.fulfillmentRequest });
        if (ffReq === undefined) {
            return Promise.reject('FulfillmentRequest was not found.');
        }

        const createdStmt = await this.create(statement);

        // edit need
        const qty = (need.fulfillQuantity !== undefined && need.fulfillQuantity !== null && !isNaN(need.fulfillQuantity)) ? need.fulfillQuantity : 0;
        const newFulfillQty = qty + statement.amount;
        const newFullfilled = (newFulfillQty >= qty) ? true : false;

        await this.needsService.update({ _id: need.id }, {
            $set: {
                fulfillQuantity: newFulfillQty,
                fullfilled: newFullfilled
            }
        });

        return Promise.resolve(createdStmt);
    }

    public async deleteFulfillmentAllocateStatement(statementId: ObjectID): Promise<boolean> {
        // create allocate and +/- need
        if (statementId === undefined || statementId === null) {
            return Promise.reject('Statement was required.');
        }

        // find statement
        const stmt: FulfillmentAllocateStatement = await this.findOne({ _id: statementId });
        if (stmt === undefined) {
            return Promise.reject('Statement was not found.');
        }

        if (stmt.deleted) {
            return Promise.reject('Statement was deleted.');
        }

        // find need
        const need: Needs = await this.needsService.findOne({ _id: stmt.needsId });
        if (need === undefined) {
            return Promise.reject('Need was not found.');
        }

        // create minus stmt
        const ffStmt = new FulfillmentAllocateStatement();
        ffStmt.amount = -stmt.amount;
        ffStmt.needsId = stmt.needsId;
        ffStmt.fulfillmentRequest = stmt.fulfillmentRequest;
        ffStmt.postId = stmt.postId;
        ffStmt.deleted = false;
        await this.create(ffStmt);

        // edit need
        const qty = (need.fulfillQuantity !== undefined && need.fulfillQuantity !== null && !isNaN(need.fulfillQuantity)) ? need.fulfillQuantity : 0;
        const newFulfillQty = qty + ffStmt.amount;
        const newFullfilled = (newFulfillQty >= qty) ? true : false;

        await this.needsService.update({ _id: need.id }, {
            $set: {
                fulfillQuantity: newFulfillQty,
                fullfilled: newFullfilled
            }
        });

        return Promise.resolve(true);
    }
}
