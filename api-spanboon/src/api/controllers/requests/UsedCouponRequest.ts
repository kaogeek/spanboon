import 'reflect-metadata';
import { IsNotEmpty, IsString } from 'class-validator';

export class UsedCouponRequest {

    @IsNotEmpty({ message: 'string is required' })
    @IsString()
    public couponId: string;

    @IsNotEmpty({ message: 'productId is required' })
    @IsString()
    public productId:string;

}