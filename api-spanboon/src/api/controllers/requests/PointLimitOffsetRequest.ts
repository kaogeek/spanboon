import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class PointLimitOffsetRequest {
    @IsNotEmpty({ message: 'title is required' })
    public limit: string;
    @IsNotEmpty({ message: 'point is required' })
    public offset:number;
}