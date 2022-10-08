const mongoose = require("mongoose");

const printJobSchema = mongoose.Schema(
	{
		buyer: {
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
		volume: {
			type: Number,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
		objectUrl: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: [
				"pending",
				"declined",
				"confirmed",
				"printing",
				"delivering",
				"delivered",
			],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("PrintJob", printJobSchema);
