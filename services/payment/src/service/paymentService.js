const axios = require("axios");
const Payment = require("../model/paymentModel.js");

const processPayment = async (user_Id, amount, paymentDate) => {
  if (!user_Id || !amount || !paymentDate) {
    throw new Error("Missing required fields");
  }

  const lastPayment = await Payment.findOne({
    where: { user_Id },
    order: [["paymentId", "DESC"]], 
  });

  const newBalance = lastPayment ? parseFloat(lastPayment.balance) + parseFloat(amount) : parseFloat(amount);

   const payment = await Payment.create({
    user_Id,
    amount,
    balance: newBalance,
    paymentDate,
  });

  return payment;
};


const getUserPayments = async (user_Id) => {
  return await Payment.findAll({
    where: { user_Id },
    order: [["paymentDate", "DESC"]],
  });
};

const getAllPayments = async () => {
  return await Payment.findAll();
};


const withdrawPayment = async (user_Id, amount) => {
  if (!user_Id || !amount) {
    throw new Error("Missing required fields");
  }

   const lastPayment = await Payment.findOne({
    where: { user_Id },
    order: [["paymentId", "DESC"]], 
  });

  if (!lastPayment || parseFloat(lastPayment.balance) < parseFloat(amount)) {
    throw new Error("Insufficient balance to withdraw");
  }

  const newBalance = parseFloat(lastPayment.balance) - parseFloat(amount);

   const withdrawal = await Payment.create({
    user_Id,
    amount: -amount, 
    balance: newBalance, 
    paymentDate: new Date(),
  });

  return { withdrawal, updatedBalance: newBalance };
};



module.exports = {
  processPayment,
  getUserPayments,
  getAllPayments,
  withdrawPayment
};
