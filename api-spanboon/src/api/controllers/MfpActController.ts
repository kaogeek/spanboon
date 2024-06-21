/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { JsonController, Res, Post,Get, Req, Authorized } from 'routing-controllers';
import { MfpActService } from '../services/MfpActService';
import { ResponseUtil } from '../../utils/ResponseUtil';
import jwt from 'jsonwebtoken';
import { MfpAct } from '../models/MfpActModel';
import { ObjectID } from 'mongodb';
import { UserService } from '../services/UserService';

@JsonController('/binding/mfp')
export class AssetController {

    constructor(
        private mfpActService: MfpActService,
        private userService:UserService
    ) { }
    
    @Post('/sign')
    public async testSignToken(@Res() res: any,@Req() req: any): Promise<any>{
        const today = new Date();
        const bodyRest:any = {};
        bodyRest.phone = req.body.phone;
        bodyRest.users = req.body.users;
        bodyRest.act_id = req.body.act_id;
        bodyRest.isBinding = req.body.isBinding;
        bodyRest.expire_at = new Date(today.getTime() + (today.getMinutes()*60*60));
        const token:any = jwt.sign({ id: bodyRest }, process.env.SECRET_MFP_ACT);
        const successResponse = ResponseUtil.getSuccessResponse('Successfully sign token.', token);
        return res.status(200).send(successResponse);
    }

    @Post('/today')
    public async bindingMfpToday(@Res() res: any,@Req() req: any): Promise<any> {
        try{
            const today = new Date();
            let successResponse:any;
            const verifyToken:any = jwt.verify(req.body.token, process.env.SECRET_MFP_ACT);
            const users:any = await this.userService.findOne({where:{_id:new ObjectID(verifyToken.id.users)}});
            if(users === undefined) {
                successResponse = ResponseUtil.getErrorResponse('User not found.', null);
                return res.status(400).send(successResponse);
            }

            if(users.banned === true) {
                successResponse = ResponseUtil.getErrorResponse('User had banned.', null);
                return res.status(400).send(successResponse);
            }
            // where:{actId:String(verifyToken.id.act_id)}
            const mfpAct:any = await this.mfpActService.findOne(
                { $or: [
                    {users:ObjectID(verifyToken.id.users)},
                    {phone:Number(verifyToken.id.phone)}
                ]
            });
            if(mfpAct !== undefined) {
                const query = {_id: ObjectID(mfpAct.id)};
                const newValues = 
                {
                    $set:
                        {
                            actId:String(verifyToken.id.act_id),
                            phone:Number(verifyToken.id.phone),
                            users:ObjectID(verifyToken.id.users)
                        }
                };
                const update:any = await this.mfpActService.update(query,newValues);
                if(update) {
                    const findUpdated:any = await this.mfpActService.findOne({where:{users:ObjectID(verifyToken.id.users),actId:String(verifyToken.id.act_id),phone:Number(verifyToken.id.phone)}});
                    successResponse = ResponseUtil.getSuccessResponse('Successfully binding mfp today.', findUpdated);
                    return res.status(200).send(successResponse);
                }
            }

            if(today.getTime() > new Date(verifyToken.id.expire_at).getTime()) {
                successResponse = ResponseUtil.getErrorResponse('token is expired.', null);
                return res.status(400).send(successResponse);
            }

            if(verifyToken.id.phone < 10) {
                successResponse = ResponseUtil.getErrorResponse('Phone Number must equal 10.', null);
                return res.status(400).send(successResponse);
            }

            if(verifyToken.id.isBinding !== true) {
                successResponse = ResponseUtil.getErrorResponse('Is binding must be true', null);
                return res.status(400).send(successResponse);
            }

            const mfpActModel = new MfpAct();
            mfpActModel.phone = Number(verifyToken.id.phone);
            mfpActModel.users = new ObjectID(verifyToken.id.users);
            mfpActModel.actId = String(verifyToken.id.act_id);
            mfpActModel.isBinding = verifyToken.id.isBinding;
            const createBinding = await this.mfpActService.create(mfpActModel);

            successResponse = ResponseUtil.getSuccessResponse('Successfully binding mfp today.', createBinding);
            return res.status(200).send(successResponse);
        } catch(err) {
            const successResponse = ResponseUtil.getErrorResponse('Invalid sign token.', err);
            return res.status(401).send(successResponse);
        }
    }

    @Get('/:id')
    @Authorized('user')
    public async isBinding(@Res() res: any,@Req() req: any): Promise<any>{
        const userId = new ObjectID(req.user.id);
        let successResponse:any;
        const mfpAct:any = await this.mfpActService.findOne({where:{users:userId}});
        if(mfpAct === undefined) {
            successResponse = ResponseUtil.getErrorResponse('Binding is not found.', null);
            return res.status(400).send(successResponse);
        }
        const users:any = await this.userService.findOne({where:{_id:new ObjectID(userId)}});
        if(users.banned === true) {
            successResponse = ResponseUtil.getErrorResponse('User had banned.', null);
            return res.status(400).send(successResponse);
        }
        successResponse = ResponseUtil.getSuccessResponse('Get binding status is sucess.', mfpAct);
        return res.status(200).send(successResponse);
    }
}