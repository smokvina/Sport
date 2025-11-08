import React, { useState } from 'react';

interface ShareButtonsProps {
  text: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ text }) => {
  const [copyStatus, setCopyStatus] = useState('Kopiraj');

  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const quoteText = encodeURIComponent(text);
    // Facebook's sharer.php works best with a URL, but the quote parameter is a good fallback.
    // We use the official Hajduk website as the URL.
    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://hajduk.hr&quote=${quoteText}`, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('Kopirano!');
      setTimeout(() => setCopyStatus('Kopiraj'), 2000);
    }, () => {
      setCopyStatus('Greška!');
      setTimeout(() => setCopyStatus('Kopiraj'), 2000);
    });
  };

  return (
    <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-60 focus-within:opacity-60 transition-opacity duration-300">
      {/* Twitter Icon */}
      <button onClick={shareOnTwitter} title="Podijeli na Twitteru" className="p-1 rounded-full hover:bg-gray-300 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-gray-700">
          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.142 0-.282-.008-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15"/>
        </svg>
      </button>
      {/* Facebook Icon */}
       <button onClick={shareOnFacebook} title="Podijeli na Facebooku" className="p-1 rounded-full hover:bg-gray-300 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-gray-700">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0 0 3.603 0 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
        </svg>
      </button>
      {/* Copy Button */}
      <button onClick={copyToClipboard} title={copyStatus} className="p-1 rounded-full hover:bg-gray-300 hover:opacity-100 flex items-center text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="mr-1">
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
        </svg>
        <span>{copyStatus}</span>
      </button>
    </div>
  );
};

export default ShareButtons;
