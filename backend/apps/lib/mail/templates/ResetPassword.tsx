
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  name?: string;
  resetUrl?: string;
  expireMinutes?: number;
}

export const ResetPasswordEmail = ({
  name = 'User',
  resetUrl = 'https://app.evolvewa.com/reset-password?token=example',
  expireMinutes = 15,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Atur ulang password akun Berry Anda</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo / Brand Header */}
          <Section style={header}>
            <Text style={logoText}>Berry</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Permintaan Reset Password</Heading>
            
            <Text style={paragraph}>Halo <strong>{name}</strong>,</Text>
            
            <Text style={paragraph}>
              Kami menerima permintaan untuk mengatur ulang password akun Anda. Klik tombol di bawah ini untuk membuat password baru:
            </Text>

            {/* Action Button */}
            <Section style={btnContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password Saya
              </Button>
            </Section>

            <Text style={subParagraph}>
              Tautan ini hanya berlaku selama <strong>{expireMinutes} menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dan password Anda akan tetap aman.
            </Text>

            <Hr style={hr} />

            {/* Fallback Link */}
            <Text style={footerText}>
              Mengalami masalah dengan tombol di atas? Salin dan tempel URL berikut ke browser Anda:
            </Text>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={copyright}>
              © {new Date().getFullYear()} Berry Sweet. All rights reserved.
              <br />
              Pesan ini dikirim secara otomatis, mohon tidak membalas email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

// --- Inline Styles (Compatibile dengan Email Clients) ---

const main = {
  backgroundColor: '#f4f5f7',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '520px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
};

const header = {
  padding: '32px 32px 0 32px',
};

const logoText = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0',
};

const content = {
  padding: '24px 32px 32px 32px',
};

const heading = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#475569',
  margin: '0 0 16px 0',
};

const subParagraph = {
  fontSize: '13px',
  lineHeight: '1.5',
  color: '#64748b',
  margin: '16px 0 0 0',
};

const btnContainer = {
  margin: '24px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '28px 0 20px 0',
};

const footerText = {
  fontSize: '12px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 4px 0',
};

const link = {
  fontSize: '12px',
  color: '#4f46e5',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const footer = {
  backgroundColor: '#f8fafc',
  padding: '20px 32px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e2e8f0',
};

const copyright = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0',
};