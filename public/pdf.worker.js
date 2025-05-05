
// This file serves as a placeholder/fallback if the CDN PDF worker fails to load
// The real worker will be loaded from CDN, but having this file prevents 404 errors
console.log('Local PDF.js worker fallback loaded');

// When the real worker is loaded from CDN, this file will not be used
// This is just to prevent errors if the CDN fails

