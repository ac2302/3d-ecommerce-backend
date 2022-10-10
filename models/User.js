const mongoose = require("mongoose");
const config = require("../config");

const userSchema = mongoose.Schema(
	{
		email: {
			type: String,
			unique: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: config.auth.roles.default,
			enum: config.auth.roles.list,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		ownedItems: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "SellableItem",
			default: [],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
