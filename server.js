const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000; // Render sẽ cung cấp PORT

// Middleware
app.use(cors());
app.use(express.json());

// Đọc connection string từ biến môi trường
const mongoURI =
  process.env.MONGO_URI ||
  'mongodb+srv://dat261303:dat861457@dictionary.hmbch.mongodb.net/dictionary_db?retryWrites=true&w=majority';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a Word model for en_vi collection
const WordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    definition: { type: String, required: true },
  },
  { collection: 'en_vi' } // Gắn đúng bộ sưu tập
);

const Word = mongoose.model('Word', WordSchema);

// Route for searching words
app.get('/search', async (req, res) => {
  const query = req.query.q; // Lấy từ khóa tìm kiếm từ query string
  try {
    let words = await Word.find({
      word: { $regex: `^${query}`, $options: 'i' }, // '^' đảm bảo chỉ tìm từ bắt đầu
    }).limit(50);

    // Thêm ký tự xuống dòng trước '@'
    words = words.map((word) => {
      return {
        ...word._doc, // Giữ nguyên dữ liệu gốc
        definition: word.definition.replace(/@/g, '\n@'), // Chèn xuống dòng trước '@'
      };
    });

    res.json(words);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
