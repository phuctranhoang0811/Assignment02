const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Mô tả một câu hỏi được lưu trong MongoDB.
const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },

  options: {
    type: [String],
    required: true
  },

  correctAnswerIndex: {
    type: Number,
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);

// GET /api/questions: xem tất cả câu hỏi.
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/questions: tạo một câu hỏi.
router.post('/', async (req, res) => {
  try {
    const { text, options, correctAnswerIndex } = req.body;

    if (
      !text ||
      !Array.isArray(options) ||
      options.length < 2 ||
      !Number.isInteger(correctAnswerIndex) ||
      correctAnswerIndex < 0 ||
      correctAnswerIndex >= options.length
    ) {
      return res.status(400).json({
        message: 'Câu hỏi cần nội dung, ít nhất 2 lựa chọn và đáp án hợp lệ.'
      });
    }

    const question = await Question.create({
      text,
      options,
      correctAnswerIndex
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/questions/:id — xem một câu hỏi.
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/questions/:id — sửa câu hỏi.
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const { text, options, correctAnswerIndex } = req.body;

    if (
      !text ||
      !Array.isArray(options) ||
      options.length < 2 ||
      !Number.isInteger(correctAnswerIndex) ||
      correctAnswerIndex < 0 ||
      correctAnswerIndex >= options.length
    ) {
      return res.status(400).json({
        message: 'Dữ liệu câu hỏi không hợp lệ'
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { text, options, correctAnswerIndex },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/questions/:id — xóa câu hỏi.
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Không tìm thấy câu hỏi' });
    }

    res.json({ message: 'Đã xóa câu hỏi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const axios = require('axios');
const pageRouter = express.Router();

const apiUrl = 'http://127.0.0.1:3000/api/questions';

// GET /questions — trang HTML danh sách.
pageRouter.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.render('questions/list.ejs', { questions });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET /questions/create — form tạo mới.
pageRouter.get('/create', (req, res) => {
  res.render('questions/create.ejs');
});

// POST /questions — nhận dữ liệu form rồi gọi API.
pageRouter.post('/', async (req, res) => {
  try {
    const options = req.body.options
      .split(',')
      .map(option => option.trim());

    await axios.post(apiUrl, {
      text: req.body.text,
      options,
      correctAnswerIndex: Number(req.body.correctAnswerIndex)
    });

    res.redirect('/questions');
  } catch (error) {
    res.status(400).send(
      error.response?.data?.message || 'Không tạo được câu hỏi.'
    );
  }
});

router.pageRouter = pageRouter;
module.exports = router;