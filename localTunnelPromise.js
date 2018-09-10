import localtunnel from 'localtunnel';
import logger from './helper/logger';

const localTunnelPromise = (port, options) => new Promise((resolve, reject) => {
  const tunnel = localtunnel(port, options, (err, result) => (err ? reject(err) : resolve(result)));
  tunnel.on('close', () => logger.log('tunnels are closed'));
  tunnel.on('error', err => console.error(err));
});

export default localTunnelPromise;
