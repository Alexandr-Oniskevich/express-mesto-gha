const router = require('express').Router();
const {
  getUsers, getUsersId, createUsers, changeUserInfo, changeAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUsersId);
router.post('/', createUsers);
router.patch('/me', changeUserInfo);
router.patch('/me/avatar', changeAvatar);

module.exports = router;
