import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 20,
    marginBottom: 30,
    color: '#3b82f6',
    textAlign: 'center'
  },
  infoSection: {
    marginBottom: 20
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  value: {
    fontSize: 14,
    color: '#111827'
  },
  scoreCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
    marginTop: 20
  },
  scoreCard: {
    flex: 1,
    padding: 15,
    borderRadius: 4
  },
  totalPoints: {
    backgroundColor: '#eff6ff'
  },
  earnedPoints: {
    backgroundColor: '#fee2e2'
  },
  lostPoints: {
    backgroundColor: '#dcfce7'
  },
  scoreLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 5
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  table: {
    marginTop: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 35,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  findingCell: {
    flex: 3,
    padding: 8
  },
  pointsCell: {
    flex: 1,
    padding: 8,
    textAlign: 'right'
  }
});

interface EspPDFProps {
  evaluation: {
    store_name: string;
    store_city: string;
    pic: string;
    evaluation_date: string;
    final_score: number;
    kpi_score: number;
  };
  findings: Array<{
    finding: string;
    deduction_points: number;
  }>;
}

const EspPDF = ({ evaluation, findings }: EspPDFProps) => {
  const totalDeductions = findings.reduce((sum, finding) => sum + finding.deduction_points, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>CRS-Store ESP Evaluation Report</Text>
        
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Store:</Text>
            <Text style={styles.value}>{evaluation.store_name} - {evaluation.store_city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>PIC:</Text>
            <Text style={styles.value}>{evaluation.pic}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy')}
            </Text>
          </View>
        </View>

        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, styles.totalPoints]}>
            <Text style={styles.scoreLabel}>Final Score</Text>
            <Text style={styles.scoreValue}>{evaluation.final_score}</Text>
          </View>
          <View style={[styles.scoreCard, styles.earnedPoints]}>
            <Text style={styles.scoreLabel}>KPI Score</Text>
            <Text style={styles.scoreValue}>{evaluation.kpi_score}</Text>
          </View>
          <View style={[styles.scoreCard, styles.lostPoints]}>
            <Text style={styles.scoreLabel}>Total Deductions</Text>
            <Text style={styles.scoreValue}>{totalDeductions}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.findingCell}>Finding</Text>
            <Text style={styles.pointsCell}>Points</Text>
          </View>
          {findings.map((finding, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.findingCell}>{finding.finding}</Text>
              <Text style={styles.pointsCell}>{finding.deduction_points}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default EspPDF;
