import { Helmet } from 'react-helmet-async';

const Seo = ({ title, description, path, type = 'website' }) => {
  const siteName = 'Nyagram Docs';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'Nyagram - Modern Java Telegram Bot Framework based on Spring Boot 3 & Virtual Threads.';
  const finalDescription = description || defaultDescription;
  const url = `https://nyagram.kaleert.pro${path || ''}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
    </Helmet>
  );
};

export default Seo;