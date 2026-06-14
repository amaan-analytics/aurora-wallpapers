import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Download,
  Heart,
  Share2,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';

import { DiscoveryGrid } from '../components/DiscoveryGrid';
import { getGIFs } from "../services/api";

export default function GifDetail() {
  const location = useLocation();
  const gif = location.state?.gif;

  const [similar, setSimilar] = useState([]);
  const navigate = useNavigate();

  const [isFavorited, setIsFavorited] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  useEffect(() => {
    getGIFs('', 'Trending', 1, 12)
      .then(res => {
        setSimilar(
          (res.items || []).filter(item => item.id !== gif?.id)
        );
      });
  }, [gif]);

  if (!gif) {
    return <div>GIF not found</div>;
  }
const handleDownload = () => {
  const link = document.createElement('a');
  link.href = gif.gif_url;
  link.download = `${gif.title || 'aurora-gif'}.gif`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleFavorite = () => {
  setIsFavorited(!isFavorited);
};

const copyUrlToClipboard = () => {
  navigator.clipboard.writeText(window.location.href);

  setCopyFeedback(true);

  setTimeout(() => {
    setCopyFeedback(false);
  }, 2000);
};

const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: gif.title,
        url: window.location.href
      });
    } catch {}
  } else {
    copyUrlToClipboard();

    setShareFeedback(true);

    setTimeout(() => {
      setShareFeedback(false);
    }, 2000);
  }
};

return (
  <div className="max-w-7xl mx-auto px-4 py-6">

    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-card-theme/60 border border-border-theme/40 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* GIF Preview */}
      <div className="lg:col-span-8 bg-card-theme/20 border border-border-theme/30 rounded-3xl p-4">

        <img
          src={gif.gif_url}
          alt={gif.title}
          className="w-full rounded-2xl"
        />

      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 flex flex-col space-y-6">

        <div className="glass-card rounded-3xl p-6 space-y-4">

          <div>
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">
              GIF INFORMATION
            </span>

            <h2 className="text-xl font-bold">
              {gif.title || 'Trending GIF'}
            </h2>

            <span className="text-xs text-text-secondary">
              Source: Giphy
            </span>
          </div>

          <hr className="border-border-theme/40" />

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-background-theme/60 p-3 rounded-xl border border-border-theme/20">
              <span className="text-[10px] text-text-secondary block">
                Type
              </span>

              <span className="text-xs font-semibold">
                Animated GIF
              </span>
            </div>

            <div className="bg-background-theme/60 p-3 rounded-xl border border-border-theme/20">
              <span className="text-[10px] text-text-secondary block">
                Category
              </span>

              <span className="text-xs font-semibold">
                Trending
              </span>
            </div>

          </div>

        </div>

        {/* Download Button */}

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-accent-theme text-white rounded-2xl"
        >
          <Download className="w-4 h-4" />
          Download GIF
        </button>

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={handleFavorite}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl border ${
              isFavorited
                ? 'bg-accent-theme/10 border-accent-theme text-accent-theme'
                : 'border-border-theme/40'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? 'fill-current' : ''
              }`}
            />
            Favorite
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-border-theme/40"
          >
            {shareFeedback ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}

            Share
          </button>

        </div>

        <button
          onClick={copyUrlToClipboard}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border-theme/30"
        >
          {copyFeedback ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}

          {copyFeedback ? 'Link Copied!' : 'Copy Page Link'}
        </button>

        {/* Tags */}

        <div className="glass-card rounded-3xl p-6">

          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-4">
            GIF TAGS
          </span>

          <div className="flex flex-wrap gap-2">

            {(gif.title || '')
              .split(' ')
              .slice(0, 10)
              .map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg bg-card-theme border border-border-theme/30 text-xs"
                >
                  #{tag}
                </span>
              ))}

          </div>

        </div>

      </div>

    </div>

    {/* Similar GIFs */}

    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">
        Similar GIFs
      </h2>

      <DiscoveryGrid
        items={similar}
        loading={false}
        hasMore={false}
      />
    </div>

  </div>
); 
}