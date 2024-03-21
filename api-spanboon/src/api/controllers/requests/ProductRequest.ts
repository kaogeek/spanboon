import 'reflect-metadata';
import { IsNotEmpty, IsPositive, IsArray, IsString } from 'class-validator';

export class ProductRequest {

    @IsNotEmpty({ message: 'categoryId is required' })
    @IsString()
    public categoryId: string;

    @IsNotEmpty({ message: 'title is required' })
    @IsString()
    public title: string;
    @IsNotEmpty({ message: 'point is required' })
    @IsPositive({ message: 'value is not Positive number'})
    public point:number;

    @IsNotEmpty({ message: 'maximumLimit is required' })
    @IsPositive({ message: 'value is not Positive number'})
    public maximumLimit: number;

    @IsNotEmpty({ message: 'detail is required' })
    @IsString()
    public detail: string;

    @IsArray()
    public condition: [];

    @IsNotEmpty({ message: 'assetId is required' })
    @IsString()
    public assetId: string;

    @IsNotEmpty({ message: 'coverPageURL is required' })
    @IsString()
    public coverPageURL:string;

    @IsNotEmpty({ message: 'link is required' })
    @IsString()
    public categoryName:string;

    public s3CoverPageURL:string;

    @IsNotEmpty({ message: 'categoryId is required' })
    @IsString()
    public expiringDate:string;

    @IsNotEmpty({ message: 'categoryId is required' })
    @IsString()
    public activeDate:string;

    @IsNotEmpty({ message: 'couponExpire is required' })
    public couponExpire:number;
}