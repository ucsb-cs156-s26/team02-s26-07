const helpRequestFixtures = {
  oneHelpRequest: {
    id: 2,
    requesterEmail: "whamabe@ucsb.edu",
    teamId: "team07",
    tableOrBreakoutRoom: "table",
    requestTime: "2026-05-03T10:30:30",
    explanation: "I am confused about blah blah blah",
    solved: false,
  },

  threeHelpRequests: [
    {
      id: 3,
      requesterEmail: "wyattearp2004@gmail.com",
      teamId: "team99",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-05-04T10:30:00",
      explanation: "I need help with blah blah blah",
      solved: false,
    },
    {
      id: 4,
      requesterEmail: "billybob2@gmail.com",
      teamId: "team200",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-05-04T05:37:02.33",
      explanation: "I am failing at blah blah bleh",
      solved: false,
    },
    {
      id: 6,
      requesterEmail: "billybob3@gmail.com",
      teamId: "team300",
      tableOrBreakoutRoom: "table",
      requestTime: "2026-05-06T10:30:00",
      explanation: "I need assistance on blah bleh blah",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
