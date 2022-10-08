const router = require("express").Router();
const _ = require("lodash");
const path = require("path");

router.post("/upload", async (req, res) => {
	try {
		if (!req.files) {
			res.send({
				status: false,
				message: "No file uploaded",
			});
		} else {
			//Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
			let uploadedFile = req.files.file;

			const randomString =
				(Math.random() + 1).toString(36).substring(7) +
				(Math.random() + 1).toString(36).substring(7) +
				(Math.random() + 1).toString(36).substring(7) +
				(Math.random() + 1).toString(36).substring(7) +
				(Math.random() + 1).toString(36).substring(7);

			//Use the mv() method to place the file in upload directory (i.e. "uploads")
			uploadedFile.mv(`./uploads/${randomString}-${uploadedFile.name}`);

			//send response
			res.send({
				status: true,
				message: "File is uploaded",
				data: {
					name: `${randomString}-${uploadedFile.name}`,
					mimetype: uploadedFile.mimetype,
					size: uploadedFile.size,
				},
			});
		}
	} catch (err) {
		res.status(500).send(err);
	}
});

router.get("/download/:filename", (req, res) => {
	try {
		res.sendFile(path.resolve("./uploads/" + req.params.filename));
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;
