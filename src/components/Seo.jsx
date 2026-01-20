import { useEffect } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_TITLE = 'Domu - Software para Administración de Edificios y Condominios';
const DEFAULT_DESCRIPTION =
  'Domu es el software para administrar edificios y condominios: gastos comunes en línea, comunicación y control de accesos.';
const DEFAULT_IMAGE = '/favicon.svg';

const getSiteUrl = () => {
  if (import.meta.env?.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://domu.app';
};

const upsertMeta = (name, content, attribute = 'name') => {
  if (!content) return;
  const selector = `meta[${attribute}="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  if (!href) return;
  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const upsertJsonLd = (id, data) => {
  const existing = document.getElementById(id);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  const script = existing || document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  if (!existing) {
    document.head.appendChild(script);
  }
};

const normalizeStructuredData = (structuredData) => {
  if (!structuredData) return null;
  return Array.isArray(structuredData) ? structuredData : [structuredData];
};

function Seo({
  title,
  description,
  keywords,
  canonicalPath,
  imageUrl = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
}) {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const resolvedTitle = title || DEFAULT_TITLE;
    const resolvedDescription = description || DEFAULT_DESCRIPTION;
    const canonicalUrl = canonicalPath ? `${siteUrl}${canonicalPath}` : siteUrl;
    const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';
    const resolvedImage = imageUrl.startsWith('http') ? imageUrl : `${siteUrl}${imageUrl}`;
    const structured = normalizeStructuredData(structuredData);

    document.title = resolvedTitle;

    upsertMeta('description', resolvedDescription);
    upsertMeta('keywords', keywords || 'software condominios, gastos comunes en línea, administración edificios, DOMU');
    upsertMeta('author', 'Domu');
    upsertMeta('robots', robotsContent);

    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:title', resolvedTitle, 'property');
    upsertMeta('og:description', resolvedDescription, 'property');
    upsertMeta('og:locale', 'es_ES', 'property');
    upsertMeta('og:url', canonicalUrl, 'property');
    upsertMeta('og:image', resolvedImage, 'property');

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', resolvedTitle);
    upsertMeta('twitter:description', resolvedDescription);
    upsertMeta('twitter:image', resolvedImage);

    upsertLink('canonical', canonicalUrl);

    upsertJsonLd('seo-json-ld', structured ? structured : null);
  }, [title, description, keywords, canonicalPath, imageUrl, noindex, structuredData]);

  return null;
}

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonicalPath: PropTypes.string,
  imageUrl: PropTypes.string,
  noindex: PropTypes.bool,
  structuredData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Seo;
