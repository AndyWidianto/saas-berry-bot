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

interface ModelErrorEmailProps {
  workspaceName?: string;
  modelName?: string;
  errorMessage?: string;
  timestamp?: string;
  actionUrl?: string;
}

export const ModelErrorEmail = ({
  workspaceName = 'Workspace Anda',
  modelName = 'gemini-2.5-flash-lite',
  errorMessage = '404 Not Found: Model no longer available or invalid configuration.',
  timestamp = new Date().toLocaleString('id-ID'),
  actionUrl = 'https://app.yourdomain.com/settings/ai',
}: ModelErrorEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>⚠️ Gangguan Layanan AI pada Workspace: {workspaceName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={heading}>Sistem AI Mengalami Kendala</Heading>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={text}>
              Halo Admin,
            </Text>
            <Text style={text}>
              Kami mendeteksi kegagalan sistem saat memproses pesan menggunakan model AI pada workspace <strong>{workspaceName}</strong>.
            </Text>

            {/* Error Detail Card */}
            <Section style={card}>
              <Text style={cardLabel}>DETAIL APLIKASI & MODEL</Text>
              <Text style={cardValue}>
                <strong>Model AI:</strong> {modelName}
              </Text>
              <Text style={cardValue}>
                <strong>Waktu Kejadian:</strong> {timestamp}
              </Text>
              
              <Hr style={cardDivider} />

              <Text style={cardLabel}>PESAN ERROR (LOG)</Text>
              <Text style={codeBlock}>{errorMessage}</Text>
            </Section>

            <Text style={text}>
              Akibat masalah ini, fitur balasan otomatis atau pemrosesan AI untuk sementara dapat terganggu. Harap periksa konfigurasi model atau ganti ke model cadangan.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={actionUrl}>
                Perbaiki Pengaturan Model
              </Button>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Text style={footer}>
              Email ini dikirim secara otomatis oleh sistem monitoring workspace Anda. Jika Anda merasa tidak perlu mengubah konfigurasi, silakan abaikan email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ModelErrorEmail;

// --- STYLES ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '580px',
};

const headerSection = {
  borderBottom: '2px solid #ef4444',
  paddingBottom: '12px',
  marginBottom: '20px',
};

const heading = {
  color: '#ef4444',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0',
};

const contentSection = {
  padding: '0',
};

const text = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '20px',
};

const cardLabel = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
  margin: '0 0 6px',
};

const cardValue = {
  color: '#1e293b',
  fontSize: '14px',
  margin: '0 0 6px',
};

const cardDivider = {
  borderColor: '#cbd5e1',
  margin: '12px 0',
};

const codeBlock = {
  backgroundColor: '#0f172a',
  color: '#f87171',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '13px',
  padding: '10px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '28px 0',
};

const button = {
  backgroundColor: '#2563eb',
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
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
};