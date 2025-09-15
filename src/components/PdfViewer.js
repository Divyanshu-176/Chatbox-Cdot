import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'; // Adjust path based on your public folder

const PdfViewer = ({ pdfUrl, pageNumber, sentence }) => {
  const [numPages, setNumPages] = useState(null);
  const [highlights, setHighlights] = useState([]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = async (page) => {
    const textContent = await page.getTextContent();
    const targetSentence = sentence.toLowerCase();

    // Find the sentence in the text content
    const highlightPositions = [];
    let currentText = '';
    let startItem = null;

    textContent.items.forEach((item) => {
      currentText += item.str.toLowerCase();
      if (!startItem && currentText.includes(targetSentence)) {
        startItem = item;
        highlightPositions.push({
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          height: item.height,
        });
      }
    });

    setHighlights(highlightPositions);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page
          pageNumber={pageNumber}
          onLoadSuccess={onPageLoadSuccess}
          renderTextLayer={true}
          renderAnnotationLayer={true}
        >
          {highlights.map((highlight, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                backgroundColor: 'rgba(255, 255, 0, 0.3)',
                left: highlight.x,
                top: highlight.y,
                width: highlight.width,
                height: highlight.height,
                zIndex: 10,
              }}
            />
          ))}
        </Page>
      </Document>
    </div>
  );
};

export default PdfViewer;