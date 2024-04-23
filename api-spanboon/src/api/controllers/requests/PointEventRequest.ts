import 'reflect-metadata';
import { IsNotEmpty, IsArray, IsString } from 'class-validator';

export class PointEventRequest {
    @IsNotEmpty({ message: 'title is required' })
    @IsString()
    public title: string;
    @IsNotEmpty({ message: 'point is required' })
    public point: number;

    @IsNotEmpty({ message: 'maximumLimit is required' })
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
    public coverPageURL: string;

    @IsNotEmpty({ message: 'link is required' })
    @IsString()
    public link: string;

    @IsNotEmpty({ message: 'pin is required' })
    public pin: boolean;

    public s3CoverPageURL: string;

}