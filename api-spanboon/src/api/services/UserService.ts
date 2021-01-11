/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class UserService {

    constructor(@OrmRepository() private userLoginRepository: UserRepository) { }

    // find user
    public find(findCondition?: any): Promise<User[]> {
        return this.userLoginRepository.find(findCondition);
    }

    // find user
    public distinct(key: any, query: any, options?: any): Promise<any> {
        return this.userLoginRepository.distinct(key, query, options);
    }

    // find user
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.userLoginRepository.aggregate(query, options).toArray();
    }

    // find user
    public findOne(findCondition: any): Promise<User> {
        return this.userLoginRepository.findOne(findCondition);
    }

    // create user
    public async create(user: User): Promise<User> {
        return await this.userLoginRepository.save(user);
    }

    // update user
    public update(query: any, newValue: any): Promise<any> {
        return this.userLoginRepository.updateOne(query, newValue);
    }

    // delete user
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userLoginRepository.deleteOne(query, options);
    }

    // Search Page
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.userLoginRepository.count();
        } else {
            return this.userLoginRepository.find(condition);
        }
    }

    public cleanUserField(user: any): any {
        if (user !== undefined && user !== null) {
            if (user !== undefined && user !== null) {
                const clearItem = {
                    id: user.id,
                    username: user.username,
                    uniqueId: user.uniqueId,
                    email: user.email,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    birthdate: user.birthdate,
                    gender: user.gender,
                    customGender: user.customGender,
                    imageURL: user.imageURL,
                    coverURL: user.coverURL,
                    coverPosition: user.coverPosition,
                    banned: user.banned,
                    isAdmin: user.isAdmin,
                    isSubAdmin: user.isSubAdmin
                };
                user = clearItem;
            }
        }
        return user;
    }

    public cleanAdminUserField(user: any): any {
        if (user !== undefined && user !== null) {
            if (user !== undefined && user !== null) {
                const clearItem = {
                    id: user._id,
                    username: user.username,
                    uniqueId: user.uniqueId,
                    email: user.email,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    birthdate: user.birthdate,
                    gender: user.gender,
                    customGender: user.customGender,
                    imageURL: user.imageURL,
                    coverURL: user.coverURL,
                    coverPosition: user.coverPosition,
                    banned: user.banned,
                    isAdmin: user.isAdmin,
                    isSubAdmin: user.isSubAdmin
                };
                user = clearItem;
            }
        }
        return user;
    }

    public cleanUsersField(users: any): any {
        const userList = [];
        for (let user of users) {
            if (user !== undefined && user !== null) {
                if (user !== undefined && user !== null) {
                    const clearItem = {
                        id: user._id,
                        username: user.username,
                        uniqueId: user.uniqueId,
                        email: user.email,
                        displayName: user.displayName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        gender: user.gender,
                        customGender: user.customGender,
                        birthdate: user.birthdate,
                        imageURL: user.imageURL,
                        coverURL: user.coverURL,
                        coverPosition: user.coverPosition
                    };
                    user = clearItem;
                }
            }
            userList.push(user);
        }

        return userList;
    }

    public cleanAdminField(users: any): any {
        const userList = [];
        for (let user of users) {
            if (user !== undefined && user !== null) {
                if (user !== undefined && user !== null) {
                    const clearItem = {
                        id: user._id,
                        username: user.username,
                        uniqueId: user.uniqueId,
                        email: user.email,
                        displayName: user.displayName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        birthdate: user.birthdate,
                        gender: user.gender,
                        customGender: user.customGender,
                        imageURL: user.imageURL,
                        coverURL: user.coverURL,
                        coverPosition: user.coverPosition,
                        banned: user.banned,
                        isAdmin: user.isAdmin,
                        isSubAdmin: user.isSubAdmin
                    };
                    user = clearItem;
                }
            }
            userList.push(user);
        }

        return userList;
    }

    public cleanTagUserField(userList: any): any {
        const userTagList = [];
        for (let user of userList) {
            if (user !== undefined && user !== null) {
                if (user !== undefined && user !== null) {
                    const clearItem = {
                        id: user.id,
                        displayName: user.displayName,
                        firstName: user.firstName,
                        lastName: user.lastName
                    };
                    user = clearItem;
                }
            }
            userTagList.push(user);
        }

        return userTagList;
    }
}
