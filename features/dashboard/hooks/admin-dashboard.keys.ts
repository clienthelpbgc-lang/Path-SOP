export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  overview: () => [...adminDashboardKeys.all, "overview"] as const,
  userOverviews: () => [...adminDashboardKeys.all, "user-overview"] as const,
  userOverview: (userId: string) =>
    [...adminDashboardKeys.userOverviews(), userId] as const,
};
