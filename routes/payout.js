const router = require("express").Router();
const SellableItem = require("../models/SellableItem");
const authOnlyMiddleware = require("../middlewares/authOnly");
const Reciept = require("../models/Reciept");
const PrintJob = require("../models/PrintJob");

// route to get due amount
router.get("/due", authOnlyMiddleware([]), async (req, res) => {
	const reciepts = await Reciept.find({
		creator: req.auth.user,
		paidCreator: false,
	});

	let dueAmount = 0;
	for (let i = 0; i < reciepts.length; i++) dueAmount += reciepts[i].price;

	res.json({ dueAmount });
});

// route to get paid
router.post("/withdraw", authOnlyMiddleware([]), async (req, res) => {
	const reciepts = await Reciept.find({
		creator: req.auth.user,
		paidCreator: false,
	});

	let paidAmount = 0;
	for (let i = 0; i < reciepts.length; i++) {
		paidAmount += reciepts[i].price;
		reciepts[i].paidCreator = true;
		await reciepts[i].save();
	}

	res.json({ paidAmount });
});

module.exports = router;
