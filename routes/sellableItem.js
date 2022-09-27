const router = require("express").Router();
const SellableItem = require("../models/SellableItem");
const authOnlyMiddleware = require("../middlewares/authOnly");
const Reciept = require("../models/Reciept");

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

// route to buy item
router.post("/buy/:id", authOnlyMiddleware([]), async (req, res) => {
	try {
		const foundItem = await SellableItem.findById(req.params.id);
		if (!foundItem) res.status(404).json({ msg: "item not found" });

		// adding item to user
		req.auth.user.ownedItems.push(foundItem);

		// creating reciept
		const newReciept = new Reciept({
			sellableItem: foundItem,
			buyer: req.auth.user,
			creator: foundItem.creator,
			price: foundItem.price,
		});

		// updating item stats
		foundItem.purchaces++;

		res.json({
			user: await req.auth.user.save(),
			reciept: await newReciept.save(),
			item: await foundItem.save(),
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ err });
	}
});

// get owned items
router.get("/owned", authOnlyMiddleware([]), async (req, res) => {
	try {
		await req.auth.user.populate("ownedItems");
		res.json(req.auth.user.ownedItems);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err });
	}
});

module.exports = router;
