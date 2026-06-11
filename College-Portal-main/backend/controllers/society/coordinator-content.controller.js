const ApiResponse = require("../../utils/ApiResponse");
const SocietyCoordinator = require("../../models/society/coordinator.model");
const Society = require("../../models/society/society.model");
const SocietyEvent = require("../../models/society/event.model");
const SocietyAchievement = require("../../models/society/achievement.model");
const SocietyProject = require("../../models/society/project.model");
const SocietySubscription = require("../../models/society/subscription.model");
const { sendEmail } = require("../../utils/nodemailer");
const { ensureSendgridConfigured } = require("../../utils/sendgrid");
const sgMail = require("@sendgrid/mail");

const requireSocietyAccess = async (coordinatorId, societyId) => {
  const coord = await SocietyCoordinator.findById(coordinatorId).select("societies");
  if (!coord) return false;
  return coord.societies?.some((id) => String(id) === String(societyId));
};

const sendEventEmailToSubscribers = async ({ society, event, emails }) => {
  if (!emails.length) return { total: 0, sent: 0 };

  const subject = `New Event: ${society.name} - ${event.title}`;
  const when = event.scheduledAt ? new Date(event.scheduledAt).toLocaleString() : "";
  const venue = event.venue ? `Venue: ${event.venue}` : "";

  const text = [
    `A new event has been scheduled by ${society.name}.`,
    "",
    `Title: ${event.title}`,
    event.description ? `Details: ${event.description}` : "",
    when ? `When: ${when}` : "",
    venue,
    "",
    "You are receiving this because you subscribed to society event updates.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>New Event: ${society.name}</h2>
      <p><strong>${event.title}</strong></p>
      ${event.description ? `<p>${event.description}</p>` : ""}
      <p>${when ? `<strong>When:</strong> ${when}<br/>` : ""}${event.venue ? `<strong>Venue:</strong> ${event.venue}` : ""}</p>
      <p style="color:#666">You are receiving this because you subscribed to society event updates.</p>
    </div>
  `;

  // Try SendGrid first for each email; fallback to Nodemailer.
  const fromEmail = process.env.SENDGRID_FROM;
  let useSendgrid = true;
  try {
    ensureSendgridConfigured();
    if (!fromEmail) throw new Error("SENDGRID_FROM is not set");
  } catch {
    useSendgrid = false;
  }

  let sent = 0;
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (to) => {
        if (useSendgrid) {
          await sgMail.send({ to, from: fromEmail, subject, text, html });
        } else {
          await sendEmail({ to, subject, text, html });
        }
      })
    );
    sent += results.filter((r) => r.status === "fulfilled").length;
  }

  return { total: emails.length, sent };
};

const listMySocieties = async (req, res) => {
  try {
    const coord = await SocietyCoordinator.findById(req.coordinatorId)
      .select("societies")
      .populate("societies", "name description status");

    if (!coord) return ApiResponse.notFound("User not found").send(res);

    return ApiResponse.success(coord.societies || [], "My societies").send(res);
  } catch (error) {
    console.error("listMySocieties Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// EVENTS
const listEvents = async (req, res) => {
  try {
    const { societyId } = req.params;
    const ok = await requireSocietyAccess(req.coordinatorId, societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const events = await SocietyEvent.find({ societyId }).sort({ scheduledAt: -1 });
    return ApiResponse.success(events, "Events fetched").send(res);
  } catch (error) {
    console.error("listEvents Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const createEvent = async (req, res) => {
  try {
    const { societyId } = req.params;
    const ok = await requireSocietyAccess(req.coordinatorId, societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const { title, description, scheduledAt, venue } = req.body;
    if (!title || !scheduledAt) {
      return ApiResponse.badRequest("title and scheduledAt are required").send(res);
    }

    const created = await SocietyEvent.create({
      societyId,
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      scheduledAt: new Date(scheduledAt),
      venue: venue ? String(venue).trim() : undefined,
      createdByCoordinatorId: req.coordinatorId,
    });

    // Email subscribers
    const society = await Society.findById(societyId).select("name");
    const subs = await SocietySubscription.find({ societyId, status: "active" }).select("email");
    const emails = subs.map((s) => s.email).filter(Boolean);
    const emailReport = await sendEventEmailToSubscribers({ society, event: created, emails });

    return ApiResponse.created({ event: created, emailReport }, "Event created").send(res);
  } catch (error) {
    console.error("createEvent Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await SocietyEvent.findById(eventId);
    if (!event) return ApiResponse.notFound("Event not found").send(res);

    const ok = await requireSocietyAccess(req.coordinatorId, event.societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const { title, description, scheduledAt, venue } = req.body;
    if (title !== undefined) event.title = String(title).trim();
    if (description !== undefined) event.description = String(description).trim();
    if (scheduledAt !== undefined) event.scheduledAt = new Date(scheduledAt);
    if (venue !== undefined) event.venue = String(venue).trim();

    await event.save();
    return ApiResponse.success(event, "Event updated").send(res);
  } catch (error) {
    console.error("updateEvent Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await SocietyEvent.findById(eventId);
    if (!event) return ApiResponse.notFound("Event not found").send(res);

    const ok = await requireSocietyAccess(req.coordinatorId, event.societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    await SocietyEvent.deleteOne({ _id: eventId });
    return ApiResponse.success({ id: eventId }, "Event deleted").send(res);
  } catch (error) {
    console.error("deleteEvent Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// ACHIEVEMENTS
const listAchievements = async (req, res) => {
  try {
    const { societyId } = req.params;
    const ok = await requireSocietyAccess(req.coordinatorId, societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const items = await SocietyAchievement.find({ societyId }).sort({ achievedAt: -1, createdAt: -1 });
    return ApiResponse.success(items, "Achievements fetched").send(res);
  } catch (error) {
    console.error("listAchievements Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const createAchievement = async (req, res) => {
  try {
    const { societyId } = req.params;
    const ok = await requireSocietyAccess(req.coordinatorId, societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const { title, description, achievedAt, link } = req.body;
    if (!title) return ApiResponse.badRequest("title is required").send(res);

    const created = await SocietyAchievement.create({
      societyId,
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      achievedAt: achievedAt ? new Date(achievedAt) : undefined,
      link: link ? String(link).trim() : undefined,
      createdByCoordinatorId: req.coordinatorId,
    });

    return ApiResponse.created(created, "Achievement created").send(res);
  } catch (error) {
    console.error("createAchievement Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const item = await SocietyAchievement.findById(achievementId);
    if (!item) return ApiResponse.notFound("Achievement not found").send(res);

    const ok = await requireSocietyAccess(req.coordinatorId, item.societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const { title, description, achievedAt, link } = req.body;
    if (title !== undefined) item.title = String(title).trim();
    if (description !== undefined) item.description = String(description).trim();
    if (achievedAt !== undefined) item.achievedAt = achievedAt ? new Date(achievedAt) : undefined;
    if (link !== undefined) item.link = link ? String(link).trim() : undefined;

    await item.save();
    return ApiResponse.success(item, "Achievement updated").send(res);
  } catch (error) {
    console.error("updateAchievement Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const item = await SocietyAchievement.findById(achievementId);
    if (!item) return ApiResponse.notFound("Achievement not found").send(res);

    const ok = await requireSocietyAccess(req.coordinatorId, item.societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    await SocietyAchievement.deleteOne({ _id: achievementId });
    return ApiResponse.success({ id: achievementId }, "Achievement deleted").send(res);
  } catch (error) {
    console.error("deleteAchievement Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

// PROJECTS
const listProjects = async (req, res) => {
  try {
    const { societyId } = req.params;
    const ok = await requireSocietyAccess(req.coordinatorId, societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const items = await SocietyProject.find({ societyId }).sort({ createdAt: -1 });
    return ApiResponse.success(items, "Projects fetched").send(res);
  } catch (error) {
    console.error("listProjects Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const createProject = async (req, res) => {
  try {
    const { societyId } = req.params;
    const ok = await requireSocietyAccess(req.coordinatorId, societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const { title, description, techStack, link } = req.body;
    if (!title) return ApiResponse.badRequest("title is required").send(res);

    const created = await SocietyProject.create({
      societyId,
      title: String(title).trim(),
      description: description ? String(description).trim() : undefined,
      techStack: techStack ? String(techStack).trim() : undefined,
      link: link ? String(link).trim() : undefined,
      createdByCoordinatorId: req.coordinatorId,
    });

    return ApiResponse.created(created, "Project created").send(res);
  } catch (error) {
    console.error("createProject Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const item = await SocietyProject.findById(projectId);
    if (!item) return ApiResponse.notFound("Project not found").send(res);

    const ok = await requireSocietyAccess(req.coordinatorId, item.societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    const { title, description, techStack, link } = req.body;
    if (title !== undefined) item.title = String(title).trim();
    if (description !== undefined) item.description = String(description).trim();
    if (techStack !== undefined) item.techStack = techStack ? String(techStack).trim() : undefined;
    if (link !== undefined) item.link = link ? String(link).trim() : undefined;

    await item.save();
    return ApiResponse.success(item, "Project updated").send(res);
  } catch (error) {
    console.error("updateProject Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const item = await SocietyProject.findById(projectId);
    if (!item) return ApiResponse.notFound("Project not found").send(res);

    const ok = await requireSocietyAccess(req.coordinatorId, item.societyId);
    if (!ok) return ApiResponse.unauthorized("No access to this society").send(res);

    await SocietyProject.deleteOne({ _id: projectId });
    return ApiResponse.success({ id: projectId }, "Project deleted").send(res);
  } catch (error) {
    console.error("deleteProject Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  listMySocieties,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
};
