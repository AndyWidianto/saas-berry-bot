import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyBetween: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  table: { width: '100%', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 6 },
  tableHeader: { backgroundColor: '#f8fafc', fontWeight: 'bold' },
  colIndex: { width: '8%', textAlign: 'center' },
  colName: { width: '30%' },
  colPhone: { width: '30%' },
  colStatus: { width: '32%', textAlign: 'center' },
});

export const ContactPdfDocument = ({ contacts, workspaceId }: { contacts: any[]; workspaceId: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contacts Directory Report</Text>
          <Text style={{ color: '#64748b', marginTop: 4 }}>Workspace ID: {workspaceId}</Text>
        </View>
        <Text style={{ color: '#059669' }}>Total: {contacts.length} Contacts</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.colIndex}>#</Text>
          <Text style={styles.colName}>Name</Text>
          <Text style={styles.colPhone}>Phone Number</Text>
          <Text style={styles.colStatus}>Status</Text>
        </View>
        {contacts.map((contact, index) => (
          <View key={contact.id || index} style={styles.tableRow}>
            <Text style={styles.colIndex}>{index + 1}</Text>
            <Text style={styles.colName}>{contact.name || 'No Name'}</Text>
            <Text style={styles.colPhone}>{contact.phoneNumber || contact.senderId || '-'}</Text>
            <Text style={styles.colStatus}>{contact.isBlocked ? 'Blocked' : 'Active'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);