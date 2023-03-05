const User = require('../models/user');

const {
  ERROR_CODE, ERROR_NO_USER, ERROR_SERVER, SUCCESS,
} = require('../utils/constants');

const getUsers = (req, res) => User.find({})
  .then((users) => res.status(SUCCESS).send({ data: users }))
  .catch(() => res.status(ERROR_SERVER).send('Ошибка сервера'));

const getUsersId = (req, res) => User.findById(req.params.userId)
  .then((user) => {
    if (user) {
      res.send({ data: user });
    } else {
      res.status(ERROR_NO_USER).send({ message: 'Пользователь по указанному _id не найден' });
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      res.status(ERROR_CODE).send({ message: 'Некорректный _id пользователя' });
    } else {
      res.status(ERROR_SERVER).send('Ошибка сервера');
    }
  });

const createUsers = (req, res) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then((user) => res.status(SUCCESS).send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(ERROR_SERVER).send('Ошибка сервера');
      }
    });
};

const changeUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((userInfo) => res.send({ data: userInfo }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        res.status(ERROR_SERVER).send('Ошибка сервера');
      }
    });
};

const changeAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((userAvatar) => res.send({ data: userAvatar }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(ERROR_SERVER).send('Ошибка сервера');
      }
    });
};

module.exports = {
  getUsers,
  getUsersId,
  createUsers,
  changeUserInfo,
  changeAvatar,
};
