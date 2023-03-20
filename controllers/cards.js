const Card = require('../models/card');
const NotFoundError = require('../utils/errors/NotFoundError');
const ErrorCode = require('../utils/errors/ErrorCode');
const Forbidden = require('../utils/errors/Forbidden');

const { SUCCESS } = require('../utils/constants');

const getCard = (req, res, next) => Card.find({})
  .then((card) => res.send({ data: card }))
  .catch(next);

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  return Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(SUCCESS).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new ErrorCode('Переданы некорректные данные при создании карточки'));
      } else {
        next(error);
      }
    });
};

const deleteCard = (req, res, next) => Card.findById(req.params.cardId)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Карточка по указанному _id не найдена'));
    }
    if (!(card.owner.equals(req.user._id.toString()))) {
      next(new Forbidden('Чужая карточка не может быть удалена'));
    } else {
      card.deleteOne().then(() => res.send({ message: 'Карточка удалена' }));
    }
  })
  .catch(next);

const likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (card) {
      res.send({ data: card });
    } else {
      next(new NotFoundError('Карточка по указанному _id не найдена'));
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      next(new ErrorCode('Переданы некорректные данные для постановки лайка'));
    } else {
      next(error);
    }
  });

const deleteLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (card) {
      res.send({ data: card });
    } else {
      next(new NotFoundError('Карточка по указанному _id не найдена'));
    }
  })
  .catch((error) => {
    if (error.name === 'CastError') {
      next(new ErrorCode('Переданы некорректные данные для снятии лайка'));
    } else {
      next(error);
    }
  });

module.exports = {
  getCard, createCard, deleteCard, likeCard, deleteLike,
};
