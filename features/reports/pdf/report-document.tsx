import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { getScoreTier } from "@/components/dashboard/score-tier";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";

import type { ReportData } from "../types/report-data.type";

// react-pdf renders its own layout engine, not the DOM -- Tailwind classes
// don't apply here, so score-tier colors are re-declared as hex to match
// SCORE_TIERS in components/dashboard/score-tier.ts (the thresholds
// themselves are still imported from there, so the two never drift apart).
const TIER_COLORS = {
  low: { bg: "#fee2e2", text: "#dc2626", label: "Needs attention" },
  mid: { bg: "#fef3c7", text: "#b45309", label: "On track" },
  high: { bg: "#d1fae5", text: "#059669", label: "Excellent" },
} as const;

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

const KRA_STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  completed: "Completed",
  not_completed: "Not completed",
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  companyName: { fontSize: 10, color: "#6b7280" },
  title: { fontSize: 18, fontWeight: 700, marginTop: 2 },
  subtitle: { fontSize: 10, color: "#6b7280", marginTop: 2 },
  generatedAt: { fontSize: 8, color: "#9ca3af", textAlign: "right" },
  scoreRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  scoreCard: {
    flex: 1,
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  scoreValue: { fontSize: 22, fontWeight: 700 },
  scoreLabel: { fontSize: 9, marginTop: 2 },
  scoreTierLabel: { fontSize: 8, marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    marginTop: 14,
  },
  table: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableCell: { padding: 6, fontSize: 9 },
  tableHeaderCell: { padding: 6, fontSize: 9, fontWeight: 700 },
  emptyState: {
    padding: 12,
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
  },
});

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const tier = TIER_COLORS[getScoreTier(value)];

  return (
    <View style={[styles.scoreCard, { backgroundColor: tier.bg }]}>
      <Text style={[styles.scoreValue, { color: tier.text }]}>{value}%</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreTierLabel, { color: tier.text }]}>
        {tier.label}
      </Text>
    </View>
  );
}

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document
      title={`${data.periodLabel} report - ${data.user.name}`}
      author="Path SOP"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.title}>Performance report</Text>
            <Text style={styles.subtitle}>
              {data.user.name} ({data.user.email}) &middot; {data.periodLabel}
            </Text>
          </View>
          <Text style={styles.generatedAt}>
            Generated {formatDateTime(data.generatedAt)}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <ScoreCard label="Overall score" value={data.performanceScore.score} />
          <ScoreCard label="Task score" value={data.performanceScore.taskScore} />
          <ScoreCard label="KRA score" value={data.performanceScore.kraScore} />
        </View>

        <Text style={styles.sectionTitle}>
          Tasks ({data.taskStats.completed}/{data.taskStats.total} weightage
          completed, {data.taskStats.rate}%)
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Title</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Due</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Weightage</Text>
          </View>
          {data.tasks.length === 0 ? (
            <Text style={styles.emptyState}>No tasks due in this period.</Text>
          ) : (
            data.tasks.map((task) => (
              <View key={task.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{task.title}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {TASK_STATUS_LABELS[task.status] ?? task.status}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {formatDate(task.dueAt)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{task.weightage}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>
          KRAs ({data.kraStats.completed}/{data.kraStats.total} weightage
          completed, {data.kraStats.rate}%)
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Title</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Type</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Period</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Weightage</Text>
          </View>
          {data.kras.length === 0 ? (
            <Text style={styles.emptyState}>
              No KRA periods ending in this range.
            </Text>
          ) : (
            data.kras.map((kra) => (
              <View key={kra.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{kra.title}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {KRA_TYPE_LABELS[kra.type]}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {KRA_STATUS_LABELS[kra.status] ?? kra.status}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {formatDate(kra.periodStart)} - {formatDate(kra.periodEnd)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{kra.weightage}</Text>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
}
