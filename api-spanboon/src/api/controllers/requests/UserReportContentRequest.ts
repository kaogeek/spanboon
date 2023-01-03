import { IsEnum, IsNotEmpty } from 'class-validator';
import { CONTENT_TYPE } from '../../../constants/ContentAction';

export class UserReportContentRequest {

    @IsNotEmpty()
    public typeId: string;
    @IsNotEmpty()
    @IsEnum(CONTENT_TYPE)
    public type: string;
    @IsNotEmpty()
    public topic: string;
    public message: string;
}