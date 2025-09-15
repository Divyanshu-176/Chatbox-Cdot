import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import BGImage from './3582364.jpg'
function ContentImprove() {
  const [DisplayType, setDisplayType] = useState('Impove Content');
  const [content, setContent] = useState('');
  const [Addionalcontent, setAddionalContent] = useState('');
  const [wordLimit, setWordLimit] = useState('');
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  const [Geratecontent, setGerateContent] = useState('');
  const [AddionalGeratecontent, setAddionalGeratecontent] = useState('');
  const [GeratewordLimit, setGerateWordLimit] = useState('');
  const [tone, setTone] = useState('');
  const [Geratedresult, setGeneratedResult] = useState([]);
  const [Gerateloading, setGerateLoading] = useState(false);
  const [Gerateerror, setGerateError] = useState('');
  const [generateCurrentPage, setGenerateCurrentPage] = useState(1);

  // State for copy feedback
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedType, setCopiedType] = useState('');

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const handleScrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };
  // const BASE_PATH = "https://stagingeservices.dot.gov.in/dotmitra"
  const API_URL = 'https://stagingeservices.dot.gov.in/dotmitra';

  const [ReimprovingContent, setReimprovingContent] = useState('');
  const [ReGenerateContent, setReGenerateContent] = useState('');

  // Function to copy rendered HTML as plain text to clipboard
  const copyToClipboard = (markdownText, index, type) => {
    // Convert Markdown to HTML
    const rawHtml = marked(markdownText || '');
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);

    // Create a temporary DOM element to extract plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || ''; // Extract plain text

    if (!plainText.trim()) {
      if (type === 'improve') {
        setError('No content to copy.');
      } else {
        setGerateError('No content to copy.');
      }
      return;
    }

    navigator.clipboard.writeText(plainText).then(() => {
      setCopiedIndex(index);
      setCopiedType(type);
      // Reset the "Copied!" message after 2 seconds
      setTimeout(() => {
        setCopiedIndex(null);
        setCopiedType('');
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      if (type === 'improve') {
        setError('Failed to copy content.');
      } else {
        setGerateError('Failed to copy content.');
      }
    });
  };

  const improveContent = async (text) => {
    if (!text.trim()) {
      setError('Please enter some content to improve.');
      return;
    }
    setReimprovingContent(text);
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL + "/ContentImproveAPIView/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text + Addionalcontent, word_limit: wordLimit || null }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setReimprovingContent("");
      setResult(prevResult => [...prevResult, data]);
      setCurrentPage(Math.ceil((result.length + 1) / itemsPerPage));
      handleScrollToTop();
    } catch (err) {
      setResult([]);
      setReimprovingContent("");
      setError('Failed to improve content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => improveContent(content);

  const GenerateContent = async (text) => {
    if (!text.trim()) {
      setGerateError('Please enter some content to generate.');
      return;
    }
    setReGenerateContent(text);
    setGerateLoading(true);
    setGerateError('');

    try {
      const response = await fetch(API_URL + "/ContentGenerateAPIView/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: text + AddionalGeratecontent, tone: tone || 'neutral', word_limit: GeratewordLimit || null }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setReGenerateContent("");
      setGeneratedResult(prevResult => [...prevResult, data]);
      setGenerateCurrentPage(Math.ceil((Geratedresult.length + 1) / itemsPerPage));
      handleScrollToTop();
    } catch (err) {
      setGeneratedResult([]);
      setGerateError('Failed to generate content. Please try again.');
    } finally {
      setGerateLoading(false);
    }
  };

  const handleGenrate = () => GenerateContent(Geratecontent);

  const sanitizeMessage = (message) => {
    const rawHtml = marked(message || '');
    return DOMPurify.sanitize(rawHtml);
  };

  // Pagination logic for Improve Content
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = result.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(result.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination logic for Generate Content
  const generateIndexOfLastItem = generateCurrentPage * itemsPerPage;
  const generateIndexOfFirstItem = generateIndexOfLastItem - itemsPerPage;
  const generateCurrentItems = Geratedresult.slice(generateIndexOfFirstItem, generateIndexOfLastItem);
  const generateTotalPages = Math.ceil(Geratedresult.length / itemsPerPage);

  const generatePaginate = (pageNumber) => setGenerateCurrentPage(pageNumber);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result, Geratedresult, currentPage, generateCurrentPage]);

  // Add keyframes dynamically using a <style> element
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className='bg-white h-100' style={{ maxWidth: "100%", margin: "auto", padding: "20px" } }>
      {/* <nav>
        <div className="nav nav-tabs" id="nav-tab" role="tablist">
          <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Home</button>
          <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Profile</button>
          <button className="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
        </div>
      </nav> */}
      <ul className="shadow nav nav-underline border border-1 rounded p-1 bg-white">
        <li className="nav-item" onClick={() => setDisplayType("Impove Content")}>
          <button className={`btn ${DisplayType === "Impove Content" ? "active btn-primary" : ""}`}>Improve Content</button>
          {/* <a  aria-current="page" href="#"></a> */}
        </li>
        <li className="nav-item" onClick={() => setDisplayType("Generate Conten")}>
          <button className={`btn ${DisplayType === "Generate Conten" ? "active btn-primary" : ""}`}>Generate Content</button>
          {/* <a className={`nav-link ${DisplayType === "Generate Conten" ? "active" : ""}`} href="#"></a> */}
        </li>
      </ul>

      {DisplayType === "Impove Content" && (
        <div className='p-2 '>
          <div className='d-flex justify-content-between'>
            <div className='w-50 shadow h-100 border rounded me-2'>
              <div className='position-relative ' >
                <textarea
                  rows="6"
                  style={styles.textarea}
                  placeholder="Enter text to improve..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setError('');
                  }}
                />
                <div className='d-flex justify-content-between'>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Word Limit (Optional)"
                    value={wordLimit}
                    onChange={(e) => setWordLimit(e.target.value)}
                    min="1"
                  />
                  <button 
                    onClick={handleSubmit}
                    style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                    disabled={loading}
                  >
                    {(loading && ReimprovingContent === content) ? (
                      <>
                        <span style={styles.spinner}></span> Improving...
                      </>
                    ) : (
                      'Improve Content'
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className='w-50 shadow border rounded p-2' style={{ height: "80vh" }}>
              <div className='p-2 bg-white h-100'>
                {error && <p style={styles.error}>{error}</p>}
                {(currentItems.length > 0 && !error) ? (
                  <div style={styles.resultSection}>
                    {currentItems.map((item, index) => (
                      <div key={index}>
                        <div className='position-relative' style={styles.resultCard}>
                          <div className='d-flex'>
                            <span className="position-absolute top-0 ms-4 translate-middle badge rounded-pill bg-secondary">Improved</span>
                            <button className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
                              onClick={() => copyToClipboard(item.improved, index, 'improve')}
                              style={styles.copyButton}
                            >
                              {copiedIndex === index && copiedType === 'improve' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>


                          <div
                            style={styles.improvedText}
                            ref={messagesContainerRef}
                            dangerouslySetInnerHTML={{ __html: sanitizeMessage(item.improved) }}
                          />
                          <div className='d-flex justify-content-between align-items-center'>


                            <input
                              type='text'
                              onChange={(e) => setAddionalContent(e.target.value)}
                              placeholder='What Additional you want to reimprove?'
                              className='form-control'
                            />
                            <button
                              onClick={() => improveContent(item.improved)}
                              style={loading ? { ...styles.reimproveButton, ...styles.buttonDisabled } : styles.reimproveButton}
                              disabled={loading}
                            >
                              {(loading && ReimprovingContent === item.improved) ? 'Reimproving...' : 'Reimprove'}
                            </button>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                  :

                  <div style={{ textAlign: "center", overflow: "hidden" }}>
                    <img className='conimproverbgimg' style={{ textAlign: "center" }} src={BGImage} width="auto" height="100%" />
                  </div>
                }
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={currentPage === 1 ? { ...styles.paginationButton, ...styles.buttonDisabled } : styles.paginationButton}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => paginate(page)}
                        style={currentPage === page ? { ...styles.paginationButton, backgroundColor: '#007bff', color: '#fff' } : styles.paginationButton}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={currentPage === totalPages ? { ...styles.paginationButton, ...styles.buttonDisabled } : styles.paginationButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {DisplayType === "Generate Conten" && (
        <div className='p-2'>
          <div className='row'>
            <div className='col-6 h-100 border rounded p-2'>
              <textarea
                rows="6"
                style={styles.textarea}
                placeholder="Enter Topic to Generate Text..."
                value={Geratecontent}
                onChange={(e) => {
                  setGerateContent(e.target.value);
                  setGerateError('');
                }}
              />
              <div className='d-flex justify-content-between'>
                <div>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Word Limit (Optional)"
                    value={GeratewordLimit}
                    onChange={(e) => setGerateWordLimit(e.target.value)}
                    min="1"
                  />
                  <select
                    style={styles.input}
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="">Select Expression</option>
                    <option value="formal">Formal</option>
                    <option value="informal">Informal</option>
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="persuasive">Persuasive</option>
                    <option value="educational">Educational</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
                <button
                  onClick={handleGenrate}
                  style={Gerateloading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                  disabled={Gerateloading}
                >
                  {(Gerateloading && ReGenerateContent === Geratecontent) ? (
                    <>
                      <span style={styles.spinner}></span> Generating...
                    </>
                  ) : (
                    'Generate Content'
                  )}
                </button>
              </div>
            </div>
            <div className='col-6 border rounded p-2' style={{ height: "80vh" }}>
              <div className='p-2 bg-white h-100'>
                {Gerateerror && <p style={styles.error}>{Gerateerror}</p>}
                {(generateCurrentItems.length > 0 && !Gerateerror) ? (
                  <div style={styles.resultSection}>
                    {generateCurrentItems.map((items, index) => (
                      <div key={index}>
                        <div className='position-relative' style={styles.resultCard}>
                          <span className="position-absolute top-0 ms-4 translate-middle badge rounded-pill bg-secondary">Generated</span>
                          <button className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
                            onClick={() => copyToClipboard(items.generated_content, index, 'generate')}
                            style={styles.copyButton}
                          >
                            {copiedIndex === index && copiedType === 'generate' ? 'Copied!' : 'Copy'}
                          </button>
                          <div
                            style={styles.improvedText}
                            ref={messagesContainerRef}
                            dangerouslySetInnerHTML={{ __html: sanitizeMessage(items.generated_content) }}
                          />
                          <div className='d-flex justify-content-between align-items-center'>


                            <input
                              type='text'
                              onChange={(e) => setAddionalGeratecontent(e.target.value)}
                              placeholder='What Additional you want to regenerate?'
                              className='form-control'
                            />
                            <button
                              onClick={() => GenerateContent(items.generated_content)}
                              style={Gerateloading ? { ...styles.reimproveButton, ...styles.buttonDisabled } : styles.reimproveButton}
                              disabled={Gerateloading}
                            >
                              {(Gerateloading && ReGenerateContent === items.generated_content) ? 'Regenerating...' : 'Regenerate'}
                            </button>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                  :

                  <div style={{ textAlign: "center", overflow: "hidden" }}>
                    <img className='conimproverbgimg' style={{ textAlign: "center" }} src={BGImage} width="auto" height="100%" />
                  </div>
                }
                {generateTotalPages > 1 && (
                  <div style={styles.pagination}>
                    <button
                      onClick={() => generatePaginate(generateCurrentPage - 1)}
                      disabled={generateCurrentPage === 1}
                      style={generateCurrentPage === 1 ? { ...styles.paginationButton, ...styles.buttonDisabled } : styles.paginationButton}
                    >
                      Previous
                    </button>
                    {Array.from({ length: generateTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => generatePaginate(page)}
                        style={generateCurrentPage === page ? { ...styles.paginationButton, backgroundColor: '#007bff', color: '#fff' } : styles.paginationButton}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => generatePaginate(generateCurrentPage + 1)}
                      disabled={generateCurrentPage === generateTotalPages}
                      style={generateCurrentPage === generateTotalPages ? { ...styles.paginationButton, ...styles.buttonDisabled } : styles.paginationButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  textarea: {
    width: '100%',
    height: "70vh",
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'vertical',
    fontSize: '16px',
    border: "none",
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    marginRight: '10px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#66b0ff',
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #fff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  error: {
    color: '#dc3545',
    marginTop: '10px',
    fontSize: '14px',
  },
  resultSection: {
    marginTop: '0px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultCard: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  heading: {
    margin: '0 0 10px',
    fontSize: '18px',
    color: '#333',
  },
  text: {
    margin: '0',
    fontSize: '16px',
    color: '#555',
  },
  improvedText: {
    margin: '0 0 15px',
    fontSize: '16px',
    color: '#333',
    height: "55vh",
    overflow: "scroll",
  },
  reimproveButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  copyButton: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  info: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  paginationButton: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
};

export default ContentImprove;