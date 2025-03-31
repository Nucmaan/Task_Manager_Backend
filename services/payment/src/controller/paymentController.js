const paymentService = require("../service/paymentService.js");

const processPayment = async (req, res) => {
  try {
    const { user_Id, amount, paymentDate } = req.body;
    const payment = await paymentService.processPayment(user_Id, amount, paymentDate);

 return res.status(201).json({
      message: "Payment recorded successfully",
      payment,
      balance: payment.balance, 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const withdrawPayment = async (req, res) => {
  try {
    const { user_Id, amount } = req.body;
    const { withdrawal, updatedBalance } = await paymentService.withdrawPayment(user_Id, amount);

    return res.status(201).json({
      message: "Withdrawal successful",
      withdrawal,
      balance: updatedBalance, 
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    return res.status(200).json({ payments });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch payments" });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const { user_Id } = req.params;
    const payments = await paymentService.getUserPayments(user_Id);
    return res.status(200).json({ payments });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user payments" });
  }
};



module.exports = { 
  processPayment,
  withdrawPayment,
  getAllPayments,
  getUserPayments
 };
