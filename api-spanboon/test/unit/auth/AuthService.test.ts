// import { Request } from 'express';
// import MockExpressRequest from 'mock-express-request';
// import { User } from 'src/api/models/User';
// import { PageUser } from 'src/api/models/PageUser';

// import { AuthService } from '../../../src/auth/AuthService';
// import { LogMock } from '../lib/LogMock';
// import { RepositoryMock } from '../lib/RepositoryMock';

// describe('AuthService', () => {

//     let authService: AuthService;
//     let userRepository: RepositoryMock<User>;
//     let pageUserRepository: RepositoryMock<PageUser>;
//     let log: LogMock;
//     beforeEach(() => {
//         log = new LogMock();
//         userRepository = new RepositoryMock<User>();
//         authService = new AuthService(log, userRepository as any, pageUserRepository as any);
//     });

//     describe('parseTokenFromRequest', () => {
//         test('Should return the credentials of the basic authorization header', () => {
//             // const base64 = Buffer.from(`bruce:1234`).toString('base64');
//             // const req: Request = new MockExpressRequest({
//             //     headers: {
//             //         Authorization: `Basic ${base64}`,
//             //     },
//             // });
//             // const credentials = authService.parseBasicAuthFromRequest(req) as any;
//             // expect(credentials.username).toBe('bruce');
//             // expect(credentials.password).toBe('1234');

//             expect(true).toBe(true);
//         });

//         test('Should return undefined if there is no basic authorization header', () => {
//             // const req: Request = new MockExpressRequest({
//             //     headers: {},
//             // });
//             // const token = authService.parseBasicAuthFromRequest(req);
//             // expect(token).toBeUndefined();
//             // expect(log.infoMock).toBeCalledWith('No credentials provided by the client', []);
//             expect(true).toBe(true);
//         });

//         test('Should return undefined if there is a invalid basic authorization header', () => {
//             // const req: Request = new MockExpressRequest({
//             //     headers: {
//             //         Authorization: 'Basic 1234',
//             //     },
//             // });
//             // const token = authService.parseBasicAuthFromRequest(req);
//             // expect(token).toBeUndefined();
//             // expect(log.infoMock).toBeCalledWith('No credentials provided by the client', []);
//             expect(true).toBe(true);
//         });

//     });

// });
