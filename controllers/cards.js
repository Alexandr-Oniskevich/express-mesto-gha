const Card = require('../models/card');
const NotFoundError = require('../utils/errors/NotFoundError');
const BadRequestError = require('../utils/errors/BadRequestError');
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
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(error);
      }
    });
};

const deleteCard = (req, res, next) => Card.findById(req.params.cardId)
  .then((card) => {
    if (!card) {
      next(new NotFoundError('Карточка по указанному _id не найдена'));
      return;
    }
    if (!(card.owner.equals(req.user._id))) {
      next(new Forbidden('Чужая карточка не может быть удалена'));
      return;
    }
    card.deleteOne()
      .then(() => res.send({ message: 'Карточка удалена' }))
      .catch(next);
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
      next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
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
      next(new BadRequestError('Переданы некорректные данные для снятии лайка'));
    } else {
      next(error);
    }
  });

module.exports = {
  getCard, createCard, deleteCard, likeCard, deleteLike,
};
