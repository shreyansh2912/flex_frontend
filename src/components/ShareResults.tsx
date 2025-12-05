import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Download, Share2, Twitter, Linkedin } from 'lucide-react';

interface ShareResultsProps {
  targetId: string; // ID of the DOM element to capture
  title: string;
  url: string;
}

const ShareResults: React.FC<ShareResultsProps> = ({ targetId, title, url }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    setIsCapturing(true);
    try {
      const element = document.getElementById(targetId);
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: null, // Transparent background if possible, or use theme bg
          scale: 2, // Higher resolution
        });
        const link = document.createElement('a');
        link.download = `flex-results-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (err) {
      console.error('Error capturing image:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const shareText = encodeURIComponent(`Check out these results from my Flex session! ${title}`);
  const shareUrl = encodeURIComponent(url);

  const twitterLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const linkedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Share Results
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} disabled={isCapturing} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          {isCapturing ? 'Capturing...' : 'Download Image'}
        </Button>
        <Button asChild variant="outline" size="sm" className="bg-[#1DA1F2] text-white hover:bg-[#1a91da] border-none">
          <a href={twitterLink} target="_blank" rel="noopener noreferrer">
            <Twitter className="w-4 h-4 mr-2" /> Tweet
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="bg-[#0A66C2] text-white hover:bg-[#0958a8] border-none">
          <a href={linkedinLink} target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-4 h-4 mr-2" /> Post
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ShareResults;
