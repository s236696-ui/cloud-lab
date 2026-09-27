const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// CORS
app.use(cors());

app.use(express.json());

// PORT
const PORT = process.env.PORT || 5000;

// ============ ROUTE TRANG CHỦ ============
app.get("/", (req, res) => {
  res.send("Backend MERN đang hoạt động!");
});

// ============ ĐỊNH NGHĨA MODEL STUDENT ============
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Student = mongoose.model("Student", studentSchema);

// ============ API TEST ============
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Backend MERN đang hoạt động!"
  });
});

// ============ CÂU 36: GET /api/students ============
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ CÂU 37: POST /api/students ============
app.post("/api/students", async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    if (!studentId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ studentId, name và email"
      });
    }

    const existingStudent = await Student.findOne({
      $or: [{ studentId }, { email }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "StudentId hoặc Email đã tồn tại"
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ============ CÂU 38: PUT /api/students/:id ============
app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, name, email } = req.body;

    if (!studentId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ studentId, name và email"
      });
    }

    const existingStudent = await Student.findOne({
      _id: { $ne: id },
      $or: [{ studentId }, { email }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "StudentId hoặc Email đã tồn tại với sinh viên khác"
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { studentId, name, email },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên với ID này"
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ============ CÂU 39: DELETE /api/students/:id ============
app.delete("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sinh viên với ID này"
      });
    }

    res.json({
      success: true,
      message: "Xóa sinh viên thành công",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// ============ KẾT NỐI MONGODB ============
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
      console.log("📚 API endpoints:");
      console.log("   GET    /");
      console.log("   GET    /api/hello");
      console.log("   GET    /api/students");
      console.log("   POST   /api/students");
      console.log("   PUT    /api/students/:id");
      console.log("   DELETE /api/students/:id");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });