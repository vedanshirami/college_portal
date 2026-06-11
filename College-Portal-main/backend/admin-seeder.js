const mongoose = require("mongoose");
const connectToMongo = require("./Database/db");

const Branch = require("./models/branch.model");
const Subject = require("./models/subject.model");
const Exam = require("./models/exam.model");
const Marks = require("./models/marks.model");
const Timetable = require("./models/timetable.model");
const Notice = require("./models/notice.model");
const Material = require("./models/material.model");
const Item = require("./models/item.model");

const AdminDetail = require("./models/details/admin-details.model");
const StudentDetail = require("./models/details/student-details.model");
const FacultyDetail = require("./models/details/faculty-details.model");
const AlumniDetail = require("./models/details/alumni-details.model");

const Society = require("./models/society/society.model");
const SocietyCoordinator = require("./models/society/coordinator.model");
const SocietyEvent = require("./models/society/event.model");
const SocietyProject = require("./models/society/project.model");
const SocietyAchievement = require("./models/society/achievement.model");
const SocietySubscription = require("./models/society/subscription.model");

const ChatConversation = require("./models/chat/conversation.model");
const ChatMessage = require("./models/chat/message.model");

const seedData = async () => {
  try {
    await connectToMongo();

    // Clear dependent collections first to avoid reference/unique conflicts.
    await ChatMessage.deleteMany({});
    await ChatConversation.deleteMany({});
    await Marks.deleteMany({});
    await Material.deleteMany({});
    await Timetable.deleteMany({});
    await Notice.deleteMany({});
    await Exam.deleteMany({});
    await Subject.deleteMany({});
    await Item.deleteMany({});

    await SocietyAchievement.deleteMany({});
    await SocietyProject.deleteMany({});
    await SocietyEvent.deleteMany({});
    await SocietySubscription.deleteMany({});
    await SocietyCoordinator.deleteMany({});
    await Society.deleteMany({});

    await StudentDetail.deleteMany({});
    await FacultyDetail.deleteMany({});
    await AlumniDetail.deleteMany({});
    await AdminDetail.deleteMany({});
    await Branch.deleteMany({});

    const branches = await Branch.create([
      { branchId: "CSE", name: "Computer Science Engineering" },
      { branchId: "ECE", name: "Electronics and Communication Engineering" },
      { branchId: "ME", name: "Mechanical Engineering" },
    ]);

    const branchById = Object.fromEntries(branches.map((b) => [b.branchId, b]));

    const adminPassword = "admin123";
    const facultyPassword = "faculty123";
    const studentPassword = "student123";
    const alumniPassword = "alumni123";
    const coordinatorPassword = "coord123";

    const admin = await AdminDetail.create({
      employeeId: 100001,
      firstName: "Sundar",
      lastName: "Pichai",
      email: "admin@college.edu",
      phone: "9876500001",
      profile: "admin-profile.jpg",
      address: "Admin Block",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
      country: "India",
      gender: "male",
      dob: new Date("1988-01-20"),
      designation: "System Administrator",
      joiningDate: new Date("2022-07-01"),
      salary: 85000,
      status: "active",
      isSuperAdmin: true,
      emergencyContact: {
        name: "Anita Pichai",
        relationship: "Spouse",
        phone: "9876500099",
      },
      bloodGroup: "O+",
      password: adminPassword,
    });

    const faculty = await FacultyDetail.create([
      {
        employeeId: 200101,
        firstName: "Priya",
        lastName: "Shah",
        email: "priya.shah@college.edu",
        phone: "9123400001",
        profile: "faculty-priya.jpg",
        address: "Satellite Road",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380015",
        country: "India",
        gender: "female",
        dob: new Date("1989-03-15"),
        designation: "Assistant Professor",
        joiningDate: new Date("2021-01-10"),
        salary: 62000,
        status: "active",
        emergencyContact: {
          name: "Rohan Shah",
          relationship: "Brother",
          phone: "9123400099",
        },
        bloodGroup: "A+",
        branchId: branchById.CSE._id,
        password: facultyPassword,
      },
      {
        employeeId: 200102,
        firstName: "Amit",
        lastName: "Patel",
        email: "amit.patel@college.edu",
        phone: "9123400002",
        profile: "faculty-amit.jpg",
        address: "Navrangpura",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380009",
        country: "India",
        gender: "male",
        dob: new Date("1985-08-05"),
        designation: "Associate Professor",
        joiningDate: new Date("2019-06-20"),
        salary: 78000,
        status: "active",
        emergencyContact: {
          name: "Neha Patel",
          relationship: "Spouse",
          phone: "9123400088",
        },
        bloodGroup: "B+",
        branchId: branchById.ECE._id,
        password: facultyPassword,
      },
    ]);

    const students = await StudentDetail.create([
      {
        enrollmentNo: 2301001,
        firstName: "Riya",
        middleName: "K",
        lastName: "Mehta",
        email: "riya.mehta@student.college.edu",
        phone: "9000000001",
        semester: 3,
        branchId: branchById.CSE._id,
        gender: "female",
        dob: new Date("2005-02-11"),
        address: "Maninagar",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380008",
        country: "India",
        profile: "student-riya.jpg",
        status: "active",
        bloodGroup: "A+",
        emergencyContact: {
          name: "Kiran Mehta",
          relationship: "Father",
          phone: "9000000091",
        },
        password: studentPassword,
      },
      {
        enrollmentNo: 2301002,
        firstName: "Arjun",
        middleName: "M",
        lastName: "Nair",
        email: "arjun.nair@student.college.edu",
        phone: "9000000002",
        semester: 3,
        branchId: branchById.CSE._id,
        gender: "male",
        dob: new Date("2004-11-21"),
        address: "Vastrapur",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380054",
        country: "India",
        profile: "student-arjun.jpg",
        status: "active",
        bloodGroup: "O+",
        emergencyContact: {
          name: "Maya Nair",
          relationship: "Mother",
          phone: "9000000092",
        },
        password: studentPassword,
      },
      {
        enrollmentNo: 2302001,
        firstName: "Dev",
        middleName: "P",
        lastName: "Rana",
        email: "dev.rana@student.college.edu",
        phone: "9000000003",
        semester: 3,
        branchId: branchById.ECE._id,
        gender: "male",
        dob: new Date("2005-04-01"),
        address: "Gota",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "382481",
        country: "India",
        profile: "student-dev.jpg",
        status: "active",
        bloodGroup: "B+",
        emergencyContact: {
          name: "Pooja Rana",
          relationship: "Mother",
          phone: "9000000093",
        },
        password: studentPassword,
      },
    ]);

    const alumni = await AlumniDetail.create([
      {
        firstName: "Kunal",
        lastName: "Joshi",
        email: "kunal.joshi@alumni.college.edu",
        profile: "alumni-kunal.jpg",
        company: "Google",
        position: "Software Engineer",
        yearPassedOut: 2022,
        branch: "CSE",
        bio: "Working on distributed backend systems.",
        status: "active",
        password: alumniPassword,
      },
      {
        firstName: "Sneha",
        lastName: "Kapoor",
        email: "sneha.kapoor@alumni.college.edu",
        profile: "alumni-sneha.jpg",
        company: "NVIDIA",
        position: "Embedded Engineer",
        yearPassedOut: 2021,
        branch: "ECE",
        bio: "Interested in chip design and embedded systems.",
        status: "active",
        password: alumniPassword,
      },
    ]);

    const subjects = await Subject.create([
      {
        name: "Data Structures",
        code: "CS301",
        branch: branchById.CSE._id,
        semester: 3,
        credits: 4,
      },
      {
        name: "Database Management Systems",
        code: "CS302",
        branch: branchById.CSE._id,
        semester: 3,
        credits: 4,
      },
      {
        name: "Digital Electronics",
        code: "EC301",
        branch: branchById.ECE._id,
        semester: 3,
        credits: 4,
      },
    ]);

    const subjectByCode = Object.fromEntries(subjects.map((s) => [s.code, s]));

    const exams = await Exam.create([
      {
        name: "Mid Semester 3",
        date: new Date("2026-03-15"),
        semester: 3,
        examType: "mid",
        timetableLink: "https://college.edu/exams/mid-sem-3",
        totalMarks: 30,
      },
      {
        name: "End Semester 3",
        date: new Date("2026-05-20"),
        semester: 3,
        examType: "end",
        timetableLink: "https://college.edu/exams/end-sem-3",
        totalMarks: 70,
      },
    ]);

    const midExam = exams.find((e) => e.examType === "mid");

    await Timetable.create([
      {
        link: "https://college.edu/timetable/cse-sem-3",
        branch: branchById.CSE._id,
        semester: 3,
      },
      {
        link: "https://college.edu/timetable/ece-sem-3",
        branch: branchById.ECE._id,
        semester: 3,
      },
    ]);

    await Notice.create([
      {
        title: "Mid Semester Exam Schedule",
        description: "Mid semester exams start from 15 March. Check timetable links.",
        type: "both",
        link: "https://college.edu/notices/mid-sem",
      },
      {
        title: "Workshop on AI",
        description: "Open workshop for students and faculty on practical AI workflows.",
        type: "student",
        link: "https://college.edu/notices/ai-workshop",
      },
    ]);

    await Material.create([
      {
        title: "DSA Unit 1 Notes",
        subject: subjectByCode.CS301._id,
        faculty: faculty[0]._id,
        file: "dsa-unit-1.pdf",
        semester: 3,
        branch: branchById.CSE._id,
        type: "notes",
      },
      {
        title: "DBMS Assignment 1",
        subject: subjectByCode.CS302._id,
        faculty: faculty[0]._id,
        file: "dbms-assignment-1.pdf",
        semester: 3,
        branch: branchById.CSE._id,
        type: "assignment",
      },
      {
        title: "Digital Electronics Syllabus",
        subject: subjectByCode.EC301._id,
        faculty: faculty[1]._id,
        file: "de-syllabus.pdf",
        semester: 3,
        branch: branchById.ECE._id,
        type: "syllabus",
      },
    ]);

    await Marks.create([
      {
        studentId: students[0]._id,
        subjectId: subjectByCode.CS301._id,
        marksObtained: 24,
        semester: 3,
        examId: midExam._id,
      },
      {
        studentId: students[0]._id,
        subjectId: subjectByCode.CS302._id,
        marksObtained: 22,
        semester: 3,
        examId: midExam._id,
      },
      {
        studentId: students[1]._id,
        subjectId: subjectByCode.CS301._id,
        marksObtained: 26,
        semester: 3,
        examId: midExam._id,
      },
      {
        studentId: students[1]._id,
        subjectId: subjectByCode.CS302._id,
        marksObtained: 20,
        semester: 3,
        examId: midExam._id,
      },
      {
        studentId: students[2]._id,
        subjectId: subjectByCode.EC301._id,
        marksObtained: 25,
        semester: 3,
        examId: midExam._id,
      },
    ]);

    await Item.create([
      {
        reporterId: students[0]._id,
        itemName: "Scientific Calculator",
        category: "Electronics",
        description: "Black Casio calculator with name sticker.",
        dateLost: new Date("2026-02-02"),
        locationLost: "Library Block A",
        status: "lost",
        reportedBy: `${students[0].firstName} ${students[0].lastName}`,
        contactEmail: students[0].email,
        contactPhone: students[0].phone,
        imageUrl: "calculator.jpg",
      },
      {
        reporterId: students[1]._id,
        itemName: "ID Card",
        category: "Documents",
        description: "Found near cafeteria.",
        dateLost: new Date("2026-02-05"),
        locationLost: "Cafeteria",
        status: "found",
        reportedBy: `${students[1].firstName} ${students[1].lastName}`,
        contactEmail: students[1].email,
        contactPhone: students[1].phone,
        imageUrl: "id-card.jpg",
      },
    ]);

    const societies = await Society.create([
      {
        name: "Code Club",
        description: "Coding contests, hackathons, and tech talks.",
        coverImageUrl: "code-club.jpg",
        website: "https://college.edu/societies/code-club",
        contact: {
          name: "Code Club Desk",
          email: "codeclub@college.edu",
          phone: "9900000001",
        },
        socials: {
          instagram: "https://instagram.com/codeclub",
          linkedin: "https://linkedin.com/company/codeclub",
        },
        status: "active",
      },
      {
        name: "Robotics Society",
        description: "Hands-on robotics and embedded systems projects.",
        coverImageUrl: "robotics.jpg",
        website: "https://college.edu/societies/robotics",
        contact: {
          name: "Robotics Desk",
          email: "robotics@college.edu",
          phone: "9900000002",
        },
        socials: {
          youtube: "https://youtube.com/robotics",
          x: "https://x.com/robotics",
        },
        status: "active",
      },
    ]);

    const coordinators = await SocietyCoordinator.create([
      {
        studentId: students[0]._id,
        firstName: "Riya",
        lastName: "Mehta",
        email: "riya.coordinator@college.edu",
        password: coordinatorPassword,
        societies: [societies[0]._id],
        status: "active",
      },
      {
        studentId: students[2]._id,
        firstName: "Dev",
        lastName: "Rana",
        email: "dev.coordinator@college.edu",
        password: coordinatorPassword,
        societies: [societies[1]._id],
        status: "active",
      },
    ]);

    await SocietyEvent.create([
      {
        societyId: societies[0]._id,
        title: "Hackathon 2026",
        description: "24-hour internal coding event.",
        scheduledAt: new Date("2026-04-15T09:00:00.000Z"),
        venue: "Auditorium",
        createdByCoordinatorId: coordinators[0]._id,
      },
      {
        societyId: societies[1]._id,
        title: "Line Follower Workshop",
        description: "Beginner robotics workshop.",
        scheduledAt: new Date("2026-04-10T10:00:00.000Z"),
        venue: "Lab 3",
        createdByCoordinatorId: coordinators[1]._id,
      },
    ]);

    await SocietyProject.create([
      {
        societyId: societies[0]._id,
        title: "Placement Tracker",
        description: "Web app to track placement progress.",
        techStack: "React, Node.js, MongoDB",
        link: "https://github.com/college/placement-tracker",
        createdByCoordinatorId: coordinators[0]._id,
      },
      {
        societyId: societies[1]._id,
        title: "Autonomous Rover",
        description: "Obstacle-avoiding rover prototype.",
        techStack: "Arduino, C++, Sensors",
        link: "https://github.com/college/autonomous-rover",
        createdByCoordinatorId: coordinators[1]._id,
      },
    ]);

    await SocietyAchievement.create([
      {
        societyId: societies[0]._id,
        title: "Smart India Hackathon Finalist",
        description: "Reached national finalist round.",
        achievedAt: new Date("2025-09-18"),
        link: "https://college.edu/achievements/sih",
        createdByCoordinatorId: coordinators[0]._id,
      },
      {
        societyId: societies[1]._id,
        title: "Robotics League Winner",
        description: "Won inter-college robotics league.",
        achievedAt: new Date("2025-12-08"),
        link: "https://college.edu/achievements/robotics",
        createdByCoordinatorId: coordinators[1]._id,
      },
    ]);

    await SocietySubscription.create([
      { societyId: societies[0]._id, email: "newstudent1@college.edu", status: "active" },
      { societyId: societies[1]._id, email: "newstudent2@college.edu", status: "active" },
    ]);

    const conversation = await ChatConversation.create({
      studentId: students[0]._id,
      alumniId: alumni[0]._id,
      lastMessageAt: new Date(),
      lastMessageText: "Thanks for the guidance!",
      lastMessageSenderRole: "student",
    });

    await ChatMessage.create([
      {
        conversationId: conversation._id,
        senderRole: "student",
        senderId: students[0]._id,
        text: "Hi, can you guide me for backend interviews?",
      },
      {
        conversationId: conversation._id,
        senderRole: "alumni",
        senderId: alumni[0]._id,
        text: "Sure, start with DSA and system design fundamentals.",
      },
    ]);

    console.log("\n=== Seed Complete ===");
    console.log("Admin login:", admin.email, "/", adminPassword);
    console.log("Faculty login:", faculty[0].email, "/", facultyPassword);
    console.log("Student login:", students[0].email, "/", studentPassword);
    console.log("Alumni login:", alumni[0].email, "/", alumniPassword);
    console.log("Coordinator login:", coordinators[0].email, "/", coordinatorPassword);
    console.log("=====================\n");
  } catch (error) {
    console.error("Error while seeding:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedData();
