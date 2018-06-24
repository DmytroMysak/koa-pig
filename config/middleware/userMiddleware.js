import _ from 'lodash';
import { models } from '../../models';
import UserDao from '../../dataAccess/UserDao';

export default function userMiddleware(req, res, next) {
  if (_.isEmpty(req.body)) {
    return next();
  }
  const userDao = new UserDao(models);
  const facebookId = req.body.entry[0].messaging[0].sender.id;

  return userDao.getUserByFacebookId(facebookId)
    .then((user) => {
      if (!_.isEmpty(user)) {
        return user;
      }
      return userDao.addUser({ facebookId, name: facebookId });
    })
    .then((user) => {
      req.user = user.get();
      return next();
    });
}
