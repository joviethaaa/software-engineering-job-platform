const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createTables } = require("./config/schema");
createTables();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const jobRoutes = require("./routes/jobs");
app.use("/api/jobs", jobRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const companyRoutes = require("./routes/companies");
app.use("/api/companies", companyRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Group 10 API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

