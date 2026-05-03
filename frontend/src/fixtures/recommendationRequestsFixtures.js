const recommendationRequestsFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "ppop@ucsb.edu",
    professorEmail: "bbob@ucsb.edu",
    explanation: "HELP MEE",
    dateRequested: "2022-01-02T12:00:00",
    dateNeeded: "2023-01-02T12:00:01",
    done: true,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "plop@ucsb.edu",
      professorEmail: "brob@ucsb.edu",
      explanation: "Please",
      dateRequested: "2024-01-02T12:00:00",
      dateNeeded: "2026-01-02T12:00:00",
      done: true,
    },
    {
      id: 62,
      requesterEmail: "pdop@ucsb.edu",
      professorEmail: "bnob@ucsb.edu",
      explanation: "Don't",
      dateRequested: "2027-01-02T12:00:00",
      dateNeeded: "2028-01-02T12:00:00",
      done: false,
    },
    {
      id: 3,
      requesterEmail: "pcop@ucsb.edu",
      professorEmail: "bpob@ucsb.edu",
      explanation: "Help",
      dateRequested: "2029-01-02T12:00:00",
      dateNeeded: "2032-01-02T12:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestsFixtures };
