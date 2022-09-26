const router = require("express").Router();
const SellableItem = require("../models/SellableItem");
const authOnlyMiddleware = require("../middlewares/authOnly");

// route to get all sellable items
router.get("/", async (req, res) => {
	try {
		res.json(await SellableItem.find());
	} catch (err) {
		console.error(err);
		res.send(500);
	}
});

// route to create sellable item
router.post("/", authOnlyMiddleware([]), async (req, res) => {
	const { title, price, description, objectUrl, images, sellableType } =
		req.body;

	// dealing with missing fields
	if (!(title && price && description && objectUrl && sellableType))
		return res.json({
			msg: "missing title, price, description, objectUrl and sellableType in req body",
		});

	try {
		const newSellableItem = new SellableItem({
			creator: req.auth.user,
			title,
			price,
			description,
			objectUrl,
			images,
			sellableType,
		});
		res.json(await newSellableItem.save());
	} catch (err) {
		res.status(500).json({ err });
	}
});

module.exports = router;
