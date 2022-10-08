const router = require("express").Router();
const SellableItem = require("../models/SellableItem");
const authOnlyMiddleware = require("../middlewares/authOnly");
const Reciept = require("../models/Reciept");
const PrintJob = require("../models/PrintJob");

// route to get all printJobs
router.get("/", async (req, res) => {
	res.json(await PrintJob.find());
});

// route to create printJob
router.post("/", authOnlyMiddleware([]), async (req, res) => {
	const { title, volume, quantity, objectUrl, address } = req.body;

	// dealing with missing fields
	if (!(title && volume && quantity && objectUrl && address))
		return res.json({
			msg: "missing title, volume, quantity, objectUrl or address in req body",
		});

	const price = volume * quantity;

	try {
		const newPrintJob = new PrintJob({
			buyer: req.auth.user,
			title,
			price,
			volume,
			quantity,
			objectUrl,
			address,
		});
		res.json(await newPrintJob.save());
	} catch (err) {
		res.status(500).json({ err });
	}
});

// route to get user's printJobs
router.get("/self", authOnlyMiddleware([]), async (req, res) => {
	try {
		res.json(await PrintJob.find({ buyer: req.auth.user }));
	} catch (err) {
		res.status(500).json({ err });
	}
});

// route to change printJob's status
router.post(
	"/change-status/:id",
	authOnlyMiddleware(["admin"]),
	async (req, res) => {
		const { status } = req.body.status;
		if (!status) return res.status(400).json({ msg: "invalid status" });

		try {
			const job = await PrintJob.findById(req.params.id);
			job.status = status;

			return res.json(await job.save());
		} catch (err) {
			res.status(500).json({ err });
		}
	}
);

module.exports = router;
