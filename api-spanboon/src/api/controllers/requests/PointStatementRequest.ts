import 'reflect-metadata';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class PointStatementRequest {
    @IsNotEmpty({ message: 'point is required' })
    @IsPositive({ message: 'value is not Positive number'})
    public point:number;

    public pointEventId: string;
    public productId: string;

    @IsNotEmpty({ message: 'type is required' })
    @IsString()
    public type:string;

    public title: string;
    public detail: string;

}