/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

/**
 * <p style="text-indent: 2em;">
 * A <code>ng</code> service which is mainly responsible for providing publish/subscribe <code>Messaging API</code>. You can easily create/publish/subscribe a
 * <code>message topic</code> by using this service. This service uses <code>RxJS</code>'s <code>Observable / Subject API</code> as a core engine. Neverthelss, it does not
 * require you to have any background on <code>RxJS</code> since it simplifies the <code>RxJS</code>'s API by providing a new way to use it. For example, in
 * <code>RxJS</code>'s normal way, you may need to keep a reference to an <code>Subject</code> object all the time in which that the <code>message topic</code>
 * is still active. Moreover, if you have more <code>message topic</code>s to handle, you must keep more <code>Subject</code> instance references separately.
 * In spite of that, this service diminishes those struggles by mapping each <code>Subject</code> object instance to a <code>topic name</code>. When you want
 * to interact with those topics, you could simply supply the <code>topic name</code> to this service. For more information, please see methods of this class
 * below.
 * </p>
 * <p style="text-indent: 2em;">
 * If you only want to publish/subscribe to a topic. Please see [[publish]] and [[subscribe]] method below.
 * </p>
 *
 * @author shiorin, tee4cute
 */
@Injectable()
export class ObservableManager {

  private subjects: any;

  constructor() {
    this.subjects = {};
  }

  /**
   * <p style="text-indent: 1em;">
   * Get the <code>RxJS</code>'s <code>Subject</code> object bound to the given topic <code><b>name</b></code>.
   * </p>
   *
   * @param name A message topic name to get.
   *
   * @return Returns <code>null</code> if the given topic <code><b>name</b></code> is not created yet.
   */
  public getSubject(name: string): Subject<any> {
    if (name === null || typeof name !== 'string') {
      return null;
    }

    let re: any = this.subjects[name];

    if (typeof re === 'undefined') {
      re = null;
    }

    return re;
  }

  /**
   * <p style="text-indent: 1em;">
   * To check that there already is <code>RxJS</code>'s <code>Subject</code> object bound to the given topic
   * <code><b>name</b></code> or not.
   * </p>
   *
   * @param name A message topic name to check.
   */
  public containsSubject(name: string): boolean {
    if (name === null || typeof name !== 'string') {
      return false;
    }

    let subj: Subject<any> = this.getSubject(name);

    return subj !== null && typeof subj !== 'undefined';
  }

  /**
   * <p style="text-indent: 1em;">
   * Create a new <code>Subject</code> (or topic) and map it to the given topic <code><b>name</b></code>. This method will return
   * the old object instance if the given <code><b>"name"</b></code> already exists.
   * </p>
   *
   * @param name A message topic name to create <code>Subject</code>.
   */
  public createSubject(name: string): Subject<any> {
    if (name === null || typeof name !== 'string') {
      return null;
    }

    if (this.containsSubject(name)) {
      // If the given name already exists, return the old one.
      return this.getSubject(name);
    }

    // console.debug('Obsv Mgr: Creating subject for topic "' + name + '".');

    this.subjects[name] = new Subject<any>();

    return this.subjects[name];
  }

  /**
   * <p style="text-indent: 1em;">
   * Subscribe message to the given topic <code><b>name</b></code>. This method will automatically create the topic if the given
   * topic name is not created yet.
   * </p>
   *
   * @param name A message topic name to subscribe.
   * @param handler A message <code>handler function</code> which will be triggered when message arrives.
   * @param errorHandler An error <code>handler function</code> which will be triggered when any error occurs on the [[Observer]].
   * @param completeHandler A <code>handler function</code> which will be triggered when the topic is closed and not publishes any messages anymore.
   *
   * @return A <code>RxJS</code>'s <code>Subscription</code> object returning from <code>Subject.subscribe()</code> method.
   */
  public subscribe(name: string, handler: any, errorHandler?: any, completeHandler?: any): Subscription {
    if (name === null || typeof name !== 'string') {
      return null;
    }

    if (!this.containsSubject(name)) {
      // Auto create topic if does not exist.
      this.createSubject(name);
    }

    console.debug('Obsv Mgr: Subscribing topic "' + name + '".');

    return this.subjects[name].subscribe(handler, errorHandler, completeHandler);
  }

  /**
   * <p style="text-indent: 1em;">
   * Publish a message (<code><b>data</b></code>) to the given topic <code><b>name</b></code>. The subscriber's <code>handler function</code> will be
   * triggered with the given <code><b>data</b></code> passed as a parameter. This method will automatically create the topic if the given
   * topic name is not created yet.
   * </p>
   *
   * @param name The message topic name to publish.
   * @param data The message data to publish.
   */
  public publish(name: string, data: any): void {
    if (name === null || typeof name !== 'string') {
      return;
    }

    if (!this.containsSubject(name)) {
      // Auto create topic if does not exist.
      this.createSubject(name);
    }

    // console.debug('Obsv Mgr: Publishing to topic "' + name + '" [data=' + JSON.stringify(data) + '].');

    this.getSubject(name).next(data);
  }

  /**
   * <p style="text-indent: 1em;">
   * Signal error message to the given topic <code><b>name</b></code>. The subscriber's <code>error function</code> will be
   * triggered with the given <code><b>error</b></code> passed as a parameter. This method will automatically create the topic if the given
   * topic name is not created yet.
   * </p>
   *
   * @param name The message topic name to signal.
   * @param error The error message to signal.
   */
  public error(name: string, error: any): void {
    if (name === null || typeof name !== 'string') {
      return;
    }

    if (!this.containsSubject(name)) {
      // Auto create topic if does not exist.
      this.createSubject(name);
    }

    console.debug('Obsv Mgr: Signal error to topic "' + name + '" [error=' + JSON.stringify(error) + '].');

    this.getSubject(name).error(error);
  }

  /**
   * <p style="text-indent: 1em;">
   * Close the specified topic <code><b>name</b></code>. If there is currently no <code>message topic</code> created or no one subsribing to this topic, this
   * method will do nothing. Otherwise, the subscriber's <code>complete handler function</code> will be triggered. Note that, we use the method name <code>
   * complete</code> instead of <code>close</code> since we try to use the same naming as <code>RxJS</code> does as much as possible.
   * </p>
   *
   * @param name The message topic name to close.
   */
  public complete(name: string): void {
    if (name === null || typeof name !== 'string') {
      return;
    }

    if (!this.containsSubject(name)) {
      return;
    }

    this.getSubject(name).complete();

    delete this.subjects[name];
  }

}
