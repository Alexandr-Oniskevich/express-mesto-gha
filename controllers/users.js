const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
const NotUsersFound = require('../utils/errors/NotUsersFound');
const ConflictRequest = require('../utils/errors/ConflictRequest');
const { SUCCESS, BASE_ERROR } = require('../utils/constants');

const login = (req, res, next) => {
  const { email, password } = req.body;
  User
    .findOne({ email }).select('+password')
    .orFail(new NotUsersFound('Пользователь не найден'))
    .then((user) => bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        // аутентификация успешна
        return user;
        // хеши не совпали — отклоняем промис
      }
      return next(new NotUsersFound('Неправильная почта или пароль'));
    }))
    .then((user) => {
      const jwt = jsonwebtoken.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ jwt });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(SUCCESS).send({ data: user }))
    .catch(next);
};

const getUsers = (req, res, next) => User.find({})
  .then((users) => res.status(SUCCESS).send({ data: users }))
  .catch(next);

const getUsersId = (req, res, next) => User.findById(req.params.userId)
  .then((user) => {
    if (user) {
      res.send({ data: user });
    } else {
      next(new NotFoundError('Пользователь по указанному _id не найден'));
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      next(new BadRequestError('Некорректный _id пользователя'));
    } else {
      next(error);
    }
  });

const createUsers = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(SUCCESS).send({
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else if (error.code === BASE_ERROR) {
        next(new ConflictRequest('Пользователь с указанной почтой уже есть в системе'));
      } else {
        next(error);
      }
    });
};

const changeUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((userInfo) => res.send({ data: userInfo }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(error);
      }
    });
};

const changeAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((userAvatar) => res.send({ data: userAvatar }))
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      } else {
        next(error);
      }
    });
};

module.exports = {
  getUsers,
  getUsersId,
  createUsers,
  changeUserInfo,
  changeAvatar,
  login,
  getCurrentUser,
};
