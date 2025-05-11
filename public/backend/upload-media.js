const multer = require("multer");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });

app.post("/api/profile", upload.array("media", 5), async (req, res) => {
  try {
    const files = req.files || [];
    const uploadedMediaURLs = [];

    for (const file of files) {
      const destination = `media/${file.originalname}`;
      await bucket.upload(file.path, {
        destination,
        metadata: {
          contentType: file.mimetype,
        },
      });

      fs.unlinkSync(file.path);

      const firebaseFile = bucket.file(destination);
      const [url] = await firebaseFile.getSignedUrl({
        action: "read",
        expires: "03-01-2030",
      });

      uploadedMediaURLs.push(url);
    }

    const { name, bio, linkedinURL } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      name,
      bio,
      linkedinURL,
      mediaURLs: uploadedMediaURLs,
    });

    res.json({ success: true, mediaURLs: uploadedMediaURLs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed." });
  }
});
