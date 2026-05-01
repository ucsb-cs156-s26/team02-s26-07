const ucsbOrganizationFixtures = {
  oneOrganization: {
    orgCode: "ZPR",
    orgTranslationShort: "ZETA PHI RHO",
    orgTranslation: "ZETA PHI RHO FRATERNITY",
    inactive: false,
  },
  threeOrganizations: [
    {
      orgCode: "ZPR",
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO FRATERNITY",
      inactive: false,
    },
    {
      orgCode: "SKY",
      orgTranslationShort: "SKYDIVING CLUB",
      orgTranslation: "SKYDIVING CLUB AT UCSB",
      inactive: false,
    },
    {
      orgCode: "OSLI",
      orgTranslationShort: "STUDENT LIFE",
      orgTranslation: "OFFICE OF STUDENT LIFE",
      inactive: true,
    },
  ],
};

export { ucsbOrganizationFixtures };