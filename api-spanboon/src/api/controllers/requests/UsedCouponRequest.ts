import 'reflect-metadata';
import { IsNotEmpty, IsBoolean, IsString } from 'class-validator';

export class UsedCouponRequest {

    @IsNotEmpty({ message: 'string is required' })
    @IsString()
    public couponId: string;

    @IsNotEmpty({ message: 'boolean is required' })
    @IsBoolean()
    public active: boolean;

    @IsNotEmpty({ message: 'productId is required' })
    @IsString()
    public productId:string;

    @IsNotEmpty({ message: 'expiringDate is required' })
    @IsString()
    public expiringDate:string;

    @IsNotEmpty({ message: 'activeDate is required' })
    @IsString()
    public activeDate:string;

}