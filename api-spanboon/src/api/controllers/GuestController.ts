/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import jwt from 'jsonwebtoken';
import { env } from '../../env';
import { JsonController, Res, Post, Body, Req, Get, QueryParam } from 'routing-controllers';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { UserService } from '../services/UserService';
import { User } from '../models/User';
import { CreateUserRequest } from './requests/CreateUserRequest';
import { UserLoginRequest } from './requests/UserLoginRequest';
import { AuthenticationId } from '../models/AuthenticationId';
import { AuthenticationIdService } from '../services/AuthenticationIdService';
import { MAILService } from '../../auth/mail.services';
import { ObjectID } from 'mongodb';
import { PROVIDER } from '../../constants/LoginProvider';
import moment from 'moment';
import { ForgotPasswordRequest } from './requests/ForgotPasswordRequest';
import { FacebookService } from '../services/FacebookService';
import { AssetService } from '../services/AssetService';
import { Asset } from '../models/Asset';
import { ASSET_SCOPE, ASSET_PATH } from '../../constants/AssetScope';
import { FileUtil } from '../../utils/FileUtil';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { AuthService } from '../../auth/AuthService';
import { ForgotPasswordActivateCodeService } from '../services/ForgotPasswordActivateCodeService';
import { ForgotPasswordActivateCode } from '../models/ForgotPasswordActivateCode';
import { GenerateUUIDUtil } from '../../utils/GenerateUUIDUtil';
import { ChangePasswordRequest } from './requests/ChangePasswordRequest';
import { GoogleService } from '../services/GoogleService';
import { TwitterService } from '../services/TwitterService';
import { ConfigService } from '../services/ConfigService';
import { USER_EXPIRED_TIME_CONFIG, DEFAULT_USER_EXPIRED_TIME, PLATFORM_NAME_TH } from '../../constants/SystemConfig';
import { ObjectUtil } from '../../utils/Utils';
import { DeviceTokenService } from '../services/DeviceToken';

@JsonController()
export class GuestController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private authenticationIdService: AuthenticationIdService,
        private facebookService: FacebookService,
        private googleService: GoogleService,
        private assetService: AssetService,
        private userFollowService: UserFollowService,
        private forgotPasswordActivateCodeService: ForgotPasswordActivateCodeService,
        private twitterService: TwitterService,
        private configService: ConfigService,
        private deviceToken: DeviceTokenService,
    ) { }

    /**
     * @api {post} /api/register Create User
     * @apiGroup Guest API
     * @apiParam (Request body) {String} username username
     * @apiParam (Request body) {String} password password
     * @apiParam (Request body) {String} email email
     * @apiParam (Request body) {String} firstName firstName
     * @apiParam (Request body) {String} lastName lastName
     * @apiParam (Request body) {String} citizenId citizenId
     * @apiParam (Request body) {number} gender gender
     * @apiParamExample {json} Input
     * {
     *      "username" : "",
     *      "password" : "",
     *      "email" : "",
     *      "firstname" : "",
     *      "lastname" : "",
     *      "citizenId" : "",
     *      "gender" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create User",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/register
     * @apiErrorExample {json} Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/register')
    public async register(@Body({ validate: true }) users: CreateUserRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const mode = req.headers.mode;
        const registerEmail = users.email.toLowerCase();
        const gender = users.gender;
        const customGender = users.customGender;
        const uniqueId = users.uniqueId;
        const assets = users.asset;
        let registerPassword = users.password;
        let authIdCreate: AuthenticationId;
        let userData: User;
        if (mode === PROVIDER.EMAIL) {
            const data: User = await this.userService.findOne({ where: { username: registerEmail } });
            if (data) {
                const errorResponse = ResponseUtil.getErrorResponse('This Email already exists', undefined);
                return res.status(400).send(errorResponse);
            } else {
                if (registerPassword === null || registerPassword === undefined) {
                    registerPassword = null;
                } else {
                    registerPassword = await User.hashPassword(registerPassword);
                }
                const user: User = new User();
                user.username = registerEmail;
                user.password = registerPassword;
                user.email = registerEmail;
                user.uniqueId = uniqueId ? uniqueId : null;
                user.imageURL = '';
                user.coverURL = '';
                user.coverPosition = 0;
                user.firstName = users.firstName;
                user.lastName = users.lastName;
                user.displayName = users.displayName;
                user.birthdate = new Date(users.birthdate);
                user.isAdmin = false;
                user.isSubAdmin = false;
                user.banned = false;
                user.customGender = users.customGender;

                if (gender !== null || gender !== undefined) {
                    user.gender = gender;
                } else {
                    user.gender = null;
                }

                if (customGender === null || customGender === undefined || customGender === '') {
                    user.customGender = null;
                } else {
                    user.customGender = customGender;
                }

                // check uniqueId
                if (user.uniqueId === '') {
                    user.uniqueId = null;
                }
                if (user.uniqueId !== undefined && user.uniqueId !== null) {
                    const isContainsUniqueId = await this.userService.isContainsUniqueId(user.uniqueId);
                    if (isContainsUniqueId !== undefined && isContainsUniqueId) {
                        const errorResponse = ResponseUtil.getErrorResponse('UniqueId already exists', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }

                let result = await this.userService.create(user);

                if (result) {
                    const userId = result.id;
                    const userObjId = new ObjectID(userId);

                    if (Object.keys(assets).length > 0 && assets !== null && assets !== undefined) {
                        const asset = new Asset();
                        const fileName = userId + FileUtil.renameFile();
                        asset.userId = userObjId;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        asset.data = assets.data;
                        asset.mimeType = assets.mimeType;
                        asset.size = assets.size;
                        asset.fileName = fileName;

                        const assetCreate: Asset = await this.assetService.create(asset);
                        const imagePath = assetCreate ? ASSET_PATH + assetCreate.id : '';
                        if (assetCreate) {
                            await this.userService.update({ _id: userObjId }, { $set: { imageURL: imagePath } });
                        }
                    }

                    let message = '<p> สวัสดีคุณ ' + result.firstName + '</p>';
                    message += '<p> ยินดีต้อนรับเข้าสู่ แพลตฟอร์ม ' + PLATFORM_NAME_TH + ' </p>';
                    message += '<p> ข้อมูลสำหรับ Login ของคุณคือ </p>';
                    message += '<p> ชื่อผู้ใช้ : ' + result.email + '</p>';

                    MAILService.customerLoginMail(message, registerEmail, 'ยินดีต้อนรับสู่' + PLATFORM_NAME_TH);
                    result = this.userService.cleanUserField(result);

                    const authId = new AuthenticationId();
                    authId.user = result.id;
                    authId.providerName = PROVIDER.EMAIL;

                    const authenIdCreated: AuthenticationId = await this.authenticationIdService.create(authId);

                    if (authenIdCreated) {
                        const successResponse = ResponseUtil.getSuccessResponse('Register Success', result);
                        return res.status(200).send(successResponse);
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Register Failed', undefined);
                    return res.status(400).send(errorResponse);
                }
            }
        } else if (mode === PROVIDER.FACEBOOK) {
            const resultUser: User = await this.userService.findOne({ where: { email: users.email } });
            const fbUserId = users.fbUserId;
            const fbToken = users.fbToken;
            const fbAccessExpirationTime = users.fbAccessExpirationTime;
            const fbSignedRequest = users.fbSignedRequest;
            const properties = { fbAccessExpTime: fbAccessExpirationTime, fbSigned: fbSignedRequest };
            if (fbUserId === null || fbUserId === undefined || fbUserId === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Facebook UserId is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (fbToken === null || fbToken === undefined || fbToken === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Facebook Token is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (fbAccessExpirationTime === null || fbAccessExpirationTime === undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('Facebook ExpirationTime is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (fbSignedRequest === null || fbSignedRequest === undefined || fbSignedRequest === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Facebook SignedRequest is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (resultUser) {
                // check if has authenid
                const currentAuthenId = await this.authenticationIdService.findOne({ user: resultUser.id, providerName: PROVIDER.FACEBOOK });
                if (currentAuthenId !== undefined) {
                    const errorResponse = ResponseUtil.getErrorResponse('Facebook was registered.', undefined);
                    return res.status(400).send(errorResponse);
                }

                const userExrTime = await this.getUserLoginExpireTime();
                userData = this.userService.cleanUserField(resultUser);
                const authenId = new AuthenticationId();
                authenId.user = resultUser.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = fbUserId;
                authenId.providerName = PROVIDER.FACEBOOK;
                authenId.storedCredentials = fbToken;
                authenId.properties = properties;
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                authIdCreate = await this.authenticationIdService.create(authenId);
                const fbTokenSign = jwt.sign({ token: fbToken }, env.SECRET_KEY);
                if (authIdCreate) {
                    const result: any = { token: fbTokenSign, user: userData };
                    const successResponse = ResponseUtil.getSuccessResponse('Register With Facebook Success', result);
                    return res.status(200).send(successResponse);
                }
            }
            else {
                const newUser = this.createBasePageUser(users);
                let providerList: any[];

                if (registerPassword === null || registerPassword === undefined || registerPassword === '') {
                    providerList = [PROVIDER.FACEBOOK];
                    registerPassword = null;
                } else {
                    providerList = [PROVIDER.EMAIL, PROVIDER.FACEBOOK];
                    registerPassword = await User.hashPassword(registerPassword);
                }
                const user: User = new User();
                user.username = registerEmail;
                user.password = registerPassword;
                user.email = registerEmail;
                user.uniqueId = uniqueId ? uniqueId : null;
                user.firstName = newUser.firstName;
                user.lastName = newUser.lastName;
                user.imageURL = '';
                user.coverURL = '';
                user.coverPosition = 0;
                user.displayName = newUser.displayName;
                user.birthdate = new Date(newUser.birthdate);
                user.isAdmin = false;
                user.isSubAdmin = false;
                user.banned = false;

                if (gender !== null || gender !== undefined) {
                    user.gender = gender;
                } else {
                    user.gender = null;
                }

                if (customGender === null || customGender === undefined || customGender === '') {
                    user.customGender = null;
                } else {
                    user.customGender = customGender;
                }

                // check uniqueId
                if (user.uniqueId === '') {
                    user.uniqueId = null;
                }
                if (user.uniqueId !== undefined && user.uniqueId !== null) {
                    const isContainsUniqueId = await this.userService.isContainsUniqueId(user.uniqueId);
                    if (isContainsUniqueId !== undefined && isContainsUniqueId) {
                        const errorResponse = ResponseUtil.getErrorResponse('UniqueId already exists', users);
                        return res.status(400).send(errorResponse);
                    }
                }

                const resultData: User = await this.userService.create(user);
                if (resultData) {
                    const userId = resultData.id;

                    userData = this.userService.cleanUserField(resultData);
                    if (assets !== null && assets !== undefined && Object.keys(assets).length > 0) {
                        const asset = new Asset();
                        const fileName = userId + FileUtil.renameFile();
                        asset.userId = userId;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        asset.data = assets.data;
                        asset.mimeType = assets.mimeType;
                        asset.size = assets.size;
                        asset.fileName = fileName;

                        const assetCreate: Asset = await this.assetService.create(asset);
                        const imagePath = assetCreate ? ASSET_PATH + assetCreate.id : '';
                        if (assetCreate) {
                            await this.userService.update({ _id: userId }, { $set: { imageURL: imagePath } });
                        }
                        userData.imageURL = imagePath;
                    }

                    const userExrTime = await this.getUserLoginExpireTime();
                    const authenIdCreated: AuthenticationId[] = [];

                    for (const provider of providerList) {
                        const authenId = new AuthenticationId();
                        authenId.user = userData.id;
                        authenId.providerName = provider;

                        if (provider === PROVIDER.EMAIL) {
                            authenId.providerUserId = userId;

                            let message = '<p> Hello ' + resultData.firstName + '</p>';
                            message += '<p> Username : ' + resultData.email + '</p>';

                            MAILService.customerLoginMail(message, registerEmail, 'Thank you for Register');
                        } else if (provider === PROVIDER.FACEBOOK) {
                            authenId.providerUserId = fbUserId;
                            authenId.properties = properties;
                            authenId.storedCredentials = users.fbToken;
                            authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                        }
                        authIdCreate = await this.authenticationIdService.create(authenId);
                        authenIdCreated.push(authIdCreate);
                    }
                    const fbTokenSign = jwt.sign({ token: fbToken }, env.SECRET_KEY);
                    if (authenIdCreated.length > 0) {
                        const result: any = { token: fbTokenSign, user: userData };
                        const successResponse = ResponseUtil.getSuccessResponse('Register With Facebook Success', result);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getErrorResponse('Register Facebook Failed', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            }
        } else if (mode === PROVIDER.APPLE) {
            // register apple
            const resultUser: User = await this.userService.findOne({ where: { email: users.email } });
            const appleUserId = users;
            if (appleUserId === null || appleUserId === undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('Apple UserId is required', undefined);
                return res.status(400).send(errorResponse);
            }
            if (appleUserId.authToken === null || appleUserId.authToken === undefined || appleUserId.authToken === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Apple Token is required', undefined);
                return res.status(400).send(errorResponse);
            }
            const userExrTime = await this.getUserLoginExpireTime();
            if (resultUser) {
                const currentAuthenId = await this.authenticationIdService.find({ user: resultUser.id, providerName: PROVIDER.APPLE });
                if (currentAuthenId !== undefined) {
                    const errorResponse = ResponseUtil.getErrorResponse('Apple was registered.', undefined);
                    console.log('pass3');
                    return res.status(400).send(errorResponse);
                }
                userData = this.userService.cleanUserField(resultUser);
                const authenId = new AuthenticationId();
                authenId.user = resultUser.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = appleUserId.userId;
                authenId.providerName = PROVIDER.APPLE;
                authenId.storedCredentials = appleUserId.idToken;
                authenId.properties = { hideEmail: appleUserId.emailHide, authen: appleUserId.authToken };
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                authIdCreate = await this.authenticationIdService.create(authenId);
                if (authIdCreate) {
                    const result: any = { token: appleUserId.authToken, user: userData };
                    const successResponse = ResponseUtil.getSuccessResponse('Register With Apple Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                let providerList: any[];
                if (registerPassword === null || registerPassword === undefined || registerPassword === '') {
                    providerList = [PROVIDER.APPLE];
                    registerPassword = null;
                } else {
                    providerList = [PROVIDER.EMAIL, PROVIDER.APPLE];
                    registerPassword = await User.hashPassword(registerPassword);
                }
                const user: User = new User();
                user.username = appleUserId.username;
                user.password = registerPassword;
                user.email = appleUserId.emailHide;
                user.uniqueId = uniqueId ? uniqueId : null;
                user.firstName = appleUserId.firstName;
                user.lastName = appleUserId.lastName;
                user.imageURL = '';
                user.coverURL = '';
                user.coverPosition = 0;
                user.displayName = appleUserId.displayName;
                user.birthdate = new Date(appleUserId.birthdate);
                user.isAdmin = false;
                user.isSubAdmin = false;
                user.banned = false;

                if (gender !== null || gender !== undefined) {
                    user.gender = gender;
                } else {
                    user.gender = null;
                }

                if (customGender === null || customGender === undefined || customGender === '') {
                    user.customGender = null;
                } else {
                    user.customGender = customGender;
                }
                // check uniqueId
                if (user.uniqueId === '') {
                    user.uniqueId = null;
                }
                if (user.uniqueId !== undefined && user.uniqueId !== null) {
                    const isContainsUniqueId = await this.userService.isContainsUniqueId(user.uniqueId);
                    if (isContainsUniqueId !== undefined && isContainsUniqueId) {
                        const errorResponse = ResponseUtil.getErrorResponse('UniqueId already exists', users);
                        return res.status(400).send(errorResponse);
                    }
                }
                const resultData: User = await this.userService.create(user);
                if (resultData) {
                    const userId = resultData.id;

                    userData = this.userService.cleanUserField(resultData);

                    if (Object.keys(assets).length > 0 && assets !== null && assets !== undefined) {
                        const asset = new Asset();
                        const fileName = userId + FileUtil.renameFile();
                        asset.userId = userId;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        asset.data = assets.data;
                        asset.mimeType = assets.mimeType;
                        asset.size = assets.size;
                        asset.fileName = fileName;

                        const assetCreate: Asset = await this.assetService.create(asset);
                        const imagePath = assetCreate ? ASSET_PATH + assetCreate.id : '';
                        if (assetCreate) {
                            await this.userService.update({ _id: userId }, { $set: { imageURL: imagePath } });
                        }
                    }

                    const authenIdCreated: AuthenticationId[] = [];

                    for (const provider of providerList) {
                        const authenId = new AuthenticationId();
                        authenId.user = userData.id;
                        authenId.providerName = provider;

                        if (provider === PROVIDER.EMAIL) {
                            authenId.providerUserId = userId;

                            let message = '<p> Hello ' + resultData.firstName + '</p>';
                            message += '<p> Username : ' + resultData.email + '</p>';

                            MAILService.customerLoginMail(message, registerEmail, 'Thank you for Register');
                        } else if (provider === PROVIDER.APPLE) {
                            authenId.providerUserId = users.userId;
                            authenId.storedCredentials = users.authToken;
                            authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                        }

                        authIdCreate = await this.authenticationIdService.create(authenId);
                        authenIdCreated.push(authIdCreate);
                    }

                    if (authenIdCreated.length > 0) {
                        const result: any = { token: appleUserId.idToken, user: userData };
                        const successResponse = ResponseUtil.getSuccessResponse('Register With APPLE Success', result);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getSuccessResponse('Register APPLE Failed', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            }
        }
        else if (mode === PROVIDER.GOOGLE) {
            const resultUser: User = await this.userService.findOne({ where: { email: users.email } });
            const idToken = req.body.idToken;
            const checkIdToken = await this.googleService.verifyIdToken(idToken, req.headers.mod_modMobile);
            const googleUserId = users.googleUserId;
            const authToken = users.authToken;

            if (googleUserId === null || googleUserId === undefined || googleUserId === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Google UserId is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (authToken === null || authToken === undefined || authToken === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Google Token is required', undefined);
                return res.status(400).send(errorResponse);
            }

            const userExrTime = await this.getUserLoginExpireTime();

            if (resultUser) {
                // check if has authenid
                const currentAuthenId = await this.authenticationIdService.findOne({ user: resultUser.id, providerName: PROVIDER.GOOGLE });
                if (currentAuthenId !== undefined) {
                    const errorResponse = ResponseUtil.getErrorResponse('Google was registered.', undefined);
                    return res.status(400).send(errorResponse);
                }
                if (checkIdToken === null && checkIdToken === undefined) {
                    userData = this.userService.cleanUserField(resultUser);
                    const authenId = new AuthenticationId();
                    authenId.user = resultUser.id;
                    authenId.lastAuthenTime = moment().toDate();
                    authenId.providerUserId = googleUserId;
                    authenId.providerName = PROVIDER.GOOGLE;
                    authenId.storedCredentials = authToken;
                    authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                    authIdCreate = await this.authenticationIdService.create(authenId);
                } else {
                    userData = this.userService.cleanUserField(resultUser);
                    const authenId = new AuthenticationId();
                    authenId.user = resultUser.id;
                    authenId.lastAuthenTime = moment().toDate();
                    authenId.providerUserId = checkIdToken.userId;
                    authenId.providerName = PROVIDER.GOOGLE;
                    authenId.storedCredentials = authToken;
                    authenId.expirationDate = moment().add(userExrTime, 'days').toDate();

                    authIdCreate = await this.authenticationIdService.create(authenId);
                }
                if (authIdCreate) {
                    const result: any = { token: authToken, user: userData };
                    const successResponse = ResponseUtil.getSuccessResponse('Register With Google Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const newUser = this.createBasePageUser(users);
                let providerList: any[];

                if (registerPassword === null || registerPassword === undefined || registerPassword === '') {
                    providerList = [PROVIDER.GOOGLE];
                    registerPassword = null;
                } else {
                    providerList = [PROVIDER.EMAIL, PROVIDER.GOOGLE];
                    registerPassword = await User.hashPassword(registerPassword);
                }

                const user: User = new User();
                user.username = registerEmail;
                user.password = registerPassword;
                user.email = registerEmail;
                user.uniqueId = uniqueId ? uniqueId : null;
                user.firstName = newUser.firstName;
                user.lastName = newUser.lastName;
                user.imageURL = '';
                user.coverURL = '';
                user.coverPosition = 0;
                user.displayName = newUser.displayName;
                user.birthdate = new Date(newUser.birthdate);
                user.isAdmin = false;
                user.isSubAdmin = false;
                user.banned = false;
                const resultData: User = await this.userService.create(user);
                if (gender !== null || gender !== undefined) {
                    user.gender = gender;
                } else {
                    user.gender = null;
                }

                if (customGender === null || customGender === undefined || customGender === '') {
                    user.customGender = null;
                } else {
                    user.customGender = customGender;
                }
                // check uniqueId
                if (user.uniqueId === '') {
                    user.uniqueId = null;
                }
                if (user.uniqueId !== undefined && user.uniqueId !== null) {
                    const isContainsUniqueId = await this.userService.isContainsUniqueId(user.uniqueId);
                    if (isContainsUniqueId !== undefined && isContainsUniqueId) {
                        const errorResponse = ResponseUtil.getErrorResponse('UniqueId already exists', users);
                        return res.status(400).send(errorResponse);
                    }
                }
                if (resultData) {
                    const userId = resultData.id;

                    userData = this.userService.cleanUserField(resultData);

                    if (Object.keys(assets).length > 0 && assets !== null && assets !== undefined) {
                        const asset = new Asset();
                        const fileName = userId + FileUtil.renameFile();
                        asset.userId = userId;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        asset.data = assets.data;
                        asset.mimeType = assets.mimeType;
                        asset.size = assets.size;
                        asset.fileName = fileName;

                        const assetCreate: Asset = await this.assetService.create(asset);
                        const imagePath = assetCreate ? ASSET_PATH + assetCreate.id : '';
                        if (assetCreate) {
                            await this.userService.update({ _id: userId }, { $set: { imageURL: imagePath } });
                        }
                    }

                    const authenIdCreated: AuthenticationId[] = [];

                    for (const provider of providerList) {
                        const authenId = new AuthenticationId();
                        authenId.user = userData.id;
                        authenId.providerName = provider;

                        if (provider === PROVIDER.EMAIL) {
                            authenId.providerUserId = userId;

                            let message = '<p> Hello ' + resultData.firstName + '</p>';
                            message += '<p> Username : ' + resultData.email + '</p>';

                            MAILService.customerLoginMail(message, registerEmail, 'Thank you for Register');
                        } else if (provider === PROVIDER.GOOGLE) {
                            authenId.providerUserId = googleUserId;
                            authenId.storedCredentials = users.authToken;
                            authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                        }

                        authIdCreate = await this.authenticationIdService.create(authenId);
                        authenIdCreated.push(authIdCreate);
                    }

                    if (authenIdCreated.length > 0) {
                        const result: any = { token: authToken, user: userData };
                        const successResponse = ResponseUtil.getSuccessResponse('Register With Google Success', result);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getSuccessResponse('Register Google Failed', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            }
        } else if (mode === PROVIDER.TWITTER) {
            const resultUser: User = await this.userService.findOne({ where: { email: users.email } });
            const twitterUserId = users.twitterUserId;
            const twitterOauthToken = users.twitterOauthToken;
            const twitterTokenSecret = users.twitterTokenSecret;

            if (twitterUserId === null || twitterUserId === undefined || twitterUserId === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Twitter UserId is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (twitterOauthToken === null || twitterOauthToken === undefined || twitterOauthToken === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Twitter OauthToken is required', undefined);
                return res.status(400).send(errorResponse);
            }

            if (twitterTokenSecret === null || twitterTokenSecret === undefined || twitterTokenSecret === '') {
                const errorResponse = ResponseUtil.getErrorResponse('Twitter TokenSecret is required', undefined);
                return res.status(400).send(errorResponse);
            }

            const userExrTime = await this.getUserLoginExpireTime();
            if (resultUser) {
                // check if has authenid
                const currentAuthenId = await this.authenticationIdService.findOne({ user: resultUser.id, providerName: PROVIDER.TWITTER });
                if (currentAuthenId !== undefined) {
                    const errorResponse = ResponseUtil.getErrorResponse('Twitter was registered.', undefined);
                    return res.status(400).send(errorResponse);
                }

                // has user just create only authenID
                userData = this.userService.cleanUserField(resultUser);
                const authenId = new AuthenticationId();
                authenId.user = resultUser.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = twitterUserId;
                authenId.providerName = PROVIDER.TWITTER;
                authenId.storedCredentials = 'oauth_token=' + twitterOauthToken + '&oauth_token_secret=' + twitterTokenSecret + '&user_id=' + twitterUserId;
                authenId.properties = {
                    userId: twitterUserId,
                    oauthToken: twitterOauthToken,
                    oauthTokenSecret: twitterTokenSecret
                };
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();

                authIdCreate = await this.authenticationIdService.create(authenId);
                const twToken = jwt.sign({ token: authenId.storedCredentials }, env.SECRET_KEY);

                if (authIdCreate) {
                    const result: any = { token: twToken, user: userData };
                    const successResponse = ResponseUtil.getSuccessResponse('Register With Twitter Success', result);
                    return res.status(200).send(successResponse);
                }
            } else {
                const newUser = this.createBasePageUser(users);
                let providerList: any[];

                if (registerPassword === null || registerPassword === undefined || registerPassword === '') {
                    providerList = [PROVIDER.TWITTER];
                    registerPassword = null;
                } else {
                    providerList = [PROVIDER.EMAIL, PROVIDER.TWITTER];
                    registerPassword = await User.hashPassword(registerPassword);
                }

                const user: User = new User();
                user.username = registerEmail;
                user.password = registerPassword;
                user.email = registerEmail;
                user.uniqueId = uniqueId ? uniqueId : null;
                user.firstName = newUser.firstName;
                user.lastName = newUser.lastName;
                user.imageURL = '';
                user.coverURL = '';
                user.coverPosition = 0;
                user.displayName = newUser.displayName;
                user.birthdate = new Date(newUser.birthdate);
                user.isAdmin = false;
                user.isSubAdmin = false;
                user.banned = false;
                console.log('user', user);
                if (gender !== null || gender !== undefined) {
                    user.gender = gender;
                } else {
                    user.gender = null;
                }

                if (customGender === null || customGender === undefined || customGender === '') {
                    user.customGender = null;
                } else {
                    user.customGender = customGender;
                }

                const resultData: User = await this.userService.create(user);
                if (resultData) {
                    const userId = resultData.id;

                    userData = this.userService.cleanUserField(resultData);
                    if (assets !== null && assets !== undefined && Object.keys(assets).length > 0) {
                        const asset = new Asset();
                        const fileName = userId + FileUtil.renameFile();
                        asset.userId = userId;
                        asset.scope = ASSET_SCOPE.PUBLIC;
                        asset.data = assets.data;
                        asset.mimeType = assets.mimeType;
                        asset.size = assets.size;
                        asset.fileName = fileName;

                        const assetCreate: Asset = await this.assetService.create(asset);
                        const imagePath = assetCreate ? ASSET_PATH + assetCreate.id : '';
                        if (assetCreate) {
                            await this.userService.update({ _id: userId }, { $set: { imageURL: imagePath } });
                        }
                        userData.imageURL = imagePath;
                    }

                    const authenIdCreated: AuthenticationId[] = [];
                    let twToken = undefined;
                    for (const provider of providerList) {
                        const authenId = new AuthenticationId();
                        authenId.user = userData.id;
                        authenId.providerName = provider;

                        if (provider === PROVIDER.EMAIL) {
                            authenId.providerUserId = userId;

                            let message = '<p> Hello ' + resultData.firstName + '</p>';
                            message += '<p> Username : ' + resultData.email + '</p>';

                            MAILService.customerLoginMail(message, registerEmail, 'Thank you for Register');
                        } else if (provider === PROVIDER.TWITTER) {
                            authenId.providerUserId = twitterUserId;
                            authenId.providerName = PROVIDER.TWITTER;
                            authenId.storedCredentials = 'oauth_token=' + twitterOauthToken + '&oauth_token_secret=' + twitterTokenSecret + '&user_id=' + twitterUserId;
                            authenId.properties = {
                                userId: twitterUserId,
                                oauthToken: twitterOauthToken,
                                oauthTokenSecret: twitterTokenSecret
                            };
                            authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                        }
                        twToken = authenId.storedCredentials;

                        authIdCreate = await this.authenticationIdService.create(authenId);
                        authenIdCreated.push(authIdCreate);
                    }
                    twToken = jwt.sign({ token: twToken }, env.SECRET_KEY);
                    if (authenIdCreated.length > 0) {
                        const result: any = { token: twToken, user: userData };
                        const successResponse = ResponseUtil.getSuccessResponse('Register With Twitter Success', result);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getErrorResponse('Register Twitter Failed', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            }
        }
    }

    // Login API
    /**
     * @api {post} /api/login Login
     * @apiGroup Guest API
     * @apiParam (Request body) {String} username User Username
     * @apiParam (Request body) {String} password User Password
     * @apiParamExample {json} Input
     * {
     *      "username" : "",
     *      "password" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "data": {
     *         "token": ""
     *      },
     *      "message": "Successfully login",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/login
     * @apiErrorExample {json} Error
     * HTTP/1.1 500 Internal Server Error
     */

    @Post('/login')
    public async login(@Body({ validate: true }) loginParam: UserLoginRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const mode = req.headers.mode;
        const modHeaders = req.headers.mod_headers;
        const loginUsername = loginParam.username;
        const loginPassword = loginParam.password;
        let loginToken: any;
        let loginUser: any;
        const tokenFCM = req.body.tokenFCM;
        const deviceName = req.body.deviceName;
        if (mode === PROVIDER.EMAIL) {
            const userLogin: any = await this.userService.findOne({ where: { username: loginUsername } });
            if (userLogin) {
                const userObjId = new ObjectID(userLogin.id);
                if (loginPassword === null && loginPassword === undefined && loginPassword === '') {
                    const errorResponse = ResponseUtil.getErrorResponse('Invalid password', undefined);
                    return res.status(400).send(errorResponse);
                }
                if (await User.comparePassword(userLogin, loginPassword)) {
                    // create a token
                    const token = jwt.sign({ id: userObjId }, env.SECRET_KEY);
                    if (userLogin.banned === true) {
                        const errorResponse = ResponseUtil.getErrorResponse('User Banned', undefined);
                        return res.status(400).send(errorResponse);
                    } else if (token) {
                        const currentDateTime = moment().toDate();
                        // find user
                        const userExrTime = await this.getUserLoginExpireTime();
                        const checkAuthen: AuthenticationId = await this.authenticationIdService.findOne({ where: { user: userLogin.id, providerName: PROVIDER.EMAIL } });
                        const newToken = new AuthenticationId();
                        newToken.user = userLogin.id;
                        newToken.lastAuthenTime = currentDateTime;
                        newToken.providerUserId = userObjId;
                        newToken.providerName = PROVIDER.EMAIL;
                        newToken.storedCredentials = token;
                        newToken.expirationDate = moment().add(userExrTime, 'days').toDate();
                        const checkExistTokenFcm = await this.deviceToken.findOne({ userId: userObjId, token: req.body.token });
                        if (checkAuthen !== null && checkAuthen !== undefined) {
                            const updateQuery = { user: userLogin.id, providerName: PROVIDER.EMAIL };
                            const newValue = { $set: { lastAuthenTime: currentDateTime, storedCredentials: token, expirationDate: newToken.expirationDate } };
                            await this.authenticationIdService.update(updateQuery, newValue);
                        } else {
                            await this.authenticationIdService.create(newToken);
                        }
                        if (checkExistTokenFcm !== 'undefiend' && checkExistTokenFcm !== null) {
                            await this.deviceToken.createDeviceToken({ deviceName, token: tokenFCM, userId: userObjId });
                        }
                        loginToken = token;
                    }
                    loginUser = userLogin;
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Invalid Password', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse: any = { status: 0, message: 'Invalid username' };
                return res.status(400).send(errorResponse);
            }
        }

        else if (mode === PROVIDER.APPLE) {

            const appleId: any = req.body.apple.result.user;
            const tokenFCM_AP = req.body.tokenFCM_AP.tokenFCM;
            const deviceAP = req.body.tokenFCM_AP.deviceName;
            const appleClient = await this.authenticationIdService.findOne({ where: { providerUserId: appleId.userId } });
            if (appleClient === null || appleClient === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            } else {
                const currentDateTime = moment().toDate();
                const query = { id: appleId.userId, providerName: PROVIDER.APPLE };
                const newValue = { $set: { lastAuthenTime: currentDateTime, storedCredentials: appleId.idToken, expirationDate: appleId.metadata.creationTime, properties: { tokenSign: appleId.accessToken, signIn: appleId.metadata.lastSignInTime } } };
                const update_Apple = await this.authenticationIdService.update(query, newValue);
                if (update_Apple) {
                    const updatedAuth = await this.authenticationIdService.findOne({ where: { providerUserId: appleId.userId } });
                    await this.deviceToken.createDeviceToken({ deviceName: deviceAP, token: tokenFCM_AP, userId: update_Apple.user });
                    loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                    loginToken = jwt.sign({ token: appleId.idToken, userId: appleId.userId }, env.SECRET_KEY);
                }
            }
        }

        else if (mode === PROVIDER.FACEBOOK) {
            const tokenFcmFB = req.body.tokenFCM_FB.tokenFCM;
            const deviceFB = req.body.tokenFCM_FB.deviceName;
            // find email then -> authentication -> mode FB
            let fbUser = undefined;
            let userFb = undefined;
            let authenticaTionFB = undefined;
            try {
                fbUser = await this.facebookService.fetchFacebook(loginParam.token);
                userFb = await this.userService.find({ email: fbUser.email });
                for (const userFind of userFb) {
                    authenticaTionFB = await this.authenticationIdService.findOne({ where: { user: ObjectID(userFind.id), providerName: PROVIDER.FACEBOOK } });
                }
            } catch (err) {
                console.log(err);
            } if (fbUser === null || fbUser === undefined && authenticaTionFB === null || authenticaTionFB === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            } else {
                const userExrTime = await this.getUserLoginExpireTime();
                const currentDateTime = moment().toDate();
                const authTime = currentDateTime;
                const expirationDate = moment().add(userExrTime, 'days').toDate();
                const facebookUserId = authenticaTionFB.providerUserId;
                const query = { providerUserId: facebookUserId, providerName: PROVIDER.FACEBOOK };
                const newValue = { $set: { providerUserId: fbUser.id, lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, storedCredentials: loginParam.token, expirationDate } };
                const updateAuth = await this.authenticationIdService.update(query, newValue);
                if (updateAuth) {
                    const updatedAuth = await this.authenticationIdService.findOne({ where: query });
                    await this.deviceToken.createDeviceToken({ deviceName: deviceFB, token: tokenFcmFB, userId: updatedAuth.user });
                    loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                    loginToken = updatedAuth.storedCredentials;
                    loginToken = jwt.sign({ token: loginToken }, env.SECRET_KEY);
                }
            }
        } else if (mode === PROVIDER.GOOGLE) {
            const idToken = loginParam.idToken;
            const authToken = loginParam.authToken;
            const checkIdToken = await this.googleService.verifyIdToken(idToken, modHeaders);
            const tokenFcmGG = req.body.tokenFCM_GG.tokenFCM;
            const deviceGG = req.body.tokenFCM_GG.deviceName;
            if (checkIdToken === undefined) {
                const errorResponse: any = { status: 0, message: 'Invalid Token.' };
                return res.status(400).send(errorResponse);
            }
            // const expiresAt = checkIdToken.expire;
            // const today = moment().toDate();
            let googleUser = undefined;
            try {
                googleUser = await this.googleService.getGoogleUser(checkIdToken.userId, authToken);
            } catch (err) {
                console.log(err);
            }
            if (googleUser === null || googleUser === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            } else {
                const userExrTime = await this.getUserLoginExpireTime();
                const currentDateTime = moment().toDate();
                const authTime = currentDateTime;
                const expirationDate = moment().add(userExrTime, 'days').toDate();
                const query = { providerUserId: googleUser.authId.providerUserId, providerName: PROVIDER.GOOGLE };
                const newValue = { $set: { lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, storedCredentials: authToken, properties: { userId: googleUser.authId.providerUserId, token: googleUser.authId.storedCredentials, expiraToken: checkIdToken.expire }, expirationDate } };
                const updateAuth = await this.authenticationIdService.update(query, newValue);
                if (updateAuth) {
                    const updatedAuthGG = await this.authenticationIdService.findOne({ providerUserId: googleUser.authId.providerUserId, providerName: PROVIDER.GOOGLE });
                    await this.deviceToken.createDeviceToken({ deviceName: deviceGG, token: tokenFcmGG, userId: updatedAuthGG.user });
                    loginUser = await this.userService.findOne({ where: { _id: updatedAuthGG.user } });
                    loginToken = updatedAuthGG.storedCredentials;
                    loginToken = jwt.sign({ token: loginToken, userId: checkIdToken.userId }, env.SECRET_KEY);
                }
            }

        }

        else if (mode === PROVIDER.TWITTER) {
            const twitterOauthToken = loginParam.twitterOauthToken;
            const twitterOauthTokenSecret = loginParam.twitterOauthTokenSecret;
            if (twitterOauthToken === undefined || twitterOauthToken === '' || twitterOauthToken === null) {
                const errorResponse: any = { status: 0, message: 'twitterOauthToken was required.' };
                return res.status(400).send(errorResponse);
            }

            if (twitterOauthTokenSecret === undefined || twitterOauthTokenSecret === '' || twitterOauthTokenSecret === null) {
                const errorResponse: any = { status: 0, message: 'twitterOauthTokenSecret was required.' };
                return res.status(400).send(errorResponse);
            }

            let twitterUserId = undefined;
            try {
                const verifyObject = await this.twitterService.verifyCredentials(twitterOauthToken, twitterOauthTokenSecret);
                twitterUserId = verifyObject.id_str;
            } catch (ex) {
                const errorResponse: any = { status: 0, message: ex };
                return res.status(400).send(errorResponse);
            }

            if (twitterUserId === undefined) {
                const errorResponse: any = { status: 0, message: 'Invalid Token.' };
                return res.status(400).send(errorResponse);
            }

            const twAuthenId = await this.twitterService.getTwitterUserAuthenId(twitterUserId);
            if (twAuthenId === null || twAuthenId === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'Twitter was not registed.' };
                return res.status(400).send(errorUserNameResponse);
            } else {
                const userExrTime = await this.getUserLoginExpireTime();
                const currentDateTime = moment().toDate();
                const authTime = currentDateTime;
                const expirationDate = moment().add(userExrTime, 'days').toDate();
                const query = { _id: twAuthenId.id };
                const newValue = { $set: { lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, expirationDate } };
                const updateAuth = await this.authenticationIdService.update(query, newValue);

                if (updateAuth) {
                    const updatedAuth = await this.authenticationIdService.findOne({ _id: twAuthenId.id });
                    // await this.deviceToken.createDeviceToken({deviceName,token:tokenFCM,userId:updatedAuth.user});
                    await this.deviceToken.createDeviceToken({ deviceName, token: tokenFCM, userId: updatedAuth.user });
                    loginUser = await this.userService.findOne({ where: { _id: updatedAuth.user } });
                    loginToken = updatedAuth.storedCredentials;
                    loginToken = jwt.sign({ token: loginToken }, env.SECRET_KEY);
                }
            }
        }

        if (loginUser === undefined) {
            const errorResponse: any = { status: 0, message: 'Cannot login please try again.' };
            return res.status(400).send(errorResponse);
        }

        if (loginUser.banned === true) {
            const errorResponse = ResponseUtil.getErrorResponse('User Banned', undefined);
            return res.status(400).send(errorResponse);
        }

        const userFollowings = await this.userFollowService.find({ where: { userId: loginUser.id, subjectType: SUBJECT_TYPE.USER } });
        const userFollowers = await this.userFollowService.find({ where: { subjectId: loginUser.id, subjectType: SUBJECT_TYPE.USER } });

        loginUser = await this.userService.cleanUserField(loginUser);
        loginUser.followings = userFollowings.length;
        loginUser.followers = userFollowers.length;
        const result = { token: loginToken, user: loginUser };

        const successResponse = ResponseUtil.getSuccessResponse('Loggedin successful', result);
        return res.status(200).send(successResponse);
    }

    // Forgot Password API
    /**
     * @api {post} /api/forgot Forgot Password
     * @apiGroup Guest API
     * @apiParam (Request body) {String} username Username
     * @apiParamExample {json} Input
     * {
     *      "username" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you. Your password send to your email",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/forgot
     * @apiErrorExample {json} Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/forgot')
    public async forgotPassword(@Body({ validate: true }) forgotPassword: ForgotPasswordRequest, @Res() res: any): Promise<any> {
        const username = forgotPassword.username;
        const emailRes: string = username.toLowerCase();
        const user: User = await this.userService.findOne({ username: emailRes });

        if (user === null || user === undefined) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Invalid Username', []));
        } else {
            const userObjId = new ObjectID(user.id);
            const activationCode = GenerateUUIDUtil.getUUID();
            const today = moment().toDate();
            const expirationDate = moment().add(60, 'minutes').toDate();
            const checkUserHasActivateCode: ForgotPasswordActivateCode = await this.forgotPasswordActivateCodeService.findOne({ userId: userObjId, activate: false, expirationDate: { $gte: today } });

            const forgotPwd: ForgotPasswordActivateCode = new ForgotPasswordActivateCode();
            forgotPwd.activate = false;
            forgotPwd.code = activationCode;
            forgotPwd.email = username;
            forgotPwd.expirationDate = expirationDate;
            forgotPwd.activateDate = null;
            forgotPwd.userId = userObjId;
            forgotPwd.username = username;

            let activationCodeCreate: ForgotPasswordActivateCode;

            if (checkUserHasActivateCode === null || checkUserHasActivateCode === undefined) {
                activationCodeCreate = await this.createActivateCode(forgotPwd);
            } else {
                const checkExpDate = checkUserHasActivateCode.expirationDate;

                if (checkExpDate < today) {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Your Activation Code Was Expired', undefined));
                } else {
                    activationCodeCreate = await this.createActivateCode(forgotPwd);
                }
            }

            if (activationCodeCreate !== null && activationCodeCreate !== undefined) {
                const code = activationCodeCreate.code;
                const email = activationCodeCreate.email;

                const sendMailRes = await this.sendActivateCode(user, email, code, 'Reset Password');

                if (sendMailRes.status === 1) {
                    return res.status(200).send(sendMailRes);
                } else {
                    return res.status(400).send(sendMailRes);
                }
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Reset Password', undefined));
            }
        }
    }

    // Change Password API
    /**
     * @api {post} /api/change_password Change Password
     * @apiGroup Guest API
     * @apiParam (Request body) {String} username Username
     * @apiParam (Request body) {String} code Activation Code
     * @apiParamExample {json} Input
     * {
     *      "username" : "",
     *      "code" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Change Password Success",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/change_password
     * @apiErrorExample {json} Error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/change_password')
    public async changePassword(@Body({ validate: true }) changePassword: ChangePasswordRequest, @Res() res: any): Promise<any> {
        const today = moment().toDate();
        const code = changePassword.code;
        const email = changePassword.email;
        let password = changePassword.password;

        const forgotPasswordActivateCode: ForgotPasswordActivateCode = await this.forgotPasswordActivateCodeService.findOne({ email, code, activate: false, expirationDate: { $gte: today } });

        if (forgotPasswordActivateCode !== null && forgotPasswordActivateCode !== undefined) {
            const expirationDate = forgotPasswordActivateCode.expirationDate;
            if (expirationDate < today) {
                return res.status(400).send(ResponseUtil.getErrorResponse('Your Activation Code Was Expired', undefined));
            } else {
                password = await User.hashPassword(password);
                const updatePassword = await this.userService.update({ email }, { $set: { password } });

                if (updatePassword) {
                    await this.forgotPasswordActivateCodeService.update({ email, code }, { $set: { activate: true, activateDate: today } });

                    let updateUser: User = await this.userService.findOne({ email });
                    updateUser = this.userService.cleanUserField(updateUser);

                    return res.status(200).send(ResponseUtil.getSuccessResponse('Change Password Success', updateUser));
                } else {
                    return res.status(400).send(ResponseUtil.getErrorResponse('Change Password Failed', undefined));
                }
            }
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Change Password', undefined));
        }
    }

    // Check UserStatus With token
    /**
     * @api {get} /api/check_status Check UserStatus with token
     * @apiGroup PageUser
     * @apiHeader {String} Mode
     * @apiParam (Request body) {String} token Facebook User Token
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "data": "{
     *         "user":''
     *      }",
     *      "message": "Account was valid",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/check_status
     * @apiErrorExample {json} User Token error
     * HTTP/1.1 500 Internal Server Error
     */
    // Check Account Status Function
    @Get('/check_status')
    public async checkAccountStatus(@QueryParam('token') tokenParam: string, @Req() request: any, @Res() response: any): Promise<any> {
        const isMode = request.header('mode');
        let user;
        if (isMode !== undefined && isMode === 'FB') {
            try {
                const decryptToken: any = await jwt.verify(tokenParam, env.SECRET_KEY);
                if (decryptToken.token === undefined) {
                    const errorUserNameResponse: any = { status: 0, message: 'Token was not found.' };
                    return response.status(400).send(errorUserNameResponse);
                }
                const fbUser = await this.facebookService.getFacebookUserFromToken(decryptToken.token);
                user = fbUser.user;
            } catch (ex: any) {
                const errorResponse: any = { status: 0, message: ex.message };
                return response.status(400).send(errorResponse);
            }
        }
        if (isMode !== undefined && isMode === 'GG') {
            try {
                const decryptToken: any = await jwt.verify(tokenParam, env.SECRET_KEY);
                if (decryptToken.token === undefined) {
                    const errorUserNameResponse: any = { status: 0, message: 'Token was not found.' };
                    return response.status(400).send(errorUserNameResponse);
                }
                const ggUser = await this.googleService.getGoogleUser(decryptToken.userId, decryptToken.token);
                const findUser = await this.userService.findOne({ _id: ObjectID(ggUser.authId.user) });
                user = findUser;
            } catch (ex: any) {
                const errorResponse: any = { status: 0, message: ex.message };
                return response.status(400).send(errorResponse);
            }
        }
        if (isMode !== undefined && isMode === 'TW') {
            try {
                const decryptToken: any = await jwt.verify(tokenParam, env.SECRET_KEY);
                if (decryptToken.token === undefined) {
                    const errorUserNameResponse: any = { status: 0, message: 'Token was not found.' };
                    return response.status(400).send(errorUserNameResponse);
                }

                const keyMap = ObjectUtil.parseQueryParamToMap(decryptToken.token);
                user = await this.twitterService.getTwitterUser(keyMap['user_id']);
            } catch (ex: any) {
                const errorResponse: any = { status: 0, message: ex.message };
                return response.status(400).send(errorResponse);
            }
        } else {
            const pageUserId = await this.authService.decryptToken(tokenParam);
            if (pageUserId !== undefined) {
                user = await this.userService.findOne({ where: { _id: new ObjectID(pageUserId) } }, { signURL: true });
            }
        }

        if (!user) {
            const errorUserNameResponse: any = { status: 0, message: 'User was not found.' };
            return response.status(400).send(errorUserNameResponse);
        }

        if (user.error !== undefined) {
            const errorResponse: any = { status: 0, message: user.error.message };
            return response.status(400).send(errorResponse);
        }

        // check expire token
        const today = moment().toDate();
        if (isMode !== undefined && isMode === 'FB') {
            if (user.fbAccessExpirationTime < today.getDate()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: user });
                return response.status(400).send(errorUserNameResponse);
            }
        }
        // check expire token GG
        if (isMode !== undefined && isMode === 'GG') {
            const authenExpira = await this.authenticationIdService.findOne({ user: user.id });
            if (authenExpira < today.getDate()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: user });
                return response.status(400).send(errorUserNameResponse);
            }
        }
        else {
            // normal mode
            const authenId: AuthenticationId = await this.authenticationIdService.findOne({ where: { user: user.id } });
            if (authenId === undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'User token invalid.' };
                return response.status(400).send(errorUserNameResponse);
            }
            const expiresAt = authenId.expirationDate;

            if (expiresAt !== undefined && expiresAt !== null && expiresAt.getTime() <= today.getTime()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: user.id });
                return response.status(400).send(errorUserNameResponse);
            }
        }
        const userFollowings = await this.userFollowService.find({ where: { userId: user.id, subjectType: SUBJECT_TYPE.USER } });
        const userFollowers = await this.userFollowService.find({ where: { subjectId: user.id, subjectType: SUBJECT_TYPE.USER } });

        user.followings = userFollowings.length;
        user.followers = userFollowers.length;

        delete user.fbUserId;
        delete user.fbToken;
        delete user.fbAccessExpirationTime;
        delete user.fbSignedRequest;
        delete user.ip;
        delete user.password;
        delete user.createdBy;
        delete user.createdByUsername;
        delete user.modifiedBy;
        delete user.modifiedByUsername;

        const successResponse: any = { status: 1, message: 'Account was valid.', data: { user, token: tokenParam, mode: isMode } };

        return response.status(200).send(successResponse);
    }

    private createBasePageUser(registerParam: CreateUserRequest): User {
        const newUser = new User();
        newUser.firstName = registerParam.firstName;
        newUser.lastName = registerParam.lastName;
        newUser.email = registerParam.email;
        newUser.username = registerParam.email;
        newUser.birthdate = registerParam.birthdate;
        newUser.displayName = registerParam.displayName;
        newUser.gender = registerParam.gender;
        newUser.customGender = registerParam.customGender;
        // -1 = undefine 0 = male 1 = female
        if (newUser.gender !== -1 && newUser.gender !== 0 && newUser.gender !== 1) {
            newUser.gender = -1;
            newUser.customGender = null;
        }

        return newUser;
    }

    private async createActivateCode(forgotPwd: ForgotPasswordActivateCode): Promise<ForgotPasswordActivateCode> {
        return await this.forgotPasswordActivateCodeService.create(forgotPwd);
    }

    private async sendActivateCode(user: User, email: string, code: string, subject: string): Promise<any> {
        let message = '<p> Hello ' + user.firstName + '</p>';
        message += '<p> Your Activation Code is: ' + code + '</p>';
        message += '<a href="https://spanboon.com/forgotpassword?code=' + code + '&email=' + email + '"> Reset Password </a>';

        const sendMail = MAILService.passwordForgotMail(message, email, subject);

        if (sendMail) {
            return ResponseUtil.getSuccessResponse('Your Activation Code has been sent to your email inbox.', '');
        } else {
            return ResponseUtil.getErrorResponse('error in sending email', '');
        }
    }

    private async getUserLoginExpireTime(): Promise<number> {
        let value = await this.configService.getConfig(USER_EXPIRED_TIME_CONFIG);
        if (value === undefined || value === null || isNaN(value) || value === '') {
            value = DEFAULT_USER_EXPIRED_TIME;
        }

        return value;
    }
}
