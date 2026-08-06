import React, { useState, useEffect } from 'react';

// Lightweight, resilient zero-dependency hash router for Evolve

export const useNavigate = () => {
  return (to) => {
    window.location.hash = to.startsWith('#') ? to : `#${to}`;
    window.dispatchEvent(new Event('hashchange'));
  };
};

export const useSearchParams = () => {
  const getParams = () => {
    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      return new URLSearchParams(hash.substring(queryIdx));
    }
    return new URLSearchParams(window.location.search);
  };
  return [getParams()];
};

export const Link = ({ to, children, className, onClick, ...props }) => {
  const navigate = useNavigate();
  const href = to.startsWith('#') ? to : `#${to}`;

  const handleClick = (e) => {
    if (onClick) onClick(e);
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export const RouterView = ({ routes }) => {
  const [currentPath, setCurrentPath] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash.split('?')[0] || '/';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      const path = hash.split('?')[0] || '/';
      setCurrentPath(path);
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Match exact routes
  if (routes[currentPath]) {
    return routes[currentPath];
  }

  // Match authentication routes (/auth, /login, /signup)
  if (
    currentPath === '/auth' || 
    currentPath.startsWith('/auth') || 
    currentPath === '/login' || 
    currentPath.startsWith('/login') ||
    currentPath === '/signup' || 
    currentPath.startsWith('/signup')
  ) {
    return routes[currentPath] || routes['/auth'];
  }

  // Match app workspace
  if (currentPath === '/app' || currentPath.startsWith('/app')) {
    return routes['/app'];
  }

  return routes['/'] || routes['*'];
};
