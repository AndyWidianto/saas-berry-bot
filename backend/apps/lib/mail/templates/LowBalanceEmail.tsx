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

interface LowBalanceEmailProps {
  workspaceName?: string;
  currentBalance?: number;
  isCritical?: boolean;
  topUpUrl?: string;
}

export const LowBalanceEmail = ({
  workspaceName = 'Workspace Anda',
  currentBalance = 0,
  isCritical = false,
  topUpUrl = 'https://app.yourdomain.com/settings/billing',
}: LowBalanceEmailProps) => {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(currentBalance);

  const previewText = isCritical
    ? `[URGENT] Saldo ${workspaceName} telah habis!`
    : `Peringatan: Saldo ${workspaceName} tersisa ${formattedAmount}`;

  // Color theme dynamically based on severity
  const themeColor = isCritical ? '#ef4444' : '#f59e0b';
  const badgeBg = isCritical ? '#fef2f2' : '#fffbeb';
  const badgeBorder = isCritical ? '#fecaca' : '#fde68a';

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Brand */}
          <Section style={header}>
            <Text style={brandText}>EVOLVE WA</Text>
          </Section>

          {/* Card Content */}
          <Section style={card}>
            {/* Status Badge */}
            <Section
              style={{
                ...badgeContainer,
                backgroundColor: badgeBg,
                borderColor: badgeBorder,
              }}
            >
              <Text style={{ ...badgeText, color: themeColor }}>
                {isCritical ? 'CRITICAL: SALDO HABIS' : 'WARNING: SALDO MENIPIS'}
              </Text>
            </Section>

            <Heading style={heading}>
              {isCritical
                ? 'Layanan Automasi Terhenti'
                : 'Saldo Workspace Hampir Habis'}
            </Heading>

            <Text style={paragraph}>
              Halo Admin <strong>{workspaceName}</strong>,
            </Text>

            <Text style={paragraph}>
              {isCritical
                ? 'Saldo Anda saat ini telah mencapai batas minimum. Layanan AI, integrasi pesan, dan automasi di workspace Anda dihentikan sementara.'
                : 'Saldo workspace Anda sudah menipis. Untuk memastikan seluruh integrasi pesan dan fitur AI berjalan tanpa gangguan, harap segera melakukan pengisian ulang saldo.'}
            </Text>

            {/* Balance Box */}
            <Section style={balanceCard}>
              <Text style={balanceLabel}>Sisa Saldo Saat Ini</Text>
              <Text style={{ ...balanceValue, color: themeColor }}>
                {formattedAmount}
              </Text>
            </Section>

            {/* Action Button */}
            <Section style={btnContainer}>
              <Button
                style={{ ...button, backgroundColor: themeColor }}
                href={topUpUrl}
              >
                Top Up Saldo Sekarang
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footerText}>
              Jika Anda memerlukan bantuan terkait billing atau opsi pembayaran, silakan hubungi tim support kami.
            </Text>
          </Section>

          {/* Footer Sub */}
          <Text style={subFooter}>
            © {new Date().getFullYear()} Evolve WA Platform. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default LowBalanceEmail;

// --- Styles (Inline Tailwind-like UI) ---
const main: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '40px 0',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '0 20px',
  width: '560px',
  maxWidth: '100%',
};

const header: React.CSSProperties = {
  paddingBottom: '20px',
  textAlign: 'center' as const,
};

const brandText: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#09090b',
  letterSpacing: '0.5px',
};

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '32px',
  border: '1px solid #e4e4e7',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
};

const badgeContainer: React.CSSProperties = {
  borderRadius: '8px',
  padding: '6px 12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  display: 'inline-block',
  marginBottom: '16px',
};

const badgeText: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: 0,
};

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#09090b',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
};

const paragraph: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#52525b',
  margin: '0 0 16px 0',
};

const balanceCard: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  border: '1px solid #f4f4f5',
  margin: '24px 0',
};

const balanceLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#71717a',
  margin: '0 0 4px 0',
  fontWeight: '500',
};

const balanceValue: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '800',
  margin: 0,
};

const btnContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0 16px 0',
};

const button: React.CSSProperties = {
  color: '#ffffff',
  borderRadius: '10px',
  fontWeight: '600',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
};

const hr: React.CSSProperties = {
  borderColor: '#f4f4f5',
  margin: '24px 0 16px 0',
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#a1a1aa',
  lineHeight: '18px',
  margin: 0,
};

const subFooter: React.CSSProperties = {
  fontSize: '11px',
  color: '#a1a1aa',
  textAlign: 'center' as const,
  marginTop: '24px',
};