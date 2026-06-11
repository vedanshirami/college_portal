const express = require("express");
const router = express.Router();

const {
  listSocietiesPublic,
  listSocietiesHighlightsPublic,
  listSubscriptionsByEmail,
  subscribeToSociety,
  unsubscribeFromSociety,
} = require("../controllers/society/public-society.controller");

router.get("/", listSocietiesPublic);
router.get("/highlights", listSocietiesHighlightsPublic);
router.get("/subscriptions", listSubscriptionsByEmail);
router.post("/:societyId/subscribe", subscribeToSociety);
router.post("/:societyId/unsubscribe", unsubscribeFromSociety);

module.exports = router;
