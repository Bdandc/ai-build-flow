import Layout from "@/components/Layout";
import { Card } from "@/components/Card";

export default function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Build Status">All systems operational.</Card>
        <Card title="Recent Activity">No recent activity.</Card>
        <Card title="Next Steps">Wire data & auth here.</Card>
      </div>
    </Layout>
  );
}
