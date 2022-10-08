const mongoose = require("mongoose");
const config = require("../config");

const sellableItemSchema = mongoose.Schema(
	{
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		purchaces: {
			type: Number,
			default: 0,
		},
		objectUrl: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: true,
		},
		sellableType: {
			type: String,
			enum: ["model", "shader"],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("SellableItem", sellableItemSchema);
