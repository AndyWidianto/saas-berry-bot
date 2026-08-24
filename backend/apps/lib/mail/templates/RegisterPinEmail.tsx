import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Hr,
} from '@react-email/components';

interface RegisterPinEmailProps {
  pinCode: string;
  userName?: string;
  workspaceName?: string;
  expirationMinutes?: number;
}

export const RegisterPinEmail = ({
  pinCode = '482910',
  userName = 'Pengguna Baru',
  workspaceName = 'BerryBot',
  expirationMinutes = 10,
}: RegisterPinEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif', margin: '0', padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '32px', borderRadius: '12px', maxWidth: '480px', border: '1px solid #e5e7eb' }}>
          
          {/* Header / Logo Place */}
          <Heading style={{ color: '#111827', fontSize: '22px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
            Selamat Datang di {workspaceName}! 🎉
          </Heading>
          
          <Text style={{ color: '#4b5563', fontSize: '14px', lineHeight: '24px', textAlign: 'center', margin: '0 0 20px 0' }}>
            Halo <strong>{userName}</strong>, terima kasih telah mendaftar. Gunakan kode PIN di bawah ini untuk memverifikasi pendaftaran akun Anda:
          </Text>

          {/* PIN Display Box */}
          <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '24px', textAlign: 'center', margin: '20px 0', border: '1px dashed #7c3aed' }}>
            <Text style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0', fontWeight: '600' }}>
              Kode PIN Pendaftaran
            </Text>
            <Text style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '10px', color: '#7c3aed', margin: '0', fontFamily: 'monospace' }}>
              {pinCode}
            </Text>
          </Section>

          {/* Expiration Note */}
          <Text style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', margin: '16px 0 24px 0' }}>
            Kode ini berlaku selama <strong>{expirationMinutes} menit</strong>. Masukkan kode ini pada halaman verifikasi untuk mengaktifkan akun Anda.
          </Text>

          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

          {/* Security Disclaimer */}
          <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center', margin: '0', lineHeight: '18px' }}>
            Jika Anda tidak merasa mendaftar di <strong>{workspaceName}</strong>, silakan abaikan email ini.
          </Text>
          
        </Container>
      </Body>
    </Html>
  );
};

export default RegisterPinEmail;