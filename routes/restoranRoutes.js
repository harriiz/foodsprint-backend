const express = require("express");
const { get } = require("mongoose");
const router = express.Router();
const restoraniController = require("../controllers/restoraniController");
const verifyJWT = require("../middleware/verifyJWT");
const upload = require("multer")({ dest: "uploads/" });
const { searchRestorani } = require("../controllers/restoraniController");
router.use(verifyJWT);

router
  .route("/")
  .get(restoraniController.getAllRestorani)
  .post(restoraniController.createNewRestoran)
  .patch(restoraniController.updateRestoran)
  .delete(restoraniController.deleteRestoran);
router.get("/search", searchRestorani);
module.exports = router;
