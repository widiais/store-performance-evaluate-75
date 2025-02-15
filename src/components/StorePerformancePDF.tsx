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
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4
  },
  storeInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  scoreCard: {
    width: '30%',
    marginRight: '3%',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  greenText: {
    color: '#059669'
  },
  redText: {
    color: '#dc2626'
  },
  yellowText: {
    color: '#d97706'
  },
  findingsList: {
    marginTop: 8,
    paddingLeft: 15
  },
  finding: {
    fontSize: 10,
    marginBottom: 4
  },
  table: {
    marginTop: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 5
  }
});

interface Store {
  id: number;
  name: string;
  city: string;
}

interface EvaluationRecord {
  id: number;
  store_name: string;
  evaluation_date: string;
  total_score: number;
}

interface FinancialRecord {
  id: number;
  store_name: string;
  total_sales: number;
  target_sales: number;
  cogs_achieved: number;
  cogs_target: number;
  total_opex: number;
  total_crew: number;
}

interface ComplaintRecord {
  id: number;
  store_name: string;
  total_weighted_complaints: number;
  avg_cu_per_day: number;
  kpi_score: number;
}

interface EspRecord {
  id: number;
  store_name: string;
  store_city: string;
  evaluation_date: string;
  total_score: number;
  final_score: number;
  kpi_score: number;
  findings: string[];
}

interface StorePerformancePDFProps {
  selectedStores: Store[];
  selectedMonth: string;
  selectedYear: string;
  operationalData: {
    champs: EvaluationRecord[];
    cleanliness: EvaluationRecord[];
    service: EvaluationRecord[];
    productQuality: EvaluationRecord[];
  };
  financialData: FinancialRecord[];
  complaintData: ComplaintRecord[];
  espData: EspRecord[];
}

const calculateAverageScore = (evaluations: EvaluationRecord[], storeName: string) => {
  const storeEvaluations = evaluations.filter(e => e.store_name === storeName);
  if (storeEvaluations.length === 0) return 0;
  
  const totalScore = storeEvaluations.reduce((sum, evaluation) => sum + evaluation.total_score, 0);
  return totalScore / storeEvaluations.length;
};

const limitToMaxScore = (score: number, maxScore: number = 4) => {
  return Math.min(Math.max(0, score), maxScore);
};

const calculateComplaintKPIScore = (totalWeightedComplaints: number, avgCUPerDay: number) => {
  const monthlyCustomers = avgCUPerDay * 30;
  const percentage = (totalWeightedComplaints / monthlyCustomers) * 100;
  if (percentage <= 0.1) return 4;       // <= 0.1% = 4 (Sangat Baik)
  if (percentage <= 0.3) return 3;       // <= 0.3% = 3 (Baik)
  if (percentage <= 0.5) return 2;       // <= 0.5% = 2 (Cukup)
  if (percentage <= 0.7) return 1;       // <= 0.7% = 1 (Kurang)
  return 0;                              // > 0.7% = 0 (Sangat Kurang)
};

const StorePerformancePDF = ({
  selectedStores,
  selectedMonth,
  selectedYear,
  operationalData,
  financialData,
  complaintData,
  espData
}: StorePerformancePDFProps) => {
  const getScoreColor = (score: number, threshold: number = 3) => {
    if (score >= threshold) return styles.greenText;
    if (score >= threshold - 1) return styles.yellowText;
    return styles.redText;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Store Performance Report</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Information</Text>
          <Text style={styles.label}>Period: {format(new Date(Number(selectedYear), parseInt(selectedMonth) - 1), 'MMMM yyyy')}</Text>
          <Text style={styles.label}>Generated: {format(new Date(), 'dd MMMM yyyy HH:mm')}</Text>
        </View>

        {/* Operational Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Performance</Text>
          {selectedStores.map((store) => (
            <View key={store.id} style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name} - {store.city}</Text>
              
              <View style={styles.grid}>
                {/* CHAMPS */}
                <View style={styles.scoreCard}>
                  <Text style={styles.label}>CHAMPS</Text>
                  <Text style={[
                    styles.value,
                    { color: calculateAverageScore(operationalData.champs, store.name) >= 3 ? '#22c55e' : '#ef4444' }
                  ]}>
                    {calculateAverageScore(operationalData.champs, store.name).toFixed(2)}
                  </Text>
                </View>

                {/* Cleanliness */}
                <View style={styles.scoreCard}>
                  <Text style={styles.label}>Cleanliness</Text>
                  <Text style={[
                    styles.value,
                    { color: calculateAverageScore(operationalData.cleanliness, store.name) >= 3 ? '#22c55e' : '#ef4444' }
                  ]}>
                    {calculateAverageScore(operationalData.cleanliness, store.name).toFixed(2)}
                  </Text>
                </View>

                {/* Service */}
                <View style={styles.scoreCard}>
                  <Text style={styles.label}>Service</Text>
                  <Text style={[
                    styles.value,
                    { color: calculateAverageScore(operationalData.service, store.name) >= 3 ? '#22c55e' : '#ef4444' }
                  ]}>
                    {calculateAverageScore(operationalData.service, store.name).toFixed(2)}
                  </Text>
                </View>

                {/* Product Quality */}
                <View style={styles.scoreCard}>
                  <Text style={styles.label}>Product Quality</Text>
                  <Text style={[
                    styles.value,
                    { color: calculateAverageScore(operationalData.productQuality, store.name) >= 3 ? '#22c55e' : '#ef4444' }
                  ]}>
                    {calculateAverageScore(operationalData.productQuality, store.name).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Financial Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Performance</Text>
          {selectedStores.map((store) => {
            const storeData = financialData.find(d => d.store_name === store.name);
            if (!storeData) return null;

            const salesKPI = limitToMaxScore((storeData.total_sales / storeData.target_sales) * 4);
            const cogsKPI = limitToMaxScore((storeData.cogs_target / storeData.cogs_achieved) * 4);
            const productivityKPI = limitToMaxScore(((storeData.total_sales / storeData.total_crew) / 30000000) * 4);
            const opexKPI = limitToMaxScore(((4 / ((storeData.total_opex / storeData.total_sales) * 100)) * 4));

            return (
              <View key={store.id} style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name} - {store.city}</Text>
                
                <View style={styles.grid}>
                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Sales KPI</Text>
                    <Text style={[styles.value, getScoreColor(salesKPI)]}>
                      {salesKPI.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>COGS KPI</Text>
                    <Text style={[styles.value, getScoreColor(cogsKPI)]}>
                      {cogsKPI.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>OPEX KPI</Text>
                    <Text style={[styles.value, getScoreColor(opexKPI)]}>
                      {opexKPI.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Productivity KPI</Text>
                    <Text style={[styles.value, getScoreColor(productivityKPI)]}>
                      {productivityKPI.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Complaint Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complaint Performance</Text>
          {selectedStores.map((store) => {
            const storeComplaints = complaintData.find(d => d.store_name === store.name);
            if (!storeComplaints) return null;

            const monthlyCustomers = storeComplaints.avg_cu_per_day * 30;
            const percentage = (storeComplaints.total_weighted_complaints / monthlyCustomers) * 100;
            const kpiScore = calculateComplaintKPIScore(
              storeComplaints.total_weighted_complaints,
              storeComplaints.avg_cu_per_day
            );

            return (
              <View key={store.id} style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name} - {store.city}</Text>
                
                <View style={styles.grid}>
                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Total Weighted Complaints</Text>
                    <Text style={styles.value}>
                      {storeComplaints.total_weighted_complaints}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Monthly Customers</Text>
                    <Text style={styles.value}>
                      {monthlyCustomers}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Complaint Percentage</Text>
                    <Text style={styles.value}>
                      {percentage.toFixed(2)}%
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>KPI Score</Text>
                    <Text style={[styles.value, getScoreColor(kpiScore)]}>
                      {kpiScore}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Audit Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Performance</Text>
          {selectedStores.map((store) => {
            const storeAudit = espData.find(d => d.store_name === store.name);
            if (!storeAudit) return null;

            return (
              <View key={store.id} style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name} - {store.city}</Text>
                
                <View style={styles.grid}>
                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Total Score</Text>
                    <Text style={styles.value}>
                      {storeAudit.total_score}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>Final Score</Text>
                    <Text style={[styles.value, storeAudit.final_score >= 90 ? styles.greenText : styles.redText]}>
                      {storeAudit.final_score}
                    </Text>
                  </View>

                  <View style={styles.scoreCard}>
                    <Text style={styles.label}>KPI Score</Text>
                    <Text style={[styles.value, getScoreColor(storeAudit.kpi_score)]}>
                      {storeAudit.kpi_score}
                    </Text>
                  </View>
                </View>

                {storeAudit.findings.length > 0 && (
                  <View style={styles.findingsList}>
                    <Text style={styles.label}>Findings:</Text>
                    {storeAudit.findings.map((finding, index) => (
                      <Text key={index} style={styles.finding}>• {finding}</Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export default StorePerformancePDF; 