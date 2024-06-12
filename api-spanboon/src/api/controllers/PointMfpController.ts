import { JsonController, Res, Post, Req, Body, Authorized, Get, QueryParam, Param } from 'routing-controllers';
// import { UserService } from '../services/UserService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PointStatementRequest } from './requests/PointStatementRequest';
import { PointLimitOffsetRequest } from './requests/PointLimitOffsetRequest';
import { PointAccumulateRequest } from './requests/PointAccumulateRequest';
import { UsedCouponRequest } from './requests/UsedCouponRequest';
import { ObjectID } from 'mongodb';
import { PointStatementModel } from '../models/PointStatementModel';
import { POINT_TYPE } from '../../constants/PointType';
import { AccumulateModel } from '../models/AccumulatePointModel';
import { PointStatementService } from '../services/PointStatementService';
import { AccumulateService } from '../services/AccumulateService';
import { UserCouponModel } from '../models/UserCoupon';
import { UserCouponService } from '../services/UserCouponService';
import { PointEventService } from '../services/PointEventService';
import { ProductService } from '../services/ProductService';
import { UserService } from '../services/UserService';
import { ProductCategoryService } from '../services/ProductCategoryService';

// startVoteDatetime
@JsonController('/point')
export class PointMfpController {
    constructor(
        // private userService: UserService,
        private pointStatementService: PointStatementService,
        private accumulateService: AccumulateService,
        private userCouponService: UserCouponService,
        private pointEventService: PointEventService,
        private productService: ProductService,
        private productCategoryService: ProductCategoryService,
        private userService: UserService
    ) { }
    /*
    @Get('/event/:id')
    public async getPointEventContent(@Param('id') id: string,@Res() res: any, @Req() req: any): Promise<any> {
        const testNoti = await this.userService.findOne({email:req.body.email});
    }
    */
    // accumulatePoint
    @Post('/statement')
    @Authorized('user')
    public async pointStatement(
        @Body({ validate: true }) pointStatementRequest: PointStatementRequest,
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);

        if (userObjId === undefined || userObjId === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (pointStatementRequest.type === POINT_TYPE.RECEIVE) {
            const pointStateMentuser = await this.pointStatementService.findOne(
                {
                    pointEventId: new ObjectID(pointStatementRequest.pointEventId),
                    userId: userObjId
                });
            if (pointStateMentuser !== undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('You have had this point statement.', undefined);
                return res.status(400).send(errorResponse);

            }
        }

        if (pointStatementRequest.type === POINT_TYPE.REDEEM) {
            const productStatenebt = await this.pointStatementService.findOne(
                {
                    productId: new ObjectID(pointStatementRequest.productId),
                    userId: userObjId
                });
            if (productStatenebt !== undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('You have had this point statement.', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        if (pointStatementRequest.type === POINT_TYPE.RECEIVE &&
            pointStatementRequest.pointEventId === undefined &&
            pointStatementRequest.pointEventId === null &&
            pointStatementRequest.pointEventId === ''
        ) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the productEventId.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (pointStatementRequest.type === POINT_TYPE.REDEEM &&
            pointStatementRequest.productId === undefined &&
            pointStatementRequest.productId === null &&
            pointStatementRequest.productId === ''
        ) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the productID.', undefined);
            return res.status(400).send(errorResponse);
        }

        const productModel = new PointStatementModel();

        if (pointStatementRequest.type === POINT_TYPE.REDEEM) {
            productModel.title = pointStatementRequest.title;
            productModel.detail = pointStatementRequest.detail;
            productModel.point = pointStatementRequest.point;
            productModel.type = POINT_TYPE.REDEEM;
            productModel.userId = userObjId;
            productModel.productId = new ObjectID(pointStatementRequest.productId);
        }

        if (pointStatementRequest.type === POINT_TYPE.RECEIVE) {
            productModel.title = pointStatementRequest.title;
            productModel.detail = pointStatementRequest.detail;
            productModel.point = pointStatementRequest.point;
            productModel.type = POINT_TYPE.RECEIVE;
            productModel.userId = userObjId;
            productModel.pointEventId = new ObjectID(pointStatementRequest.pointEventId);
        }

        const create = await this.pointStatementService.create(productModel);
        if (create) {
            const accumulateCreate = await this.accumulateService.findOne({ userId: userObjId });
            if (accumulateCreate === undefined) {
                const accumulateModel = new AccumulateModel();
                accumulateModel.userId = userObjId;
                accumulateModel.accumulatePoint = pointStatementRequest.point;
                accumulateModel.usedPoint = 0;
                const createAccumulate = await this.accumulateService.create(accumulateModel);
                if (createAccumulate) {
                    const successResponse = ResponseUtil.getSuccessResponse('Point Statement is success.', create);
                    return res.status(200).send(successResponse);
                }
            }

            if (accumulateCreate !== undefined && pointStatementRequest.type === POINT_TYPE.RECEIVE) {
                const pointEventObjId = new ObjectID(pointStatementRequest.pointEventId);
                const pointEvent = await this.pointEventService.findOne({ _id: pointEventObjId });

                if (pointEvent.maximumLimit === pointEvent.receiver) {
                    const errorResponse = ResponseUtil.getErrorResponse('ProductEvent is out of store.', undefined);
                    const deletePointStatement = await this.pointStatementService.delete({ _id: create.id, userId: userObjId });
                    if (deletePointStatement) {
                        return res.status(400).send(errorResponse);
                    }
                }

                const updatePointEvent = await this.pointEventService.update({ _id: pointEvent.id }, { $set: { receiver: pointEvent.receiver + 1 } });
                if (updatePointEvent) {
                    const query = { userId: userObjId };
                    const newValues = {
                        $set:
                        {
                            accumulatePoint: accumulateCreate.accumulatePoint + pointStatementRequest.point
                        }
                    };
                    const update = await this.accumulateService.update(query, newValues);
                    if (update) {
                        const successResponse = ResponseUtil.getSuccessResponse('Creact Point Statement and Receiver point is success.', create);
                        return res.status(200).send(successResponse);
                    }
                }
            }
            if (accumulateCreate !== undefined && pointStatementRequest.type === POINT_TYPE.REDEEM) {
                if (accumulateCreate.accumulatePoint < pointStatementRequest.point) {
                    const errorResponse = ResponseUtil.getErrorResponse('The point you have got is not enough.', undefined);
                    const deletePointStatement = await this.pointStatementService.delete({ _id: create.id, userId: userObjId });
                    if (deletePointStatement) {
                        return res.status(400).send(errorResponse);
                    }
                }
                const today = new Date();

                const productPoint = await this.productService.findOne({ _id: new ObjectID(pointStatementRequest.productId) });

                if (today.getTime() > productPoint.expiringDate.getTime()) {
                    const errorResponse = ResponseUtil.getErrorResponse('The product had been expiring.', undefined);
                    return res.status(400).send(errorResponse);
                }

                if (productPoint.maximumLimit === productPoint.receiverCoupon) {
                    const errorResponse = ResponseUtil.getErrorResponse('The product is out of store.', undefined);
                    return res.status(400).send(errorResponse);
                }

                const updatePointEvent = await this.productService.update({ _id: productPoint.id }, { $set: { receiverCoupon: productPoint.receiverCoupon + 1 } });
                const query = { userId: userObjId };
                const newValues = {
                    $set:
                    {
                        accumulatePoint: accumulateCreate.accumulatePoint - pointStatementRequest.point,
                        usedPoint: accumulateCreate.usedPoint + pointStatementRequest.point
                    }
                };
                await this.accumulateService.update(query, newValues);
                if (updatePointEvent) {
                    const userCouponModel = new UserCouponModel();
                    userCouponModel.userId = userObjId;
                    userCouponModel.active = false;
                    userCouponModel.flag = false;
                    userCouponModel.productId = productPoint.id;
                    userCouponModel.expireDate = new Date(productPoint.expiringDate);
                    userCouponModel.activeDate = null;
                    const createUserCoupon = await this.userCouponService.create(userCouponModel);
                    if (createUserCoupon) {
                        const successResponse = ResponseUtil.getSuccessResponse('Redeem coupon is success.', create);
                        return res.status(200).send(successResponse);
                    }
                }
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/used/coupon')
    @Authorized('user')
    public async usedCoupon(
        @Body({ validate: true }) usedCouponRequest: UsedCouponRequest,
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const today = new Date();
        const productObj = await this.productService.findOne({ _id: new ObjectID(usedCouponRequest.productId) });
        const pointStatement = await this.pointStatementService.findOne({ type: 'USE_COUPON', userId: userObjId, productId: productObj.id });
        let query: any;
        let newValues: any;
        if (pointStatement !== undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been actived coupon.', undefined);
            return res.status(400).send(errorResponse);
        }
        const minute = today.getTime() + productObj.couponExpire * 60 * 60;

        if (today.getTime() > productObj.expiringDate.getTime()) {
            const errorResponse = ResponseUtil.getErrorResponse('The product had been expiring.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (productObj.maximumLimit === productObj.receiverCoupon) {
            const errorResponse = ResponseUtil.getErrorResponse('The product is out of store.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (productObj.couponExpire !== -1) {
            if (today.getTime() > minute) {
                const errorResponse = ResponseUtil.getErrorResponse('The product was expire.', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        const couponObj = await this.userCouponService.findOne(
            {
                _id: new ObjectID(usedCouponRequest.couponId),
                userId: userObjId,
                productId: productObj.id
            }
        );
        if (couponObj === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Coupon not found.', undefined);
            return res.status(400).send(errorResponse);
        }

        if (couponObj !== undefined && couponObj.productId === undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('Product id is undefined.', undefined);
            return res.status(400).send(errorResponse);
        }
        /*
        if (couponObj.active !== true) {
            const errorResponse = ResponseUtil.getErrorResponse('Coupon is not active.', undefined);
            return res.status(400).send(errorResponse);
        }
        if (couponObj.activeDate !== null) {
            const errorResponse = ResponseUtil.getErrorResponse('You have been used coupon.', undefined);
            return res.status(400).send(errorResponse);
        }
        */
        const productModel = new PointStatementModel();

        if (today.getTime() > couponObj.expireDate.getTime()) {
            query = {
                userId: userObjId,
                productId: productObj.id
            };
            newValues = {
                $set:
                {
                    active: false,
                    activeDate: today
                }
            };

            const updateCouponExpire = await this.userCouponService.update(query, newValues);
            const expireCoupon = await this.pointStatementService.findOne(
                {
                    userId: userObjId,
                    type: POINT_TYPE.COUPON_EXPIRED,
                    productId: productObj.id
                }
            );
            if (expireCoupon === undefined) {
                if (updateCouponExpire) {
                    productModel.title = 'The Coupon has expired.';
                    productModel.detail = null;
                    productModel.point = productObj.point;
                    productModel.type = POINT_TYPE.COUPON_EXPIRED;
                    productModel.productId = productObj.id;
                    productModel.userId = userObjId;
                    productModel.pointEventId = null;
                    const createExpire = await this.pointStatementService.create(productModel);
                    if (createExpire) {
                        const errorResponse = ResponseUtil.getErrorResponse('The Coupon has expired.', undefined);
                        return res.status(400).send(errorResponse);
                    }
                }
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('The Coupon has expired.', undefined);
                return res.status(400).send(errorResponse);
            }
        }

        query = {
            userId: userObjId,
            productId: productObj.id
        };
        newValues = {
            $set:
            {
                active: true,
                activeDate: today
            }
        };

        const updateUserCoupon = await this.userCouponService.update(query, newValues);
        if (updateUserCoupon) {
            productModel.title = productObj.title;
            productModel.detail = null;
            productModel.point = productObj.point;
            productModel.type = POINT_TYPE.USE_COUPON;
            productModel.productId = productObj.id;
            productModel.userId = userObjId;
            productModel.pointEventId = null;
            const create = await this.pointStatementService.create(productModel);
            if (create) {
                const successResponse = ResponseUtil.getSuccessResponse('Redeem coupon is success.', undefined);
                return res.status(200).send(successResponse);
            } else {
                const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    @Get('/event/:id')
    public async getEventObj(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.headers.userid);
        const eventObjId = new ObjectID(id);
        const pointEventObj = await this.pointEventService.findOne({ _id: eventObjId });
        const pointStatementCoupon = await this.pointStatementService.findOne(
            {
                type: 'RECEIVE_POINT',
                userId: userObjId, productId: pointEventObj.id
            }
        );
        const result: any = {};
        result.id = pointEventObj.id;
        result.createdDate = pointEventObj.createdDate;
        result.title = pointEventObj.title;
        result.detail = pointEventObj.detail;
        result.point = pointEventObj.point;
        result.maximumLimit = pointEventObj.maximumLimit;
        result.condition = pointEventObj.condition;
        result.userId = pointEventObj.userId;
        result.assetId = pointEventObj.assetId;
        result.coverPageURL = pointEventObj.coverPageURL;
        result.link = pointEventObj.link;
        result.s3CoverPageURL = pointEventObj.s3CoverPageURL;
        result.receiver = pointEventObj.receiver;
        result.eventActive = pointStatementCoupon !== undefined ? true : false; // รับแล้ว?
        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Get PointEventObj is success.', { 'pointEventDetail': result });
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found PointEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Get('/product/:id')
    public async getProductObj(@Param('id') id: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.headers.userid);
        const productObjId = new ObjectID(id);
        const productObj = await this.productService.findOne({ _id: productObjId });
        const pointStatementCoupon = await this.pointStatementService.findOne(
            {
                type: POINT_TYPE.USE_COUPON,
                userId: userObjId, productId: productObj.id
            }
        );
        const pointStatementRedeem = await this.pointStatementService.findOne(
            {
                type: POINT_TYPE.REDEEM,
                userId: userObjId,
                productId: productObj.id
            }
        );
        const result: any = {};
        result.id = productObj.id;
        result.createdDate = productObj.createdDate;
        result.categoryId = productObj.categoryId;
        result.title = productObj.title;
        result.detail = productObj.detail;
        result.point = productObj.point;
        result.maximumLimit = productObj.maximumLimit;
        result.condition = productObj.condition;
        result.userId = productObj.userId;
        result.assetId = productObj.assetId;
        result.coverPageURL = productObj.coverPageURL;
        result.s3CoverPageURL = productObj.s3CoverPageURL;
        result.categoryName = productObj.categoryName;
        result.expiringDate = productObj.expirationDate;
        result.activeDate = productObj.activeDate;
        result.receiverCoupon = productObj.receiverCoupon;
        result.couponExpire = productObj.couponExpire;
        result.useCoupon = pointStatementCoupon !== undefined ? true : false; // ใช้ coupon หรือยัง
        result.redeemCoupon = pointStatementRedeem !== undefined ? true : false; // มี coupon หรือไม่
        if (result) {
            const successResponse = ResponseUtil.getSuccessResponse('Get Product is success.', { 'productDetail': result });
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found Product.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/accumulate/search')
    @Authorized('user')
    public async getAccumulate(
        @Body({ validate: true }) pointAccumulateRequest: PointAccumulateRequest,
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const take = pointAccumulateRequest !== undefined ? pointAccumulateRequest.limit : 10;
        const skips = pointAccumulateRequest !== undefined ? pointAccumulateRequest.offset : 0;
        const accumulateAggr = await this.accumulateService.aggregate(
            [
                {
                    $match: {
                        userId: userObjId
                    }
                },
                {
                    '$addFields': {
                        'totalPoint': {
                            '$add': ['$accumulatePoint', '$usedPoint']
                        }
                    }
                },
                {
                    $project: {
                        createdDate: 1,
                        userId: 1,
                        accumulatePoint: 1,
                        usedPoint: 1,
                        totalPoint: 1
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'userId': '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$userId', '$userId']
                                    }
                                },
                            },
                            {
                                $match: {
                                    type: { $ne: POINT_TYPE.USE_COUPON },
                                }
                            },
                            {
                                $sort: {
                                    createdDate: -1
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            }
                        ],
                        as: 'totalPointStatement'
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'userId': '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$userId', '$userId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: { $nin: [POINT_TYPE.REDEEM, POINT_TYPE.ADMIN_REDUCE, POINT_TYPE.USE_COUPON] }
                                }
                            },
                            {
                                $sort: {
                                    createdDate: -1
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            }
                        ],
                        as: 'receivePointStatement'
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'userId': '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$userId', '$userId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: { $in: [POINT_TYPE.REDEEM, POINT_TYPE.ADMIN_REDUCE] }
                                }
                            },
                            {
                                $sort: {
                                    createdDate: -1
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            }
                        ],
                        as: 'redeemPointStatement'
                    }
                }
            ]
        );

        const userObj = await this.userService.aggregate(
            [
                {
                    $match: {
                        _id: userObjId
                    }
                },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        displayName: 1,
                        uniqueId: 1,
                        birthdate: 1,
                        imageURL: 1,
                        s3ImageURL: 1,
                    }
                },
                {
                    $lookup: {
                        from: 'AuthenticationId',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$user']
                                    }
                                }
                            },
                            {
                                $match: {
                                    providerName: 'MFP'
                                }
                            },
                            {
                                $project: {
                                    user: 1,
                                    providerName: 1,
                                    properties: 1,
                                    mfpSerial: 1
                                }
                            }
                        ],
                        as: 'authenticationId'
                    }
                },
                {
                    '$addFields': {
                        'userId': '$authenticationId.user',
                        'providerName': '$authenticationId.providerName',
                        'identificationNumber': '$authenticationId.properties.identification_number',
                        'mfpSerial': '$authenticationId.mfpSerial'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        displayName: 1,
                        uniqueId: 1,
                        birthdate: 1,
                        imageURL: 1,
                        s3ImageURL: 1,
                        userId: 1,
                        authenticationId: 1,
                        providerName: 1,
                        identificationNumber: 1,
                        mfpSerial: 1
                    }
                }
            ]
        );
        const decorateUser: {
            _id: ObjectID;
            firstName: string;
            lastName: string;
            displayName: string;
            uniqueId: string;
            birthdate: Date;
            imageURL: string;
            s3ImageURL: string;
            userId: ObjectID;
            providerName: string;
            identificationNumber: string;
            mfpSerial: number
        } = {
            '_id': userObj !== undefined && userObj.length > 0 ? userObj[0]._id : undefined,
            'firstName': userObj !== undefined && userObj.length > 0 ? userObj[0].firstName : undefined,
            'lastName': userObj !== undefined && userObj.length > 0 ? userObj[0].lastName : undefined,
            'displayName': userObj !== undefined && userObj.length > 0 ? userObj[0].displayName : undefined,
            'uniqueId': userObj !== undefined && userObj.length > 0 ? userObj[0].uniqueId : undefined,
            'birthdate': userObj !== undefined && userObj.length > 0 ? userObj[0].birthdate : undefined,
            'imageURL': userObj !== undefined && userObj.length > 0 ? userObj[0].imageURL : undefined,
            's3ImageURL': userObj !== undefined && userObj.length > 0 ? userObj[0].s3ImageURL : undefined,
            'userId': userObj !== undefined && userObj.length > 0 && userObj[0].authenticationId.length > 0 ? userObj[0].userId[0] : null,
            'providerName': userObj !== undefined && userObj.length > 0 && userObj[0].authenticationId.length > 0 ? userObj[0].providerName[0] : null,
            'identificationNumber': userObj !== undefined && userObj.length > 0 && userObj[0].authenticationId.length > 0 ? 'XXXX-' + userObj[0].identificationNumber[0].slice(4, userObj[0].identificationNumber[0].length) : null,
            'mfpSerial': userObj !== undefined && userObj.length > 0 && userObj[0].authenticationId.length > 0 ? userObj[0].mfpSerial[0] : null
        };

        const result = {
            'user': decorateUser !== undefined ? decorateUser : {},
            'accumulatePoint': accumulateAggr !== undefined ? accumulateAggr[0] : {},
        };
        const successResponse = ResponseUtil.getSuccessResponse('Get content points is success.', result);
        return res.status(200).send(successResponse);
    }

    @Post('/coupon/search')
    @Authorized('user')
    public async getUserCoupon(
        @Body({ validate: true }) pointLimitOffsetRequest: PointLimitOffsetRequest,
        @Res() res: any,
        @Req() req: any
    ): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const take = pointLimitOffsetRequest !== undefined ? pointLimitOffsetRequest.limit : 10;
        const skips = pointLimitOffsetRequest !== undefined ? pointLimitOffsetRequest.offset : 0;
        const typeCondition = pointLimitOffsetRequest.whereConditions?.type;
        let activeCoupon = pointLimitOffsetRequest.whereConditions?.active; // boolean true, false
        let activeDateCoupon = pointLimitOffsetRequest.whereConditions?.activeDate;
        const today = new Date();
        // { $ne: null }
        let successResponse: any = undefined;
        let result: any | string | number = {};
        const userCoupon: any | string | number = [];
        userCoupon.push(
            {
                $match: {
                    userId: userObjId,
                }
            },
        );

        if (pointLimitOffsetRequest.whereConditions === undefined) {
            userCoupon.push(
                {
                    $match: {
                        active: false,
                        activeDate: null,
                        expireDate: { $gte: today }
                    }
                }
            );
        }

        if (
            pointLimitOffsetRequest.whereConditions?.active !== undefined
            && typeCondition === 'REDEEM') {
            activeCoupon =
            {
                $match: {
                    active: activeCoupon,
                    expireDate: { $gte: today }
                }
            };
            userCoupon.push(activeCoupon);
        }
        if (
            pointLimitOffsetRequest.whereConditions?.active !== undefined
            && typeCondition !== 'REDEEM') {
            activeCoupon =
            {
                $match: {
                    active: activeCoupon
                }
            };
            userCoupon.push(activeCoupon);
        }
        if (activeDateCoupon === 'not_null') { activeDateCoupon = { $match: { activeDate: { $ne: null } } }; userCoupon.push(activeDateCoupon); }
        if (activeDateCoupon === null) { activeDateCoupon = { $match: { activeDate: null } }; userCoupon.push(activeDateCoupon); }
        if (typeCondition === undefined) {
            const redeem = await this.userCouponService.aggregate([
                {
                    $match: {
                        userId: userObjId,
                        active: false,
                        activeDate: null,
                        expireDate: { $gte: today }
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'productId': '$productId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$productId', '$productId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: 'REDEEM',
                                    productId: { $ne: null },
                                    userId: userObjId
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    point: 1,
                                    productId: 1,
                                    userId: 1,
                                    type: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Product',
                                    let: { 'productId': '$productId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$productId', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                categoryId: 1,
                                                title: 1,
                                                detail: 1,
                                                point: 1,
                                                userId: 1,
                                                asssetId: 1,
                                                coverPageURL: 1,
                                                s3CoverPageURL: 1,
                                                categoryName: 1,
                                                expiringDate: 1,
                                                activeDate: 1,
                                                receiverCoupon: 1,
                                                couponExpire: 1
                                            }
                                        }
                                    ],
                                    as: 'product'
                                }
                            },
                            {
                                $unwind: '$product'
                            }
                        ],
                        as: 'pointStatement'
                    }
                },
                {
                    $unwind: '$pointStatement'
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        userId: 1,
                        pointStatement: 1,
                        productId: 1,
                        expireDate: 1,
                        activeDate: 1,
                        active: 1
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
            ]);

            const redeemExpire = await this.userCouponService.aggregate([
                {
                    $match: {
                        userId: userObjId,
                        active: false,
                        activeDate: null,
                        expireDate: { $lte: today }
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'productId': '$productId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$productId', '$productId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: 'REDEEM',
                                    productId: { $ne: null },
                                    userId: userObjId
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    point: 1,
                                    productId: 1,
                                    userId: 1,
                                    type: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Product',
                                    let: { 'productId': '$productId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$productId', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                categoryId: 1,
                                                title: 1,
                                                detail: 1,
                                                point: 1,
                                                userId: 1,
                                                asssetId: 1,
                                                coverPageURL: 1,
                                                s3CoverPageURL: 1,
                                                categoryName: 1,
                                                expiringDate: 1,
                                                activeDate: 1,
                                                receiverCoupon: 1,
                                                couponExpire: 1
                                            }
                                        }
                                    ],
                                    as: 'product'
                                }
                            },
                            {
                                $unwind: '$product'
                            }
                        ],
                        as: 'pointStatement'
                    }
                },
                {
                    $unwind: '$pointStatement'
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        userId: 1,
                        pointStatement: 1,
                        productId: 1,
                        expireDate: 1,
                        activeDate: 1,
                        active: 1
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
            ]);

            const alreadyCoupon = await this.userCouponService.aggregate([
                {
                    $match: {
                        userId: userObjId,
                        active: true,
                        activeDate: { $ne: null },
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'productId': '$productId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$productId', '$productId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: 'USE_COUPON',
                                    productId: { $ne: null },
                                    userId: userObjId
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    point: 1,
                                    productId: 1,
                                    userId: 1,
                                    type: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Product',
                                    let: { 'productId': '$productId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$productId', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                categoryId: 1,
                                                title: 1,
                                                detail: 1,
                                                point: 1,
                                                userId: 1,
                                                asssetId: 1,
                                                coverPageURL: 1,
                                                s3CoverPageURL: 1,
                                                categoryName: 1,
                                                expiringDate: 1,
                                                activeDate: 1,
                                                receiverCoupon: 1,
                                                couponExpire: 1
                                            }
                                        }
                                    ],
                                    as: 'product'
                                }
                            },
                            {
                                $unwind: '$product'
                            }
                        ],
                        as: 'pointStatement'
                    }
                },
                {
                    $unwind: '$pointStatement'
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        userId: 1,
                        pointStatement: 1,
                        productId: 1,
                        expireDate: 1,
                        activeDate: 1,
                        active: 1
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
            ]);

            const expireCoupon = await this.userCouponService.aggregate([
                {
                    $match: {
                        userId: userObjId,
                        active: false,
                        activeDate: { $ne: null },
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'productId': '$productId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$productId', '$productId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: 'COUPON_HAS_EXPIRED',
                                    productId: { $ne: null },
                                    userId: userObjId
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    point: 1,
                                    productId: 1,
                                    userId: 1,
                                    type: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Product',
                                    let: { 'productId': '$productId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$productId', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                categoryId: 1,
                                                title: 1,
                                                detail: 1,
                                                point: 1,
                                                userId: 1,
                                                asssetId: 1,
                                                coverPageURL: 1,
                                                s3CoverPageURL: 1,
                                                categoryName: 1,
                                                expiringDate: 1,
                                                activeDate: 1,
                                                receiverCoupon: 1,
                                                couponExpire: 1
                                            }
                                        }
                                    ],
                                    as: 'product'
                                }
                            },
                            {
                                $unwind: '$product'
                            }
                        ],
                        as: 'pointStatement'
                    }
                },
                {
                    $unwind: '$pointStatement'
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        userId: 1,
                        pointStatement: 1,
                        productId: 1,
                        expireDate: 1,
                        activeDate: 1,
                        active: 1
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
            ]);

            if (pointLimitOffsetRequest.whereConditions === undefined) {
                result = {
                    'readyCoupon': redeem,
                    'alreadyCoupon': alreadyCoupon,
                    'expireCoupon': expireCoupon.concat(redeemExpire)
                };
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            }
        }
        if (typeCondition !== undefined) {
            userCoupon.push(
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'productId': '$productId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$productId', '$productId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: typeCondition,
                                    productId: { $ne: null },
                                    userId: userObjId
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    point: 1,
                                    productId: 1,
                                    userId: 1,
                                    type: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Product',
                                    let: { 'productId': '$productId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$productId', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                categoryId: 1,
                                                title: 1,
                                                detail: 1,
                                                point: 1,
                                                userId: 1,
                                                asssetId: 1,
                                                coverPageURL: 1,
                                                s3CoverPageURL: 1,
                                                categoryName: 1,
                                                expiringDate: 1,
                                                activeDate: 1,
                                                receiverCoupon: 1,
                                                couponExpire: 1
                                            }
                                        }
                                    ],
                                    as: 'product'
                                }
                            },
                            {
                                $unwind: '$product'
                            }
                        ],
                        as: 'pointStatement'
                    }
                },
                {
                    $unwind: '$pointStatement'
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        userId: 1,
                        pointStatement: 1,
                        productId: 1,
                        expireDate: 1,
                        activeDate: 1,
                        active: 1
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
            );
        }
        const search = await this.userCouponService.aggregate(userCoupon);
        // readyCoupon
        // alreadyCoupon
        // expireCoupon

        if (
            pointLimitOffsetRequest.whereConditions?.type === 'REDEEM' &&
            pointLimitOffsetRequest.whereConditions?.active === false &&
            pointLimitOffsetRequest.whereConditions?.activeDate === null) {
            result = {
                'readyCoupon': search.length > 0 ? search : []
            };
            if (result['readyCoupon'] !== null && result['readyCoupon'].length > 0) {
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            } else {
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            }
        } else if (
            pointLimitOffsetRequest.whereConditions?.type === 'USE_COUPON' &&
            pointLimitOffsetRequest.whereConditions?.active === true &&
            pointLimitOffsetRequest.whereConditions?.activeDate === 'not_null'
        ) {
            result = {
                'alreadyCoupon': search.length > 0 ? search : []
            };
            if (result['alreadyCoupon'] !== null && result['alreadyCoupon'].length > 0) {
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            } else {
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            }
        } else if (
            pointLimitOffsetRequest.whereConditions?.type === 'COUPON_HAS_EXPIRED' &&
            pointLimitOffsetRequest.whereConditions?.active === false &&
            pointLimitOffsetRequest.whereConditions?.activeDate === 'not_null'
        ) {
            const redeemExpireCoupon = await this.userCouponService.aggregate([
                {
                    $match: {
                        userId: userObjId,
                        active: false,
                        activeDate: null,
                        expireDate: { $lte: today }
                    }
                },
                {
                    $lookup: {
                        from: 'PointStatement',
                        let: { 'productId': '$productId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$productId', '$productId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    type: 'REDEEM',
                                    productId: { $ne: null },
                                    userId: userObjId
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    point: 1,
                                    productId: 1,
                                    userId: 1,
                                    type: 1
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Product',
                                    let: { 'productId': '$productId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$productId', '$_id']
                                                }
                                            }
                                        },
                                        {
                                            $project: {
                                                _id: 1,
                                                categoryId: 1,
                                                title: 1,
                                                detail: 1,
                                                point: 1,
                                                userId: 1,
                                                asssetId: 1,
                                                coverPageURL: 1,
                                                s3CoverPageURL: 1,
                                                categoryName: 1,
                                                expiringDate: 1,
                                                activeDate: 1,
                                                receiverCoupon: 1,
                                                couponExpire: 1
                                            }
                                        }
                                    ],
                                    as: 'product'
                                }
                            },
                            {
                                $unwind: '$product'
                            }
                        ],
                        as: 'pointStatement'
                    }
                },
                {
                    $unwind: '$pointStatement'
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        userId: 1,
                        pointStatement: 1,
                        productId: 1,
                        expireDate: 1,
                        activeDate: 1,
                        active: 1
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
            ]);

            let counponExpireResult = search;
            if (search.length > 0 && redeemExpireCoupon.length > 0) {
                counponExpireResult.concat(redeemExpireCoupon);
            }
            if (search.length === 0 && redeemExpireCoupon.length > 0) {
                counponExpireResult = redeemExpireCoupon;
            }

            result = {
                'expireCoupon': counponExpireResult
            };
            if (result['expireCoupon'] !== null && result['expireCoupon'].length > 0) {
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            } else {
                successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
                return res.status(200).send(successResponse);
            }
        }
    }

    @Post('/sort/accumulate/search')
    public async getAccumulatePoint(
        @Res() res: any,
        @Req() req: any
    ): Promise<any> {
        const userObjId = new ObjectID(req.headers.userid);
        const takeLimit = req.body.limit === undefined || req.body.limit === null ? 50 : req.body.limit;
        const takeOffset = req.body.offset === undefined || req.body.limit === null ? 0 : req.body.offset;
        const sortPoint:any = await this.accumulateService.aggregate(
            [
                {
                    $sort:{
                        accumulatePoint:-1
                    }
                },
                {
                    $project:{
                        userId:1,
                        accumulatePoint:1
                    }
                },
            ]
        );
        const selfPoint = await this.accumulateService.aggregate(
            [
                {
                    $match: {
                        userId: userObjId
                    }
                },
                {
                    $lookup: {
                        from: 'User',
                        let: { 'userId': '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$userId', '$_id']
                                    }
                                }
                            },
                            {
                                $project: {
                                    firstName: 1,
                                    lastName: 1,
                                    displayName: 1,
                                    uniqueId: 1,
                                    imageURL: 1,
                                    s3ImageURL: 1,
                                    province: 1,
                                    membership: 1

                                }
                            }

                        ],
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    '$addFields': {
                        'accumulatePoint': {
                            '$add': ['$accumulatePoint', '$usedPoint']
                        }
                    }
                },
                {
                    $project: {
                        createdDate: 1,
                        userId: 1,
                        user: 1,
                        accumulatePoint: 1
                    }
                }
            ]
        );
        const sortUserPoint = await this.accumulateService.aggregate(
            [
                {
                    $lookup: {
                        from: 'User',
                        let: { 'userId': '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$userId', '$_id']
                                    }
                                }
                            },
                            {
                                $project: {
                                    firstName: 1,
                                    lastName: 1,
                                    displayName: 1,
                                    uniqueId: 1,
                                    imageURL: 1,
                                    s3ImageURL: 1,
                                    province: 1,
                                    membership: 1

                                }
                            }

                        ],
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    '$addFields': {
                        'accumulatePoint': {
                            '$add': ['$accumulatePoint', '$usedPoint']
                        }
                    }
                },
                {
                    $project: {
                        createdDate: 1,
                        userId: 1,
                        user: 1,
                        accumulatePoint: 1
                    }
                },
                {
                    $sort: {
                        accumulatePoint: -1
                    }
                },
                {
                    $limit: takeLimit
                },
                {
                    $skip: takeOffset
                },
            ]
        );
        const arrPoints:string[] = [];
        if(sortPoint.length) { 
            for(const content of sortPoint) {
                arrPoints.push(String(content.userId));
            }
        }
        let result:any = {};
        const selfRanking:number = arrPoints.indexOf(String(userObjId));
        if(arrPoints.length > 0){
            result = {
                'sortAccumulatePoint': {
                    'selfOrder': selfRanking === 0 ? 0 : selfRanking + 1,
                    'self': selfPoint !== undefined && selfPoint.length > 0 ? selfPoint[0] : null,
                    'rankingPoint': sortUserPoint !== undefined ? sortUserPoint : null
                },
            };
            const successResponse = ResponseUtil.getSuccessResponse('Get content AcumulatePoint is success.', result);
            return res.status(200).send(successResponse);
        } else {
            result = {
                'sortAccumulatePoint': {
                    'selfOrder': selfRanking === 0 ? 0 : selfRanking + 1,
                    'self': selfPoint !== undefined && selfPoint.length > 0 ? selfPoint[0] : null,
                    'rankingPoint': sortUserPoint !== undefined ? sortUserPoint : null
                },
            };
            const successResponse = ResponseUtil.getSuccessResponse('Get content AcumulatePoint is success.', result);
            return res.status(200).send(successResponse);
        }
    }

    @Get('/mfp/content')
    public async getPointMfpContents(
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const userObjId = req.headers.userid ? new ObjectID(req.headers.userid) : undefined;
        const categoryId = [];
        const accumulateAggr = await this.accumulateService.aggregate(
            [
                {
                    $match: {
                        userId: userObjId
                    }
                },
                {
                    '$addFields': {
                        'totalPoint': {
                            '$add': ['$accumulatePoint', '$usedPoint']
                        }
                    }
                },
                {
                    $project: {
                        createdDate: 1,
                        userId: 1,
                        accumulatePoint: 1,
                        usedPoint: 1,
                        totalPoint: 1
                    }
                }
            ]
        );
        const today = new Date();
        const userCouponCount = await this.userCouponService.aggregate(
            [
                {
                    $match: {
                        userId: userObjId,
                        active: false,
                        activeDate: null,
                        expireDate: { $gte: today }
                    }
                },
                {
                    $count: 'count'
                }
            ]
        );

        const pointEventsAggr = await this.pointEventService.aggregate(
            [
                {
                    $match: {
                        pin: true
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        title: 1,
                        detail: 1,
                        point: 1,
                        maximumLimit: 1,
                        condition: 1,
                        assetId: 1,
                        coverPageURL: 1,
                        link: 1,
                        s3CoverPageURL: 1,
                        receiver: 1,
                    }
                }
            ]
        );

        const categoryProductAggr = await this.productCategoryService.aggregate(
            [
                {
                    $match: {
                        pin: true
                    }
                },
                {
                    $lookup: {
                        from: 'Product',
                        let: { id: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$categoryId']
                                    }
                                }
                            }
                        ],
                        as: 'product'
                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        createdDate: 1,
                        title: 1,
                        assetId: 1,
                        coverPageURL: 1,
                        s3CoverPageURL: 1,
                        product: {
                            $cond: [
                                {
                                    $gt: [{ $size: '$product' }, 0]
                                },
                                true,
                                false
                            ]
                        }
                    }
                },
                {
                    $match: {
                        product: true
                    }
                }
            ]
        );
        if (categoryProductAggr.length > 0) { for (const content of categoryProductAggr) { categoryId.push(new ObjectID(content._id)); } }
        const productAggr = await this.productCategoryService.aggregate(
            [
                {
                    $match: {
                        _id: { $in: categoryId },
                        pin: true,
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        title: { $first: '$title' },
                        createdDate: { $first: '$createdDate'}

                    }
                },
                {
                    $sort: {
                        createdDate: -1
                    }
                },
                {
                    $lookup: {
                        from: 'Product',
                        let: { 'id': '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$categoryId']
                                    }
                                }
                            },
                            {
                                $match: {
                                    pin: true
                                }
                            },
                            {
                                $sort: {
                                    createdDate: -1
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    createdDate: 1,
                                    categoryId: 1,
                                    title: 1,
                                    detail: 1,
                                    point: 1,
                                    maximumLimit: 1,
                                    condition: 1,
                                    assetId: 1,
                                    coverPageURL: 1,
                                    s3CoverPageURL: 1,
                                    categoryName: 1,
                                    expiringDate: 1,
                                    activeDate: 1,
                                    receiverCoupon: 1,
                                    couponExpire: 1,
                                }
                            }
                        ],
                        as: 'product'
                    }
                }
            ]
        );
        const result = {
            'accumulatePoint': accumulateAggr.length > 0 ? accumulateAggr[0] : null,
            'userCoupon': userCouponCount.length > 0 ? userCouponCount[0].count : 0,
            'pointEvent': pointEventsAggr,
            'categoryProduct': categoryProductAggr,
            'productAggr': productAggr
        };
        const successResponse = ResponseUtil.getSuccessResponse('Get content points is success.', result);
        return res.status(200).send(successResponse);
    }

    @Get('/category/product/:id')
    public async getCategoryProductContent(
        @Param('id') id: string,
        @QueryParam('offset') offset: number,
        @QueryParam('limit') limt: number,
        @Res() res: any,
        @Req() req: any
    ): Promise<any> {
        const categoryId = new ObjectID(id);
        const productAggr = await this.productCategoryService.aggregate(
            [
                {
                    $match: {
                        _id: categoryId
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        title: { $first: '$title' },
                        coverPageURL: { $first: '$coverPageURL' },
                        s3CoverPageURL: { $first: '$s3CoverPageURL' }
                    }
                },
                {
                    $lookup: {
                        from: 'Product',
                        let: { 'id': '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$$id', '$categoryId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    createdDate: 1,
                                    categoryId: 1,
                                    title: 1,
                                    detail: 1,
                                    point: 1,
                                    maximumLimit: 1,
                                    condition: 1,
                                    assetId: 1,
                                    coverPageURL: 1,
                                    s3CoverPageURL: 1,
                                    categoryName: 1,
                                    expiringDate: 1,
                                    activeDate: 1,
                                    receiverCoupon: 1,
                                    couponExpire: 1,
                                }
                            }
                        ],
                        as: 'product'
                    }
                }
            ]
        );
        const result = {
            'categoryProducts': productAggr[0] !== undefined ? productAggr[0] : null
        };
        const successResponse = ResponseUtil.getSuccessResponse('Get category product is success.', result);
        return res.status(200).send(successResponse);
    }
}
