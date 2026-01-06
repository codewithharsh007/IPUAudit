import mongoose from "mongoose";

const academicAuditSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College ID is required"],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{2}$/.test(v); // Format: 2024-25
        },
        message: (props) =>
          `${props.value} is not a valid academic year format!`,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "submitted", "approved", "rejected"],
        message: "{VALUE} is not a valid status",
      },
      default: "draft",
    },
    currentStep: {
      type: Number,
      default: 1,
      min: [1, "Step cannot be less than 1"],
      max: [17, "Step cannot be greater than 17"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    // Section A: Institute Information
    instituteInfo: {
      institutionName: String,
      directorName: String,
      address: String,
      directorMobile: String,
      instituteTelephone: String,
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      website: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },

    // Section B: Academic Programmes
    academicPrograms: [
      {
        programme: { type: String, required: true },
        startYear: Number,
        regulatoryBody: String,
        sanctionedIntakeFirstShift: { type: Number, min: 0 },
        sanctionedIntakeSecondShift: { type: Number, min: 0 },
        totalIntake: { type: Number, min: 0 },
        totalStudents: { type: Number, min: 0 },
      },
    ],

    // Section 1: Accreditation Status
    accreditation: {
      applicability: {
        type: String,
        enum: ["NBA Only", "NAAC Only", "Both NBA and NAAC", "N.A."],
      },
      nbaStatus: String,
      naacStatus: String,
      naacGrade: {
        type: String,
        enum: ["A++", "A+", "A", "B++", "B+", "B", "C", "D", ""],
      },
      documents: [String],
    },

    // Section 2: Teachers Availability
    teachersAvailability: {
      ugStudents: { type: Number, min: 0 },
      pgStudents: { type: Number, min: 0 },
      programWiseTeachers: [
        {
          programme: String,
          duration: Number,
          sanctionedIntake: { type: Number, min: 0 },
          requiredTeachers: { type: Number, min: 0 },
          regularTeachersAvailable: { type: Number, min: 0 },
          assistantProfessors: { type: Number, min: 0 },
          associateProfessors: { type: Number, min: 0 },
          professors: { type: Number, min: 0 },
          studentTeacherRatio: Number,
          cadreRatio: String,
        },
      ],
      totalTeachers: { type: Number, min: 0 },
      visitingFaculty: { type: Number, min: 0 },
    },

    // Section 3: Quality of Teachers
    qualityOfTeachers: {
      teachersWithPhD: { type: Number, min: 0, default: 0 },
      teachersPursuingPhD: { type: Number, min: 0, default: 0 },
      publicationsWoSSCOPUS: { type: Number, min: 0, default: 0 },
      publicationsUGCCARE1: { type: Number, min: 0, default: 0 },
      publicationsUGCCARE2: { type: Number, min: 0, default: 0 },
      publicationsOther: { type: Number, min: 0, default: 0 },
      conferencePublications: {
        indexed: { type: Number, min: 0, default: 0 },
        withISBN: { type: Number, min: 0, default: 0 },
        others: { type: Number, min: 0, default: 0 },
      },
      patentsPublished: { type: Number, min: 0, default: 0 },
      patentsGranted: { type: Number, min: 0, default: 0 },
      booksAuthored: { type: Number, min: 0, default: 0 },
      coursePlanAvailable: { type: Boolean, default: false },
      coursesOnLMS: { type: Number, min: 0, default: 0 },
      classroomsWithICT: { type: Number, min: 0, default: 0 },
      teachersUsingICT: { type: Number, min: 0, default: 0 },
      documents: [String],
    },

    // Section 4: Faculty Development
    facultyDevelopment: {
      teacherAwards: [
        {
          awardName: String,
          teacherName: String,
          year: Number,
        },
      ],
      studyLeaveGrants: { type: Number, min: 0, default: 0 },
      conferenceAttendanceGrants: { type: Number, min: 0, default: 0 },
      individualComputingFacilities: { type: Boolean, default: false },
      documents: [String],
    },

    // Section 5: Student Grievance Redressal
    grievanceRedressal: {
      sgrcAvailable: { type: Boolean, default: false },
      studentRepresentative: { type: Boolean, default: false },
      documentationMaintained: { type: Boolean, default: false },
      psychiatristAvailable: { type: Boolean, default: false },
      publishedOnWebsite: { type: Boolean, default: false },
      studentsSatisfied: { type: Boolean, default: false },
      reportsSentToUniversity: { type: Boolean, default: false },
      documents: [String],
    },

    // Section 6: University Examinations
    universityExaminations: {
      facultyParticipationPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      documents: [String],
    },

    // Section 7: Library Status
    library: {
      totalBooksAdded: { type: Number, min: 0, default: 0 },
      totalVolumesAdded: { type: Number, min: 0, default: 0 },
      programWiseBooks: [
        {
          programme: String,
          titles: { type: Number, min: 0 },
          volumes: { type: Number, min: 0 },
          score: { type: Number, min: 0 },
        },
      ],
      journalsAdded: { type: Number, min: 0, default: 0 },
      journalsDiscontinued: { type: Number, min: 0, default: 0 },
      indianJournals: { type: Number, min: 0, default: 0 },
      internationalJournals: { type: Number, min: 0, default: 0 },
      documents: [String],
    },

    // Section 8: Laboratories
    laboratories: {
      otherLabs: [
        {
          labName: String,
          instruments: String,
          upgradation: String,
        },
      ],
      totalComputers: { type: Number, min: 0, default: 0 },
      licensedSoftware: { type: Number, min: 0, default: 0 },
      internetSpeed: String,
      documents: [String],
    },

    // Section 9: Co-Curricular Activities
    coCurricularActivities: {
      conferencesOrganized: [
        {
          type: String,
          name: String,
          date: Date,
          isIndexed: { type: Boolean, default: false },
        },
      ],
      seminarsOrganized: { type: Number, min: 0, default: 0 },
      fdpMdpOrganized: { type: Number, min: 0, default: 0 },
      workshopsOrganized: { type: Number, min: 0, default: 0 },
      valueAddedPrograms: { type: Number, min: 0, default: 0 },
      webinarsOrganized: { type: Number, min: 0, default: 0 },
      documents: [String],
    },

    // Section 10: Publications
    publications: {
      journalPublished: { type: Boolean, default: false },
      journalISSN: String,
      journalFrequency: String,
      magazinesPublished: [
        {
          name: String,
          frequency: String,
          type: String,
        },
      ],
      documents: [String],
    },

    // Section 11: Student Development
    studentDevelopment: {
      mockInterviews: { type: Number, min: 0, default: 0 },
      rolePlays: { type: Number, min: 0, default: 0 },
      groupDiscussions: { type: Number, min: 0, default: 0 },
      workshops: { type: Number, min: 0, default: 0 },
      competitions: { type: Number, min: 0, default: 0 },
      personalityDevLab: { type: Boolean, default: false },
      trainedFaculty: { type: Boolean, default: false },
      nssNccAvailable: { type: Boolean, default: false },
      indoorSportsFacilities: { type: Boolean, default: false },
      outdoorSportsFacilities: { type: Boolean, default: false },
      documents: [String],
    },

    // Section 12: Placement Status
    placement: {
      totalPassedOut: { type: Number, min: 0, default: 0 },
      eligibleAndRegistered: { type: Number, min: 0, default: 0 },
      goingForHigherEducation: { type: Number, min: 0, default: 0 },
      studentsPlaced: { type: Number, min: 0, default: 0 },
      startups: { type: Number, min: 0, default: 0 },
      totalPlacedAndHigherEd: { type: Number, min: 0, default: 0 },
      placementPercentage: { type: Number, min: 0, max: 100, default: 0 },
      companiesVisited: { type: Number, min: 0, default: 0 },
      averageSalary: String,
      tpoOfficeExists: { type: Boolean, default: false },
      entrepreneurshipActivities: { type: Number, min: 0, default: 0 },
      documents: [String],
    },

    // Section 13: General Parameters
    generalParameters: {
      individualSeating: { type: Boolean, default: false },
      websiteURL: {
        type: String,
        lowercase: true,
        trim: true,
      },
      websiteAvailable: { type: Boolean, default: false },
      girlsCommonRoom: { type: Boolean, default: false },
      toiletCleanliness: {
        type: String,
        enum: ["Excellent", "Good", "Average", "Poor", ""],
      },
      canteenAndWater: { type: Boolean, default: false },
      documents: [String],
    },

    // Section 14: Feedback
    feedback: {
      facultyFeedback: {
        collected: { type: Boolean, default: false },
        analysed: { type: Boolean, default: false },
        actionTaken: { type: Boolean, default: false },
      },
      employerFeedback: {
        collected: { type: Boolean, default: false },
        analysed: { type: Boolean, default: false },
        actionTaken: { type: Boolean, default: false },
      },
      studentFeedback: {
        collected: { type: Boolean, default: false },
        analysed: { type: Boolean, default: false },
        actionTaken: { type: Boolean, default: false },
      },
      alumniFeedback: {
        collected: { type: Boolean, default: false },
        analysed: { type: Boolean, default: false },
        actionTaken: { type: Boolean, default: false },
      },
      documents: [String],
    },

    // Section 15: Previous Deficiencies
    deficiencies: {
      deficienciesIdentified: { type: Number, min: 0, default: 0 },
      deficienciesRemoved: { type: Number, min: 0, default: 0 },
      deficiencyList: [
        {
          deficiency: String,
          status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
          },
          actionTaken: String,
        },
      ],
      documents: [String],
    },

    // PDF Upload Option
    directPDFUpload: {
      uploaded: { type: Boolean, default: false },
      fileUrl: String,
      publicId: String,
      fileName: String,
      uploadedAt: Date,
    },

    submittedAt: Date,
    submittedBy: String,

    // Admin review
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewComments: String,
  },
  {
    timestamps: true, // ✅ Automatic createdAt and updatedAt
    toJSON: { virtuals: true }, // ✅ Enable virtuals in JSON
    toObject: { virtuals: true },
  },
);

// ✅ Indexes for better performance
academicAuditSchema.index({ collegeId: 1, academicYear: 1 }, { unique: true });
academicAuditSchema.index({ status: 1 });
academicAuditSchema.index({ submittedAt: -1 });
academicAuditSchema.index({ "instituteInfo.institutionName": "text" });

// ✅ Virtual fields
academicAuditSchema.virtual("isEditable").get(function () {
  return this.status === "draft" || this.status === "rejected";
});

academicAuditSchema.virtual("completionPercentage").get(function () {
  const sections = [
    "academicPrograms",
    "accreditation",
    "teachersAvailability",
    "qualityOfTeachers",
    "facultyDevelopment",
    "grievanceRedressal",
    "universityExaminations",
    "library",
    "laboratories",
    "coCurricularActivities",
    "publications",
    "studentDevelopment",
    "placement",
    "generalParameters",
    "feedback",
    "deficiencies",
  ];

  const completed = sections.filter((section) => {
    const data = this[section];
    return (
      data &&
      ((Array.isArray(data) && data.length > 0) ||
        (typeof data === "object" && Object.keys(data).length > 0))
    );
  }).length;

  return Math.round((completed / sections.length) * 100);
});

// ✅ FIXED: Pre-save middleware - ASYNC version (no next needed)
academicAuditSchema.pre("save", async function () {
  // Update lastUpdated
  this.lastUpdated = new Date();
  
  // Validate status transitions
  if (this.isModified("status") && this._original) {
    const validTransitions = {
      draft: ["draft", "submitted"],
      submitted: ["submitted", "approved", "rejected"],
      approved: ["approved"],
      rejected: ["rejected", "draft"],
    };

    const originalStatus = this._original.status || "draft";
    const newStatus = this.status;

    if (!validTransitions[originalStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${originalStatus} to ${newStatus}`
      );
    }
  }
  // ✅ No next() call needed in async functions
});


// Track original document for status validation
academicAuditSchema.post("init", function (doc) {
  doc._original = doc.toObject();
});

export default mongoose.models.AcademicAudit ||
  mongoose.model("AcademicAudit", academicAuditSchema);
