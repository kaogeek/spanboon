/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import express from 'express';
import { ContainerInstance } from 'typedi';

export interface Context {
  requestId: number;
  request: express.Request;
  response: express.Response;
  container: ContainerInstance;
}
