/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import { mail } from '../env';

export class MAILService {
    // for add customer API
    public static customerLoginMail(emailContent: any, email: any, Subject: any): Promise<any> {
        const emailData = undefined;
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(smtpTransport({
                pool: true,
                host: mail.HOST,
                port: mail.PORT,
                secure: mail.SECURE,
                auth: {
                    user: mail.AUTH.user,
                    pass: mail.AUTH.pass,
                },
            }));
            ejs.renderFile('./views/emailTemplate.ejs', { emailContent, emailData }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        from: '"' + process.env.MAIL_FROM_NAME + '" <' + mail.FROM + '>',
                        to: email,
                        subject: Subject,
                        html: data,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(info);
                        }
                    });
                }
            });
        });
    }
    //  customer register
    public static registerMail(emailContent: any, email: any, Subject: any): Promise<any> {
        const emailData = undefined;
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(smtpTransport({
                pool: true,
                host: mail.HOST,
                port: mail.PORT,
                secure: mail.SECURE,
                auth: {
                    user: mail.AUTH.user,
                    pass: mail.AUTH.pass,
                },
            }));
            ejs.renderFile('./views/emailTemplate.ejs', { emailContent, emailData }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        from: '"' + process.env.MAIL_FROM_NAME + '" <' + mail.FROM + '>',
                        to: email,
                        subject: Subject,
                        html: data,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(info);
                        }
                    });
                }
            });
        });
    }
    // forgot password
    public static passwordForgotMail(emailContent: any, email: any, Subject: any): Promise<any> {
        const emailData = undefined;
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(smtpTransport({
                pool: true,
                host: mail.HOST,
                port: mail.PORT,
                secure: mail.SECURE,
                auth: {
                    user: mail.AUTH.user,
                    pass: mail.AUTH.pass,
                },
            }));
            ejs.renderFile('./views/emailTemplate.ejs', { emailContent, emailData }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        from: '"' + process.env.MAIL_FROM_NAME + '" <' + mail.FROM + '>',
                        to: email,
                        subject: Subject,
                        html: data,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(info);
                        }
                    });
                }
            });
        });
    }
    // push notification
    public static pushNotification(emailContent: any, email: any, Subject: any): Promise<any> {
        const emailData = undefined;
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(smtpTransport({
                pool: true,
                host: mail.HOST,
                port: mail.PORT,
                secure: mail.SECURE,
                auth: {
                    user: mail.AUTH.user,
                    pass: mail.AUTH.pass,
                },
            }));
            ejs.renderFile('./views/emailTemplate.ejs', { emailContent, emailData }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        from: '"' + process.env.MAIL_FROM_NAME + '" <' + mail.FROM + '>',
                        to: email,
                        subject: Subject,
                        html: data,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(info);
                        }
                    });
                }
            });
        });
    }

    // contact Us
    public static contactMail(emailContent: string, Subject: any, adminId: any): Promise<any> {
        const emailData = undefined;
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(smtpTransport({
                pool: true,
                host: mail.HOST,
                port: mail.PORT,
                secure: mail.SECURE,
                auth: {
                    user: mail.AUTH.user,
                    pass: mail.AUTH.pass,
                },
            }));
            ejs.renderFile('./views/emailTemplate.ejs', { emailContent, emailData }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        to: adminId,
                        subject: Subject,
                        html: data,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(info);
                        }
                    });
                }
            });
        });
    }
    public static kaokaiToday(emailContent: any, email: any, Subject: any): Promise<any> {
        const emailData = undefined;
        console.log('Subject', Subject);
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(smtpTransport({
                pool: true,
                host: mail.HOST,
                port: mail.PORT,
                secure: mail.SECURE,
                auth: {
                    user: mail.AUTH.user,
                    pass: mail.AUTH.pass,
                },
            }));
            ejs.renderFile('./views/emailTemplate.ejs', { emailContent, emailData }, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    const mailOptions = {
                        from: '"' + process.env.MAIL_FROM_NAME + '" <' + mail.FROM + '>',
                        to: email,
                        subject: Subject,
                        html: data,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            reject(error);
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            resolve(info);
                        }
                    });
                }
            });
        });
    }
}
