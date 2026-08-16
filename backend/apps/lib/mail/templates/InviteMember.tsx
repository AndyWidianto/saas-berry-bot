
import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Heading,
  Section,
} from '@react-email/components';

interface InviteEmailProps {
  workspaceName: string;
  inviteLink: string;
}

export const InviteEmail = ({
  workspaceName = 'Workspace Kami',
  inviteLink = 'https://kurmabot.id',
}: InviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px', borderRadius: '8px' }}>
          <Heading style={{ color: '#333', fontSize: '20px' }}>
            Undangan Bergabung ke {workspaceName}
          </Heading>
          <Text style={{ color: '#555', fontSize: '14px' }}>
            Anda telah diundang untuk bergabung di workspace <strong>{workspaceName}</strong>. Klik tombol di bawah ini untuk menerima undangan:
          </Text>
          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Button
              href={inviteLink}
              style={{
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '5px',
                textDecoration: 'none',
              }}
            >
              Terima Undangan
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InviteEmail;