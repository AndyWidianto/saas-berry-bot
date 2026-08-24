import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface AdminModelAlertEmailProps {
  modelId?: string;
  modelName?: string;
  provider?: string;
  affectedWorkspaceCount?: number;
  totalErrorCount?: number;
  lastErrorReason?: string;
  adminDashboardUrl?: string;
}

export const AdminModelAlertEmail = ({
  modelId = 'clx123456000008l000000000',
  modelName = 'Gemini 2.5 Flash Lite',
  provider = 'GOOGLE',
  affectedWorkspaceCount = 12,
  totalErrorCount = 45,
  lastErrorReason = '404 Not Found: Model gemini-2.5-flash-lite is no longer available.',
  adminDashboardUrl = 'https://admin.yourdomain.com/models',
}: AdminModelAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>🚨 [SYSTEM ALERT] Model {modelName} Mengalami Error Berulang</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={heading}>🚨 Alert Admin: Model AI Bermasalah</Heading>
            <Text style={subheading}>Pemberitahuan Otomatis untuk Platform Maintainer</Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={text}>
              Terdeteksi **peningkatan kegagalan (failure threshold)** pada salah satu model AI global. Pertimbangkan untuk menonaktifkan model ini agar pengguna tidak terdampak lebih jauh.
            </Text>

            {/* Aggregated Stats Card */}
            <Section style={statsCard}>
              <Text style={cardTitle}>SISTEM STATISTIK & IDENTITAS MODEL</Text>
              
              <Text style={metaRow}>
                <strong>Nama Model:</strong> {modelName}
              </Text>
              <Text style={metaRow}>
                <strong>Provider:</strong> {provider}
              </Text>
              <Text style={metaRow}>
                <strong>Model ID (DB):</strong> <code style={inlineCode}>{modelId}</code>
              </Text>
              <Text style={metaRow}>
                <strong>Workspace Terdampak:</strong> <span style={badgeRed}>{affectedWorkspaceCount} Workspace</span>
              </Text>
              <Text style={metaRow}>
                <strong>Total Error (1 Jam Terakhir):</strong> {totalErrorCount}x
              </Text>

              <Hr style={cardDivider} />

              <Text style={cardTitle}>SAMPEL LOG ERROR TERAKHIR</Text>
              <Text style={codeBlock}>{lastErrorReason}</Text>
            </Section>

            {/* Recommended Action */}
            <Section style={actionBox}>
              <Text style={actionTitle}>💡 Rekomendasi Tindakan Admin:</Text>
              <Text style={actionText}>
                Nonaktifkan status <code style={inlineCode}>is_active = false</code> untuk model ini di Superadmin Dashboard agar workspace yang menggunakannya otomatis dialihkan ke model *fallback*.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={adminDashboardUrl}>
                Kelola Model di Admin Panel
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Email ini dikirim khusus ke Superadmin System via BullMQ Monitor Event.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminModelAlertEmail;

// --- STYLES ---
const main = {
  backgroundColor: '#0f172a', // Dark background khusus admin
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  margin: '0 auto',
  padding: '24px',
  maxWidth: '600px',
};

const headerSection = {
  borderBottom: '2px solid #f43f5e',
  paddingBottom: '16px',
  marginBottom: '20px',
};

const heading = {
  color: '#f43f5e',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0 0 4px',
};

const subheading = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0',
};

const contentSection = {
  padding: '0',
};

const text = {
  color: '#e2e8f0',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
};

const statsCard = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '20px',
};

const cardTitle = {
  color: '#38bdf8',
  fontSize: '11px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
  margin: '0 0 10px',
};

const metaRow = {
  color: '#cbd5e1',
  fontSize: '13px',
  margin: '0 0 6px',
};

const inlineCode = {
  backgroundColor: '#334155',
  color: '#f1f5f9',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
};

const badgeRed = {
  backgroundColor: '#881337',
  color: '#fecdd3',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600' as const,
};

const cardDivider = {
  borderColor: '#334155',
  margin: '14px 0',
};

const codeBlock = {
  backgroundColor: '#020617',
  color: '#fb7185',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: '12px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
  border: '1px solid #1e293b',
};

const actionBox = {
  backgroundColor: '#422006',
  border: '1px solid #854d0e',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '20px',
};

const actionTitle = {
  color: '#fde047',
  fontSize: '13px',
  fontWeight: '700' as const,
  margin: '0 0 4px',
};

const actionText = {
  color: '#fef08a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0 16px',
};

const button = {
  backgroundColor: '#e11d48',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#334155',
  margin: '20px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
};