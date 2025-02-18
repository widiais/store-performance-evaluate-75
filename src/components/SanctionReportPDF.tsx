import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 'auto',
    objectFit: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginTop: 20,
  },
  content: {
    fontSize: 12,
    marginTop: 20,
  },
  row: {
    marginVertical: 5,
  },
  label: {
    marginRight: 10,
    width: 120,
  },
  field: {
    flexDirection: 'row',
  },
  violationBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  checkbox: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  box: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 10,
  },
  checkedBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#000',
    marginRight: 10,
  },
  commitmentBox: {
    marginTop: 20,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    width: '100%',
    marginTop: 40,
  },
});

interface SanctionReportPDFProps {
  data: {
    employee_name: string;
    sanction_date: string;
    sanction_type: string;
    duration_months: number;
    violation_details: string;
    pic: string;
    submitted_by: string;
    store_name: string;
    store_city: string;
  };
}

const SanctionReportPDF = ({ data }: SanctionReportPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image 
          src="/public/lovable-uploads/labbaik.png"
          style={styles.logo}
        />
        <Text style={styles.title}>SURAT PERINGATAN</Text>
        <View style={styles.logo} />
      </View>

      <View style={styles.content}>
        <Text style={styles.row}>
          Tanggal: {format(new Date(data.sanction_date), 'dd MMMM yyyy')}
        </Text>

        <Text style={[styles.row, { marginTop: 20 }]}>
          Surat Peringatan ini diberikan kepada:
        </Text>

        <View style={[styles.field, styles.row]}>
          <Text style={styles.label}>Nama</Text>
          <Text>: {data.employee_name}</Text>
        </View>

        <View style={[styles.field, styles.row]}>
          <Text style={styles.label}>Store</Text>
          <Text>: {data.store_name} - {data.store_city}</Text>
        </View>

        <View style={styles.violationBox}>
          <Text style={{ marginBottom: 10 }}>Peringatan:</Text>
          <View style={styles.checkbox}>
            <View style={data.sanction_type === 'Peringatan Tertulis' ? styles.checkedBox : styles.box} />
            <Text>Peringatan Tertulis</Text>
          </View>
          <View style={styles.checkbox}>
            <View style={data.sanction_type === 'SP1' ? styles.checkedBox : styles.box} />
            <Text>SP 1</Text>
          </View>
          <View style={styles.checkbox}>
            <View style={data.sanction_type === 'SP2' ? styles.checkedBox : styles.box} />
            <Text>SP 2</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>Alasan (Uraikan Secara Rinci):</Text>
          <Text style={{ marginTop: 10 }}>{data.violation_details}</Text>
        </View>

        <Text style={{ marginTop: 20 }}>
          Surat ini berlaku selama {data.duration_months} bulan
        </Text>

        <View style={{ marginTop: 20 }}>
          <Text>Perbaikan yang akan dilakukan & Komitmen Karyawan:</Text>
          <View style={styles.commitmentBox}>
            <Text style={{ color: '#999999' }}>_____________________</Text>
          </View>
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text>Karyawan</Text>
            <View style={styles.signatureLine} />
            <Text style={{ marginTop: 5 }}>({data.employee_name})</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text>(HRD Manager)</Text>
            <View style={styles.signatureLine} />
            <Text style={{ marginTop: 5 }}>Arik Rahayu</Text>
          </View>
          
          <View style={styles.signatureBox}>
            <Text>OAM</Text>
            <View style={styles.signatureLine} />
            <Text style={{ marginTop: 5 }}>({data.submitted_by})</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default SanctionReportPDF;
