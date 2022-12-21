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
import { PageRepository } from '../repositories/PageRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { S3Service } from '../services/S3Service';
import { CreateUserRequest } from '../controllers/requests/CreateUserRequest';
@Service()
export class UserService {

    constructor(
        @OrmRepository() private userLoginRepository: UserRepository,
        @OrmRepository() private pageRepository: PageRepository,
        private s3Service: S3Service) { }

    // find user
    public find(findCondition?: any): Promise<any> {
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
    public findOne(findCondition: any, options?: any): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.userLoginRepository.findOne(findCondition);
                if (result && result.s3ImageURL && result.s3ImageURL !== '' && options && options.signURL) {
                    try {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(result.s3ImageURL);
                        Object.assign(result, { signURL: (signUrl ? signUrl : '') });
                    } catch (error) {
                        console.log('User Find one Error: ', error);
                    }
                }
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
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

    public isContainsUniqueId(uniqueId: string, ignoreUserUniqueId?: string, ignorePageUniqueId?: string): Promise<boolean> {
        if (uniqueId === undefined || uniqueId === null || uniqueId === '') {
            return Promise.resolve(undefined);
        }

        return new Promise(async (resolve, reject) => {
            try {
                let checkUniqueIdUserQuey: any = { where: { uniqueId } };
                if (ignoreUserUniqueId !== undefined && ignoreUserUniqueId !== null && ignoreUserUniqueId !== '') {
                    checkUniqueIdUserQuey = {
                        $and: [
                            {
                                uniqueId
                            }, {
                                uniqueId: {
                                    $nin: [ignoreUserUniqueId]
                                }
                            }
                        ]
                    };
                }
                const checkUniqueIdUser: User = await this.findOne(checkUniqueIdUserQuey);
                let checkPageUsernameQuey: any = { where: { pageUsername: uniqueId } };
                if (ignorePageUniqueId !== undefined && ignorePageUniqueId !== null && ignorePageUniqueId !== '') {
                    checkPageUsernameQuey = {
                        $and: [
                            {
                                pageUsername: uniqueId
                            }, {
                                pageUsername: {
                                    $nin: [ignorePageUniqueId]
                                }
                            }
                        ]
                    };
                }
                const checkPageUsername: any = await this.pageRepository.findOne(checkPageUsernameQuey);
                if ((checkUniqueIdUser !== null && checkUniqueIdUser !== undefined) || (checkPageUsername !== null && checkPageUsername !== undefined)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
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

    public async createUser(users: CreateUserRequest): Promise<void> {
        const userPassword = await User.hashPassword(users.password);

        const user: User = new User();
        user.username = users.email;
        user.password = userPassword;
        user.email = users.email;
        user.displayName = users.displayName;
        user.firstName = users.firstName;
        user.lastName = users.lastName;
        user.citizenId = users.citizenId;
        user.gender = users.gender;
        user.imageURL = '';
        user.coverURL = '';
        user.coverPosition = 0;
        user.banned = false;
        user.isAdmin = users.isAdmin;

        const data = await this.findOne({ where: { username: users.email } });

        if (data) {
            return;
        }

        this.create(user);

        return;
    }
}
