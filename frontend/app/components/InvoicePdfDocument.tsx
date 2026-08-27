import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CreditLedger } from '@/lib/types';


interface InvoicePdfDocumentProps {
  workspaceId: string;
  invoices: CreditLedger[];
}

// Styling menggunakan stylesheet bawaan @react-pdf/renderer
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 9, color: '#64748B', marginTop: 4 },
  badgeHeader: { fontSize: 8, color: '#4338CA', backgroundColor: '#EEF2FF', padding: '4 8', borderRadius: 4 },

  // Stats Card
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  statLabel: { fontSize: 8, color: '#64748B' },
  statValue: { fontSize: 12, fontWeight: 'bold', marginTop: 3 },

  // Table
  table: { width: '100%', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 6, paddingHorizontal: 6, alignItems: 'center' },
  tableHeader: { backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', fontWeight: 'bold' },
  
  // Columns
  colNo: { width: '5%', textAlign: 'center' },
  colDate: { width: '22%' },
  colDesc: { width: '28%' },
  colType: { width: '15%' },
  colChannel: { width: '15%' },
  colAmount: { width: '15%', textAlign: 'right' },

  // Text details
  textSub: { fontSize: 7, color: '#94A3B8', marginTop: 1 },
  textBold: { fontWeight: 'bold' },
  
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#94A3B8', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 }
});

export const InvoicePdfDocument: React.FC<InvoicePdfDocumentProps> = ({ workspaceId, invoices }) => {
  // Format mata uang & tanggal
  const formatCurrency = (val: number) => `Rp ${Math.abs(val).toLocaleString('id-ID')}`;
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hitung Stat Total
  const totalTopUp = invoices
    .filter(i => i.type === 'TOP_UP' || i.type === 'BONUS' || i.type === 'REFUND')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalUsage = invoices
    .filter(i => i.type === 'USAGE_CHAT' || i.type === 'USAGE_RAG')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Document Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Invoice & Usage Statement</Text>
            <Text style={styles.subtitle}>Workspace ID: {workspaceId}</Text>
          </View>
          <View>
            <Text style={styles.badgeHeader}>Credit Statement</Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Top Up / Refund</Text>
            <Text style={[styles.statValue, { color: '#059669' }]}>{formatCurrency(totalTopUp)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Usage Cost</Text>
            <Text style={[styles.statValue, { color: '#E11D48' }]}>{formatCurrency(totalUsage)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Transactions</Text>
            <Text style={[styles.statValue, { color: '#0F172A' }]}>{invoices.length}</Text>
          </View>
        </View>

        {/* Transactions Table */}
        <View style={styles.table}>
          {/* Header Table */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colNo}>#</Text>
            <Text style={styles.colDate}>Date & Ref</Text>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colType}>Type</Text>
            <Text style={styles.colChannel}>Channel</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>

          {/* Rows */}
          {invoices.length > 0 ? (
            invoices.map((inv, index) => {
              const isExpense = inv.type === 'USAGE_CHAT' || inv.type === 'USAGE_RAG';
              return (
                <View key={inv.id || index} style={styles.tableRow}>
                  <Text style={styles.colNo}>{index + 1}</Text>
                  
                  <View style={styles.colDate}>
                    <Text style={{ color: '#334155' }}>{formatDate(inv.createdAt)}</Text>
                    <Text style={styles.textSub}>{inv.invoiceId || inv.id.substring(0, 8)}</Text>
                  </View>

                  <View style={styles.colDesc}>
                    <Text style={{ color: '#0F172A' }}>{inv.description || '-'}</Text>
                    {inv.tokensUsed ? (
                      <Text style={styles.textSub}>{inv.tokensUsed.toLocaleString('id-ID')} tokens</Text>
                    ) : null}
                  </View>

                  <Text style={[styles.colType, { color: isExpense ? '#E11D48' : '#059669', fontWeight: 'bold' }]}>
                    {inv.type}
                  </Text>

                  <Text style={styles.colChannel}>
                    {inv.channel || '-'}
                  </Text>

                  <Text style={[styles.colAmount, { color: isExpense ? '#E11D48' : '#059669', fontWeight: 'bold' }]}>
                    {isExpense ? `-${formatCurrency(inv.amount)}` : formatCurrency(inv.amount)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ width: '100%', textAlign: 'center', color: '#94A3B8', paddingVertical: 10 }}>
                No invoice records found.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Auto-Generated Financial Report • Confidential</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};