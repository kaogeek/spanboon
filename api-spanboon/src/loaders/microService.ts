import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import amqp from 'amqplib';
export const MicroServices:MicroframeworkLoader = async (settings:MicroframeworkSettings| undefined) => {
    try{
        const amqpServer = 'amqps://wnrrlryn:jrWKNJkO9TtPBqCCVrmWMbotrdA36jZm@cow.rmq2.cloudamqp.com/wnrrlryn';
        const connection = await amqp.connect(amqpServer);
        const channel = await connection.createChannel();
        await channel.assertQueue('rabbit');
    }catch(err){
        console.log(err);
    }
};