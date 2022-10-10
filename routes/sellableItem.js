const router = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const SellableItem = require("../models/SellableItem");
const authOnlyMiddleware = require("../middlewares/authOnly");
const Reciept = require("../models/Reciept");
const config = require("../config");

// route to get all sellable items
router.get("/", async (req, res) => {
	try {
		res.json(await SellableItem.find());
	} catch (err) {
		console.error(err);
		res.send(500);
	}
});

// route to get sellable item by id
router.get("/:id", async (req, res) => {
	try {
		res.json(await SellableItem.findById(req.params.id));
	} catch (err) {
		console.error(err);
		res.send(500);
	}
});

// route to create sellable item
router.post("/", authOnlyMiddleware([]), async (req, res) => {
	const { title, price, description, objectUrl, image, sellableType } =
		req.body;

	// dealing with missing fields
	if (!(title && price && description && objectUrl && image && sellableType))
		return res.json({
			msg: "missing title, price, description, objectUrl, image or sellableType in req body",
		});

	try {
		const newSellableItem = new SellableItem({
			creator: req.auth.user,
			title,
			price,
			description,
			objectUrl,
			image,
			sellableType,
		});
		res.json(await newSellableItem.save());
	} catch (err) {
		res.status(500).json({ err });
	}
});

// route to create order for buying item
router.post("/order/:id", authOnlyMiddleware([]), async (req, res) => {
	try {
		const itemId = req.params.id;

		if (req.auth.user.ownedItems.includes(itemId))
			return res.status(400).json({ message: "already owned" });

		const foundItem = await SellableItem.findById(itemId);
		if (!foundItem)
			return res.status(404).json({ message: "item not found" });

		const instance = new Razorpay({
			key_id: config.razorpay.keyId,
			key_secret: config.razorpay.keySecret,
		});

		const options = {
			amount: foundItem.price * 100,
			currency: "INR",
			receipt: crypto.randomBytes(10).toString("hex"),
		};

		instance.orders.create(options, (error, order) => {
			if (error) {
				console.log(error);
				return res
					.status(500)
					.json({ message: "Something Went Wrong!" });
			}
			res.status(200).json({ data: order });
		});
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error!" });
		console.log(error);
	}
});

// route to verify order
router.post("/verify/:id", authOnlyMiddleware([]), async (req, res) => {
	try {
		const itemId = req.params.id;

		if (req.auth.user.ownedItems.includes(itemId))
			return res.status(400).json({ message: "already owned" });

		const foundItem = await SellableItem.findById(itemId);
		if (!foundItem) return res.status(404).json({ message: "item not found" });

		const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
			req.body;
		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSign = crypto
			.createHmac("sha256", config.razorpay.keySecret)
			.update(sign.toString())
			.digest("hex");

		if (razorpay_signature === expectedSign) {
			const newReciept = new Reciept({
				paymentId: razorpay_payment_id,
				orderId: razorpay_order_id,
				sellableItem: foundItem,
				buyer: req.auth.user,
				creator: foundItem.creator,
				price: foundItem.price,
			});
			await newReciept.save();

			req.auth.user.ownedItems.push(itemId);
			await req.auth.user.save();

			return res
				.status(200)
				.json({ message: "Payment verified successfully" });
		} else {
			return res.status(400).json({ message: "Invalid signature sent!" });
		}
	} catch (error) {
		res.status(500).json({ message: "Internal Server Error!" });
		console.log(error);
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
