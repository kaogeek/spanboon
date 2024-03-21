import 'reflect-metadata';
import { IsNotEmpty, IsBoolean,IsPositive, IsString } from 'class-validator';

export class CouponWarehouse {

    @IsNotEmpty({ message: 'maximumCouponLimit is required' })
    @IsPositive({ message: 'value is not Positive number'})
    public maximumCouponLimit: number;

    @IsNotEmpty({ message: 'boolean is required' })
    @IsBoolean()
    public active: boolean;

    @IsNotEmpty({ message: 'expiringDate is required' })
    @IsString()
    public expiringDate:string;

    @IsNotEmpty({ message: 'activeDate is required' })
    @IsString()
    public activeDate:string;

}