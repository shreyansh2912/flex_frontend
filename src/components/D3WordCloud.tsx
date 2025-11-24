import React, { useEffect, useRef, useState } from 'react';
import cloud from 'd3-cloud';
import { select } from 'd3-selection';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

interface WordData {
  text: string;
  value: number;
}

interface D3WordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
}

const D3WordCloud: React.FC<D3WordCloudProps> = ({ words, width = 800, height = 400 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle responsive resizing
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: height, // Keep fixed height or make dynamic
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const layout = cloud()
      .size([dimensions.width, dimensions.height])
      .words(words.map((d) => ({ text: d.text, size: d.value })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90)) // 0 or 90 degrees
      .font('Impact')
      .fontSize((d) => Math.sqrt(d.size || 10) * 10) // Scale font size
      .on('end', draw);

    layout.start();

    function draw(words: any[]) {
      const svg = select(svgRef.current);
      svg.selectAll('*').remove(); // Clear previous

      const g = svg
        .attr('width', layout.size()[0])
        .attr('height', layout.size()[1])
        .append('g')
        .attr('transform', `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`);

      const fill = scaleOrdinal(schemeCategory10);

      g.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', (d) => `${d.size}px`)
        .style('font-family', 'Impact')
        .style('fill', (d, i) => fill(i.toString()))
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text((d) => d.text)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          select(this).style('opacity', 0.7);
        })
        .on('mouseout', function() {
          select(this).style('opacity', 1);
        });
    }
  }, [words, dimensions]);

  return <svg ref={svgRef} className="w-full h-full" />;
};

export default D3WordCloud;
