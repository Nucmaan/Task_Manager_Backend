const express = require("express");
const { processPayment, getAllPayments, getUserPayments, withdrawPayment } = require("../controller/paymentController.js");

const router = express.Router();

router.post("/process-payment", processPayment);
router.post("/withdraw", withdrawPayment);
router.get("/all", getAllPayments);
router.get("/user/:user_Id", getUserPayments);

module.exports = router;
