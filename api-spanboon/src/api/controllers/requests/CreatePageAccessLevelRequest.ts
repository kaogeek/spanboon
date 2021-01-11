import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class CreatePageAccessLevelRequest {

    @IsNotEmpty({ message: 'user id is required' })
    public user: string;

    @IsNotEmpty({ message: 'level is required' })
    public level: string;
}