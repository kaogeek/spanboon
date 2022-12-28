import 'reflect-metadata';

export class OtpRequest {

    public email: string;
    public otp:number;
    public username: string;
    public password: string;
    public token: string;
    public idToken: string;
    public authToken: string;
    public twitterOauthToken: string;
    public twitterOauthTokenSecret: string;
    public twitterUserId: string; // ! remove when fix a bug when verify
    public apple: string;
    public facebookObject: any;
}