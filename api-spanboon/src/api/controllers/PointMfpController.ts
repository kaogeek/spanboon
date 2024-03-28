import { JsonController, Res, Post, Req, Body, Authorized,Get,QueryParam, Param } from 'routing-controllers';
// import { UserService } from '../services/UserService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import { PointStatementRequest } from './requests/PointStatementRequest';
import { PointLimitOffsetRequest } from './requests/PointLimitOffsetRequest';
import { UsedCouponRequest } from './requests/UsedCouponRequest';
import { ObjectID } from 'mongodb';
import { PointStatementModel } from '../models/PointStatementModel';
import { AccumulateModel } from '../models/AccumulatePointModel';
import { PointStatementService } from '../services/PointStatementService';
import { AccumulateService } from '../services/AccumulateService';
import { UserCouponModel } from '../models/UserCoupon';
import { UserCouponService } from '../services/UserCouponService';
import { PointEventService } from '../services/PointEventService';
import { ProductService } from '../services/ProductService';
import { ProductCategoryService } from '../services/ProductCategoryService';

// startVoteDatetime
@JsonController('/point')
export class NotificationController {
    constructor(
        // private userService: UserService,
        private pointStatementService:PointStatementService,
        private accumulateService:AccumulateService,
        private userCouponService:UserCouponService,
        private pointEventService:PointEventService,
        private productService:ProductService,
        private productCategoryService:ProductCategoryService
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
        @Req() req: any): Promise<any>{
        const userObjId = new ObjectID(req.user.id);

        if(userObjId === undefined || userObjId === null) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the user.', undefined);
            return res.status(400).send(errorResponse);
        }
        if(pointStatementRequest.type ==='RECEIVE_POINT') {
            const pointStateMentuser = await this.pointStatementService.findOne(
            {
                pointEventId: new ObjectID(pointStatementRequest.pointEventId),
                userId:userObjId
            });
            if(pointStateMentuser !== undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('You have had this point statement.', undefined);
                return res.status(400).send(errorResponse);

            }
        }

        if(pointStatementRequest.type === 'REDEEM') {
            const productStatenebt = await this.pointStatementService.findOne(
                {
                    productId: new ObjectID(pointStatementRequest.productId),
                    userId:userObjId
                });
            if(productStatenebt !== undefined) {
                const errorResponse = ResponseUtil.getErrorResponse('You have had this point statement.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
        
        if(pointStatementRequest.type  === 'RECEIVE_POINT' && 
            pointStatementRequest.pointEventId === undefined &&
            pointStatementRequest.pointEventId === null &&
            pointStatementRequest.pointEventId === ''
        ) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the productEventId.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(pointStatementRequest.type  === 'REDEEM' && 
            pointStatementRequest.productId === undefined &&
            pointStatementRequest.productId === null &&
            pointStatementRequest.productId === ''
        ) {
            const errorResponse = ResponseUtil.getErrorResponse('Not found the productID.', undefined);
            return res.status(400).send(errorResponse);
        }

        const productModel = new PointStatementModel();

        if(pointStatementRequest.type === 'REDEEM'){
            productModel.title = pointStatementRequest.title;
            productModel.detail = pointStatementRequest.detail;
            productModel.point = pointStatementRequest.point;
            productModel.type = pointStatementRequest.type;
            productModel.userId = userObjId;
            productModel.productId = new ObjectID(pointStatementRequest.productId);
        }

        if(pointStatementRequest.type === 'RECEIVE_POINT') {
            productModel.title = pointStatementRequest.title;
            productModel.detail = pointStatementRequest.detail;
            productModel.point = pointStatementRequest.point;
            productModel.type = pointStatementRequest.type;
            productModel.userId = userObjId;
            productModel.pointEventId = new ObjectID(pointStatementRequest.pointEventId);
        }

        const create = await this.pointStatementService.create(productModel);
        if(create){
            const accumulateCreate = await this.accumulateService.findOne({userId:userObjId});
            if(accumulateCreate === undefined) {
                const accumulateModel = new AccumulateModel();
                accumulateModel.userId = userObjId;
                accumulateModel.accumulatePoint = pointStatementRequest.point;
                accumulateModel.usedPoint = 0;
                const createAccumulate = await this.accumulateService.create(accumulateModel);
                if(createAccumulate){
                    const successResponse = ResponseUtil.getSuccessResponse('Point Statement is success.', create);
                    return res.status(200).send(successResponse);
                }
            } 

            if(accumulateCreate !== undefined && pointStatementRequest.type === 'RECEIVE_POINT') {
                const pointEventObjId = new ObjectID(pointStatementRequest.pointEventId);
                const pointEvent = await this.pointEventService.findOne({_id:pointEventObjId});

                if(pointEvent.maximumLimit === pointEvent.receiver) {
                    const errorResponse = ResponseUtil.getErrorResponse('ProductEvent is out of store.', undefined);
                    const deletePointStatement = await this.pointStatementService.delete({_id:create.id,userId:userObjId});
                    if(deletePointStatement){
                        return res.status(400).send(errorResponse);
                    }
                }

                const updatePointEvent = await this.pointEventService.update({_id:pointEvent.id},{$set:{receiver: pointEvent.receiver + 1}});
                if(updatePointEvent){
                    const query = {userId:userObjId};
                    const newValues = {$set:
                        {
                            accumulatePoint: accumulateCreate.accumulatePoint + pointStatementRequest.point
                        }
                    };
                    const update = await this.accumulateService.update(query,newValues);
                    if(update) {
                        const successResponse = ResponseUtil.getSuccessResponse('Creact Point Statement and Receiver point is success.', create);
                        return res.status(200).send(successResponse);
                    }
                }
            }
            if(accumulateCreate !== undefined && pointStatementRequest.type === 'REDEEM'){
                if(accumulateCreate.accumulatePoint < pointStatementRequest.point){
                    const errorResponse = ResponseUtil.getErrorResponse('The point you have got is not enough.', undefined);
                    const deletePointStatement = await this.pointStatementService.delete({_id:create.id,userId:userObjId});
                    if(deletePointStatement){
                        return res.status(400).send(errorResponse);
                    }
                } 
                const productPoint = await this.productService.findOne({_id: new ObjectID(pointStatementRequest.productId)});

                const userCouponModel = new UserCouponModel();
                userCouponModel.userId = userObjId;
                userCouponModel.active = false;
                userCouponModel.productId = productPoint.id;
                userCouponModel.expireDate = productPoint.expiringDate;
                userCouponModel.activeDate = null;
                const createUserCoupon = await this.userCouponService.create(userCouponModel);
                if(createUserCoupon){
                    const successResponse = ResponseUtil.getSuccessResponse('Redeem coupon is success.', create);
                    return res.status(200).send(successResponse);
                }
            }
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }
    // create get product
    
    @Post('/used/coupon')
    @Authorized('user')
    public async usedCoupon(
        @Body({ validate: true }) usedCouponRequest: UsedCouponRequest,
        @Res() res: any, 
        @Req() req: any): Promise<any>{
        const userObjId = new ObjectID(req.user.id);
        const today = new Date();
        const productObj = await this.productService.findOne({_id: new ObjectID(usedCouponRequest.productId)});
        const minute = today.getTime() + productObj.couponExpire * 60 * 60;

        if(today.getTime() > productObj.expiringDate.getTime()) {
            const errorResponse = ResponseUtil.getErrorResponse('The product had been expiring.', undefined);
            return res.status(400).send(errorResponse);
        }
            
        if(productObj.maximumLimit === productObj.receiverCoupon) {
            const errorResponse = ResponseUtil.getErrorResponse('The product is out of store.', undefined);
            return res.status(400).send(errorResponse);
        }

        if(today.getTime() > minute){
            const errorResponse = ResponseUtil.getErrorResponse('The coupon was expire.', undefined);
            return res.status(400).send(errorResponse);
        }

        const query = {
            userId:userObjId,
            productId: productObj.id
        };
        const newValues = {$set:
            {
                active:usedCouponRequest.active,
                activeDate:new Date(usedCouponRequest.activeDate)
            }
        };

        const updateUserCoupon = await this.userCouponService.update(query,newValues);
        if(updateUserCoupon){
            const productModel = new PointStatementModel();
            productModel.title = 'Use a Coupon.';
            productModel.detail = null;
            productModel.point = productObj.point;
            productModel.type = 'USE_COUPON';
            productModel.userId = userObjId;
            productModel.pointEventId = null;
            const create = await this.pointStatementService.create(productModel);
            if(create){
                try{
                    const updateProduct = await this.productService.update({_id:productObj.id},{$set:{receiverCoupon: productObj.receiverCoupon + 1}});
                    if(updateProduct) {
                        const successResponse = ResponseUtil.getSuccessResponse('Redeem coupon is success.', undefined);
                        return res.status(200).send(successResponse);
                    } else {
                        const updateReverse = await this.userCouponService.update({userId:userObjId,productId: productObj.id},
                            {
                                $set:{
                                    active: false,
                                    activeDate: null
                                }
                            }
                        );
                        if(updateReverse){
                            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
                            return res.status(400).send(errorResponse);
                        }
                    }
                } catch(error) {
                    const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', error);
                    return res.status(400).send(errorResponse);
                }
            }
        }
    }

    @Get('/event/:id')
    public async getEventObj(@Param('id') id: string,@Res() res: any,@Req() req: any): Promise<any> {
        const eventObjId = new ObjectID(id);
        const pointEventObj = await this.pointEventService.findOne({_id: eventObjId});
        const result:any = {};
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
        if(result){
            const successResponse = ResponseUtil.getSuccessResponse('Get PointEventObj is success.', pointEventObj);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found PointEvent.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Get('/product/:id')
    public async getProductObj(@Param('id') id: string,@Res() res: any,@Req() req: any): Promise<any> {
        const productObjId = new ObjectID(id);
        const productObj = await this.productService.findOne({_id: productObjId});
        const result:any = {};
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
        if(result){
            const successResponse = ResponseUtil.getSuccessResponse('Get Product is success.', result);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Not found Product.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/accumulate/search')
    @Authorized('user')
    public async getAccumulate(
        @Body({ validate: true }) pointLimitOffsetRequest: PointLimitOffsetRequest,
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const take = pointLimitOffsetRequest !== undefined ? pointLimitOffsetRequest.limit : 10;
        const skips = pointLimitOffsetRequest !== undefined ? pointLimitOffsetRequest.offset : 0;
        const accumulateAggr = await this.accumulateService.aggregate(
            [
                {
                    $match:{
                        userId:userObjId
                    }
                },
                {
                    '$addFields':{
                        'totalPoint':{
                            '$add':['$accumulatePoint','$usedPoint']
                        }
                    }
                },
                {
                    $project:{
                        createdDate:1,
                        userId:1,
                        accumulatePoint:1,
                        usedPoint:1,
                        totalPoint:1
                    }
                },
                {
                    $lookup:{
                        from:'PointStatement',
                        let:{'userId':'$userId'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$$userId','$userId']
                                    }
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            }
                        ],
                        as:'totalPointStatement'
                    }
                },
                {
                    $lookup:{
                        from:'PointStatement',
                        let:{'userId':'$userId'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$$userId','$userId']
                                    }
                                }
                            },
                            {
                                $match:{
                                    type:'RECEIVE_POINT'
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            }
                        ],
                        as:'receivePointStatement'
                    }
                },
                {
                    $lookup:{
                        from:'PointStatement',
                        let:{'userId':'$userId'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$$userId','$userId']
                                    }
                                }
                            },
                            {
                                $match:{
                                    type:'REDEEM'
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            }
                        ],
                        as:'redeemPointStatement'
                    }
                }
            ]
        );
        const result = {
            'accumulatePoint':accumulateAggr !== undefined ? accumulateAggr[0] : [],
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
        const userCoupon = await this.userCouponService.aggregate(
            [
                {
                    $match:{
                        userId:userObjId
                    }
                },
                {
                    $skip: skips
                },
                {
                    $limit: take
                },
                {
                    $lookup:{
                        from:'PointStatement',
                        let:{'id':'$userId'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$$id','$userId']
                                    }
                                }
                            },
                            {
                                $match:{
                                    productId:{$ne:null}
                                }
                            },
                            {
                                $project:{
                                    _id:1,
                                    title:1,
                                    point:1,
                                    productId:1,
                                    userId:1
                                }
                            },
                            {
                                $skip: skips
                            },
                            {
                                $limit: take
                            },
                            {
                                $lookup:{
                                    from:'Product',
                                    let:{'productId':'$productId'},
                                    pipeline:[
                                        {
                                            $match:{
                                                $expr:{
                                                    $eq:['$$productId','$_id']
                                                }
                                            }
                                        },
                                        {
                                            $skip: skips
                                        },
                                        {
                                            $limit: take
                                        },
                                        {
                                            $project:{
                                                _id:1,
                                                categoryId:1,
                                                title:1,
                                                detail:1,
                                                point:1,
                                                userId:1,
                                                asssetId:1,
                                                coverPageURL:1,
                                                s3CoverPageURL: 1,
                                                categoryName:1,
                                                expiringDate:1,
                                                activeDate:1,
                                                receiverCoupon:1,
                                                couponExpire:1
                                            }
                                        }
                                    ],
                                    as:'product'
                                }
                            },
                            {
                                $unwind:'$product'
                            }
                        ],
                        as:'pointStatement'
                    }
                },
                {
                    $unwind:'$pointStatement'
                },
                {
                    $project:{
                        _id:1,
                        createdDate:1,
                        userId:1,
                        pointStatement:1,
                        productId:1,
                        expireDate:1,
                        activeDate:1
                    }
                }
            ]
        );
        const result = {
            'userCoupon':userCoupon
        };
        const successResponse = ResponseUtil.getSuccessResponse('Get content UserCoupon is success.', result);
        return res.status(200).send(successResponse);
    }

    @Post('/sort/accumulate/search')
    @Authorized('user')
    public async getAccumulatePoint(
        @Res() res: any,
        @Req() req: any
    ): Promise<any>{
        const userObjId = new ObjectID(req.user.id);
        let userCouponCount = undefined;
        let selfPoint = undefined;
        let sortUserPoint = undefined;

        userCouponCount = await this.userCouponService.aggregate(
            [
                {
                    $match:{
                        userId:userObjId
                    }
                },
                {
                    $count:'count'
                }
            ]
        );
        
        if(userCouponCount !== undefined && userCouponCount.length > 0){
            selfPoint = await this.accumulateService.aggregate(
                [
                    {
                        $match:{
                            userId:userObjId
                        }
                    },
                    {
                        $lookup:{
                            from:'User',
                            let:{'userId':'$userId'},
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $eq:['$$userId','$_id']
                                        }
                                    }
                                },
                                {
                                    $project:{
                                        firstName:1,
                                        lastName:1,
                                        displayName:1,
                                        uniqueId:1,
                                        imageURL:1,
                                        s3ImageURL:1,
                                        province:1,
                                        membership:1

                                    }
                                }
                                
                            ],
                            as:'user'
                        }
                    },
                    {
                        $unwind:'$user'
                    },
                    {
                        '$addFields':{
                            'accumulatePoint':{
                                '$add':['$accumulatePoint','$usedPoint']
                            }
                        }
                    },
                    {
                        $project:{
                            createdDate:1,
                            userId:1,
                            user:1,
                            accumulatePoint:1
                        }
                    }
                ]
            );
        }

        if(selfPoint !== undefined && selfPoint.length>0){
            sortUserPoint = await this.accumulateService.aggregate(
                [
                    {
                        $match:{
                            userId:{$ne: new ObjectID(selfPoint[0].userId)}
                        }
                    },
                    {
                        $lookup:{
                            from:'User',
                            let:{'userId':'$userId'},
                            pipeline:[
                                {
                                    $match:{
                                        $expr:{
                                            $eq:['$$userId','$_id']
                                        }
                                    }
                                },
                                {
                                    $project:{
                                        firstName:1,
                                        lastName:1,
                                        displayName:1,
                                        uniqueId:1,
                                        imageURL:1,
                                        s3ImageURL:1,
                                        province:1,
                                        membership:1

                                    }
                                }
                                
                            ],
                            as:'user'
                        }
                    },
                    {
                        $unwind:'$user'
                    },
                    {
                        $limit:50
                    },
                    {
                        '$addFields':{
                            'accumulatePoint':{
                                '$add':['$accumulatePoint','$usedPoint']
                            }
                        }
                    },
                    {
                        $project:{
                            createdDate:1,
                            userId:1,
                            user:1,
                            accumulatePoint:1
                        }
                    }
                ]
            );
        }
        const result = {
            'sortAccumulatePoint':{
                'self':selfPoint[0],
                'rankingPoint':sortUserPoint
            },
        };
        const successResponse = ResponseUtil.getSuccessResponse('Get content AcumulatePoint is success.', result);
        return res.status(200).send(successResponse);
    }

    @Get('/mfp/content')
    public async getPointMfpContents(
        @QueryParam('offset') offset: number, 
        @QueryParam('limit') limt: number,
        @Res() res: any,
        @Req() req: any): Promise<any> {
        const userObjId = req.headers.userid ? new ObjectID(req.headers.userid) : undefined;
        const categoryId = [];
        const accumulateAggr = await this.accumulateService.aggregate(
            [
                {
                    $match:{
                        userId:userObjId
                    }
                },
                {
                    '$addFields':{
                        'totalPoint':{
                            '$add':['$accumulatePoint','$usedPoint']
                        }
                    }
                },
                {
                    $project:{
                        createdDate:1,
                        userId:1,
                        accumulatePoint:1,
                        usedPoint:1,
                        totalPoint:1
                    }
                }
            ]
        );
        const userCouponCount = await this.userCouponService.aggregate(
            [
                {
                    $match:{
                        userId:userObjId
                    }
                },
                {
                    $count:'count'
                }
            ]
        );

        const pointEventsAggr = await this.pointEventService.aggregate(
            [
                {
                    $project:{
                        _id:1,
                        createdDate:1,
                        title:1,
                        detail:1,
                        point:1,
                        maximumLimit:1,
                        condition:1,
                        assetId:1,
                        coverPageURL:1,
                        link:1,
                        s3CoverPageURL:1,
                        receiver:1,
                    }
                }
            ]
        );

        const categoryProductAggr = await this.productCategoryService.aggregate(
            [
                {
                    $project:{
                        _id:1,
                        createdDate:1,
                        title:1,
                        assetId:1,
                        coverPageURL:1,
                        s3CoverPageURL:1,
                    }
                }
            ]
        );
        if(categoryProductAggr.length > 0) { for(const content of categoryProductAggr ) {categoryId.push(new ObjectID(content._id)); }}
        const productAggr = await this.productCategoryService.aggregate(
            [
                {
                    $match:{
                        _id:{$in:categoryId}
                    }
                },
                {
                    $group:{
                        _id:'$_id',
                        title:{$first:'$title'}
                    }
                },
                {
                    $lookup:{
                        from:'Product',
                        let:{'id':'$_id'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $eq:['$$id','$categoryId']
                                    }
                                }
                            },
                            {
                                $project:{
                                    _id:1,
                                    createdDate:1,
                                    categoryId:1,
                                    title:1,
                                    detail:1,
                                    point:1,
                                    maximumLimit:1,
                                    condition:1,
                                    assetId:1,
                                    coverPageURL:1,
                                    s3CoverPageURL:1,
                                    categoryName:1,
                                    expiringDate:1,
                                    activeDate:1,
                                    receiverCoupon:1,
                                    couponExpire:1,
                                }
                            }
                        ],
                        as:'product'
                    }
                }
            ]
        );
        const result = {
            'accumulatePoint':accumulateAggr.length > 0 ? accumulateAggr[0] : [],
            'userCoupon':userCouponCount.length > 0 ? userCouponCount[0].count : 0,
            'pointEvent':pointEventsAggr,
            'categoryProduct':categoryProductAggr,
            'productAggr':productAggr
        };
        const successResponse = ResponseUtil.getSuccessResponse('Get content points is success.', result);
        return res.status(200).send(successResponse);
    }
}
