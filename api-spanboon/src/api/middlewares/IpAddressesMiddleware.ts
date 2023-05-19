import { EventEmitter } from 'events';
interface IpAddressesEventData {
  ipAddress: string;
}
const eventEmitter = new EventEmitter();
const handleFacebookEvent = (data: IpAddressesEventData) => {
  console.log('IpAddress -> :', data.ipAddress);
  // Here you can perform any necessary logic with the received data
};

export const IpAddressEvent = eventEmitter;
eventEmitter.on(process.env.EVENT_LISTENNER, handleFacebookEvent);