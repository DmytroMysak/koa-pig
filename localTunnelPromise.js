import localtunnel from 'localtunnel';
import logger from './helper/logger';

const localTunnelPromise = (port, options) => new Promise((resolve, reject) => {
  const tunnel = localtunnel(port, options, (err, result) => (err ? reject(err) : resolve(result)));
  tunnel.on('close', () => logger.log('tunnels are closed'));
  tunnel.on('error', (err) => {
    logger.error(err);
    // тому що вінстон 3.0 гамно їбане блять
    console.log(err); // eslint-disable-line no-console
  });
});

export default localTunnelPromise;
