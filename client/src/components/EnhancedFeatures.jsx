import React from 'react';

const FeatureCard = ({ feature, index }) => {
  const cardVariants = [
    { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', shadow: '0 8px 32px rgba(34, 197, 94, 0.3)' },
    { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: '0 8px 32px rgba(59, 130, 246, 0.3)' },
    { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: '0 8px 32px rgba(245, 158, 11, 0.3)' },
    { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: '0 8px 32px rgba(239, 68, 68, 0.3)' },
    { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }
  ];

  const variant = cardVariants[index % cardVariants.length];

  return (
    <div
      style={{
        background: variant.bg,
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        boxShadow: variant.shadow,
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-8px)';
        e.target.style.boxShadow = variant.shadow.replace('0.3)', '0.5)');
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = variant.shadow;
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)'
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          {feature.icon}
        </div>
        
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: 'white'
        }}>
          {feature.title}
        </h3>
        
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          opacity: '0.95',
          margin: 0
        }}>
          {feature.description}
        </p>

        {feature.stats && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem'
            }}>
              {feature.stats.value}
            </div>
            <div style={{
              fontSize: '0.875rem',
              opacity: '0.9'
            }}>
              {feature.stats.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EnhancedFeatures = () => {
  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Analysis',
      description: 'Advanced artificial intelligence analyzes your medications, health conditions, and dietary preferences to provide personalized meal recommendations.',
      stats: { value: '99.8%', label: 'Accuracy Rate' }
    },
    {
      icon: '💊',
      title: 'Medication Safety',
      description: 'Comprehensive database of drug-food interactions ensures your meals never interfere with your medications or treatment plans.',
      stats: { value: '10K+', label: 'Drug Interactions Tracked' }
    },
    {
      icon: '🎯',
      title: 'Personalized Plans',
      description: 'Every recommendation is tailored to your unique health profile, dietary restrictions, and nutritional goals for optimal results.',
      stats: { value: '100%', label: 'Personalized' }
    },
    {
      icon: '📊',
      title: 'Health Tracking',
      description: 'Monitor your nutritional intake, track meal compliance, and see how your diet impacts your overall health and wellness.',
      stats: { value: '24/7', label: 'Monitoring' }
    },
    {
      icon: '🔬',
      title: 'Science-Backed',
      description: 'All recommendations are based on peer-reviewed research, clinical studies, and the latest nutritional science guidelines.',
      stats: { value: '500+', label: 'Studies Referenced' }
    }
  ];

  return (
    <section style={{
      padding: '5rem 2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, #22c55e20, #16a34a20)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(135deg, #3b82f620, #2563eb20)',
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '50px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            ✨ Revolutionary Features
          </div>
          
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Why Choose{' '}
            <span style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Medimeal
            </span>
            ?
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Experience the future of personalized nutrition with cutting-edge AI technology
            that understands your unique health needs.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          background: 'white',
          borderRadius: '20px',
          padding: '3rem 2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Ready to Transform Your Health?
          </h3>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem'
          }}>
            Join thousands of users who have already improved their health with AI-powered meal planning.
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(34, 197, 94, 0.3)';
            }}
          >
            🚀 Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatures;
