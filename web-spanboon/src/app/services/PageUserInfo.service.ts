/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AbstractFacade } from './facade/AbstractFacade';
import { AuthenManager } from './AuthenManager.service'; 

// only page user can login
@Injectable()
export class PageUserInfo extends AbstractFacade {

  protected baseURL: string;
  protected http: HttpClient;
 
  private pageUsers: any = {};

  constructor(http: HttpClient, authMgr: AuthenManager) {
    super(http, authMgr);
    this.http = http;
    // this.imageAvatarFacade = imageAvatarFacade;
    this.baseURL = environment.apiBaseURL;
  }

  public getPageUsers(): any {
    return this.pageUsers;
  } 

  public getUserImage(user: any): string {
    if (user) {
      if (this.pageUsers[user.username] !== undefined && this.pageUsers[user.username] !== null)  {
        if (this.pageUsers[user.username].userImage) {
          return this.pageUsers[user.username].userImage;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  } 

  public addPageUser(user: any): void {
    if (user) {
      if (this.pageUsers[user.username] !== undefined && this.pageUsers[user.username] !== null) {
        if (!this.pageUsers[user.username].userImage) {
          this.setUserImage(user.username);
        }
      } else {
        this.pageUsers[user.username] = user;
        if (!this.pageUsers[user.username].userImage) {
          this.setUserImage(user.username);
        }
      }
    }
  } 
  
  public setUserImage(username: any): void {
    // this.imageAvatarFacade.avatarProfile(this.pageUsers[username].avatar, this.pageUsers[username].avatarPath).then((result: any) => {
    //   let blob = result;
    //   var reader = new FileReader();
    //   reader.readAsDataURL(blob);
    //   reader.onloadend = () => {
    //     var base64data = reader.result;
    //     this.pageUsers[username].userImage = base64data;
    //   }
    // }).catch((error: any) => {
    //   this.pageUsers[username].userImage = undefined;
    // });
  }

}
