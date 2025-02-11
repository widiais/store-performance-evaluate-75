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
  earnedValue: {
    color: '#ef4444'
  },
  lostValue: {
    color: '#22c55e'
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
  questionCell: {
    flex: 4,
    padding: 8
  },
  pointsCell: {
    flex: 1,
    padding: 8,
    textAlign: 'right'
  },
  scoreCell: {
    flex: 1,
    padding: 8,
    textAlign: 'right'
  },
  statusCell: {
    flex: 1,
    padding: 8,
    textAlign: 'center'
  },
  crossStatus: {
    color: '#ef4444'
  },
  excludeStatus: {
    color: '#eab308'
  },
  noneStatus: {
    color: '#22c55e'
  }
});

interface CleanlinessReportPDFProps {
  evaluation: {
    store_name: string;
    store_city: string;
    pic: string;
    evaluation_date: string;
    total_score: number;
  };
  questions: Array<{
    question: string;
    points: number;
    score: number;
    status: string;
  }>;
}

const CleanlinessReportPDF = ({ evaluation, questions }: CleanlinessReportPDFProps) => {
  const adjustedPoints = questions
    .filter(q => q.status !== 'exclude')
    .reduce((sum, q) => sum + q.points, 0);

  const crossPoints = questions
    .filter(q => q.status === 'cross')
    .reduce((sum, q) => sum + q.points, 0);

  const earnedPoints = adjustedPoints - crossPoints;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>CRS-Store Cleanliness Evaluation Report</Text>
        
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
          <View style={styles.infoRow}>
            <Text style={styles.label}>Final Score:</Text>
            <Text style={styles.value}>{evaluation.total_score}</Text>
          </View>
        </View>

        <View style={styles.scoreCards}>
          <View style={[styles.scoreCard, styles.totalPoints]}>
            <Text style={styles.scoreLabel}>Total Points</Text>
            <Text style={styles.scoreValue}>{adjustedPoints}</Text>
          </View>
          <View style={[styles.scoreCard, styles.earnedPoints]}>
            <Text style={styles.scoreLabel}>Earned Points</Text>
            <Text style={[styles.scoreValue, styles.earnedValue]}>
              {earnedPoints}
            </Text>
          </View>
          <View style={[styles.scoreCard, styles.lostPoints]}>
            <Text style={styles.scoreLabel}>Lost Points</Text>
            <Text style={[styles.scoreValue, styles.lostValue]}>
              {crossPoints}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.questionCell}>Question</Text>
            <Text style={styles.pointsCell}>Points</Text>
            <Text style={styles.scoreCell}>Score</Text>
            <Text style={styles.statusCell}>Status</Text>
          </View>
          {questions.map((q, i) => (
            <View key={i} style={[styles.tableRow, 
              q.status === 'exclude' && { backgroundColor: '#fefce8' }
            ]}>
              <Text style={styles.questionCell}>{q.question}</Text>
              <Text style={styles.pointsCell}>{q.points}</Text>
              <Text style={styles.scoreCell}>{q.score}</Text>
              <Text style={[
                styles.statusCell,
                q.status === 'cross' && styles.crossStatus,
                q.status === 'exclude' && styles.excludeStatus,
                q.status === 'none' && styles.noneStatus
              ]}>
                {q.status === 'cross' ? 'Cross' : 
                 q.status === 'exclude' ? 'Exclude' : 
                 'Pass'}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default CleanlinessReportPDF;
