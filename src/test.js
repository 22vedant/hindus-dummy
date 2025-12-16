// test_trigger.js
import { PubSub } from '@google-cloud/pubsub';
// Set the PUBSUB_EMULATOR_HOST environment variable or specify apiEndpoint in PubSub constructor
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085'; // Use the port from your emulator output
const pubsubClient = new PubSub({
  projectId: 'first-test-12cd8'
});

const functionName = 'daily6PMQuizGen';
const topic = `firebase-schedule-${functionName}`;

async function triggerFunction() {
  console.log(`Triggering scheduled function via PubSub topic: ${topic}`);

  await pubsubClient.topic(topic).publishMessage({
    json: {}
  });

  console.log('Trigger sent!');

  const [topics] = await pubsubClient.getTopics();
  console.log(topics.map(t => t.name));
}


triggerFunction();
