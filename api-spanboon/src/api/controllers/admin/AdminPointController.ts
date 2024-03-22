/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { JsonController, Res, Post, Body, Req, Authorized,Put,Param, Delete } from 'routing-controllers';
import { ResponseUtil } from '../../../utils/ResponseUtil';
import { PointEventService } from '../../services/PointEventService';
import { UserService } from '../../services/UserService';
import { PointEventModel } from '../../models/PointEventModel';
import { ProductCategoryModel } from '../../models/ProductCategoryModel';
import { ProductCategoryService } from '../../services/ProductCategoryService';
import { S3Service } from '../../services/S3Service';
import { ProductModel } from '../../models/ProductModel';
import { ProductService } from '../../services/ProductService';
// import { UserCouponService } from '../../services/UserCouponService';
import { CategoryPointRequest } from '../requests/CategoryPointRequest';
import { ProductRequest } from '../requests/ProductRequest';
import { PointEventRequest } from '../requests/PointEventRequest';
import { ObjectID } from 'mongodb';
// import { AssetService } from '../../../api/services/AssetService';

@JsonController('/admin/point')
export class AdminUserController {
    constructor(
        private pointEventService:PointEventService,
        private userService:UserService,
        private productCategoryService:ProductCategoryService,
        private productService:ProductService,
        private s3Service:S3Service
       //  private userCouponService:UserCouponService
    ) { }

    /**
     * @api {post} /api/admin/user/register Create User
     * @apiGroup Admin API
     * @apiParam (Request body) {String} firstName firstName
     * @apiParam (Request body) {String} lastName lastName
     * @apiParam (Request body) {String} email email
     * @apiParam (Request body) {String} citizenId citizenId
     * @apiParam (Request body) {number} gender gender
     * @apiParamExample {json} Input
     * {
     *      "firstname" : "",
     *      "lastname" : "",
     *      "email" : "",
     *      "citizenId" : "",
     *      "gender" : ""
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully create User",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/admin/user/register
     * @apiErrorExample {json} Error
     * HTTP/1.1 500 Internal Server Error
     */
    
    @Post('/event')
    @Authorized()
    public async createPointEvent(@Body({ validate: true }) pointEventRequest: PointEventRequest, @Res() res: any, @Req() req: any): Promise<any> {
        const userId = new ObjectID(req.user.id);
        const user = await this.userService.findOne({_id:userId});

        const signUrl = pointEventRequest.s3CoverPageURL !== undefined ? await this.s3Service.s3signCloudFront(pointEventRequest.s3CoverPageURL): undefined;

        const pointEventModel = new PointEventModel();
        pointEventModel.title = pointEventRequest.title;
        pointEventModel.detail = pointEventRequest.detail;
        pointEventModel.point = pointEventRequest.point;
        pointEventModel.maximumLimit = pointEventRequest.maximumLimit;
        pointEventModel.condition = pointEventRequest.condition;
        pointEventModel.userId = userId;
        pointEventModel.assetId = pointEventRequest.assetId;
        pointEventModel.coverPageURL = pointEventRequest.coverPageURL;
        pointEventModel.username = user.username;
        pointEventModel.link = pointEventRequest.link;
        pointEventModel.s3CoverPageURL = signUrl;
        pointEventModel.receiver = 0;
        const create = await this.pointEventService.create(pointEventModel);
        if(create){
            const successResponse = ResponseUtil.getSuccessResponse('Create PointEvent is success.', create);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/event/:id')
    @Authorized()
    public async updatePointEvent(@Body({ validate: true }) pointEventRequest: PointEventRequest,@Param('id') eventId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const eventObjId = new ObjectID(eventId);
        const user = await this.userService.findOne({_id:userObjId});

        const signUrl = pointEventRequest.s3CoverPageURL !== undefined ? await this.s3Service.s3signCloudFront(pointEventRequest.s3CoverPageURL): undefined;

        const update = await this.pointEventService.update(
            {_id:eventObjId}
            ,
            {
                $set:{
                    title: pointEventRequest.title,
                    detail: pointEventRequest.detail,
                    point: pointEventRequest.point,
                    maximumLimit: pointEventRequest.maximumLimit,
                    condition: pointEventRequest.condition,
                    userId: userObjId,
                    assetId: pointEventRequest.assetId,
                    coverPageURL: pointEventRequest.coverPageURL,
                    username: user.username,
                    link: pointEventRequest.link,
                    s3CoverPageURL: signUrl,
                    updateDate: new Date()
                }
            }
        );
        if(update){
            const successResponse = ResponseUtil.getSuccessResponse('Update PointEvent is success.', update);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/event/:id')
    @Authorized()
    public async deletePointEvent(
        @Param('id') eventId: string, @Res() res: any, @Req() req: any): Promise<any> {
        const eventObjId = new ObjectID(eventId);
        const deletePointEvent = await this.pointEventService.delete({_id:eventObjId});

        if(deletePointEvent){
            const successResponse = ResponseUtil.getSuccessResponse('Delete PointEvent is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/category')
    @Authorized()
    public async createCategory(
        @Body({validate: true}) categoryPointRequest:CategoryPointRequest,
        @Res() res: any, 
        @Req() req: any): Promise<any> {

        const categoryObj = await this.productCategoryService.findOne({title:categoryPointRequest.title});
        if(categoryObj !== undefined) {
            const errorResponse = ResponseUtil.getErrorResponse('The category have had one.', undefined);
            return res.status(400).send(errorResponse);
        }
        const signUrl = categoryPointRequest.s3CoverPageURL !== undefined ? await this.s3Service.s3signCloudFront(categoryPointRequest.s3CoverPageURL): undefined;

        const userId = new ObjectID(req.user.id);
        const user = await this.userService.findOne({_id:userId});
        const productCategoryModel = new ProductCategoryModel();
        productCategoryModel.title = categoryPointRequest.title;
        productCategoryModel.username = user.username;
        productCategoryModel.userId = userId;
        productCategoryModel.assetId = categoryPointRequest.assetId;
        productCategoryModel.coverPageURL = categoryPointRequest.coverPageURL;
        productCategoryModel.s3CoverPageURL = signUrl;
        const create = await this.productCategoryService.create(productCategoryModel);
        if(create){
            const successResponse = ResponseUtil.getSuccessResponse('Create Product Category is success.', create);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Put('/category/:id')
    @Authorized()
    public async updateCategory(@Body({validate: true}) categoryPointRequest:CategoryPointRequest,
        @Param('id') categoryId: string, 
        @Res() res: any, 
        @Req() req: any 
    ): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const categoryObjId = new ObjectID(categoryId);
        const user = await this.userService.findOne({_id:userObjId});

        const signUrl = categoryPointRequest.s3CoverPageURL !== undefined ? await this.s3Service.s3signCloudFront(categoryPointRequest.s3CoverPageURL): undefined;

        const update = await this.productCategoryService.update(
            {_id:categoryObjId}
            ,
            {
                $set:{
                    title: categoryPointRequest.title,
                    username: user.username,
                    userId: userObjId,
                    assetId: categoryPointRequest.assetId,
                    coverPageURL: categoryPointRequest.coverPageURL,
                    s3CoverPageURL: signUrl,
                    updateDate: new Date()
                }
            }
        );
        if(update){
            const successResponse = ResponseUtil.getSuccessResponse('Update ProductCategory is success.', update);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/category/:id')
    @Authorized()
    public async deleteCategoryProduct(
        @Param('id') categoryId: string, 
        @Res() res: any, 
        @Req() req: any 
    ): Promise<any> {
        const categoryObjId = new ObjectID(categoryId);

        const productCategoryObj = await this.productService.find({categoryId:categoryObjId});
        if(productCategoryObj.length >0) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete category the product have had existed.', undefined);
            return res.status(400).send(errorResponse);
        }

        const deleteCategoryProduct = await this.productCategoryService.delete({_id:categoryObjId});

        if(deleteCategoryProduct){
            const successResponse = ResponseUtil.getSuccessResponse('Delete ProductCategory is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/product')
    @Authorized()
    public async createProductPoint(
        @Body({validate: true}) productRequest:ProductRequest,  
        @Res() res: any, 
        @Req() req: any): Promise<any> {
        if(typeof(productRequest.couponExpire) === 'string'){
            const errorResponse = ResponseUtil.getErrorResponse('couponExpire is string.', undefined);
            return res.status(400).send(errorResponse);
        }
        const signUrl = productRequest.s3CoverPageURL !== undefined ? await this.s3Service.s3signCloudFront(productRequest.s3CoverPageURL): undefined;

        const userId = new ObjectID(req.user.id);
        const user = await this.userService.findOne({_id:userId});
        const productModel = new ProductModel();
        productModel.categoryId = new ObjectID(productRequest.categoryId);
        productModel.title = productRequest.title;
        productModel.detail = productRequest.detail;
        productModel.point = productRequest.point;
        productModel.maximumLimit = productRequest.maximumLimit;
        productModel.condition = productRequest.condition;
        productModel.username = user.username;
        productModel.userId = userId;
        productModel.assetId = productRequest.assetId;
        productModel.coverPageURL = productRequest.coverPageURL;
        productModel.s3CoverPageURL = signUrl;
        productModel.categoryName = productRequest.categoryName;
        productModel.expiringDate = new Date(productRequest.expiringDate);
        productModel.activeDate = new Date(productRequest.activeDate);
        productModel.receiverCoupon = 0;
        productModel.couponExpire = productRequest.couponExpire;
        const create = await this.productService.create(productModel);
        if(create){
            const successResponse = ResponseUtil.getSuccessResponse('Create Product is success.', create);
            return res.status(200).send(successResponse);
        } else {
            const deleteProduct = await this.productService.delete({_id:create.id});
            if(deleteProduct){
                const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
                return res.status(400).send(errorResponse);
            }
        }
    }

    @Put('/product/:id')
    @Authorized()
    public async updateProduct(@Body({validate: true}) productRequest:ProductRequest,
        @Param('id') product: string, 
        @Res() res: any, 
        @Req() req: any 
    ): Promise<any> {
        const userObjId = new ObjectID(req.user.id);
        const productObjId = new ObjectID(product);
        const user = await this.userService.findOne({_id:userObjId});

        const signUrl = productRequest.s3CoverPageURL !== undefined ? await this.s3Service.s3signCloudFront(productRequest.s3CoverPageURL): undefined;

        const update = await this.productService.update(
            {_id:productObjId}
            ,
            {
                $set:{
                    title: productRequest.title,
                    detail: productRequest.detail,
                    point: productRequest.point,
                    maximumLimit: productRequest.maximumLimit,
                    condition: productRequest.condition,
                    categoryName: productRequest.categoryName,
                    username: user.username,
                    userId: userObjId,
                    assetId: productRequest.assetId,
                    coverPageURL: productRequest.coverPageURL,
                    s3CoverPageURL: signUrl,
                    expiringDate: productRequest.expiringDate,
                    activeDate: productRequest.activeDate,
                    couponExpire: productRequest.couponExpire,
                    updateDate: new Date()
                }
            }
        );
        if(update){
            const successResponse = ResponseUtil.getSuccessResponse('Update Product is success.', update);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Delete('/product/:id')
    @Authorized()
    public async deleteProduct(
        @Param('id') product: string, 
        @Res() res: any, 
        @Req() req: any 
    ): Promise<any> {
        const productObjId = new ObjectID(product);

        const productEventObj = await this.pointEventService.find({productId:productObjId});
        if(productEventObj.length > 0) {
            const errorResponse = ResponseUtil.getErrorResponse('Cannot delete product users had reversed this product.', undefined);
            return res.status(400).send(errorResponse);
        }

        const deleteProduct = await this.productService.delete({_id:productObjId});
        if(deleteProduct){
            const successResponse = ResponseUtil.getSuccessResponse('Delete Product is success.', undefined);
            return res.status(200).send(successResponse);
        } else {
            const errorResponse = ResponseUtil.getErrorResponse('Error have occured.', undefined);
            return res.status(400).send(errorResponse);
        }
    }

    @Post('/event/search')
    @Authorized()
    public async searchPointEvent(@Res() res: any, @Req() req: any): Promise<any> {
        const pointEvent = await this.pointEventService.find();
        if(pointEvent.length >0){
            const successResponse = ResponseUtil.getSuccessResponse('Search PointEvent is success.', pointEvent);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Search PointEvent is success.', []);
            return res.status(200).send(successResponse);
        }
    }

    @Post('/category/search')
    @Authorized()
    public async searchCategory(@Res() res: any, @Req() req: any): Promise<any> {
        const Category = await this.productCategoryService.find();
        if(Category.length >0){
            const successResponse = ResponseUtil.getSuccessResponse('Search Category is success.', Category);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Search Category is success.', []);
            return res.status(200).send(successResponse);
        }
    }

    @Post('/product/search')
    @Authorized()
    public async searchProduct(@Res() res: any, @Req() req: any): Promise<any> {
        const product = await this.productService.find();
        if(product.length >0){
            const successResponse = ResponseUtil.getSuccessResponse('Search Product is success.', product);
            return res.status(200).send(successResponse);
        } else {
            const successResponse = ResponseUtil.getSuccessResponse('Search Product is success.', []);
            return res.status(200).send(successResponse);
        }
    }
} 
