const mongoose = require("mongoose");
const config = require("../config");

const recieptSchema = mongoose.Schema(
	{
		sellableItem: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "SellableItem",
			required: true,
		},
		buyer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		paidCreator: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Reciept", recieptSchema);
