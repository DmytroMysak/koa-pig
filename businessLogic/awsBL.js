import AWS from 'aws-sdk';
import config from '../config/env';

AWS.config = new AWS.Config({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const Polly = new AWS.Polly({
  signatureVersion: 'v4',
});

export default Polly;
