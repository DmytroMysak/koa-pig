import _ from 'lodash';
import { models } from '../../models';
import UserDao from '../../dataAccess/UserDao';

export default function userMiddleware(req, res, next) {
  const userDao = new UserDao(models);
  const testUser = {
    mac: 'test user',
    name: 'test',
  };

  return userDao.getUserByMac(testUser.mac)
    .then((user) => {
      if (!_.isEmpty(user)) {
        return user;
      }
      return userDao.addUser(testUser);
    })
    .then((user) => {
      req.user = user.get();
      return next();
    });
}
