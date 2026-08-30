import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getCurrentUser } from "@/lib/session";

const Home = async () => {
  const user = await getCurrentUser();

  return (
    <DashboardOverview
      userId={user.id}
      title={`Welcome back, ${user.name.split(" ")[0]}`}
      description={`Here's what's happening at ${user.company.name} today.`}
    />
  );
};

export default Home;
