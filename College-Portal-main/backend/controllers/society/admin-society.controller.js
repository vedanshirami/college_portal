const ApiResponse = require("../../utils/ApiResponse");
const Society = require("../../models/society/society.model");

const listSocietiesAdmin = async (req, res) => {
  try {
    const societies = await Society.find().sort({ createdAt: -1 });
    return ApiResponse.success(societies, "Societies fetched").send(res);
  } catch (error) {
    console.error("listSocietiesAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const createSocietyAdmin = async (req, res) => {
  try {
    const { name, description, status, coverImageUrl, website, contact, socials } = req.body;
    if (!name || !String(name).trim()) {
      return ApiResponse.badRequest("name is required").send(res);
    }

    const created = await Society.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      coverImageUrl: coverImageUrl ? String(coverImageUrl).trim() : undefined,
      website: website ? String(website).trim() : undefined,
      contact: {
        name: contact?.name ? String(contact.name).trim() : undefined,
        email: contact?.email ? String(contact.email).trim().toLowerCase() : undefined,
        phone: contact?.phone ? String(contact.phone).trim() : undefined,
      },
      socials: {
        instagram: socials?.instagram ? String(socials.instagram).trim() : undefined,
        facebook: socials?.facebook ? String(socials.facebook).trim() : undefined,
        x: socials?.x ? String(socials.x).trim() : undefined,
        linkedin: socials?.linkedin ? String(socials.linkedin).trim() : undefined,
        youtube: socials?.youtube ? String(socials.youtube).trim() : undefined,
      },
      status: status || "active",
    });

    return ApiResponse.created(created, "Society created").send(res);
  } catch (error) {
    if (error?.code === 11000) {
      return ApiResponse.conflict("Society name already exists").send(res);
    }
    console.error("createSocietyAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const updateSocietyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, coverImageUrl, website, contact, socials } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (coverImageUrl !== undefined) updates.coverImageUrl = String(coverImageUrl).trim();
    if (website !== undefined) updates.website = String(website).trim();

    if (contact !== undefined) {
      updates.contact = {
        name: contact?.name ? String(contact.name).trim() : undefined,
        email: contact?.email ? String(contact.email).trim().toLowerCase() : undefined,
        phone: contact?.phone ? String(contact.phone).trim() : undefined,
      };
    }

    if (socials !== undefined) {
      updates.socials = {
        instagram: socials?.instagram ? String(socials.instagram).trim() : undefined,
        facebook: socials?.facebook ? String(socials.facebook).trim() : undefined,
        x: socials?.x ? String(socials.x).trim() : undefined,
        linkedin: socials?.linkedin ? String(socials.linkedin).trim() : undefined,
        youtube: socials?.youtube ? String(socials.youtube).trim() : undefined,
      };
    }
    if (status !== undefined) updates.status = status;

    const updated = await Society.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return ApiResponse.notFound("Society not found").send(res);

    return ApiResponse.success(updated, "Society updated").send(res);
  } catch (error) {
    if (error?.code === 11000) {
      return ApiResponse.conflict("Society name already exists").send(res);
    }
    console.error("updateSocietyAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

const deleteSocietyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Society.findByIdAndDelete(id);
    if (!deleted) return ApiResponse.notFound("Society not found").send(res);

    return ApiResponse.success({ id }, "Society deleted").send(res);
  } catch (error) {
    console.error("deleteSocietyAdmin Error:", error);
    return ApiResponse.internalServerError().send(res);
  }
};

module.exports = {
  listSocietiesAdmin,
  createSocietyAdmin,
  updateSocietyAdmin,
  deleteSocietyAdmin,
};
