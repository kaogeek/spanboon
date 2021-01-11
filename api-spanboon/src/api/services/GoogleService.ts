/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { AuthenticationIdService } from './AuthenticationIdService';
import { google_setup } from '../../env';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { UserService } from './UserService';
import { ObjectID } from 'mongodb';

@Service()
export class GoogleService {

  protected CLIENT_ID = google_setup.GOOGLE_CLIENT_ID;
  protected CLIENT_SECRET = google_setup.GOOGLE_CLIENT_SECRET;
  protected REDIRECT_URL = google_setup.GOOGLE_REDIRECT_URL;
  protected SCOPES = google_setup.GOOGLE_SCOPES;
  protected CLIENT: OAuth2Client;

  constructor(private authenIdService: AuthenticationIdService, private userService: UserService) {
    this.CLIENT = this.createGoogle();
  }

  public createGoogle(): OAuth2Client {
    return new google.auth.OAuth2(this.CLIENT_ID, this.CLIENT_SECRET, this.REDIRECT_URL);
  }

  public async verifyIdToken(idToken: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const ticket = await this.CLIENT.verifyIdToken({ idToken, audience: this.CLIENT_ID });
      const payload = ticket.getPayload();

      if (payload !== null && payload !== undefined) {
        const userId = payload.sub;
        const email = payload.email;
        const firstName = payload.given_name;
        const lastName = payload.family_name;
        const imageURL = payload.picture;
        const expire = payload.exp;
        const result = { userId, email, firstName, lastName, imageURL, expire };

        resolve(result);
      } else {
        reject(undefined);
      }
    });
  }

  public async getGoogleUser(userId: string, accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {

      this.authenIdService.findOne({ where: { providerUserId: userId } }).then((auth) => {
        console.log('auth >>> ', auth);
        if (auth === null || auth === undefined) {
          resolve(undefined);
        }

        this.userService.findOne({ where: { _id: new ObjectID(auth.user) } }).then((authUser) => {
          console.log('authUser >>> ', authUser);
          if (authUser) {
            authUser = this.userService.cleanAdminUserField(authUser);
            resolve({ token: accessToken, authId: auth, user: authUser });
          } else {
            resolve(undefined);
          }
        }).catch((userError) => { reject(userError); });
      }).catch((authError) => { reject(authError); });
    });
  }
}