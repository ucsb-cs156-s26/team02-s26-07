import React from "react";
import ArticleTable from "main/components/Articles/ArticleTable";
import { ArticlesFixtures } from "fixtures/articlesFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/Articles/ArticleTable",
  component: ArticleTable,
};

const Template = (args) => {
  return <ArticleTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  dates: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  dates: ArticlesFixtures.threeDates,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  dates: ArticlesFixtures.threeDates,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/articles", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
