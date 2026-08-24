import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ContactEmailProps {
  name: string;
  email: string;
  workspace?: string;
  message: string;
}

export const ContactEmail = ({
  name,
  email,
  workspace,
  message,
}: ContactEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Pesan Baru dari Form Kontak: {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Badge */}
          <Section style={headerSection}>
            <Text style={badge}>Pesan Baru</Text>
            <Heading style={heading}>Kontak dari Website</Heading>
          </Section>

          <Hr style={hr} />

          {/* Details Section */}
          <Section style={contentSection}>
            <Text style={label}>NAMA PENGIRIM</Text>
            <Text style={value}>{name}</Text>

            <Text style={label}>EMAIL</Text>
            <Text style={value}>{email}</Text>

            {workspace && (
              <>
                <Text style={label}>WORKSPACE / PERUSAHAAN</Text>
                <Text style={value}>{workspace}</Text>
              </>
            )}

            <Text style={label}>PESAN</Text>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            Email ini dikirim otomatis melalui sistem notifikasi formulir kontak Evolve WA.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactEmail;

// --- STYLES (Inline CSS compatible for Email Clients) ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '12px',
  margin: '0 auto',
  padding: '32px',
  maxWidth: '580px',
};

const headerSection = {
  marginBottom: '20px',
};

const badge = {
  color: '#6366f1',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
};

const heading = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const contentSection = {
  margin: '20px 0',
};

const label = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '16px 0 4px 0',
};

const value = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const messageBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '8px',
};

const messageText = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  margin: '0',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '0',
};