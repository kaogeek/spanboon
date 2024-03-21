import 'reflect-metadata';
import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryPointRequest {
    @IsNotEmpty({ message: 'title is required' })
    @IsString()
    public title: string;

    @IsNotEmpty({ message: 'assetId is required' })
    @IsString()
    public assetId: string;

    @IsNotEmpty({ message: 'coverPageURL is required' })
    @IsString()
    public coverPageURL:string;

    public s3CoverPageURL:string;

}