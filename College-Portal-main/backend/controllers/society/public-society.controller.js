const ApiResponse = require("../../utils/ApiResponse");
const Society = require("../../models/society/society.model");
const SocietySubscription = require("../../models/society/subscription.model");
const SocietyEvent = require("../../models/society/event.model");
const SocietyProject = require("../../models/society/project.model");

const listSocietiesPublic = async (req, res) => {
  try {
    const societies = await Society.find({ status: "active" })
      .select("name description coverImageUrl website contact socials status")
      .sort({ name: 1 });
    return ApiResponse.success(societies, "Societies fetched").send(res);
  } catch (error) {
    console.error("listSocietiesPublic Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// Active societies with lightweight highlights: next upcoming event + recent projects (for card UI)
const listSocietiesHighlightsPublic = async (req, res) => {
  try {
    const limitProjects = Math.min(Number(req.query?.projectLimit || 2) || 2, 5);
    const now = new Date();

    const societies = await Society.find({ status: "active" })
      .select("name description coverImageUrl website contact socials status")
      .sort({ name: 1 })
      .lean();

    const societyIds = societies.map((s) => s._id);
    if (societyIds.length === 0) {
      return ApiResponse.success([], "Societies fetched").send(res);
    }

    const nextEvents = await SocietyEvent.aggregate([
      { $match: { societyId: { $in: societyIds }, scheduledAt: { $gte: now } } },
      { $sort: { scheduledAt: 1 } },
      {
        $group: {
          _id: "$societyId",
          event: {
            $first: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              scheduledAt: "$scheduledAt",
              venue: "$venue",
            },
          },
        },
      },
    ]);

    const recentProjects = await SocietyProject.aggregate([
      { $match: { societyId: { $in: societyIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$societyId",
          projects: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              techStack: "$techStack",
              link: "$link",
              createdAt: "$createdAt",
            },
          },
        },
      },
      { $project: { projects: { $slice: ["$projects", limitProjects] } } },
    ]);

    const nextEventBySociety = new Map(nextEvents.map((e) => [String(e._id), e.event]));
    const projectsBySociety = new Map(recentProjects.map((p) => [String(p._id), p.projects]));

    const payload = societies.map((s) => ({
      ...s,
      nextEvent: nextEventBySociety.get(String(s._id)) || null,
      projects: projectsBySociety.get(String(s._id)) || [],
    }));

    return ApiResponse.success(payload, "Societies fetched").send(res);
  } catch (error) {
    console.error("listSocietiesHighlightsPublic Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const subscribeToSociety = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { email: rawEmail } = req.body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

    if (!email) return ApiResponse.badRequest("email is required").send(res);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

    const society = await Society.findById(societyId).select("status");
    if (!society) return ApiResponse.notFound("Society not found").send(res);

    await SocietySubscription.findOneAndUpdate(
      { societyId, email },
      { $set: { status: "active" } },
      { upsert: true, new: true }
    );

    return ApiResponse.success(null, "Subscribed").send(res);
  } catch (error) {
    if (error?.code === 11000) {
      return ApiResponse.success(null, "Subscribed").send(res);
    }
    console.error("subscribeToSociety Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const unsubscribeFromSociety = async (req, res) => {
  try {
    const { societyId } = req.params;
    const { email: rawEmail } = req.body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

    if (!email) return ApiResponse.badRequest("email is required").send(res);

    await SocietySubscription.findOneAndUpdate(
      { societyId, email },
      { $set: { status: "inactive" } },
      { new: true }
    );

    return ApiResponse.success(null, "Unsubscribed").send(res);
  } catch (error) {
    console.error("unsubscribeFromSociety Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const listSubscriptionsByEmail = async (req, res) => {
  try {
    const { email: rawEmail } = req.query;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;

    if (!email) return ApiResponse.badRequest("email is required").send(res);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ApiResponse.badRequest("Invalid email format").send(res);
    }

    const subs = await SocietySubscription.find({ email, status: "active" })
      .select("societyId status")
      .lean();

    return ApiResponse.success(subs, "Subscriptions fetched").send(res);
  } catch (error) {
    console.error("listSubscriptionsByEmail Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  listSocietiesPublic,
  listSocietiesHighlightsPublic,
  listSubscriptionsByEmail,
  subscribeToSociety,
  unsubscribeFromSociety,
};
