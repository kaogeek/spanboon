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
import { OtpRequest } from './requests/OTP';
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
import { CheckUser } from './requests/CheckUser';
import { AutoSynz } from './requests/AutoSynz';
import { FirebaseGuestUser } from './requests/FirebaseGuestUsers';
import { OtpService } from '../services/OtpService';
import { DeviceToken } from '../models/DeviceToken';
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
        private otpService: OtpService
    ) { }

    @Get('/register/date')
    public async getUserRegisterByDate(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @Res() res: any): Promise<any> {
        try {
            if (offset === undefined) {
                offset = 0;
            }
            if (limit === undefined) {
                limit = 10;
            }

            const user = await this.userService.aggregate([
                {
                    $sort: { createdDate: -1 }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdDate'
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $limit: limit },
                { $skip: offset },
                {
                    $sort: { _id: -1 }
                }
            ]);

            if (!!user) {
                return res.status(200).send(ResponseUtil.getSuccessResponse('Get User Register By Date Success', user));
            } else {
                return res.status(400).send(ResponseUtil.getErrorResponse('Get User Register By Date Failed', undefined));
            }
        } catch (error) {
            return res.status(400).send(ResponseUtil.getErrorResponse('Cannot Get User Register By Date', error));
        }
    }

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
        // const ipAddress = req.clientIp;
        // IpAddressEvent.emit(process.env.EVENT_LISTENNER, {ipAddress});
        const mode = req.headers.mode;
        const registerEmail = users.email.toLowerCase();
        const gender = users.gender;
        const customGender = users.customGender;
        const uniqueId = users.uniqueId;
        const assets = users.asset;
        let registerPassword = users.password;
        let authIdCreate: AuthenticationId;
        let userData: User;
        const regex = /[ก-ฮ]/g;
        const found = uniqueId.match(regex);
        const checkEmail: User = await this.userService.findOne({ where: { username: registerEmail } });
        if (checkEmail) {
            const errorResponse = ResponseUtil.getErrorResponse('This Email already exists', undefined);
            return res.status(400).send(errorResponse);
        }
        if (found !== null) {
            const errorResponse = ResponseUtil.getErrorResponse('Please fill in the box with english lanauage.', undefined);
            return res.status(400).send(errorResponse);
        } if (mode === PROVIDER.EMAIL) {

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
                user.isSyncPage = undefined;
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
                user.mergeEM = true;
                user.subjectAttention = undefined;
                user.province = users.province;
                user.ua = undefined;
                user.uaVersion = undefined;
                user.tos = undefined;
                user.tosVersion = undefined;
                user.subscribeEmail = true;
                user.subscribeNoti = true;
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
                    result = await this.userService.cleanUserField(result);

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
                userData = await this.userService.cleanUserField(resultUser);
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
                user.isSyncPage = undefined;
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
                user.mergeFB = true;
                user.subjectAttention = undefined;
                user.province = users.province;
                user.ua = undefined;
                user.uaVersion = undefined;
                user.tos = undefined;
                user.tosVersion = undefined;
                user.subscribeEmail = true;
                user.subscribeNoti = true;

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

                    userData = await this.userService.cleanUserField(resultData);
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
            const resultUser: User = await this.userService.findOne({ where: { email: users.email.toString() } });
            const appleUserId = users;
            if (appleUserId.userId === null || appleUserId.userId === undefined) {
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
                    return res.status(400).send(errorResponse);
                }
                userData = await this.userService.cleanUserField(resultUser);
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
                    const result: any = { token: appleUserId.authToken, user: authIdCreate };
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
                user.username = registerEmail;
                user.password = registerPassword;
                user.email = registerEmail;
                user.isSyncPage = undefined;
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
                user.mergeAP = true;
                user.subjectAttention = undefined;
                user.province = users.province;
                user.ua = undefined;
                user.uaVersion = undefined;
                user.tos = undefined;
                user.tosVersion = undefined;
                user.subscribeEmail = true;
                user.subscribeNoti = true;

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

                    userData = await this.userService.cleanUserField(resultData);
                    try {
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
                    }
                    catch (err) {
                        console.log('Error na', err);
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
                        const result: any = { token: appleUserId.idToken, user: resultData };
                        const successResponse = ResponseUtil.getSuccessResponse('Register With APPLE Success', result);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getSuccessResponse('Register APPLE Failed', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            }
        } else if (mode === PROVIDER.GOOGLE) {
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
                    userData = await this.userService.cleanUserField(resultUser);
                    const authenId = new AuthenticationId();
                    authenId.user = resultUser.id;
                    authenId.lastAuthenTime = moment().toDate();
                    authenId.providerUserId = checkIdToken.userId;
                    authenId.providerName = PROVIDER.GOOGLE;
                    authenId.storedCredentials = authToken;
                    authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                    authIdCreate = await this.authenticationIdService.create(authenId);
                } else {
                    userData = await this.userService.cleanUserField(resultUser);
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
                user.isSyncPage = undefined;
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
                user.mergeGG = true;
                user.subjectAttention = undefined;
                user.province = users.province;
                user.ua = undefined;
                user.uaVersion = undefined;
                user.tos = undefined;
                user.tosVersion = undefined;
                user.subscribeEmail = true;
                user.subscribeNoti = true;

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
                    userData = await this.userService.cleanUserField(resultData);
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
                            authenId.providerUserId = checkIdToken.userId;
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
                userData = await this.userService.cleanUserField(resultUser);
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
                user.isSyncPage = undefined;
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
                user.mergeTW = true;
                user.subjectAttention = undefined;
                user.province = users.province;
                user.ua = undefined;
                user.uaVersion = undefined;
                user.tos = undefined;
                user.tosVersion = undefined;
                user.subscribeEmail = true;
                user.subscribeNoti = true;

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

                    userData = await this.userService.cleanUserField(resultData);
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
        // const ipAddress = req.clientIp;
        // IpAddressEvent.emit(process.env.EVENT_LISTENNER, {ipAddress});
        const mode = req.headers.mode;
        const modHeaders = req.headers.mod_headers;
        const loginUsername = loginParam.username;
        const loginPassword = loginParam.password;
        let loginToken: any;
        let loginUser: any;
        if (mode === PROVIDER.EMAIL) {
            const userName: string = loginUsername.toLocaleLowerCase();
            const tokenFCMEm = req.body.tokenFCM;
            const deviceNameEm = req.body.deviceName;
            const userLogin: any = await this.userService.findOne({ where: { username: userName } });
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
                            const findFcmToken = await this.deviceToken.findOne({ deviceName: deviceNameEm, userId: userObjId });
                            if (findFcmToken) {
                                const queryFcm = { deviceName: deviceNameEm, userId: userObjId };
                                const newValuesFcm = { $set: { token: tokenFCMEm } };
                                await this.deviceToken.updateToken(queryFcm, newValuesFcm);
                            } else {
                                await this.deviceToken.createDeviceToken({ deviceName: deviceNameEm, token: tokenFCMEm ? tokenFCMEm : null, userId: userObjId });
                            }
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
            const tokenFCM_AP = req.body.tokenFCM;
            const deviceAP = req.body.deviceName;
            const appleClient = await this.authenticationIdService.findOne({ where: { providerUserId: appleId.userId, providerName: PROVIDER.APPLE } });
            if (appleClient === null || appleClient === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            } else {
                const currentDateTime = moment().toDate();
                const userExrTime = await this.getUserLoginExpireTime();
                const authTime = currentDateTime;
                const expirationDateAp = moment().add(userExrTime, 'days').toDate();
                const query = { id: appleId.userId, providerName: PROVIDER.APPLE };
                const newValue = { $set: { lastAuthenTime: authTime, storedCredentials: appleId.idToken, expirationDate: expirationDateAp } };
                const update_Apple = await this.authenticationIdService.update(query, newValue);
                if (update_Apple) {
                    const updatedAuth = await this.authenticationIdService.findOne({ where: { providerUserId: appleId.userId } });
                    const findFcmToken = await this.deviceToken.findOne({ deviceName: deviceAP, userId: updatedAuth.user });
                    if (findFcmToken) {
                        const queryFcm = { deviceName: deviceAP, userId: updatedAuth.user };
                        const newValuesFcm = { $set: { token: tokenFCM_AP } };
                        await this.deviceToken.updateToken(queryFcm, newValuesFcm);
                    } else {
                        await this.deviceToken.createDeviceToken({ deviceName: deviceAP, token: tokenFCM_AP ? tokenFCM_AP : null, userId: updatedAuth.user });
                    }
                    loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                    loginToken = jwt.sign({ token: updatedAuth.storedCredentials, userId: loginUser.id }, env.SECRET_KEY);
                }
            }
        }

        else if (mode === PROVIDER.FACEBOOK) {
            const tokenFcmFB = req.body.tokenFCM;
            const deviceFB = req.body.deviceName;
            // find email then -> authentication -> mode FB
            let fbUser = undefined;
            try {
                fbUser = await this.facebookService.getFacebookUserFromToken(loginParam.token);
            } catch (err) {
                console.log(err);
            }

            if (fbUser === null || fbUser === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            } else {
                const userExrTime = await this.getUserLoginExpireTime();
                const currentDateTime = moment().toDate();
                const authTime = currentDateTime;
                const expirationDate = moment().add(userExrTime, 'days').toDate();
                const facebookUserId = fbUser.authId.providerUserId;
                const query = { providerUserId: facebookUserId, providerName: PROVIDER.FACEBOOK };
                const newValue = { $set: { providerUserId: facebookUserId, lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, storedCredentials: loginParam.token, expirationDate } };
                const updateAuth = await this.authenticationIdService.update(query, newValue);
                if (updateAuth) {
                    const updatedAuth = await this.authenticationIdService.findOne({ where: query });
                    const findFcmToken = await this.deviceToken.findOne({ deviceName: deviceFB, userId: updatedAuth.user });
                    if (findFcmToken) {
                        const queryFcm = { deviceName: deviceFB, userId: updatedAuth.user };
                        const newValuesFcm = { $set: { token: tokenFcmFB } };
                        await this.deviceToken.updateToken(queryFcm, newValuesFcm);
                    } else {
                        await this.deviceToken.createDeviceToken({ deviceName: deviceFB, token: tokenFcmFB, userId: updatedAuth.user });
                    }
                    loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                    loginToken = updatedAuth.storedCredentials;
                    loginToken = jwt.sign({ token: loginToken }, env.SECRET_KEY);
                }
            }
        } else if (mode === PROVIDER.GOOGLE) {
            const idToken = loginParam.idToken;
            const authToken = loginParam.authToken;
            const checkIdToken = await this.googleService.verifyIdToken(idToken, modHeaders);
            const tokenFcmGG = req.body.tokenFCM_GG;
            const deviceGG = req.body.deviceName;
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
                    const findFcmToken = await this.deviceToken.findOne({ deviceName: deviceGG, userId: updatedAuthGG.user });
                    if (findFcmToken) {
                        const queryFcm = { deviceName: deviceGG, userId: updatedAuthGG.user };
                        const newValuesFcm = { $set: { token: tokenFcmGG } };
                        await this.deviceToken.updateToken(queryFcm, newValuesFcm);
                    } else {
                        await this.deviceToken.createDeviceToken({ deviceName: deviceGG, token: tokenFcmGG ? tokenFcmGG : null, userId: updatedAuthGG.user });
                    }
                    loginUser = await this.userService.findOne({ where: { _id: updatedAuthGG.user } });
                    loginToken = updatedAuthGG.storedCredentials;
                    loginToken = jwt.sign({ token: loginToken, userId: checkIdToken.userId }, env.SECRET_KEY);
                }
            }
        }
        else if (mode === PROVIDER.TWITTER) {
            const twitterOauthToken = loginParam.twitterOauthToken;
            const twitterOauthTokenSecret = loginParam.twitterOauthTokenSecret;
            const tokenFcmGG = req.body.tokenFCM;
            const deviceGG = req.body.deviceName;
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
                    const findFcmToken = await this.deviceToken.findOne({ deviceName: deviceGG, userId: updatedAuth.user });
                    if (findFcmToken) {
                        const queryFcm = { deviceName: deviceGG, userId: updatedAuth.user };
                        const newValuesFcm = { $set: { token: tokenFcmGG } };
                        await this.deviceToken.updateToken(queryFcm, newValuesFcm);
                    } else {
                        await this.deviceToken.createDeviceToken({ deviceName: deviceGG, token: tokenFcmGG ? tokenFcmGG : null, userId: updatedAuth.user });
                    }
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
    @Post('/check_email_user')
    public async checkEmail(@Body({ validate: true }) users: CheckUser, @Res() res: any, @Req() req: any): Promise<any> {
        // const ipAddress = req.clientIp;
        // IpAddressEvent.emit(process.env.EVENT_LISTENNER, {ipAddress});
        const mode = req.headers.mode;
        const modHeaders = req.headers.mod_headers;
        const loginPassword = users.password;
        let loginToken: any;
        let loginUser: any;
        const userEmail: string = users.email ? users.email.toLowerCase() : '';
        let authen = undefined;
        if (mode === PROVIDER.EMAIL) {
            const modeAuthen = [];
            const data: User = await this.userService.findOne({ where: { username: userEmail } });

            if (data === undefined) {
                const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                return res.status(400).send(errorUserNameResponse);
            }

            const checkAuth = await this.authenticationIdService.findOne({ where: { user: ObjectID(String(data.id)), providerName: mode } });

            const AllAuthen = await this.authenticationIdService.find({ user: data.id });
            // ONE-HOT ENCODING
            // [1,0,0,0,0]
            // [0,1,0,0,0]
            // authen.providerName === PROVIDER.EMAIL && authen.providerName === PROVIDER.FACEBOOK && authen.providerName === PROVIDER.GOOGLE && authen.providerName === PROVIDER.TWITTER && authen.providerName === PROVIDER.APPLE 
            for (authen of AllAuthen) {
                if (authen.providerName === 'EMAIL') {
                    modeAuthen.push(authen.providerName);
                } else if (authen.providerName === 'FACEBOOK') {
                    modeAuthen.push(authen.providerName);
                } else if (authen.providerName === 'TWIITER') {
                    modeAuthen.push(authen.providerName);
                } else if (authen.providerName === 'GOOGLE') {
                    modeAuthen.push(authen.providerName);
                } else if (authen.providerName === 'APPLE') {
                    modeAuthen.push(authen.providerName);
                }
            }
            if (data.banned === true) {
                const errorResponse = ResponseUtil.getErrorResponse('User Banned', undefined);
                return res.status(400).send(errorResponse);
            }
            if (data && checkAuth === undefined) {
                const user: User = new User();
                user.username = data.username;
                user.email = data.email;
                user.uniqueId = data.uniqueId;
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.imageURL = data.imageURL;
                user.coverURL = data.coverURL;
                user.coverPosition = 0;
                user.displayName = data.displayName;
                user.birthdate = new Date(data.birthdate);
                user.isAdmin = data.isAdmin;
                user.isSubAdmin = data.isSubAdmin;
                user.banned = data.banned;
                if (user) {
                    if (await User.comparePassword(data, loginPassword)) {
                        const successResponse = ResponseUtil.getSuccessResponseAuth('This Email already exists', user, modeAuthen);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getErrorResponse('Invalid Password', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            } else if (data && checkAuth !== undefined) {
                if (data) {
                    const userObjId = new ObjectID(data.id);
                    if (loginPassword === null && loginPassword === undefined && loginPassword === '') {
                        const errorResponse = ResponseUtil.getErrorResponse('Invalid password', undefined);
                        return res.status(400).send(errorResponse);
                    }
                    if (await User.comparePassword(data, loginPassword)) {
                        // create a token
                        const token = jwt.sign({ id: userObjId }, env.SECRET_KEY);
                        loginUser = data;

                        loginToken = token;
                        loginUser = await this.userService.cleanUserField(loginUser);
                        const result = { token: loginToken, user: loginUser };

                        const successResponse = ResponseUtil.getSuccessResponse('Loggedin successful', result);
                        return res.status(200).send(successResponse);
                    } else {
                        const errorResponse = ResponseUtil.getErrorResponse('Invalid Password', undefined);
                        return res.status(400).send(errorResponse);
                    }
                } else {
                    const errorResponse: any = { status: 0, message: 'Invalid username' };
                    return res.status(400).send(errorResponse);
                }
            }
            else {
                const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                return res.status(400).send(errorResponse);
            }
        } else if (mode === PROVIDER.FACEBOOK) {
            let authenFB = undefined;
            const stackAuth = [];
            const pic = [];
            // userEmail
            // fbUser (userId,email)
            const fbUser = await this.facebookService.fetchFacebook(users.token);
            if (fbUser.id !== undefined && fbUser.email !== undefined) {
                const findUserFb = await this.userService.findOne({ email: fbUser.email });
                const findAuthenFb = await this.authenticationIdService.findOne({ providerUserId: fbUser.id, providerName: PROVIDER.FACEBOOK });
                if (findUserFb === undefined && findAuthenFb === undefined) {
                    const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                    return res.status(400).send(errorResponse);
                }
                if (findUserFb !== undefined && findAuthenFb === undefined) {
                    const authenAll = await this.authenticationIdService.find({ where: { user: findUserFb.id } });
                    for (authenFB of authenAll) {
                        if (authenFB.providerName === 'EMAIL') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'FACEBOOK') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'TWIITER') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'GOOGLE') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'APPLE') {
                            stackAuth.push(authenFB.providerName);
                        }
                    }
                    const user: User = new User();
                    user.username = findUserFb.username;
                    user.email = findUserFb.email;
                    user.uniqueId = findUserFb.uniqueId;
                    user.firstName = findUserFb.firstName;
                    user.lastName = findUserFb.lastName;
                    user.imageURL = findUserFb.imageURL;
                    user.coverURL = findUserFb.coverURL;
                    user.coverPosition = 0;
                    user.displayName = findUserFb.displayName;
                    user.birthdate = new Date(findUserFb.birthdate);
                    user.isAdmin = findUserFb.isAdmin;
                    user.isSubAdmin = findUserFb.isSubAdmin;
                    user.banned = findUserFb.banned;
                    const successResponse = ResponseUtil.getSuccessResponseAuth('This Email already exists', user, stackAuth, pic);
                    return res.status(200).send(successResponse);
                } else if (findAuthenFb !== undefined && findUserFb !== undefined) {
                    // find email then -> authentication -> mode FB

                    if (findUserFb === null && findAuthenFb === undefined) {
                        const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                        return res.status(400).send(errorUserNameResponse);
                    } else {
                        const userExrTime = await this.getUserLoginExpireTime();
                        const currentDateTime = moment().toDate();
                        const authTime = currentDateTime;
                        const expirationDate = moment().add(userExrTime, 'days').toDate();
                        const facebookUserId = findAuthenFb.providerUserId;
                        const query = { providerUserId: facebookUserId, providerName: PROVIDER.FACEBOOK };
                        const newValue = { $set: { providerUserId: facebookUserId, lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, storedCredentials: users.token, expirationDate } };
                        const updateAuth = await this.authenticationIdService.update(query, newValue);
                        if (updateAuth) {
                            const updatedAuth = await this.authenticationIdService.findOne({ providerUserId: findAuthenFb.providerUserId, providerName: PROVIDER.FACEBOOK });
                            loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                            loginToken = updatedAuth.storedCredentials;
                            loginToken = jwt.sign({ token: loginToken }, env.SECRET_KEY);
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
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else if (fbUser.id !== undefined && fbUser.email === undefined) {
                let findUserFb = undefined;
                if (users.email === null && users.email === undefined && users.email === '') {
                    const errorResponse = ResponseUtil.getErrorResponse('We need your email to identify.', undefined);
                    return res.status(400).send(errorResponse);
                }
                const findAuthenFb = await this.authenticationIdService.findOne({ providerUserId: fbUser.id, providerName: PROVIDER.FACEBOOK });
                if (findAuthenFb !== undefined) {
                    findUserFb = await this.userService.findOne({ _id: findAuthenFb.user });
                } else if (findAuthenFb === undefined) {
                    findUserFb = await this.userService.findOne({ email: userEmail });
                }
                if (findUserFb === undefined && findAuthenFb === undefined) {
                    const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                    return res.status(400).send(errorResponse);
                }

                if (findUserFb !== undefined && findAuthenFb === undefined) {
                    const authenAll = await this.authenticationIdService.find({ where: { user: findUserFb.id } });
                    for (authenFB of authenAll) {
                        if (authenFB.providerName === 'EMAIL') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'FACEBOOK') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'TWIITER') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'GOOGLE') {
                            stackAuth.push(authenFB.providerName);
                        } else if (authenFB.providerName === 'APPLE') {
                            stackAuth.push(authenFB.providerName);
                        }
                    }
                    const user: User = new User();
                    user.username = findUserFb.username;
                    user.email = findUserFb.email;
                    user.uniqueId = findUserFb.uniqueId;
                    user.firstName = findUserFb.firstName;
                    user.lastName = findUserFb.lastName;
                    user.imageURL = findUserFb.imageURL;
                    user.coverURL = findUserFb.coverURL;
                    user.coverPosition = 0;
                    user.displayName = findUserFb.displayName;
                    user.birthdate = new Date(findUserFb.birthdate);
                    user.isAdmin = findUserFb.isAdmin;
                    user.isSubAdmin = findUserFb.isSubAdmin;
                    user.banned = findUserFb.banned;
                    const successResponse = ResponseUtil.getSuccessResponseAuth('This Email already exists', user, stackAuth, pic);
                    return res.status(200).send(successResponse);
                } else if (findAuthenFb !== undefined && findUserFb !== undefined) {
                    // find email then -> authentication -> mode FB
                    const userExrTime = await this.getUserLoginExpireTime();
                    const currentDateTime = moment().toDate();
                    const authTime = currentDateTime;
                    const expirationDate = moment().add(userExrTime, 'days').toDate();
                    const facebookUserId = findAuthenFb.providerUserId;
                    const query = { providerUserId: facebookUserId, providerName: PROVIDER.FACEBOOK };
                    const newValue = { $set: { providerUserId: facebookUserId, lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, storedCredentials: users.token, expirationDate } };
                    const updateAuth = await this.authenticationIdService.update(query, newValue);
                    if (updateAuth) {
                        const updatedAuth = await this.authenticationIdService.findOne({ providerUserId: findAuthenFb.providerUserId, providerName: PROVIDER.FACEBOOK });
                        loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                        loginToken = updatedAuth.storedCredentials;
                        loginToken = jwt.sign({ token: loginToken }, env.SECRET_KEY);
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
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Cannot encrypt token.', undefined);
                return res.status(400).send(errorResponse);
            }

        } else if (mode === PROVIDER.APPLE) {
            let userApple = undefined;
            let appleClient = undefined;
            const appleId: any = req.body.apple.result.user;
            if (users.email === undefined) {
                appleClient = await this.authenticationIdService.findOne({ where: { providerUserId: appleId.userId, providerName: PROVIDER.APPLE } });
                if (appleClient === undefined) {
                    const errorResponse = ResponseUtil.getErrorResponseApple('Cannot find your user Please Provide the email to check again.', undefined);
                    return res.status(400).send(errorResponse);
                }
                userApple = await this.userService.findOne({ where: { _id: appleClient.user } });

            } else {
                userApple = await this.userService.findOne({ where: { username: users.email.toLowerCase() } });
                if (userApple === undefined) {
                    const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                    return res.status(400).send(errorUserNameResponse);
                }
                if (userApple.banned === true) {
                    const errorResponse = ResponseUtil.getErrorResponse('User Banned', undefined);
                    return res.status(400).send(errorResponse);
                }
                appleClient = await this.authenticationIdService.findOne({ where: { user: userApple.id, providerName: PROVIDER.APPLE } });
            }
            // authen.providerName === PROVIDER.EMAIL && authen.providerName === PROVIDER.FACEBOOK && authen.providerName === PROVIDER.GOOGLE && authen.providerName === PROVIDER.TWITTER && authen.providerName === PROVIDER.APPLE 
            if (userApple !== undefined && appleClient === undefined) {
                const AllAuthen = await this.authenticationIdService.find({ user: userApple.id });
                const stackAuth = [];
                const user: User = new User();
                user.username = userApple.username;
                user.email = userApple.email;
                user.uniqueId = userApple.uniqueId;
                user.firstName = userApple.firstName;
                user.lastName = userApple.lastName;
                user.imageURL = userApple.imageURL;
                user.coverURL = userApple.coverURL;
                user.coverPosition = 0;
                user.displayName = userApple.displayName;
                user.birthdate = new Date(userApple.birthdate);
                user.isAdmin = userApple.isAdmin;
                user.isSubAdmin = userApple.isSubAdmin;
                user.banned = userApple.banned;
                for (const authens of AllAuthen) {
                    if (authens.providerName === 'EMAIL') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'FACEBOOK') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'TWIITER') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'GOOGLE') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'APPLE') {
                        stackAuth.push(authens.providerName);
                    }
                }
                const successResponse = ResponseUtil.getSuccessResponseAuth('This Email already exists', user, stackAuth);
                return res.status(200).send(successResponse);
            } else if (userApple !== undefined && appleClient !== undefined) {
                if (appleClient === null || appleClient === undefined) {
                    const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'User was not found.' };
                    return res.status(400).send(errorUserNameResponse);
                } else {
                    const userExrTime = await this.getUserLoginExpireTime();
                    const currentDateTime = moment().toDate();
                    const authTime = currentDateTime;
                    const expirationDateAP = moment().add(userExrTime, 'days').toDate();
                    const query = { providerUserId: appleId.userId, providerName: PROVIDER.APPLE };
                    const newValue = { $set: { lastAuthenTime: authTime, storedCredentials: appleId.idToken, expirationDate: expirationDateAP, properties: { tokenSign: appleId.accessToken, signIn: currentDateTime } } };
                    const update_Apple = await this.authenticationIdService.update(query, newValue);
                    if (update_Apple) {
                        const updatedAuth = await this.authenticationIdService.findOne({ where: { providerUserId: appleId.userId } });
                        loginUser = await this.userService.findOne({ where: { _id: ObjectID(updatedAuth.user) } });
                        loginToken = jwt.sign({ token: updatedAuth.storedCredentials, userId: loginUser.id }, env.SECRET_KEY);
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
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                return res.status(400).send(errorResponse);
            }
        } else if (mode === PROVIDER.GOOGLE) {
            const idToken = users.idToken;
            const authToken = users.authToken;
            const checkIdToken = await this.googleService.verifyIdToken(idToken, modHeaders);
            const userGG = await this.userService.findOne({ email: checkIdToken.email });
            const pic = [];
            if (checkIdToken === undefined) {
                const errorResponse: any = { status: 0, message: 'Invalid Token.' };
                return res.status(400).send(errorResponse);
            }

            const authenGG = await this.authenticationIdService.findOne({ providerUserId: checkIdToken.userId, providerName: PROVIDER.GOOGLE });
            if (userGG !== undefined && authenGG === undefined) {
                const stackAuth = [];
                pic.push(checkIdToken.imageURL);
                const AllAuthen = await this.authenticationIdService.find({ user: ObjectID(String(userGG.id)) });
                const user: User = new User();
                user.username = userGG.username;
                user.email = userGG.email;
                user.uniqueId = userGG.uniqueId;
                user.firstName = userGG.firstName;
                user.lastName = userGG.lastName;
                user.imageURL = userGG.imageURL;
                user.coverURL = userGG.coverURL;
                user.coverPosition = 0;
                user.displayName = userGG.displayName;
                user.birthdate = new Date(userGG.birthdate);
                user.isAdmin = userGG.isAdmin;
                user.isSubAdmin = userGG.isSubAdmin;
                user.banned = userGG.banned;
                for (const authens of AllAuthen) {
                    if (authens.providerName === 'EMAIL') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'FACEBOOK') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'TWIITER') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'GOOGLE') {
                        stackAuth.push(authens.providerName);
                    } else if (authens.providerName === 'APPLE') {
                        stackAuth.push(authens.providerName);
                    }
                }
                const successResponse = ResponseUtil.getSuccessResponseAuth('This Email already exists', user, stackAuth, pic);
                return res.status(200).send(successResponse);
            } else if (userGG !== undefined && authenGG !== undefined) {

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
                        loginUser = await this.userService.findOne({ where: { _id: updatedAuthGG.user } });
                        loginToken = updatedAuthGG.storedCredentials;
                        loginToken = jwt.sign({ token: loginToken, userId: checkIdToken.userId }, env.SECRET_KEY);
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
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined);
                return res.status(400).send(errorResponse);
            }
        } else if (mode === PROVIDER.TWITTER) {
            const twitterOauthToken = users.twitterOauthToken;
            const twitterOauthTokenSecret = users.twitterOauthTokenSecret;
            if (twitterOauthToken === undefined || twitterOauthToken === '' || twitterOauthToken === null) {
                const errorResponse: any = { status: 0, message: 'twitterOauthToken was required.' };
                return res.status(400).send(errorResponse);
            }

            if (twitterOauthTokenSecret === undefined || twitterOauthTokenSecret === '' || twitterOauthTokenSecret === null) {
                const errorResponse: any = { status: 0, message: 'twitterOauthTokenSecret was required.' };
                return res.status(400).send(errorResponse);
            }

            let twitterUserId = undefined;
            let obJectTw = undefined;
            try {
                const verifyObject = await this.twitterService.verifyCredentials(twitterOauthToken, twitterOauthTokenSecret);
                obJectTw = verifyObject;
                twitterUserId = verifyObject.id_str;
            } catch (ex) {
                const errorResponse: any = { status: 0, message: ex };
                return res.status(400).send(errorResponse);
            }
            if (twitterUserId === undefined) {
                const errorResponse: any = { status: 0, message: 'Invalid Token.' };
                return res.status(400).send(errorResponse);
            }
            let userTw = undefined;
            const authenTw = await this.authenticationIdService.findOne({ providerUserId: twitterUserId, providerName: PROVIDER.TWITTER });
            if (userEmail !== undefined && authenTw !== undefined) {
                userTw = await this.userService.findOne({ _id: authenTw.user });
            } else {
                userTw = await this.userService.findOne({ email: userEmail });
            }
            if (authenTw === undefined && userTw === undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('Not found user.', undefined);
                return res.status(400).send(errorResponse);
            }
            if (authenTw === undefined && userTw !== undefined) {
                let authenTws = undefined;
                const stackAuth = [];
                const pic = [];
                const findAuthenTw = await this.authenticationIdService.findOne({ providerUserId: twitterUserId, providerName: PROVIDER.TWITTER });
                if (userTw !== undefined && findAuthenTw === undefined) {
                    const authenAll = await this.authenticationIdService.find({ where: { user: userTw.id } });
                    for (authenTws of authenAll) {
                        if (authenTws.providerName === 'EMAIL') {
                            stackAuth.push(authenTws.providerName);
                        } else if (authenTws.providerName === 'FACEBOOK') {
                            stackAuth.push(authenTws.providerName);
                        } else if (authenTws.providerName === 'TWIITER') {
                            stackAuth.push(authenTws.providerName);
                        } else if (authenTws.providerName === 'GOOGLE') {
                            stackAuth.push(authenTws.providerName);
                        } else if (authenTws.authenTws === 'APPLE') {
                            stackAuth.push(authenTws.providerName);
                        }
                    }
                    const user: User = new User();
                    user.username = userTw.username;
                    user.email = userTw.email;
                    user.uniqueId = userTw.uniqueId;
                    user.firstName = userTw.firstName;
                    user.lastName = userTw.lastName;
                    user.imageURL = userTw.imageURL;
                    user.coverURL = userTw.coverURL;
                    user.coverPosition = 0;
                    user.displayName = userTw.displayName;
                    user.birthdate = new Date(userTw.birthdate);
                    user.isAdmin = userTw.isAdmin;
                    user.isSubAdmin = userTw.isSubAdmin;
                    user.banned = userTw.banned;
                    const successResponse = ResponseUtil.getSuccessResponseAuth('This Email already exists', user, stackAuth, pic);
                    return res.status(200).send(successResponse);
                }
            } else if (authenTw !== undefined && userTw !== undefined) {
                if (authenTw === null || authenTw === undefined) {
                    const errorUserNameResponse: any = { status: 0, code: 'E3000001', message: 'Twitter was not registed.' };
                    return res.status(400).send(errorUserNameResponse);
                } else {
                    const userExrTime = await this.getUserLoginExpireTime();
                    const currentDateTime = moment().toDate();
                    const authTime = currentDateTime;
                    const expirationDate = moment().add(userExrTime, 'days').toDate();
                    const query = { user: userTw.id };
                    const newValue = { $set: { lastAuthenTime: authTime, lastSuccessAuthenTime: authTime, expirationDate } };
                    const updateAuth = await this.authenticationIdService.update(query, newValue);

                    if (updateAuth) {
                        const updatedAuth = await this.authenticationIdService.findOne({ user: userTw.id });
                        // await this.deviceToken.createDeviceToken({deviceName,token:tokenFCM,userId:updatedAuth.user});
                        loginUser = await this.userService.findOne({ where: { _id: updatedAuth.user } });
                        loginToken = updatedAuth.storedCredentials;
                        loginToken = jwt.sign({ token: loginToken }, env.SECRET_KEY);
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
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('This Email not exists', undefined, obJectTw);
                return res.status(400).send(errorResponse);
            }
        }
    }
    // send otp
    @Post('/send_otp')
    public async sendOTP(@Body({ validate: true }) otpRequest: OtpRequest, @Res() res: any, @Req() req: any): Promise<any> {
        // const ipAddress = req.clientIp;
        // IpAddressEvent.emit(process.env.EVENT_LISTENNER, {ipAddress});
        const username = otpRequest.email;
        let saveOtp = undefined;
        const emailRes: string = username;
        const expirationDate = moment().add(1, 'minutes').toDate().getTime() / 1000;
        const minute = Math.floor(expirationDate);
        const expirationCompare = moment().add(5, 'minutes').toDate().getTime() / 1000;
        const momentCompare = Math.floor(expirationCompare);
        const user: User = await this.userService.findOne({ username: emailRes });
        const checkOtp = await this.otpService.findOne({ userId: ObjectID(user.id), email: user.email });
        if (checkOtp !== undefined && checkOtp.expiration > momentCompare) {
            await this.otpService.delete({ userId: ObjectID(user.id), email: user.email });
        }
        const minm = 100000;
        const maxm = 999999;
        const limitCount = await this.otpService.findOne({ where: { email: user.email } });
        let count = 1;

        const otpRandom = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
        if (limitCount === undefined) {
            const sendMailRes = await this.sendActivateOTP(user, emailRes, otpRandom, 'Send OTP');
            if (sendMailRes.status === 1) {
                saveOtp = await this.otpService.createOtp({ userId: user.id, email: emailRes, otp: otpRandom, limit: count, expiration: momentCompare });
            }
        }

        if (limitCount !== undefined && limitCount.limit <= 2) {
            count += limitCount.limit;
            const query = { email: emailRes };
            const newValues = { $set: { limit: count, otp: otpRandom } };
            const sendMailRes = await this.sendActivateOTP(user, emailRes, otpRandom, 'Send OTP');
            if (sendMailRes.status === 1) {
                await this.otpService.updateToken(query, newValues);
            }
        }

        if (saveOtp !== undefined && limitCount === undefined) {
            // const sendMailRes = await this.sendActivateOTP(user, emailRes, otpRandom, 'Send OTP');
            const successResponse = ResponseUtil.getSuccessOTP('The Otp have been send.', saveOtp.limit);
            return res.status(200).send(successResponse);
        } else if (limitCount !== undefined && limitCount.limit <= 2 && limitCount.expiration < momentCompare) {
            // const sendMailRes = await this.sendActivateOTP(user, emailRes, limitCount.otp, 'Send OTP');
            const successResponse = ResponseUtil.getSuccessOTP('The Otp have been send.', limitCount.limit);
            return res.status(200).send(successResponse);
        } else if (limitCount !== undefined && limitCount.limit === 3 && minute > limitCount.expiration) {
            await this.otpService.delete({ userId: ObjectID(user.id), email: user.email });
            return res.status(400).send(ResponseUtil.getErrorResponse('The Otp have been send more than 3 times, Please try add your OTP again', undefined));
        } else {
            return res.status(400).send(ResponseUtil.getErrorResponse('The Otp have been send more than 3 times, Please try add your OTP again', undefined));
        }
    }

    // checkOpt
    @Post('/check_otp')
    public async checkOTP(@Body({ validate: true }) otpRequest: OtpRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const username = otpRequest.email;
        const otp = otpRequest.otp;
        const mode = req.headers.mode;
        const emailRes: string = username.toLowerCase();
        const user: User = await this.userService.findOne({ email: emailRes });
        const otpFind = await this.otpService.findOne({ email: emailRes, userId: ObjectID(user.id) });
        const expirationDate = moment().add(5, 'minutes').toDate().getTime();
        const userExrTime = await this.getUserLoginExpireTime();
        let loginUser: any;
        if (user && mode === PROVIDER.EMAIL) {
            if (otp === otpFind.otp) {
                let authIdCreate = undefined;
                const token = jwt.sign({ id: user.id }, env.SECRET_KEY);
                const authenId = new AuthenticationId();
                authenId.user = user.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = user.id;
                authenId.providerName = PROVIDER.EMAIL;
                authenId.storedCredentials = token;
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                if (otpFind.expiration < expirationDate) {
                    authIdCreate = await this.authenticationIdService.create(authenId);
                    const queryMerge = { _id: user.id };
                    const newValues = { $set: { mergeEM: true } };
                    if (authIdCreate) {
                        const query = { email: emailRes };
                        await this.otpService.delete(query);
                        const successResponse = ResponseUtil.getSuccessResponseAuth('Loggedin successful', user.id, mode);
                        const update = await this.userService.update(queryMerge, newValues);
                        if (update) {
                            return res.status(200).send(successResponse);
                        } else {
                            const errorResponse = ResponseUtil.getErrorResponse('Merge not successful.', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('Merge not successful.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                return res.status(400).send(errorResponse);
            }

        } else if (user && mode === PROVIDER.FACEBOOK) {
            if (otp === otpFind.otp) {
                let authIdCreate = undefined;
                const properties = { fbAccessExpTime: otpRequest.facebook.fbexptime, fbSigned: otpRequest.facebook.fbsignedRequest };
                const userFB = await this.userService.findOne({ email: otpRequest.email });
                const authenId = new AuthenticationId();
                authenId.user = userFB.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = otpRequest.facebook.fbid;
                authenId.providerName = PROVIDER.FACEBOOK;
                authenId.storedCredentials = otpRequest.facebook.fbtoken;
                authenId.properties = properties;
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                if (otpFind.expiration < expirationDate) {
                    authIdCreate = await this.authenticationIdService.create(authenId);
                    const queryMerge = { _id: user.id };
                    const newValues = { $set: { mergeFB: true } };
                    if (authIdCreate) {
                        loginUser = await this.userService.findOne({ where: { _id: authIdCreate.user } });
                        const query = { email: emailRes };
                        await this.otpService.delete(query);
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

                        const successResponse = ResponseUtil.getSuccessResponseAuth('Loggedin successful', otpRequest.facebook.fbtoken, PROVIDER.FACEBOOK);
                        const update = await this.userService.update(queryMerge, newValues);
                        if (update) {
                            return res.status(200).send(successResponse);
                        } else {
                            const errorResponse = ResponseUtil.getErrorResponse('Merge not successful.', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else if (user && mode === PROVIDER.GOOGLE) {
            if (otp === otpFind.otp) {
                let authIdCreate = undefined;
                const modHeaders = req.headers.mod_headers;
                const checkIdToken = await this.googleService.verifyIdToken(otpRequest.idToken, modHeaders);
                const authenId = new AuthenticationId();
                authenId.user = user.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = checkIdToken.userId;
                authenId.providerName = PROVIDER.GOOGLE;
                authenId.storedCredentials = otpRequest.authToken;
                authenId.properties = { userId: checkIdToken.userId, token: otpRequest.idToken, expiraToken: checkIdToken.expire };
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                if (otpFind.expiration < expirationDate) {
                    authIdCreate = await this.authenticationIdService.create(authenId);
                    const queryMerge = { _id: user.id };
                    const newValues = { $set: { mergeGG: true } };
                    if (authIdCreate) {
                        loginUser = await this.userService.findOne({ where: { _id: authIdCreate.user } });
                        const query = { email: emailRes };
                        await this.otpService.delete(query);
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

                        const successResponse = ResponseUtil.getSuccessResponseAuth('Loggedin successful', otpRequest.idToken, PROVIDER.GOOGLE);
                        const update = await this.userService.update(queryMerge, newValues);
                        if (update) {
                            return res.status(200).send(successResponse);
                        } else {
                            const errorResponse = ResponseUtil.getErrorResponse('Merge not successful.', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else if (user && mode === PROVIDER.TWITTER) {
            if (otp === otpFind.otp) {
                let authIdCreate = undefined;
                const twitterOauthToken = otpRequest.twitterOauthToken;
                const twitterOauthTokenSecret = otpRequest.twitterOauthTokenSecret;

                let twitterUserId = undefined;
                try {
                    const verifyObject = await this.twitterService.verifyCredentials(twitterOauthToken, twitterOauthTokenSecret);
                    twitterUserId = verifyObject.id_str;
                } catch (ex) {
                    const errorResponse: any = { status: 0, message: ex };
                    return res.status(400).send(errorResponse);
                }
                const authenId = new AuthenticationId();
                authenId.user = user.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerUserId = twitterUserId;
                authenId.providerName = PROVIDER.TWITTER;
                authenId.storedCredentials = 'oauth_token=' + twitterOauthToken + '&oauth_token_secret=' + twitterOauthTokenSecret + '&user_id=' + twitterUserId;
                authenId.properties = {
                    userId: twitterUserId,
                    oauthToken: twitterOauthToken,
                    oauthTokenSecret: twitterOauthTokenSecret
                };
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                if (otpFind.expiration < expirationDate) {
                    authIdCreate = await this.authenticationIdService.create(authenId);
                    const queryMerge = { _id: user.id };
                    const newValues = { $set: { mergeTW: true } };
                    if (authIdCreate) {
                        loginUser = await this.userService.findOne({ where: { _id: authIdCreate.user } });
                        const query = { email: emailRes };
                        await this.otpService.delete(query);
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

                        const successResponse = ResponseUtil.getSuccessResponseAuth('Loggedin successful', otpRequest.idToken, PROVIDER.TWITTER);
                        const update = await this.userService.update(queryMerge, newValues);
                        if (update) {
                            return res.status(200).send(successResponse);
                        } else {
                            const errorResponse = ResponseUtil.getErrorResponse('Merge not successful.', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                return res.status(400).send(errorResponse);
            }
        } else if (user && mode === PROVIDER.APPLE) {
            if (otp === otpFind.otp) {
                let authIdCreate = undefined;
                const appleId: any = otpRequest.apple.result.user;
                const authenId = new AuthenticationId();
                authenId.user = user.id;
                authenId.lastAuthenTime = moment().toDate();
                authenId.providerName = PROVIDER.APPLE;
                authenId.providerUserId = appleId.userId;
                authenId.storedCredentials = appleId.idToken;
                authenId.expirationDate = moment().add(userExrTime, 'days').toDate();
                authenId.properties = {
                    properties: { tokenSign: appleId.accessToken }
                };

                if (otpFind.expiration < expirationDate) {
                    authIdCreate = await this.authenticationIdService.create(authenId);
                    const queryMerge = { _id: user.id };
                    const newValues = { $set: { mergeAP: true } };
                    if (authIdCreate) {
                        loginUser = await this.userService.findOne({ where: { _id: authIdCreate.user } });
                        const query = { email: emailRes };
                        await this.otpService.delete(query);
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

                        const successResponse = ResponseUtil.getSuccessResponseAuth('Loggedin successful', otpRequest.idToken, PROVIDER.APPLE);
                        const update = await this.userService.update(queryMerge, newValues);
                        if (update) {
                            return res.status(200).send(successResponse);
                        } else {
                            const errorResponse = ResponseUtil.getErrorResponse('Merge not successful.', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                } else {
                    const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('The OTP is not correct.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }
    @Post('/guest/users')
    public async guestUsers(@Body({ validate: true }) firebaseGuestUser: FirebaseGuestUser, @Res() res: any, @Req() req: any): Promise<any> {
        console.log('firebaseGuestUser', firebaseGuestUser);
        const tokenFCM = String(firebaseGuestUser.token);
        const checkTokenFcm = await this.deviceToken.find({ token: tokenFCM });
        if (checkTokenFcm.length > 0) {
            console.log('pass2 guest firebase user.');
            const errorResponse = ResponseUtil.getErrorResponse('Token already exist.', undefined);
            return res.status(400).send(errorResponse);
        }
        const result: DeviceToken = new DeviceToken();
        result.DeviceName = firebaseGuestUser.deviceName;
        result.token = tokenFCM;
        result.os = firebaseGuestUser.os;
        const createToken = await this.deviceToken.createDeviceToken(result);
        console.log('createToken', createToken);
        if (createToken) {
            console.log('pass1 guest firebase user.');
            const successResponse = ResponseUtil.getSuccessResponse('Create Guest User Firebase', createToken);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot Create Guest User Firebase.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    // autoSyncPage
    // undone
    @Post('/auto_sync')
    public async autoSyncPage(@Body({ validate: true }) autoSync: AutoSynz, @Res() res: any, @Req() req: any): Promise<any> {
        if (autoSync.autoSync === true) {
            // check mode
            if (req.headers.mode === PROVIDER.FACEBOOK) {
                try {
                    const getPage = await this.facebookService.getFBPageAccounts(autoSync.accessToken);
                    const successResponse = ResponseUtil.getSuccessResponse('Get Page Account Success.', getPage);
                    return res.status(200).send(successResponse);
                } catch (err) {
                    const errorResponse = ResponseUtil.getErrorResponse('Cannot Get Page Account.', undefined);
                    return res.status(400).send(errorResponse);
                }
            } else {
                try {
                    const getPage = await this.facebookService.getFBPageAccounts(autoSync.accessToken);
                    const successResponse = ResponseUtil.getSuccessResponse('Get Page Account Success.', getPage);
                    return res.status(200).send(successResponse);
                } catch (err) {
                    const errorResponse = ResponseUtil.getErrorResponse('Cannot Get Page Account.', undefined);
                    return res.status(400).send(errorResponse);
                }
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not Found User.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/forgot')
    public async forgotPassword(@Body({ validate: true }) forgotPassword: ForgotPasswordRequest, @Res() res: any, @Req() req: any): Promise<any> {
        // const ipAddress = req.clientIp;
        // IpAddressEvent.emit(process.env.EVENT_LISTENNER, {ipAddress});
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
                    updateUser = await this.userService.cleanUserField(updateUser);

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
     * 
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
                const findUser = await this.userService.findOne({ _id: ObjectID(fbUser.user.id) });
                user = findUser;
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
        } if (isMode !== undefined && isMode === 'AP') {
            try {
                const decryptToken: any = await jwt.verify(tokenParam, env.SECRET_KEY);
                if (decryptToken.token === undefined) {
                    const errorUserNameResponse: any = { status: 0, message: 'Token was not found.' };
                    return response.status(400).send(errorUserNameResponse);
                }
                const apUser = await this.authenticationIdService.findOne({ user: ObjectID(decryptToken.userId), providerName: PROVIDER.APPLE });
                const findUser = await this.userService.findOne({ _id: ObjectID(apUser.user) });
                user = findUser;
            } catch (ex: any) {
                const errorResponse: any = { status: 0, message: ex.message };
                return response.status(400).send(errorResponse);
            }
        }

        else {
            const pageUserId = await this.authService.decryptToken(tokenParam);
            if (pageUserId !== undefined) {
                user = await this.userService.findOne({ where: { _id: new ObjectID(pageUserId) } }, { signURL: true });
            }
        }
        if (user === undefined) {
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
            const authenId: AuthenticationId = await this.authenticationIdService.findOne({ where: { user: user.id, providerName: PROVIDER.FACEBOOK } });
            if (authenId === undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'User token invalid.' };
                return response.status(400).send(errorUserNameResponse);
            }
            const expiresAt = authenId.expirationDate;
            if (expiresAt !== undefined && expiresAt !== null && expiresAt.getTime() <= today.getTime()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
        } else if (isMode !== undefined && isMode === 'GG') {
            const authenId = await this.authenticationIdService.findOne({ user: user.id, providerName: PROVIDER.GOOGLE });
            if (authenId === undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'User token invalid.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
            const expiresAt = authenId.expirationDate;
            if (expiresAt !== undefined && expiresAt !== null && expiresAt.getTime() <= today.getTime()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
        } else if (isMode !== undefined && isMode === 'AP') {
            const authenId = await this.authenticationIdService.findOne({ user: user.id, providerName: PROVIDER.APPLE });
            if (authenId === undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'User token invalid.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
            const expiresAt = authenId.expirationDate;
            if (expiresAt !== undefined && expiresAt !== null && expiresAt.getTime() <= today.getTime()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
        } else if (isMode !== undefined && isMode === 'TW') {
            const authenId = await this.authenticationIdService.findOne({ user: user.id, providerName: PROVIDER.TWITTER });
            if (authenId === undefined) {
                const errorUserNameResponse: any = { status: 0, message: 'User token invalid.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
            const expiresAt = authenId.expirationDate;
            if (expiresAt !== undefined && expiresAt !== null && expiresAt.getTime() <= today.getTime()) {
                const errorUserNameResponse: any = { status: 0, message: 'User token expired.' };
                await this.deviceToken.delete({ userId: authenId.user });
                return response.status(400).send(errorUserNameResponse);
            }
        } else {
            // normal mode
            const authenId: AuthenticationId = await this.authenticationIdService.findOne({ where: { user: user.id, providerName: PROVIDER.EMAIL } });
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
        message += '<a href="' + process.env.APP_HOST + '"/forgotpassword?code=' + code + '&email=' + email + '"> Reset Password </a>';

        const sendMail = MAILService.passwordForgotMail(message, email, subject);

        if (sendMail) {
            return ResponseUtil.getSuccessResponse('Your Activation Code has been sent to your email inbox.', '');
        } else {
            return ResponseUtil.getErrorResponse('error in sending email', '');
        }
    }

    private async sendActivateOTP(user: User, email: string, code: any, subject: string): Promise<any> {
        let message = '<p> Hello ' + user.firstName + '</p>';
        message += '<p> Your Activation Code is: ' + code + '</p>';

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
