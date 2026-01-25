import { Github, Heart } from 'lucide-react';

const Footer = ({ data }) => {
  const year = new Date().getFullYear();
  const version = data?.metadata?.version || '1.0.0';

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, #E94033, #F08D43)',
      color: 'white',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          
          {/* Левый блок */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              © {year} <span style={{ fontWeight: 'bold' }}>Nyagram Framework</span>. All rights reserved.
            </p>
            <p style={{ 
              fontSize: '12px', 
              margin: '4px 0 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Created with <Heart size={10} style={{ margin: '0 4px' }} /> by Kaleert
            </p>
          </div>

          {/* Правый блок */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{
              fontSize: '12px',
              fontFamily: 'monospace',
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              backdropFilter: 'blur(10px)'
            }}>
              v{version}
            </span>
            
            <a 
              href={data?.metadata?.githubUrl || "https://github.com/kaleert/nyagram"} 
              target="_blank" 
              rel="noreferrer"
              style={{
                color: 'rgba(255,255,255,0.8)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Github size={20} />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Footer;