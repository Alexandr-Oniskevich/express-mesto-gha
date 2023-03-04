const router = require('express').Router();

const {
  getCard, createCard, deleteCard, likeCard, deleteLike,
} = require('../controllers/cards');

router.get('/', getCard);
router.post('/', createCard);
router.delete('/:cardId', deleteCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', deleteLike);

module.exports = router;
